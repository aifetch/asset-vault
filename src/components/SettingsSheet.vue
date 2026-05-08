<template>
  <BaseSheet :open="open" @close="$emit('close')">
    <div class="settings-panel">
      <div class="settings-panel__header">
        <div class="settings-panel__title">数据管理</div>
        <button type="button" class="settings-panel__close" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="settings-panel__actions">
        <button type="button" class="settings-row" :disabled="exporting" @click="handleExportJSON">
          <div class="settings-row__icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v10m0 0l-3.5-3.5M9 12l3.5-3.5M3 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="settings-row__text">
            <div class="settings-row__label">导出 JSON 备份</div>
            <div class="settings-row__hint">{{ exporting ? '正在导出…' : '完整备份，包含图片' }}</div>
          </div>
        </button>

        <button type="button" class="settings-row" :disabled="items.length === 0 || exporting" @click="handleExportCSV">
          <div class="settings-row__icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 2h6l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6 2v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="settings-row__text">
            <div class="settings-row__label">导出 CSV</div>
            <div class="settings-row__hint">{{ items.length === 0 ? '没有数据可导出' : '纯文本，可用 Excel 打开' }}</div>
          </div>
        </button>

        <button type="button" class="settings-row" :disabled="importing" @click="triggerImport">
          <div class="settings-row__icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 14V4m0 0L5.5 7.5M9 4l3.5 3.5M3 2h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="settings-row__text">
            <div class="settings-row__label">导入 JSON 数据</div>
            <div class="settings-row__hint">{{ importing ? importStatus : '从备份文件恢复数据' }}</div>
          </div>
        </button>
      </div>

      <input ref="importInput" type="file" accept=".json" hidden @change="handleImportFile" />
    </div>
  </BaseSheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseSheet from './BaseSheet.vue'
import { exportCSV, exportJSON, importJSON } from '../lib/export'
import { calcDays } from '../lib/format'
import type { AssetItem } from '../types/asset'

const props = defineProps<{
  open: boolean
  items: AssetItem[]
}>()

const emit = defineEmits<{
  close: []
  toast: [message: string]
  imported: [items: AssetItem[]]
}>()

const importing = ref(false)
const exporting = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const importStatus = ref('')

async function handleExportJSON() {
  exporting.value = true
  try {
    await exportJSON(props.items)
    emit('toast', 'JSON 已导出')
  } catch (e) {
    console.error(e)
    emit('toast', '导出失败')
  } finally {
    exporting.value = false
  }
}

function handleExportCSV() {
  try {
    exportCSV(props.items, calcDays)
    emit('toast', 'CSV 已导出')
  } catch (e) {
    console.error(e)
    emit('toast', '导出失败')
  }
}

function triggerImport() {
  importInput.value?.click()
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''

  importing.value = true
  importStatus.value = '正在读取文件…'

  try {
    const { items, count } = await importJSON(file, (msg) => {
      importStatus.value = msg
    })

    const confirmed = window.confirm(`将导入 ${count} 件物品，已有物品将被覆盖。是否继续？`)
    if (!confirmed) {
      importing.value = false
      importStatus.value = ''
      return
    }

    emit('imported', items)
    emit('toast', `已导入 ${count} 件物品`)
    emit('close')
  } catch (e) {
    console.error(e)
    emit('toast', (e as Error).message || '导入失败')
  } finally {
    importing.value = false
    importStatus.value = ''
  }
}
</script>

<style scoped>
.settings-panel {
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
}

@media (min-width: 640px) {
  .settings-panel {
    padding: 32px;
  }
}

.settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.settings-panel__title {
  font-size: 18px;
  font-weight: 600;
}

.settings-panel__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--text-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.settings-panel__actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-m);
  text-align: left;
  transition: background 0.15s ease;
}

.settings-row:hover:not(:disabled) {
  background: var(--surface-2);
}

.settings-row:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.settings-row__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-row__label {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 2px;
}

.settings-row__hint {
  font-size: 12px;
  color: var(--text-2);
}
</style>
