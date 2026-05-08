<template>
  <div class="view-toggle">
    <button
      type="button"
      class="view-toggle__btn"
      :class="{ active: modelValue === 'grid' }"
      aria-label="网格视图"
      @click="$emit('update:modelValue', 'grid')"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" stroke-width="1.3" />
        <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" stroke-width="1.3" />
        <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" stroke-width="1.3" />
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" stroke-width="1.3" />
      </svg>
    </button>
    <button
      type="button"
      class="view-toggle__btn"
      :class="{ active: modelValue === 'list' }"
      aria-label="列表视图"
      @click="$emit('update:modelValue', 'list')"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.3" />
        <rect x="1" y="7" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.3" />
        <rect x="1" y="12" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.3" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'grid' | 'list'
}>()

defineEmits<{
  'update:modelValue': [value: 'grid' | 'list']
}>()
</script>

<style scoped>
.view-toggle {
  display: inline-flex;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
  padding: 3px;
  gap: 2px;
}

.view-toggle__btn {
  width: 32px;
  height: 30px;
  border-radius: var(--radius-pill);
  color: var(--text-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.view-toggle__btn.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
