<template>
  <div v-if="open" class="search-bar">
    <svg class="search-bar__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11 11l3.5 3.5M7 2a5 5 0 100 10A5 5 0 007 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input
      ref="inputRef"
      v-model="query"
      type="search"
      placeholder="搜索物品名称"
      class="search-bar__input"
      @input="$emit('update:query', query)"
    />
    <button v-if="query" type="button" class="search-bar__clear" @click="clear">
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  query: string
}>()

const emit = defineEmits<{
  'update:query': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const query = ref(props.query)

watch(() => props.query, v => { query.value = v })

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    query.value = ''
    emit('update:query', '')
  }
})

function clear() {
  query.value = ''
  emit('update:query', '')
  inputRef.value?.focus()
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border-radius: var(--radius-pill);
  padding: 0 14px;
  min-height: 36px;
  box-shadow: inset 0 0 0 1px var(--hairline);
  flex-shrink: 0;
}

.search-bar__icon {
  color: var(--text-2);
  flex-shrink: 0;
}

.search-bar__input {
  width: 100%;
  min-height: 36px !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-size: 14px;
}

.search-bar__input:focus {
  box-shadow: none !important;
  background: transparent !important;
}

.search-bar__clear {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface-3);
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
