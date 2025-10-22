<template>
  <div class="app">
    <header class="toolbar">
      <div class="toolbar-left">
        <h1 class="app-title">AI Spreadsheet</h1>
        <div class="toolbar-actions">
          <button @click="addRow" class="btn">+ Row</button>
          <button @click="addColumn" class="btn">+ Column</button>
          <button @click="clearData" class="btn btn-secondary">Clear</button>
          <button @click="showSettings = true" class="btn btn-secondary">⚙️ Settings</button>
        </div>
      </div>
      <div class="toolbar-right">
        <div class="formula-bar">
          <input
            v-model="formulaInput"
            @keyup.enter="applyFormula"
            placeholder="Enter formula or value..."
            class="formula-input"
          />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="spreadsheet-container">
        <SpreadsheetGrid
          :data="spreadsheetData"
          :selected-cell="selectedCell"
          @cell-selected="onCellSelected"
          @cell-updated="onCellUpdated"
        />
      </div>

      <AIPanel
        :selected-cell="selectedCell"
        :cell-data="getSelectedCellData()"
        @ai-response="onAIResponse"
        @fill-cells="onFillCells"
      />
    </main>

    <SettingsModal
      :is-visible="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import SpreadsheetGrid from './components/SpreadsheetGrid.vue'
import AIPanel from './components/AIPanel.vue'
import SettingsModal from './components/SettingsModal.vue'

export default {
  name: 'App',
  components: {
    SpreadsheetGrid,
    AIPanel,
    SettingsModal
  },
  setup() {
    const spreadsheetData = reactive(createInitialData())
    const selectedCell = ref({ row: 0, col: 0 })
    const formulaInput = ref('')
    const showSettings = ref(false)

    function createInitialData() {
      const data = {}
      for (let row = 0; row < 50; row++) {
        data[row] = {}
        for (let col = 0; col < 20; col++) {
          data[row][col] = ''
        }
      }
      return data
    }

    function onCellSelected(cell) {
      selectedCell.value = cell
      const cellValue = spreadsheetData[cell.row]?.[cell.col] || ''
      formulaInput.value = cellValue
    }

    function onCellUpdated({ row, col, value }) {
      if (!spreadsheetData[row]) {
        spreadsheetData[row] = {}
      }
      spreadsheetData[row][col] = value
      if (selectedCell.value.row === row && selectedCell.value.col === col) {
        formulaInput.value = value
      }
    }

    function applyFormula() {
      const { row, col } = selectedCell.value
      onCellUpdated({ row, col, value: formulaInput.value })
    }

    function getSelectedCellData() {
      const { row, col } = selectedCell.value
      return {
        row,
        col,
        value: spreadsheetData[row]?.[col] || '',
        surroundingData: getSurroundingData(row, col)
      }
    }

    function getSurroundingData(centerRow, centerCol) {
      const surrounding = {}
      for (let row = Math.max(0, centerRow - 2); row <= Math.min(49, centerRow + 2); row++) {
        for (let col = Math.max(0, centerCol - 2); col <= Math.min(19, centerCol + 2); col++) {
          if (row !== centerRow || col !== centerCol) {
            surrounding[`${row},${col}`] = spreadsheetData[row]?.[col] || ''
          }
        }
      }
      return surrounding
    }

    function addRow() {
      const newRow = {}
      for (let col = 0; col < 20; col++) {
        newRow[col] = ''
      }

      const maxRow = Math.max(...Object.keys(spreadsheetData).map(Number))
      spreadsheetData[maxRow + 1] = newRow
    }

    function addColumn() {
      const maxCol = Math.max(...Object.values(spreadsheetData).flatMap(row => Object.keys(row).map(Number)))
      for (let row in spreadsheetData) {
        spreadsheetData[row][maxCol + 1] = ''
      }
    }

    function clearData() {
      for (let row in spreadsheetData) {
        for (let col in spreadsheetData[row]) {
          spreadsheetData[row][col] = ''
        }
      }
      formulaInput.value = ''
    }

    function onAIResponse(response) {
      console.log('AI Response:', response)
    }

    function onFillCells(cells) {
      cells.forEach(({ row, col, value }) => {
        onCellUpdated({ row, col, value })
      })
    }

    return {
      spreadsheetData,
      selectedCell,
      formulaInput,
      showSettings,
      onCellSelected,
      onCellUpdated,
      applyFormula,
      getSelectedCellData,
      addRow,
      addColumn,
      clearData,
      onAIResponse,
      onFillCells
    }
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  min-height: 60px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-title {
  font-size: 18px;
  font-weight: 500;
  color: #202124;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  flex: 1;
  max-width: 500px;
  margin-left: 20px;
}

.formula-bar {
  width: 100%;
}

.formula-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #3c4043;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f8f9fa;
  border-color: #c0c0c0;
}

.btn-secondary {
  background: #f1f3f4;
  color: #5f6368;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.spreadsheet-container {
  flex: 1;
  overflow: auto;
  border-right: 1px solid #e0e0e0;
}
</style>