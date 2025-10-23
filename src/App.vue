<template>
  <div class="container">
    <header>
      <h1>📊 Google Sheets Data Analyzer</h1>
      <p>Paste your spreadsheet data and analyze it with AI</p>
    </header>

    <main>
      <div class="input-section">
        <div class="data-input">
          <label for="dataInput">Paste your Google Sheets data:</label>
          <textarea
            id="dataInput"
            v-model="dataInput"
            placeholder="Paste your data here from Google Sheets (tab-separated or comma-separated values)"
            rows="10"
          ></textarea>
          <div class="data-format">
            <label>
              <input type="radio" name="format" value="tab" v-model="dataFormat"> Tab-separated
            </label>
            <label>
              <input type="radio" name="format" value="csv" v-model="dataFormat"> Comma-separated (CSV)
            </label>
          </div>
        </div>

        <div class="prompt-input">
          <label for="promptInput">What would you like to know about your data?</label>
          <textarea
            id="promptInput"
            v-model="promptInput"
            placeholder="e.g., 'Analyze trends in this data', 'Find outliers', 'Create a summary', 'Which products perform best?'"
            rows="4"
            @keydown.ctrl.enter="analyzeData"
            @keydown.meta.enter="analyzeData"
          ></textarea>
        </div>

        <button
          @click="analyzeData"
          class="analyze-btn"
          :disabled="isLoading"
        >
          <span class="btn-text" v-if="!isLoading">Analyze Data</span>
          <span class="loading" v-else>Analyzing...</span>
        </button>
      </div>

      <div class="results-section" v-if="results">
        <h2>Analysis Results</h2>
        <div class="results-content">{{ results }}</div>
        <div class="results-actions">
          <button @click="clearResults" class="clear-btn">Clear Results</button>
          <button @click="copyResults" class="copy-btn">{{ copyButtonText }}</button>
        </div>
      </div>

      <div class="error-section" v-if="error">
        <h2>Error</h2>
        <div class="error-message">{{ error }}</div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { aiAPI } from './services/api.js'

export default {
  name: 'App',
  setup() {
    const dataInput = ref('')
    const promptInput = ref('')
    const openaiKey = ref(import.meta.env.VITE_OPENAI_API_KEY || '')
    const geminiKey = ref(import.meta.env.VITE_GEMINI_API_KEY || '')
    const dataFormat = ref('tab')
    const results = ref('')
    const error = ref('')
    const isLoading = ref(false)
    const copyButtonText = ref('Copy Results')

    onMounted(() => {
      setSamplePlaceholders()
    })

    const setSamplePlaceholders = () => {
      if (!dataInput.value && !promptInput.value) {
        dataInput.value = ''
        promptInput.value = ''
      }
    }

    const parseData = (text) => {
      const delimiter = dataFormat.value === 'tab' ? '\t' : ','
      const lines = text.trim().split('\n').filter(line => line.trim())

      if (lines.length === 0) {
        throw new Error('No data found. Please paste your spreadsheet data.')
      }

      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
      const rows = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''))
        if (values.length === headers.length) {
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })
          rows.push(row)
        }
      }

      return { headers, rows, totalRows: rows.length }
    }

    const createAnalysisPrompt = (headers, rows, userPrompt) => {
      const dataPreview = rows.slice(0, 10).map((row, index) =>
        `Row ${index + 1}: ` + headers.map(header => `${header}: ${row[header]}`).join(', ')
      ).join('\n')

      return `You are a data analyst. I have spreadsheet data with the following structure:

Headers: ${headers.join(', ')}
Total rows: ${rows.length}

Data preview (first 10 rows):
${dataPreview}

${rows.length > 10 ? `(showing first 10 of ${rows.length} rows)` : ''}

User's analysis request: "${userPrompt}"

Please analyze this data and provide insights. Be specific, helpful, and actionable. If the data contains numbers, include calculations or trends. If it's text data, provide categorization or patterns. Format your response in a clear, readable way.`
    }

    const callAIAPI = async (prompt, openaiKey, geminiKey) => {
      return await aiAPI.generateContent(prompt, openaiKey, geminiKey)
    }

    const analyzeData = async () => {
      try {
        isLoading.value = true
        results.value = ''
        error.value = ''

        // Validate inputs
        const dataText = dataInput.value.trim()
        const prompt = promptInput.value.trim()
        const openai = openaiKey.value.trim()
        const gemini = geminiKey.value.trim()

        if (!dataText) {
          throw new Error('Please paste your spreadsheet data.')
        }

        if (!prompt) {
          throw new Error('Please enter a prompt for analysis.')
        }

        if (!openai && !gemini) {
          throw new Error('No API keys configured. Please set VITE_OPENAI_API_KEY and/or VITE_GEMINI_API_KEY in your .env file.')
        }

        // Parse the data
        const { headers, rows } = parseData(dataText)

        // Prepare the prompt for AI analysis
        const analysisPrompt = createAnalysisPrompt(headers, rows, prompt)

        // Call AI API with fallback support
        const response = await callAIAPI(analysisPrompt, openai, gemini)

        // Display results
        results.value = response

      } catch (err) {
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }

    const clearResults = () => {
      results.value = ''
      error.value = ''
      promptInput.value = ''
      dataInput.value = ''
    }

    const copyResults = async () => {
      try {
        await navigator.clipboard.writeText(results.value)
        showCopySuccess()
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = results.value
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          showCopySuccess()
        } catch (fallbackError) {
          console.error('Failed to copy text: ', fallbackError)
        }
        document.body.removeChild(textArea)
      }
    }

    const showCopySuccess = () => {
      const originalText = copyButtonText.value
      copyButtonText.value = 'Copied!'

      setTimeout(() => {
        copyButtonText.value = originalText
      }, 2000)
    }

    return {
      dataInput,
      promptInput,
      dataFormat,
      results,
      error,
      isLoading,
      copyButtonText,
      analyzeData,
      clearResults,
      copyResults
    }
  }
}
</script>