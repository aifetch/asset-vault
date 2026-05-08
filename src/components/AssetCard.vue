<template>
  <article class="card-surface asset-card" @click="handleClick">
    <div v-if="batchMode" class="asset-card__check" @click.stop="$emit('select')">
      <svg v-if="selected" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="16" height="16" rx="4" fill="var(--accent)" stroke="var(--accent)" stroke-width="1.3" />
        <path d="M5 9.5L8 13l5.5-7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="16" height="16" rx="4" stroke="var(--text-2)" stroke-width="1.3" />
      </svg>
    </div>

    <div class="asset-card__image">
      <img v-if="imageUrl" :src="imageUrl" :alt="item.name" loading="lazy" />
      <span v-else class="asset-card__placeholder">◇</span>
      <button v-if="!batchMode" class="asset-card__edit" type="button" aria-label="编辑" @click.stop="$emit('edit')">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="asset-card__body">
      <div class="asset-card__category">{{ item.category }}</div>
      <div class="asset-card__name">{{ item.name }}</div>
      <div class="asset-card__price"><span class="currency">¥</span>{{ formatMoney(item.price) }}</div>

      <div class="asset-card__meta-row">
        <span class="asset-card__meta">已拥有 <strong>{{ daysOwned }}</strong> 天</span>
        <template v-if="daysOwned > 0">
          <span class="asset-card__daily-label">日均</span>
          <span class="asset-card__daily-value">¥{{ formatDaily(dailyAvg) }}</span>
        </template>
        <template v-else>
          <span class="asset-card__daily-label">新加入</span>
          <span class="asset-card__daily-value">—</span>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { calcDays, formatDaily, formatMoney } from '../lib/format'
import type { AssetItem } from '../types/asset'

const props = defineProps<{
  item: AssetItem
  imageUrl: string | null
  batchMode?: boolean
  selected?: boolean
}>()

const emit = defineEmits<{
  edit: []
  select: []
}>()

function handleClick() {
  if (props.batchMode) {
    emit('select')
  } else {
    emit('edit')
  }
}

const daysOwned = computed(() => calcDays(props.item.purchaseDate))
const dailyAvg = computed(() => (daysOwned.value > 0 ? props.item.price / daysOwned.value : 0))
</script>

<style scoped>
.asset-card {
  cursor: pointer;
  transition: transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.asset-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.asset-card:active {
  transform: translateY(-1px) scale(0.99);
  transition-duration: 0.12s;
}

.asset-card__check {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--surface-2);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

@media (min-width: 640px) {
  .asset-card__image {
    aspect-ratio: 1 / 1;
  }
}

.asset-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.asset-card:hover .asset-card__image img {
  transform: scale(1.05);
}

.asset-card__placeholder {
  font-size: 48px;
  color: var(--text-3);
  font-weight: 300;
}

.asset-card__edit {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  opacity: 0;
  transition: opacity 0.2s ease;
}

@media (hover: hover) {
  .asset-card:hover .asset-card__edit {
    opacity: 1;
  }
}

@media (hover: none) {
  .asset-card__edit {
    opacity: 1;
  }
}

.asset-card__edit svg {
  width: 15px;
  height: 15px;
}

.asset-card__body {
  padding: 14px 16px 18px;
}

@media (min-width: 768px) {
  .asset-card__body {
    padding: 16px 20px 20px;
  }
}

.asset-card__category {
  display: inline-block;
  font-size: 11px;
  color: var(--accent);
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.asset-card__name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.asset-card__price {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .asset-card__price {
    font-size: 24px;
  }
}

.asset-card__price .currency {
  font-size: 0.6em;
  color: var(--text-2);
  margin-right: 2px;
  font-weight: 500;
}

.asset-card__meta-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  padding-top: 12px;
  border-top: 1px solid var(--hairline);
}

.asset-card__meta {
  color: var(--text-2);
}

.asset-card__meta strong {
  color: var(--text);
  font-weight: 600;
}

.asset-card__daily-label {
  color: var(--text-2);
  margin-left: auto;
}

.asset-card__daily-value {
  color: var(--accent);
  font-weight: 600;
}
</style>