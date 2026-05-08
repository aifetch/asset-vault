<template>
  <div v-if="loading" class="empty-state">
    <div class="empty-state__icon">···</div>
    <div class="empty-state__title">正在加载</div>
    <div class="empty-state__hint">读取本地资产数据中</div>
  </div>

  <div v-else-if="error" class="fatal-state">
    <div class="fatal-state__icon">!</div>
    <div class="fatal-state__title">无法打开本地数据库</div>
    <div class="fatal-state__hint">{{ error }}</div>
  </div>

  <div v-else-if="items.length === 0" class="empty-state">
    <div class="empty-state__icon">◇</div>
    <div class="empty-state__title">还没有物品</div>
    <div class="empty-state__hint">点击右下角 + 添加第一件</div>
  </div>

  <div v-else-if="filteredItems.length === 0" class="empty-state">
    <div class="empty-state__icon">◇</div>
    <div class="empty-state__title">没有匹配的物品</div>
    <div class="empty-state__hint">换个条件或添加新物品</div>
  </div>

  <section v-else class="asset-section">
    <header class="asset-section__header">
      <div>
        <p class="asset-section__eyebrow">按价格与使用时长整理</p>
        <h2 class="asset-section__title">{{ activeCategory === '全部' ? '全部物品' : activeCategory }}</h2>
      </div>
      <div class="asset-section__count">{{ filteredItems.length }} 件</div>
    </header>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid">
      <AssetCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :image-url="getImageUrl(item)"
        :batch-mode="batchMode"
        :selected="selectedIds.has(item.id)"
        @edit="$emit('edit', item)"
        @select="$emit('toggle-select', item.id)"
      />
    </div>

    <!-- List View -->
    <div v-else class="list">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="list-item"
        @click="handleListClick(item)"
      >
        <div v-if="batchMode" class="list-item__check" @click.stop="$emit('toggle-select', item.id)">
          <svg v-if="selectedIds.has(item.id)" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="16" height="16" rx="4" fill="var(--accent)" stroke="var(--accent)" stroke-width="1.3" />
            <path d="M5 9.5L8 13l5.5-7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="16" height="16" rx="4" stroke="var(--text-2)" stroke-width="1.3" />
          </svg>
        </div>

        <div class="list-item__thumb">
          <img v-if="getImageUrl(item)" :src="getImageUrl(item)!" :alt="item.name" loading="lazy" />
          <span v-else class="list-item__placeholder">◇</span>
        </div>

        <div class="list-item__info">
          <div class="list-item__name">{{ item.name }}</div>
          <div class="list-item__category">{{ item.category }}</div>
        </div>

        <div class="list-item__price">
          <span class="currency">¥</span>{{ formatMoney(item.price) }}
        </div>

        <div class="list-item__daily">
          <template v-if="calcDays(item.purchaseDate) > 0">
            ¥{{ formatDaily(item.price / calcDays(item.purchaseDate)) }}/天
          </template>
          <template v-else>新加入</template>
        </div>

        <button v-if="!batchMode" type="button" class="list-item__edit" @click.stop="$emit('edit', item)">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { calcDays, formatDaily, formatMoney } from '../lib/format'
import type { AssetItem } from '../types/asset'
import AssetCard from './AssetCard.vue'

const props = defineProps<{
  items: AssetItem[]
  filteredItems: AssetItem[]
  activeCategory: string
  loading: boolean
  error: string
  getImageUrl: (item: AssetItem) => string | null
  viewMode: 'grid' | 'list'
  batchMode: boolean
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  edit: [item: AssetItem]
  'toggle-select': [id: string]
}>()

function handleListClick(item: AssetItem) {
  if (props.batchMode) {
    emit('toggle-select', item.id)
  } else {
    emit('edit', item)
  }
}
</script>

<style scoped>
.asset-section {
  padding: 18px 0 8px;
}

.asset-section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .asset-section__header {
    margin-bottom: 28px;
  }
}

.asset-section__eyebrow {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 6px;
}

.asset-section__title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

@media (min-width: 768px) {
  .asset-section__title {
    font-size: 34px;
  }
}

.asset-section__count {
  flex-shrink: 0;
  min-height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--hairline);
  color: var(--text-2);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
}

@media (min-width: 1440px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 28px;
  }
}

/* List View */
.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.list-item:hover {
  box-shadow: var(--shadow-card-hover);
}

.list-item__check {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-item__thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--surface-2);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-item__placeholder {
  font-size: 22px;
  color: var(--text-3);
  font-weight: 300;
}

.list-item__info {
  flex: 1;
  min-width: 0;
}

.list-item__name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.list-item__category {
  font-size: 12px;
  color: var(--text-2);
}

.list-item__price {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

.list-item__price .currency {
  font-size: 0.7em;
  color: var(--text-2);
  font-weight: 500;
  margin-right: 1px;
}

.list-item__daily {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 72px;
  text-align: right;
}

.list-item__edit {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-item__edit svg {
  width: 15px;
  height: 15px;
}

@media (max-width: 639px) {
  .list-item__price {
    font-size: 14px;
  }

  .list-item__daily {
    font-size: 12px;
    min-width: 60px;
  }
}
</style>
