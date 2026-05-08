<template>
  <div class="upload-box">
    <input ref="fileInput" type="file" accept="image/*" hidden @change="onSelect" />

    <button type="button" class="upload-box__trigger" @click="fileInput?.click()">
      <img v-if="previewUrl" :src="previewUrl" alt="预览图" />
      <span v-else class="upload-box__plus">+</span>
      <div class="upload-box__overlay">{{ previewUrl ? '更换图片' : '添加图片' }}</div>
    </button>

    <button
      v-if="previewUrl"
      type="button"
      class="upload-box__remove"
      aria-label="移除图片"
      @click="emit('remove')"
    >
      <svg viewBox="0 0 14 14" fill="none">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { compressImage } from '../lib/image'

const emit = defineEmits<{
  change: [blob: Blob]
  remove: []
  error: [message: string]
}>()

defineProps<{
  previewUrl: string | null
}>()

const fileInput = ref<HTMLInputElement | null>(null)

async function onSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const blob = await compressImage(file)
    emit('change', blob)
  } catch (error) {
    console.error(error)
    emit('error', '图片处理失败')
  } finally {
    input.value = ''
  }
}
</script>

<style scoped>
.upload-box {
  position: relative;
  width: 96px;
  height: 96px;
}

.upload-box__trigger {
  width: 96px;
  height: 96px;
  border-radius: 18px;
  background: var(--surface-2);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 1px solid var(--hairline);
}

.upload-box__trigger img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-box__plus {
  font-size: 36px;
  font-weight: 300;
  color: var(--text-3);
}

.upload-box__overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 10px 8px;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.52), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-box__trigger:hover .upload-box__overlay,
.upload-box__trigger:focus-visible .upload-box__overlay {
  opacity: 1;
}

.upload-box__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

.upload-box__remove svg {
  width: 12px;
  height: 12px;
}
</style>
