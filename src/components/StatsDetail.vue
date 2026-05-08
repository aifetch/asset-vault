<template>
  <section class="stats-detail">
    <nav class="stats-detail__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="stats-detail__tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="stats-detail__body">
      <!-- Overview -->
      <div v-if="activeTab === 'overview'" class="overview-cards">
        <div class="overview-card">
          <div class="overview-card__label">物品总数</div>
          <div class="overview-card__value">{{ totalCount }} 件</div>
        </div>
        <div class="overview-card">
          <div class="overview-card__label">平均持有</div>
          <div class="overview-card__value">{{ avgDays }} 天</div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div v-if="activeTab === 'category'" class="chart-container">
        <div v-if="categoryData.length === 0" class="chart-empty">暂无数据</div>
        <canvas v-else ref="doughnutCanvas"></canvas>
      </div>

      <!-- Monthly Trend -->
      <div v-if="activeTab === 'trend'" class="chart-container">
        <div v-if="trendData.every(d => d === 0)" class="chart-empty">暂无数据</div>
        <canvas v-else ref="barCanvas"></canvas>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Chart } from 'chart.js'
import { chartDefaults, getChartColors } from '../lib/chart-theme'
import { calcDays } from '../lib/format'
import type { AssetItem } from '../types/asset'

const props = defineProps<{
  items: AssetItem[]
  totalCount: number
  avgDays: number
}>()

const emit = defineEmits<{
  filterCategory: [category: string]
}>()

const tabs = [
  { key: 'overview', label: '总览' },
  { key: 'category', label: '分类' },
  { key: 'trend', label: '趋势' }
] as const

type TabKey = typeof tabs[number]['key']
const activeTab = ref<TabKey>('overview')

const doughnutCanvas = ref<HTMLCanvasElement | null>(null)
const barCanvas = ref<HTMLCanvasElement | null>(null)

let doughnutChart: Chart | null = null
let barChart: Chart | null = null

const categoryData = computed(() => {
  const map = new Map<string, number>()
  for (const item of props.items) {
    map.set(item.category, (map.get(item.category) ?? 0) + item.price)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
})

const trendData = computed(() => {
  const now = new Date()
  const months: number[] = new Array(12).fill(0)

  for (const item of props.items) {
    const d = new Date(item.purchaseDate + 'T00:00:00')
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (diffMonths >= 0 && diffMonths < 12) {
      months[11 - diffMonths] += item.price
    }
  }

  return months
})

const monthLabels = computed(() => {
  const now = new Date()
  const labels: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(`${d.getMonth() + 1}月`)
  }
  return labels
})

watch([activeTab, () => props.items], () => {
  nextTick(() => {
    if (activeTab.value === 'category') renderDoughnut()
    if (activeTab.value === 'trend') renderBar()
  })
}, { immediate: true })

function renderDoughnut() {
  if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null }
  const canvas = doughnutCanvas.value
  if (!canvas || categoryData.value.length === 0) return

  const colors = getChartColors(categoryData.value.length)

  doughnutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: categoryData.value.map(d => d.name),
      datasets: [{
        data: categoryData.value.map(d => d.value),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      ...chartDefaults,
      cutout: '65%',
      plugins: {
        ...chartDefaults.plugins,
        legend: {
          ...chartDefaults.plugins.legend,
          position: 'right'
        }
      },
      onClick: (_event, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index
          emit('filterCategory', categoryData.value[idx].name)
        }
      }
    }
  })
}

function renderBar() {
  if (barChart) { barChart.destroy(); barChart = null }
  const canvas = barCanvas.value
  if (!canvas || trendData.value.every(d => d === 0)) return

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0071e3'

  barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: monthLabels.value,
      datasets: [{
        data: trendData.value,
        backgroundColor: accent,
        borderRadius: 6,
        barPercentage: 0.7
      }]
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim()
          }
        },
        y: {
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--hairline').trim()
          },
          ticks: {
            font: { size: 11 },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim(),
            callback: (value) => `¥${value}`
          }
        }
      }
    }
  })
}
</script>

<style scoped>
.stats-detail {
  margin-bottom: 36px;
}

.stats-detail__tabs {
  display: flex;
  gap: 4px;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
  padding: 3px;
  margin-bottom: 20px;
}

.stats-detail__tab {
  flex: 1;
  min-height: 36px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  transition: all 0.2s ease;
}

.stats-detail__tab.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.stats-detail__body {
  min-height: 200px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.overview-card {
  background: var(--surface);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-card);
  padding: 20px;
  text-align: center;
}

.overview-card__label {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 8px;
}

.overview-card__value {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.chart-container {
  position: relative;
  height: 260px;
  background: var(--surface);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-card);
  padding: 20px;
}

@media (min-width: 640px) {
  .chart-container {
    height: 300px;
    padding: 24px;
  }
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-3);
  font-size: 14px;
}
</style>
