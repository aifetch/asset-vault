<template>
  <BaseSheet :open="open" @close="emit('close')">
    <form class="dialog-card" @submit.prevent="onSubmit">
      <div class="dialog-card__header">
        <div class="dialog-card__title">{{ editing ? '编辑物品' : '添加物品' }}</div>
        <button type="button" class="dialog-card__close" @click="emit('close')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="field">
        <label>图片</label>
        <ImageUploadBox
          :preview-url="previewUrl"
          @change="setImage"
          @remove="removeImage"
          @error="message => emit('toast', message)"
        />
      </div>

      <div class="field">
        <label for="name">名称</label>
        <input id="name" v-model.trim="draft.name" type="text" maxlength="40" placeholder="例如：MacBook Pro" />
      </div>

      <div class="field">
        <label for="category">分类</label>
        <select id="category" v-model="selectedCategory">
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          <option :value="ADD_CUSTOM">+ 新建分类…</option>
        </select>
        <div v-if="selectedCategory === ADD_CUSTOM" class="field__sub">
          <input v-model.trim="customCategory" type="text" maxlength="12" placeholder="新分类名" />
        </div>
      </div>

      <div class="field">
        <label for="price">价格（元）</label>
        <input id="price" v-model.number="draft.price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" />
      </div>

      <div class="field field--date">
        <div class="field__row">
          <label>购买日期</label>
        </div>

        <button
          v-if="isMobile"
          type="button"
          class="mobile-date-trigger"
          @click="mobilePickerOpen = true"
        >
          <span>{{ mobileDisplayDate }}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2.5L7.5 6 4 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <VueDatePicker
          v-else
          v-model="purchaseDateValue"
          locale="zh-CN"
          format="yyyy 年 MM 月 dd 日"
          model-type="yyyy-MM-dd"
          :enable-time-picker="false"
          :auto-apply="true"
          :teleport="true"
          :month-change-on-scroll="false"
          text-input
          input-class-name="asset-date-input"
          menu-class-name="asset-date-menu"
          calendar-class-name="asset-date-calendar"
          placeholder="请选择购买日期"
        />
      </div>

      <div class="dialog-card__actions">
        <button v-if="editing" type="button" class="danger-button" @click="emit('remove')">删除</button>
        <button type="button" class="secondary-button" @click="emit('close')">取消</button>
        <button type="submit" class="pill-button">保存</button>
      </div>
    </form>

    <van-popup v-model:show="mobilePickerOpen" position="bottom" round teleport="body">
      <van-date-picker
        v-model="mobilePickerValues"
        title="选择购买日期"
        :columns-type="['year', 'month', 'day']"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="handleMobileConfirm"
        @cancel="mobilePickerOpen = false"
      />
    </van-popup>
  </BaseSheet>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { Popup as VanPopup, DatePicker as VanDatePicker } from 'vant'
import BaseSheet from './BaseSheet.vue'
import ImageUploadBox from './ImageUploadBox.vue'
import { formatDisplayDate, todayString } from '../lib/format'
import type { AssetDraft, AssetItem } from '../types/asset'

const ADD_CUSTOM = '__add_custom__'

const props = defineProps<{
  open: boolean
  item: AssetItem | null
  categories: string[]
}>()

const emit = defineEmits<{
  close: []
  save: [payload: AssetDraft & { id?: string; createdAt?: number }]
  remove: []
  toast: [message: string]
}>()

const draft = reactive<AssetDraft>({
  name: '',
  category: '',
  price: null,
  purchaseDate: todayString(),
  image: null
})

const editing = computed(() => Boolean(props.item))
const selectedCategory = ref('')
const customCategory = ref('')
const previewUrl = ref<string | null>(null)
const isMobile = ref(false)
const mobilePickerOpen = ref(false)
const mobilePickerValues = ref<string[]>(splitDate(todayString()))
const minDate = new Date(2000, 0, 1)
const maxDate = new Date(2099, 11, 31)

const purchaseDateValue = computed({
  get: () => draft.purchaseDate,
  set: value => {
    draft.purchaseDate = value || todayString()
    mobilePickerValues.value = splitDate(draft.purchaseDate)
  }
})

const mobileDisplayDate = computed(() => formatDisplayDate(draft.purchaseDate))

function splitDate(value: string) {
  const [year, month, day] = value.split('-')
  return [year, String(Number(month)), String(Number(day))]
}

function updateViewport() {
  isMobile.value = window.innerWidth < 640
  if (!isMobile.value) {
    mobilePickerOpen.value = false
  }
}

watch(
  () => props.open,
  open => {
    if (!open) {
      mobilePickerOpen.value = false
      return
    }

    const item = props.item
    draft.name = item?.name ?? ''
    draft.category = item?.category ?? props.categories[0] ?? '电子产品'
    draft.price = item?.price ?? null
    draft.purchaseDate = item?.purchaseDate ?? todayString()
    draft.image = item?.image ?? null
    selectedCategory.value = props.categories.includes(draft.category) ? draft.category : ADD_CUSTOM
    customCategory.value = props.categories.includes(draft.category) ? '' : draft.category
    mobilePickerValues.value = splitDate(draft.purchaseDate)
    syncPreview(draft.image)
    updateViewport()
  },
  { immediate: true }
)

watch(selectedCategory, value => {
  if (value !== ADD_CUSTOM) {
    draft.category = value
  }
})

watch(customCategory, value => {
  if (selectedCategory.value === ADD_CUSTOM) {
    draft.category = value
  }
})

function syncPreview(blob: Blob | null) {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }

  if (blob) {
    previewUrl.value = URL.createObjectURL(blob)
  }
}

function setImage(blob: Blob) {
  draft.image = blob
  syncPreview(blob)
}

function removeImage() {
  draft.image = null
  syncPreview(null)
}

function handleMobileConfirm({ selectedValues }: { selectedValues: string[] }) {
  const [year, month, day] = selectedValues
  draft.purchaseDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  mobilePickerValues.value = [...selectedValues]
  mobilePickerOpen.value = false
}

function onSubmit() {
  const category = selectedCategory.value === ADD_CUSTOM ? customCategory.value.trim() : selectedCategory.value
  if (!draft.name || !category || draft.price === null || draft.price < 0 || !draft.purchaseDate) {
    emit('toast', '请完整填写')
    return
  }

  emit('save', {
    id: props.item?.id,
    createdAt: props.item?.createdAt,
    name: draft.name,
    category,
    price: draft.price,
    purchaseDate: draft.purchaseDate,
    image: draft.image
  })
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.dialog-card {
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
}

@media (min-width: 640px) {
  .dialog-card {
    padding: 32px;
  }
}

.dialog-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.dialog-card__title {
  font-size: 18px;
  font-weight: 600;
}

.dialog-card__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--text-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
}

.field__sub {
  margin-top: 8px;
}

.field__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.field__row label {
  margin-bottom: 0;
}

.mobile-date-trigger {
  min-height: 52px;
  width: 100%;
  border-radius: 16px;
  border: 1px solid var(--hairline);
  background: var(--surface-2);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text);
  font-size: 16px;
}

.dialog-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 28px;
}

.dialog-card__actions > * {
  flex: 1;
}

.secondary-button,
.danger-button {
  min-height: 44px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
}

.secondary-button {
  background: var(--surface-2);
  color: var(--text);
}

.danger-button {
  background: var(--danger);
  color: #fff;
}
</style>
