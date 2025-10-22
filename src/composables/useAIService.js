import { ref } from 'vue'

export function useAIService() {
  const apiKeys = ref({
    openai: localStorage.getItem('openai_api_key') || '',
    claude: localStorage.getItem('claude_api_key') || '',
    gemini: localStorage.getItem('gemini_api_key') || ''
  })

  const apiEndpoints = {
    openai: 'https://api.openai.com/v1/chat/completions',
    claude: 'https://api.anthropic.com/v1/messages',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  }

  async function makeRequest(provider, context, useFallback = true) {
    const apiKey = apiKeys.value[provider]

    if (!apiKey) {
      throw new Error(`API key for ${provider} is not configured`)
    }

    try {
      const response = await callAPI(provider, apiKey, context)
      return parseResponse(provider, response)
    } catch (error) {
      console.error(`${provider} API error:`, error)

      if (useFallback) {
        const fallbackProviders = ['openai', 'claude', 'gemini'].filter(p => p !== provider)

        for (const fallbackProvider of fallbackProviders) {
          if (apiKeys.value[fallbackProvider]) {
            try {
              console.log(`Trying fallback provider: ${fallbackProvider}`)
              const response = await callAPI(fallbackProvider, apiKeys.value[fallbackProvider], context)
              return parseResponse(fallbackProvider, response)
            } catch (fallbackError) {
              console.error(`Fallback ${fallbackProvider} also failed:`, fallbackError)
              continue
            }
          }
        }
      }

      throw new Error(`All AI providers failed. Last error: ${error.message}`)
    }
  }

  async function callAPI(provider, apiKey, context) {
    const { selectedCell, cellData, prompt } = context

    // Prepare context data for the AI
    const contextInfo = {
      selectedCell: selectedCell ? `${getColumnLabel(selectedCell.col)}${selectedCell.row + 1}` : null,
      cellValue: cellData?.value || '',
      surroundingData: cellData?.surroundingData || {},
      prompt: prompt
    }

    let requestBody, headers

    switch (provider) {
      case 'openai':
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        requestBody = {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for a spreadsheet application.
              You can analyze data, generate formulas, suggest fill patterns, and provide insights.
              Current cell: ${contextInfo.selectedCell}
              Cell value: "${contextInfo.cellValue}"
              Surrounding data: ${JSON.stringify(contextInfo.surroundingData, null, 2)}

              When suggesting cell updates, respond with JSON format:
              {
                "text": "Your explanation here",
                "cellUpdates": [{"row": 0, "col": 1, "value": "example"}],
                "actions": [{"description": "Apply formula", "cellUpdates": [...]}]
              }`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }
        break

      case 'claude':
        headers = {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
        requestBody = {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `You are an AI assistant for a spreadsheet application.
              Current cell: ${contextInfo.selectedCell}
              Cell value: "${contextInfo.cellValue}"
              Surrounding data: ${JSON.stringify(contextInfo.surroundingData, null, 2)}

              User request: ${prompt}

              When suggesting cell updates, include them in your response in this format:
              Cell Updates: [{"row": 0, "col": 1, "value": "example"}]
              Actions: [{"description": "Apply formula", "cellUpdates": [...]}]`
            }
          ]
        }
        break

      case 'gemini':
        headers = {
          'Content-Type': 'application/json'
        }
        requestBody = {
          contents: [
            {
              parts: [
                {
                  text: `You are an AI assistant for a spreadsheet application.
                  Current cell: ${contextInfo.selectedCell}
                  Cell value: "${contextInfo.cellValue}"
                  Surrounding data: ${JSON.stringify(contextInfo.surroundingData, null, 2)}

                  User request: ${prompt}

                  When suggesting cell updates, include them in your response in this format:
                  Cell Updates: [{"row": 0, "col": 1, "value": "example"}]
                  Actions: [{"description": "Apply formula", "cellUpdates": [...]}]`
                }
              ]
            }
          ]
        }
        break

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    const url = provider === 'gemini'
      ? `${apiEndpoints[provider]}?key=${apiKey}`
      : apiEndpoints[provider]

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API request failed: ${response.status} ${errorData.error?.message || response.statusText}`)
    }

    return response.json()
  }

  function parseResponse(provider, response) {
    let text = ''
    let cellUpdates = null
    let actions = null

    switch (provider) {
      case 'openai':
        text = response.choices[0]?.message?.content || ''
        break
      case 'claude':
        text = response.content[0]?.text || ''
        break
      case 'gemini':
        text = response.candidates[0]?.content?.parts[0]?.text || ''
        break
    }

    // Try to extract structured data from the response
    try {
      const cellUpdateMatch = text.match(/Cell Updates:\s*(\[[\s\S]*?\])/i)
      const actionsMatch = text.match(/Actions:\s*(\[[\s\S]*?\])/i)

      if (cellUpdateMatch) {
        cellUpdates = JSON.parse(cellUpdateMatch[1])
      }

      if (actionsMatch) {
        actions = JSON.parse(actionsMatch[1])
      }
    } catch (error) {
      console.warn('Failed to parse structured data from AI response:', error)
    }

    return {
      text,
      cellUpdates,
      actions
    }
  }

  function getColumnLabel(col) {
    let label = ''
    while (col >= 0) {
      label = String.fromCharCode(65 + (col % 26)) + label
      col = Math.floor(col / 26) - 1
    }
    return label
  }

  async function checkAPIStatus(provider) {
    const apiKey = apiKeys.value[provider]
    if (!apiKey) return false

    try {
      const testContext = {
        selectedCell: { row: 0, col: 0 },
        cellData: { value: '', surroundingData: {} },
        prompt: 'Test connection'
      }

      const response = await callAPI(provider, apiKey, testContext)
      return !!response
    } catch {
      return false
    }
  }

  function setAPIKey(provider, key) {
    apiKeys.value[provider] = key
    localStorage.setItem(`${provider}_api_key`, key)
  }

  function getAPIKey(provider) {
    return apiKeys.value[provider]
  }

  function hasAPIKey(provider) {
    return !!apiKeys.value[provider]
  }

  return {
    makeRequest,
    checkAPIStatus,
    setAPIKey,
    getAPIKey,
    hasAPIKey,
    apiKeys
  }
}