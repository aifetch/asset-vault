import { computed, onBeforeUnmount, ref } from 'vue'
import { deleteAsset, getAllAssets, saveAsset } from '../lib/db'
import { calcDays } from '../lib/format'
import type { AssetDraft, AssetItem } from '../types/asset'

export const PRESET_CATEGORIES = ['电子产品', '服装', '家居', '书籍', '工具', '其他']

export type SortMode = 'price-desc' | 'price-asc' | 'daily-desc' | 'daily-asc' | 'newest' | 'oldest'

export function useAssets() {
  const items = ref<AssetItem[]>([])
  const activeCategory = ref('全部')
  const loading = ref(true)
  const loadError = ref('')
  const objectUrls = new Map<string, string>()

  // Search
  const searchQuery = ref('')
  const searchOpen = ref(false)

  // Sort
  const sortMode = ref<SortMode>('price-desc')

  // View
  const viewMode = ref<'grid' | 'list'>('grid')

  // Batch
  const batchMode = ref(false)
  const selectedIds = ref(new Set<string>())

  // Undo
  const pendingDelete = ref<{ item: AssetItem; timer: number } | null>(null)
  const undoVisible = ref(false)
  const undoMessage = ref('')

  const categories = computed(() => {
    const custom = items.value.map(item => item.category)
    return [...new Set([...PRESET_CATEGORIES, ...custom])]
  })

  const filteredItems = computed(() => {
    let list = items.value

    // Category filter
    if (activeCategory.value !== '全部') {
      list = list.filter(item => item.category === activeCategory.value)
    }

    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(item => item.name.toLowerCase().includes(q))
    }

    // Sort
    const sorted = [...list]
    switch (sortMode.value) {
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'daily-desc':
        sorted.sort((a, b) => {
          const da = calcDays(a.purchaseDate)
          const db = calcDays(b.purchaseDate)
          const avgA = da > 0 ? a.price / da : 0
          const avgB = db > 0 ? b.price / db : 0
          return avgB - avgA
        })
        break
      case 'daily-asc':
        sorted.sort((a, b) => {
          const da = calcDays(a.purchaseDate)
          const db = calcDays(b.purchaseDate)
          const avgA = da > 0 ? a.price / da : 0
          const avgB = db > 0 ? b.price / db : 0
          return avgA - avgB
        })
        break
      case 'newest':
        sorted.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'oldest':
        sorted.sort((a, b) => a.createdAt - b.createdAt)
        break
    }

    return sorted
  })

  const totalAssets = computed(() => items.value.reduce((sum, item) => sum + item.price, 0))

  const totalDaily = computed(() => items.value.reduce((sum, item) => {
    const days = calcDays(item.purchaseDate)
    return sum + (days > 0 ? item.price / days : 0)
  }, 0))

  const totalCount = computed(() => items.value.length)

  const avgDays = computed(() => {
    if (items.value.length === 0) return 0
    const total = items.value.reduce((sum, item) => sum + calcDays(item.purchaseDate), 0)
    return Math.round(total / items.value.length)
  })

  const allSelected = computed(() =>
    filteredItems.value.length > 0 &&
    filteredItems.value.every(item => selectedIds.value.has(item.id))
  )

  async function load() {
    loading.value = true
    loadError.value = ''

    try {
      items.value = await getAllAssets()
    } catch (error) {
      console.error(error)
      loadError.value = '无法打开本地数据库，请确认浏览器支持 IndexedDB。'
    } finally {
      loading.value = false
    }
  }

  async function upsert(payload: AssetDraft & { id?: string; createdAt?: number }) {
    const asset: AssetItem = {
      id: payload.id ?? crypto.randomUUID(),
      name: payload.name,
      category: payload.category,
      price: payload.price ?? 0,
      purchaseDate: payload.purchaseDate,
      image: payload.image,
      createdAt: payload.createdAt ?? Date.now()
    }

    await saveAsset(asset)
    releaseUrl(asset.id)

    const index = items.value.findIndex(item => item.id === asset.id)
    if (index >= 0) {
      items.value[index] = asset
      items.value = [...items.value]
    } else {
      items.value = [...items.value, asset]
    }
  }

  async function remove(id: string) {
    await deleteAsset(id)
    releaseUrl(id)
    items.value = items.value.filter(item => item.id !== id)
  }

  function softDelete(item: AssetItem) {
    // If there's a pending delete, finalize it first
    if (pendingDelete.value) {
      finalizeDelete(pendingDelete.value)
    }

    // Remove from UI only
    items.value = items.value.filter(i => i.id !== item.id)

    // Set up undo timer
    const timer = window.setTimeout(() => {
      if (pendingDelete.value?.item.id === item.id) {
        finalizeDelete(pendingDelete.value)
        pendingDelete.value = null
        undoVisible.value = false
      }
    }, 5000)

    pendingDelete.value = { item, timer }
    undoMessage.value = `已删除「${item.name}」`
    undoVisible.value = true
  }

  function undoDelete() {
    if (!pendingDelete.value) return

    // Restore item to list
    items.value = [...items.value, pendingDelete.value.item]
    window.clearTimeout(pendingDelete.value.timer)
    pendingDelete.value = null
    undoVisible.value = false
  }

  async function finalizeDelete(pending: { item: AssetItem; timer: number }) {
    window.clearTimeout(pending.timer)
    await deleteAsset(pending.item.id)
    releaseUrl(pending.item.id)
  }

  function dismissUndo() {
    if (pendingDelete.value) {
      finalizeDelete(pendingDelete.value)
      pendingDelete.value = null
    }
    undoVisible.value = false
  }

  async function batchDelete() {
    const ids = [...selectedIds.value]
    if (ids.length === 0) return

    // Finalize any pending delete first
    if (pendingDelete.value) {
      await finalizeDelete(pendingDelete.value)
      pendingDelete.value = null
      undoVisible.value = false
    }

    for (const id of ids) {
      await deleteAsset(id)
      releaseUrl(id)
    }

    items.value = items.value.filter(item => !selectedIds.value.has(item.id))
    selectedIds.value = new Set()
    batchMode.value = false
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  function toggleSelectAll() {
    if (allSelected.value) {
      selectedIds.value = new Set()
    } else {
      selectedIds.value = new Set(filteredItems.value.map(item => item.id))
    }
  }

  function exitBatchMode() {
    batchMode.value = false
    selectedIds.value = new Set()
  }

  function getObjectUrl(item: AssetItem) {
    if (!item.image) return null
    const cached = objectUrls.get(item.id)
    if (cached) return cached
    const url = URL.createObjectURL(item.image)
    objectUrls.set(item.id, url)
    return url
  }

  function releaseUrl(id: string) {
    const url = objectUrls.get(id)
    if (!url) return
    URL.revokeObjectURL(url)
    objectUrls.delete(id)
  }

  function setActiveCategory(category: string) {
    activeCategory.value = category
  }

  onBeforeUnmount(() => {
    for (const url of objectUrls.values()) {
      URL.revokeObjectURL(url)
    }
    objectUrls.clear()
    if (pendingDelete.value) {
      window.clearTimeout(pendingDelete.value.timer)
    }
  })

  return {
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
    load,
    loading,
    loadError,
    remove,
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
    viewMode,
    getObjectUrl
  }
}
