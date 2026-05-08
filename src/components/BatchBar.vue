<template>
  <Teleport to="body">
    <div v-if="batchMode" class="batch-bar">
      <div class="batch-bar__info">
        <button type="button" class="batch-bar__checkbox" @click="$emit('toggle-all')">
          <svg v-if="allSelected" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" fill="var(--accent)" stroke="var(--accent)" stroke-width="1.3" />
            <path d="M4.5 8.5L7 11l4.5-5.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="var(--text-2)" stroke-width="1.3" />
          </svg>
        </button>
        <span class="batch-bar__count">已选 {{ selectedCount }} 件</span>
      </div>

      <div class="batch-bar__actions">
        <button
          type="button"
          class="batch-bar__delete"
          :disabled="selectedCount === 0"
          @click="$emit('delete')"
        >
          删除 ({{ selectedCount }})
        </button>
        <button type="button" class="batch-bar__done" @click="$emit('done')">
          完成
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  batchMode: boolean
  selectedCount: number
  allSelected: boolean
}>()

defineEmits<{
  'toggle-all': []
  delete: []
  done: []
}>()
</script>

<style scoped>
.batch-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface);
  border-top: 0.5px solid var(--hairline);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 60;
  animation: slide-up-bar 0.2s ease;
}

@keyframes slide-up-bar {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.batch-bar__info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-bar__checkbox {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-bar__count {
  font-size: 14px;
  font-weight: 500;
}

.batch-bar__actions {
  display: flex;
  gap: 8px;
}

.batch-bar__delete {
  min-height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-pill);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
}

.batch-bar__delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.batch-bar__done {
  min-height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}
</style>
