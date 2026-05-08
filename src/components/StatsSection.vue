<template>
  <section class="stats-grid">
    <article class="stat-card stat-card--assets">
      <div class="stat-card__label">总资产</div>
      <div class="stat-card__value">
        <span class="stat-card__currency">¥</span>
        <span>{{ formatMoney(totalAssets) }}</span>
      </div>
    </article>

    <article class="stat-card stat-card--daily">
      <div class="stat-card__label">总日均</div>
      <div class="stat-card__value">
        <span class="stat-card__currency">¥</span>
        <span>{{ formatDaily(totalDaily) }}</span>
        <span class="stat-card__unit">/ 天</span>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { formatDaily, formatMoney } from '../lib/format'

defineProps<{
  totalAssets: number
  totalDaily: number
}>()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 36px;
  animation: fade-up 0.6s 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 52px;
  }
}

.stat-card {
  position: relative;
  padding: 28px 24px;
  background: var(--surface);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

@media (min-width: 768px) {
  .stat-card {
    padding: 40px 36px;
  }
}

/* Apple Store-style subtle gradient accent on the left edge */
.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: 12px;
  letter-spacing: 0.02em;
}

.stat-card__value {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

@media (min-width: 768px) {
  .stat-card__value {
    font-size: 56px;
  }
}

@media (min-width: 1024px) {
  .stat-card__value {
    font-size: 64px;
  }
}

.stat-card__currency {
  font-size: 0.5em;
  font-weight: 500;
  color: var(--text-2);
  margin-right: 2px;
  vertical-align: 0.15em;
}

.stat-card__unit {
  font-size: 0.3em;
  font-weight: 400;
  color: var(--text-2);
  margin-left: 8px;
  vertical-align: 0.35em;
  letter-spacing: 0;
}
</style>
