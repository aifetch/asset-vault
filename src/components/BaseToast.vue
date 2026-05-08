<template>
  <div class="toast" :class="{ show: visible }">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  visible: boolean
}>()
</script>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(32px + env(safe-area-inset-bottom));
  transform: translateX(-50%) translateY(20px);
  background: var(--text);
  color: var(--bg);
  padding: 12px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
  z-index: 100;
  max-width: 90vw;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
