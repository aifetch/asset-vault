<template>
  <Teleport to="body">
    <div v-if="open" class="sheet-backdrop" @click.self="$emit('close')">
      <div class="sheet-panel card-surface" :class="{ desktop: desktop }">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  desktop?: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 80;
}

.sheet-panel {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: var(--shadow-dialog);
  animation: slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-panel.desktop {
  width: 480px;
  max-width: 92vw;
  border-radius: 20px;
  animation: fade-in 0.18s ease;
}

@media (min-width: 640px) {
  .sheet-backdrop {
    align-items: center;
  }

  .sheet-panel {
    width: 480px;
    max-width: 92vw;
    border-radius: 20px;
    animation: fade-in 0.18s ease;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    transform: scale(0.96);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
