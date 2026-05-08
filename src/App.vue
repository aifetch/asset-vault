<template>
  <div class="app-shell">
    <header class="page-header">
      <div class="page-header__row">
        <div>
          <h1>我的资产</h1>
          <p>换个角度看看它们每天值多少钱</p>
        </div>
        <button type="button" class="gear-button" aria-label="设置" @click="settingsOpen = true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.5" />
            <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.4 3.4l1.4 1.4M13.2 13.2l1.4 1.4M3.4 14.6l1.4-1.4M13.2 4.8l1.4-1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <StatsSection :total-assets="totalAssets" :total-daily="totalDaily" />
    <StatsDetail
      :items="items"
      :total-count="totalCount"
      :avg-days="avgDays"
      @filter-category="setActiveCategory"
    />

    <div ref="toolbarRef" class="toolbar">
      <CategoryTabs
        v-if="!searchOpen"
        :categories="categories"
        :active-category="activeCategory"
        @change="setActiveCategory"
      />

      <SearchBar
        v-if="searchOpen"
        :open="searchOpen"
        :query="searchQuery"
        @update:query="q => searchQuery = q"
      />

      <div class="toolbar__actions">
        <button
          v-if="!searchOpen"
          type="button"
          class="toolbar__icon-btn"
          aria-label="搜索"
          @click="searchOpen = true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11 11l3.5 3.5M7 2a5 5 0 100 10A5 5 0 007 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>

        <button v-else type="button" class="toolbar__icon-btn" aria-label="关闭搜索" @click="searchOpen = false">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>

        <div class="sort-chip">
          <select v-model="sortMode" class="sort-select">
            <option value="price-desc">价格 高→低</option>
            <option value="price-asc">价格 低→高</option>
            <option value="daily-desc">日均 高→低</option>
            <option value="daily-asc">日均 低→高</option>
            <option value="newest">最新添加</option>
            <option value="oldest">最早添加</option>
          </select>
        </div>

        <ViewToggle v-model="viewMode" class="hide-mobile" />

        <button
          v-if="!batchMode && items.length > 0"
          type="button"
          class="toolbar__icon-btn"
          aria-label="批量管理"
          @click="batchMode = true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>

        <button class="pill-button toolbar-action" type="button" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <span>添加</span>
        </button>
      </div>
    </div>

    <AssetGrid
      :items="items"
      :filtered-items="filteredItems"
      :active-category="activeCategory"
      :loading="loading"
      :error="loadError"
      :get-image-url="getObjectUrl"
      :view-mode="viewMode"
      :batch-mode="batchMode"
      :selected-ids="selectedIds"
      @edit="openEdit"
      @toggle-select="toggleSelect"
    />
  </div>

  <button v-if="!batchMode" class="fab" type="button" aria-label="添加物品" @click="openCreate">
    <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>

  <AssetDialog
    :open="dialogOpen"
    :item="editingItem"
    :categories="categories"
    @close="closeDialog"
    @save="handleSave"
    @remove="handleDelete"
    @toast="showToast"
  />

  <SettingsSheet
    :open="settingsOpen"
    :items="items"
    @close="settingsOpen = false"
    @toast="showToast"
    @imported="handleImported"
  />

  <BatchBar
    :batch-mode="batchMode"
    :selected-count="selectedIds.size"
    :all-selected="allSelected"
    @toggle-all="toggleSelectAll"
    @delete="handleBatchDelete"
    @done="exitBatchMode"
  />

  <!-- Undo Toast -->
  <Teleport to="body">
    <div v-if="undoVisible" class="undo-toast" @click="undoDelete">
      <span>{{ undoMessage }}</span>
      <button type="button" class="undo-toast__action" @click.stop="undoDelete">撤销</button>
    </div>
  </Teleport>

  <BaseToast :message="toastMessage" :visible="toastVisible" />

  <!-- PWA Install Banner -->
  <div v-if="installBannerVisible" class="install-banner">
    <span>添加到主屏幕，离线也能用</span>
    <button type="button" class="install-banner__action" @click="handleInstall">安装</button>
    <button type="button" class="install-banner__dismiss" @click="dismissInstall">
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <!-- Offline Indicator -->
  <div v-if="isOffline" class="offline-badge">离线模式</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AssetDialog from './components/AssetDialog.vue'
import AssetGrid from './components/AssetGrid.vue'
import BatchBar from './components/BatchBar.vue'
import BaseToast from './components/BaseToast.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import SearchBar from './components/SearchBar.vue'
import SettingsSheet from './components/SettingsSheet.vue'
import StatsDetail from './components/StatsDetail.vue'
import StatsSection from './components/StatsSection.vue'
import ViewToggle from './components/ViewToggle.vue'
import { useAssets } from './composables/useAssets'
import { saveAsset } from './lib/db'
import type { AssetDraft, AssetItem } from './types/asset'

const {
  activeCategory,
  allSelected,
  avgDays,
  batchDelete,
  batchMode,
  categories,
  dismissUndo,
  exitBatchMode,
  filteredItems,
  items,
  getObjectUrl,
  load,
  loading,
  loadError,
  searchOpen,
  searchQuery,
  selectedIds,
  setActiveCategory,
  sortMode,
  softDelete,
  toggleSelect,
  toggleSelectAll,
  totalAssets,
  totalCount,
  totalDaily,
  undoDelete,
  undoMessage,
  undoVisible,
  upsert,
  viewMode
} = useAssets()

const dialogOpen = ref(false)
const editingItem = ref<AssetItem | null>(null)
const settingsOpen = ref(false)
const toastMessage = ref('')
const toastVisible = ref(false)
const toolbarRef = ref<HTMLElement | null>(null)
let toastTimer: number | null = null

// PWA state
const installBannerVisible = ref(false)
const isOffline = ref(false)
let deferredPrompt: any = null

function onScroll() {
  if (!toolbarRef.value) return
  toolbarRef.value.classList.toggle('is-scrolled', window.scrollY > 8)
}

function onOnline() { isOffline.value = false }
function onOffline() { isOffline.value = true }

onMounted(() => {
  load()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  isOffline.value = !navigator.onLine

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt = e
    installBannerVisible.value = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
  dismissUndo()
})

function openCreate() {
  editingItem.value = null
  dialogOpen.value = true
}

function openEdit(item: AssetItem) {
  if (batchMode.value) return
  editingItem.value = item
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

async function handleSave(payload: AssetDraft & { id?: string; createdAt?: number }) {
  try {
    await upsert(payload)
    showToast(payload.id ? '已更新' : '已添加')
    closeDialog()
  } catch (error) {
    console.error(error)
    showToast('保存失败')
  }
}

async function handleDelete() {
  if (!editingItem.value) return

  try {
    softDelete(editingItem.value)
    closeDialog()
  } catch (error) {
    console.error(error)
    showToast('删除失败')
  }
}

async function handleBatchDelete() {
  const count = selectedIds.value.size
  if (count === 0) return
  if (!window.confirm(`确定删除 ${count} 件物品？`)) return

  try {
    await batchDelete()
    showToast(`已删除 ${count} 件物品`)
  } catch (error) {
    console.error(error)
    showToast('删除失败')
  }
}

async function handleImported(importedItems: AssetItem[]) {
  for (const item of importedItems) {
    await saveAsset(item)
  }
  await load()
}

async function handleInstall() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
  installBannerVisible.value = false
}

function dismissInstall() {
  installBannerVisible.value = false
}

function showToast(message: string) {
  toastMessage.value = message
  toastVisible.value = true
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 2200)
}
</script>
