<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>AI API Settings</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="api-settings">
          <div class="api-section">
            <h3>OpenAI API</h3>
            <div class="input-group">
              <label for="openai-key">API Key:</label>
              <input
                id="openai-key"
                v-model="localKeys.openai"
                type="password"
                placeholder="sk-..."
                class="api-key-input"
              />
              <button @click="testAPI('openai')" :disabled="!localKeys.openai || testing.openai" class="test-btn">
                <span v-if="testing.openai">Testing...</span>
                <span v-else>Test</span>
              </button>
            </div>
            <div class="api-status" :class="status.openai">
              <span class="status-indicator"></span>
              {{ getStatusText(status.openai) }}
            </div>
          </div>

          <div class="api-section">
            <h3>Claude API</h3>
            <div class="input-group">
              <label for="claude-key">API Key:</label>
              <input
                id="claude-key"
                v-model="localKeys.claude"
                type="password"
                placeholder="sk-ant-..."
                class="api-key-input"
              />
              <button @click="testAPI('claude')" :disabled="!localKeys.claude || testing.claude" class="test-btn">
                <span v-if="testing.claude">Testing...</span>
                <span v-else>Test</span>
              </button>
            </div>
            <div class="api-status" :class="status.claude">
              <span class="status-indicator"></span>
              {{ getStatusText(status.claude) }}
            </div>
          </div>

          <div class="api-section">
            <h3>Gemini API</h3>
            <div class="input-group">
              <label for="gemini-key">API Key:</label>
              <input
                id="gemini-key"
                v-model="localKeys.gemini"
                type="password"
                placeholder="AIza..."
                class="api-key-input"
              />
              <button @click="testAPI('gemini')" :disabled="!localKeys.gemini || testing.gemini" class="test-btn">
                <span v-if="testing.gemini">Testing...</span>
                <span v-else>Test</span>
              </button>
            </div>
            <div class="api-status" :class="status.gemini">
              <span class="status-indicator"></span>
              {{ getStatusText(status.gemini) }}
            </div>
          </div>
        </div>

        <div class="usage-info">
          <h3>Usage Information</h3>
          <ul>
            <li><strong>OpenAI:</strong> Requires GPT-3.5-turbo or GPT-4 API access</li>
            <li><strong>Claude:</strong> Requires Claude API access from Anthropic</li>
            <li><strong>Gemini:</strong> Requires Google AI Studio API key</li>
            <li>API keys are stored locally in your browser</li>
            <li>The app will automatically fallback to other APIs if one fails</li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="saveSettings" class="btn btn-primary">Save Settings</button>
        <button @click="closeModal" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { useAIService } from '../composables/useAIService'

export default {
  name: 'SettingsModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { setAPIKey, getAPIKey, checkAPIStatus } = useAIService()

    const localKeys = reactive({
      openai: '',
      claude: '',
      gemini: ''
    })

    const status = reactive({
      openai: 'unknown',
      claude: 'unknown',
      gemini: 'unknown'
    })

    const testing = reactive({
      openai: false,
      claude: false,
      gemini: false
    })

    // Load existing keys when modal opens
    watch(() => props.isVisible, (visible) => {
      if (visible) {
        localKeys.openai = getAPIKey('openai') || ''
        localKeys.claude = getAPIKey('claude') || ''
        localKeys.gemini = getAPIKey('gemini') || ''

        // Check status for existing keys
        Object.keys(localKeys).forEach(provider => {
          if (localKeys[provider]) {
            testAPI(provider)
          }
        })
      }
    })

    async function testAPI(provider) {
      if (!localKeys[provider]) return

      testing[provider] = true
      status[provider] = 'testing'

      try {
        const isWorking = await checkAPIStatus(provider)
        status[provider] = isWorking ? 'available' : 'unavailable'
      } catch (error) {
        status[provider] = 'error'
      } finally {
        testing[provider] = false
      }
    }

    function getStatusText(statusValue) {
      switch (statusValue) {
        case 'available': return 'API key is working'
        case 'unavailable': return 'API key is invalid or expired'
        case 'error': return 'API test failed'
        case 'testing': return 'Testing API connection...'
        default: return 'API key not set'
      }
    }

    function saveSettings() {
      Object.keys(localKeys).forEach(provider => {
        if (localKeys[provider]) {
          setAPIKey(provider, localKeys[provider])
        }
      })
      closeModal()
    }

    function closeModal() {
      emit('close')
    }

    return {
      localKeys,
      status,
      testing,
      testAPI,
      getStatusText,
      saveSettings,
      closeModal
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #5f6368;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f1f3f4;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.api-settings {
  margin-bottom: 24px;
}

.api-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.api-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #202124;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.input-group label {
  min-width: 80px;
  font-size: 14px;
  color: #5f6368;
}

.api-key-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
}

.api-key-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.test-btn {
  padding: 8px 16px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #1a73e8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.test-btn:hover:not(:disabled) {
  background: #e8f0fe;
  border-color: #1a73e8;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-top: 4px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.api-status.available .status-indicator {
  background: #34a853;
}

.api-status.unavailable .status-indicator,
.api-status.error .status-indicator {
  background: #ea4335;
}

.api-status.testing .status-indicator {
  background: #fbbc04;
  animation: pulse 1.5s infinite;
}

.api-status.unknown .status-indicator {
  background: #9e9e9e;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.usage-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #202124;
}

.usage-info ul {
  margin: 0;
  padding-left: 20px;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.btn {
  padding: 8px 24px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.btn-primary:hover {
  background: #1765cc;
}

.btn-secondary {
  background: white;
  color: #5f6368;
}

.btn-secondary:hover {
  background: #f1f3f4;
}
</style>