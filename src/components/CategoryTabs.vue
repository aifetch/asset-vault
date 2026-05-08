<template>
  <div class="categories-wrap">
    <nav class="categories" role="tablist">
      <button
        v-for="category in ['全部', ...categories]"
        :key="category"
        type="button"
        class="chip"
        :class="{ active: activeCategory === category }"
        @click="$emit('change', category)"
      >
        {{ category }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[]
  activeCategory: string
}>()

defineEmits<{
  change: [category: string]
}>()
</script>

<style scoped>
.categories-wrap {
  flex: 1;
  position: relative;
  min-width: 0;
}

.categories-wrap::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  width: 40px;
  background: linear-gradient(to left, var(--bg), transparent);
  pointer-events: none;
}

.categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-right: 40px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.categories::-webkit-scrollbar {
  display: none;
}

.chip {
  flex-shrink: 0;
  min-height: 36px;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-2);
  box-shadow: inset 0 0 0 1px var(--hairline);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.chip:hover {
  background: var(--surface-2);
  color: var(--text);
}

.chip.active {
  background: var(--text);
  color: var(--bg);
  box-shadow: none;
}

.chip.active:hover {
  background: var(--text);
  color: var(--bg);
}
</style>
