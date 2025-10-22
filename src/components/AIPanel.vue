<template>
  <div class="ai-panel">
    <div class="panel-header">
      <h3>AI Assistant</h3>
      <div class="api-selector">
        <label for="api-select">API:</label>
        <select id="api-select" v-model="selectedAPI" class="api-select">
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
    </div>

    <div class="panel-content">
      <!-- Cell Info -->
      <div class="cell-info" v-if="selectedCell">
        <h4>Current Cell: {{ getCellLabel() }}</h4>
        <div class="cell-value">
          <strong>Value:</strong> {{ cellData?.value || '(empty)' }}
        </div>
      </div>

      <!-- Prompt Section -->
      <div class="prompt-section">
        <h4>Prompt AI</h4>
        <textarea
          v-model="prompt"
          placeholder="Ask AI to analyze data, generate formulas, fill cells, or get insights..."
          class="prompt-input"
          rows="4"
        ></textarea>

        <div class="prompt-actions">
          <button
            @click="sendPrompt"
            :disabled="!prompt.trim() || isLoading"
            class="btn btn-primary"
          >
            <span v-if="isLoading">Thinking...</span>
            <span v-else>Send</span>
          </button>
          <button
            @click="clearPrompt"
            class="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h4>Quick Actions</h4>
        <div class="action-buttons">
          <button @click="analyzeData" class="action-btn">Analyze Data</button>
          <button @click="generateFormula" class="action-btn">Generate Formula</button>
          <button @click="fillSeries" class="action-btn">Fill Series</button>
          <button @click="summarizeData" class="action-btn">Summarize</button>
        </div>
      </div>

      <!-- API Response -->
      <div class="response-section" v-if="response">
        <h4>AI Response</h4>
        <div class="response-content">
          <div class="response-text" v-html="formatResponse(response.text)"></div>

          <!-- Suggested Actions -->
          <div class="suggested-actions" v-if="response.actions">
            <h5>Suggested Actions:</h5>
            <div class="action-list">
              <button
                v-for="(action, index) in response.actions"
                :key="index"
                @click="applyAction(action)"
                class="action-item"
              >
                {{ action.description }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- API Status -->
      <div class="api-status">
        <h4>API Status</h4>
        <div class="status-indicators">
          <div
            v-for="api in apiStatus"
            :key="api.name"
            class="status-item"
            :class="api.status"
          >
            <span class="status-dot"></span>
            <span class="status-text">{{ api.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useAIService } from '../composables/useAIService'

export default {
  name: 'AIPanel',
  props: {
    selectedCell: {
      type: Object,
      default: null
    },
    cellData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['ai-response', 'fill-cells'],
  setup(props, { emit }) {
    const prompt = ref('')
    const response = ref(null)
    const isLoading = ref(false)
    const selectedAPI = ref('openai')

    const { makeRequest, checkAPIStatus } = useAIService()

    const apiStatus = reactive([
      { name: 'OpenAI', status: 'unknown' },
      { name: 'Claude', status: 'unknown' },
      { name: 'Gemini', status: 'unknown' }
    ])

    // Check API status on mount
    checkAllAPIs()

    async function checkAllAPIs() {
      const apis = ['openai', 'claude', 'gemini']
      await Promise.all(
        apis.map(async (api, index) => {
          try {
            const isAvailable = await checkAPIStatus(api)
            apiStatus[index].status = isAvailable ? 'available' : 'unavailable'
          } catch {
            apiStatus[index].status = 'error'
          }
        })
      )
    }

    function getCellLabel() {
      if (!props.selectedCell) return ''
      const { row, col } = props.selectedCell
      let colLabel = ''
      let tempCol = col
      while (tempCol >= 0) {
        colLabel = String.fromCharCode(65 + (tempCol % 26)) + colLabel
        tempCol = Math.floor(tempCol / 26) - 1
      }
      return `${colLabel}${row + 1}`
    }

    async function sendPrompt() {
      if (!prompt.value.trim() || isLoading.value) return

      isLoading.value = true
      response.value = null

      try {
        const context = {
          selectedCell: props.selectedCell,
          cellData: props.cellData,
          prompt: prompt.value
        }

        const result = await makeRequest(selectedAPI.value, context)
        response.value = result
        emit('ai-response', result)

        // If response includes cell updates, emit them
        if (result.cellUpdates) {
          emit('fill-cells', result.cellUpdates)
        }
      } catch (error) {
        response.value = {
          text: `Error: ${error.message}`,
          actions: null
        }
      } finally {
        isLoading.value = false
      }
    }

    function clearPrompt() {
      prompt.value = ''
      response.value = null
    }

    async function analyzeData() {
      prompt.value = `Analyze the data in cell ${getCellLabel()} and its surrounding cells. Provide insights and identify patterns.`
      await sendPrompt()
    }

    async function generateFormula() {
      prompt.value = `Generate a formula for cell ${getCellLabel()} based on the surrounding data context. Explain what the formula does.`
      await sendPrompt()
    }

    async function fillSeries() {
      prompt.value = `Based on the pattern in the surrounding cells, suggest how to fill a series starting from cell ${getCellLabel()}.`
      await sendPrompt()
    }

    async function summarizeData() {
      prompt.value = `Summarize the data visible in the current sheet area and provide key statistics.`
      await sendPrompt()
    }

    function applyAction(action) {
      if (action.cellUpdates) {
        emit('fill-cells', action.cellUpdates)
      }
      if (action.newPrompt) {
        prompt.value = action.newPrompt
        sendPrompt()
      }
    }

    function formatResponse(text) {
      // Convert markdown-like formatting to HTML
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    }

    return {
      prompt,
      response,
      isLoading,
      selectedAPI,
      apiStatus,
      getCellLabel,
      sendPrompt,
      clearPrompt,
      analyzeData,
      generateFormula,
      fillSeries,
      summarizeData,
      applyAction,
      formatResponse
    }
  }
}
</script>

<style scoped>
.ai-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.api-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.cell-info,
.prompt-section,
.quick-actions,
.response-section,
.api-status {
  margin-bottom: 20px;
}

.cell-info h4,
.prompt-section h4,
.quick-actions h4,
.response-section h4,
.api-status h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
}

.cell-value {
  font-size: 12px;
  color: #3c4043;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
}

.prompt-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 8px;
}

.prompt-actions {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #3c4043;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #c0c0c0;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.btn-primary:hover:not(:disabled) {
  background: #1765cc;
}

.btn-primary:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f3f4;
  color: #5f6368;
}

.btn-secondary:hover {
  background: #e8eaed;
}

.response-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #1a73e8;
}

.response-text {
  font-size: 13px;
  line-height: 1.4;
  color: #3c4043;
  margin-bottom: 12px;
}

.suggested-actions h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 500;
  color: #5f6368;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-item {
  padding: 6px 10px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #1a73e8;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.action-item:hover {
  background: #e8f0fe;
  border-color: #1a73e8;
}

.status-indicators {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-item.available .status-dot {
  background: #34a853;
}

.status-item.unavailable .status-dot {
  background: #ea4335;
}

.status-item.error .status-dot {
  background: #fbbc04;
}

.status-item.unknown .status-dot {
  background: #9e9e9e;
}

.status-text {
  color: #5f6368;
}
</style>