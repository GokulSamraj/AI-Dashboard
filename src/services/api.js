export class OpenAIService {
  constructor() {
    this.baseURL = 'https://api.openai.com/v1/chat/completions'
  }

  async generateContent(prompt, apiKey) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API')
    }

    return data.choices[0].message.content
  }
}

export class GeminiService {
  constructor() {
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
  }

  async generateContent(prompt, apiKey) {
    const response = await fetch(`${this.baseURL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    return data.candidates[0].content.parts[0].text
  }
}

export class AIService {
  constructor() {
    this.openai = new OpenAIService()
    this.gemini = new GeminiService()
  }

  async generateContent(prompt, openaiKey, geminiKey) {
    let lastError = null

    // Try OpenAI first if key is available
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI API...')
        return await this.openai.generateContent(prompt, openaiKey)
      } catch (error) {
        console.warn('OpenAI API failed, trying Gemini fallback:', error.message)
        lastError = error
      }
    }

    // Fallback to Gemini if key is available
    if (geminiKey) {
      try {
        console.log('Attempting Gemini API fallback...')
        return await this.gemini.generateContent(prompt, geminiKey)
      } catch (error) {
        console.error('Gemini API also failed:', error.message)
        lastError = error
      }
    }

    // If both APIs failed, throw the last error
    throw lastError || new Error('No API keys configured or all APIs failed')
  }
}

export const openaiAPI = new OpenAIService()
export const geminiAPI = new GeminiService()
export const aiAPI = new AIService()