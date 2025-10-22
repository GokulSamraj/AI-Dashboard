<template>
  <div class="spreadsheet">
    <div class="grid-container">
      <!-- Corner cell -->
      <div class="corner-cell"></div>

      <!-- Column headers -->
      <div class="column-headers">
        <div
          v-for="col in visibleColumns"
          :key="col"
          class="column-header"
          :class="{ selected: selectedCell?.col === col }"
          @click="selectColumn(col)"
        >
          {{ getColumnLabel(col) }}
        </div>
      </div>

      <!-- Row headers and cells -->
      <div class="rows-container">
        <div
          v-for="row in visibleRows"
          :key="row"
          class="row"
        >
          <!-- Row header -->
          <div
            class="row-header"
            :class="{ selected: selectedCell?.row === row }"
            @click="selectRow(row)"
          >
            {{ row + 1 }}
          </div>

          <!-- Cells -->
          <div class="cells">
            <div
              v-for="col in visibleColumns"
              :key="`${row}-${col}`"
              class="cell"
              :class="{
                selected: isSelected(row, col),
                editing: isEditing(row, col)
              }"
              @click="selectCell(row, col)"
              @dblclick="startEditing(row, col)"
            >
              <input
                v-if="isEditing(row, col)"
                ref="cellInputs"
                v-model="editValue"
                @blur="stopEditing"
                @keydown="onKeydown"
                @keydown.tab.prevent="handleTab"
                @keydown.enter="stopEditing"
                @keydown.esc="cancelEditing"
                class="cell-input"
              />
              <span v-else class="cell-content">
                {{ data[row]?.[col] || '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'

export default {
  name: 'SpreadsheetGrid',
  props: {
    data: {
      type: Object,
      required: true
    },
    selectedCell: {
      type: Object,
      default: () => ({ row: 0, col: 0 })
    }
  },
  emits: ['cell-selected', 'cell-updated'],
  setup(props, { emit }) {
    const editingCell = ref(null)
    const editValue = ref('')
    const cellInputs = ref([])
    const scrollContainer = ref(null)

    const visibleRows = computed(() => {
      const maxRow = Math.max(...Object.keys(props.data).map(Number), 49)
      return Array.from({ length: maxRow + 1 }, (_, i) => i)
    })

    const visibleColumns = computed(() => {
      const maxCol = Math.max(
        ...Object.values(props.data).flatMap(row => Object.keys(row).map(Number)),
        19
      )
      return Array.from({ length: maxCol + 1 }, (_, i) => i)
    })

    function getColumnLabel(col) {
      let label = ''
      while (col >= 0) {
        label = String.fromCharCode(65 + (col % 26)) + label
        col = Math.floor(col / 26) - 1
      }
      return label
    }

    function isSelected(row, col) {
      return props.selectedCell?.row === row && props.selectedCell?.col === col
    }

    function isEditing(row, col) {
      return editingCell.value?.row === row && editingCell.value?.col === col
    }

    function selectCell(row, col) {
      emit('cell-selected', { row, col })
    }

    function selectRow(row) {
      emit('cell-selected', { row, col: 0 })
    }

    function selectColumn(col) {
      emit('cell-selected', { row: 0, col })
    }

    async function startEditing(row, col) {
      editingCell.value = { row, col }
      editValue.value = props.data[row]?.[col] || ''

      await nextTick()
      if (cellInputs.value[0]) {
        cellInputs.value[0].focus()
        cellInputs.value[0].select()
      }
    }

    function stopEditing() {
      if (editingCell.value) {
        const { row, col } = editingCell.value
        emit('cell-updated', { row, col, value: editValue.value })
        editingCell.value = null
        editValue.value = ''
      }
    }

    function cancelEditing() {
      editingCell.value = null
      editValue.value = ''
    }

    function onKeydown(event) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
          event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        handleArrowKey(event.key)
      }
    }

    function handleArrowKey(key) {
      if (!editingCell.value) return

      const { row, col } = editingCell.value
      let newRow = row
      let newCol = col

      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, row - 1)
          break
        case 'ArrowDown':
          newRow = Math.min(visibleRows.value.length - 1, row + 1)
          break
        case 'ArrowLeft':
          newCol = Math.max(0, col - 1)
          break
        case 'ArrowRight':
          newCol = Math.min(visibleColumns.value.length - 1, col + 1)
          break
      }

      if (newRow !== row || newCol !== col) {
        stopEditing()
        selectCell(newRow, newCol)
        startEditing(newRow, newCol)
      }
    }

    function handleTab(event) {
      const { row, col } = editingCell.value
      const newCol = event.shiftKey
        ? Math.max(0, col - 1)
        : Math.min(visibleColumns.value.length - 1, col + 1)

      if (newCol !== col) {
        stopEditing()
        selectCell(row, newCol)
        startEditing(row, newCol)
      }
    }

    watch(() => props.selectedCell, (newCell, oldCell) => {
      if (editingCell.value && (!newCell || newCell.row !== oldCell?.row || newCell.col !== oldCell?.col)) {
        stopEditing()
      }
    }, { deep: true })

    return {
      visibleRows,
      visibleColumns,
      editingCell,
      editValue,
      cellInputs,
      getColumnLabel,
      isSelected,
      isEditing,
      selectCell,
      selectRow,
      selectColumn,
      startEditing,
      stopEditing,
      cancelEditing,
      onKeydown,
      handleTab
    }
  }
}
</script>

<style scoped>
.spreadsheet {
  height: 100%;
  overflow: auto;
  font-size: 13px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.grid-container {
  display: flex;
  flex-direction: column;
  min-width: max-content;
}

.corner-cell {
  width: 40px;
  height: 20px;
  border: 1px solid #e0e0e0;
  background: #f8f9fa;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 3;
}

.column-headers {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.column-header {
  width: 100px;
  min-width: 60px;
  height: 20px;
  border: 1px solid #e0e0e0;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  font-weight: 500;
  color: #5f6368;
  cursor: pointer;
  user-select: none;
}

.column-header.selected {
  background: #e8f0fe;
  color: #1967d2;
}

.rows-container {
  flex: 1;
}

.row {
  display: flex;
}

.row-header {
  width: 40px;
  min-width: 40px;
  height: 24px;
  border: 1px solid #e0e0e0;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  font-weight: 500;
  color: #5f6368;
  cursor: pointer;
  user-select: none;
  position: sticky;
  left: 0;
  z-index: 1;
}

.row-header.selected {
  background: #e8f0fe;
  color: #1967d2;
}

.cells {
  display: flex;
}

.cell {
  width: 100px;
  min-width: 60px;
  height: 24px;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-top: none;
  position: relative;
  cursor: cell;
  background: white;
}

.cell:hover {
  background: #f8f9fa;
}

.cell.selected {
  background: #e8f0fe;
  border: 2px solid #1967d2;
  z-index: 1;
}

.cell.editing {
  padding: 0;
}

.cell-content {
  display: block;
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 20px;
}

.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 2px 6px;
  font-family: inherit;
  font-size: inherit;
  background: transparent;
}
</style>