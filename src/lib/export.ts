import type { AssetItem } from '../types/asset'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob())
}

interface ExportData {
  version: number
  exportedAt: string
  items: Array<Omit<AssetItem, 'image'> & { image: string | null }>
}

export async function exportJSON(items: AssetItem[]): Promise<void> {
  const exportedItems = await Promise.all(
    items.map(async item => ({
      ...item,
      image: item.image ? await blobToBase64(item.image) : null
    }))
  )

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    items: exportedItems
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  a.download = `assets-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(items: AssetItem[], calcDaysFn: (date: string) => number): void {
  const BOM = '﻿'
  const header = '名称,分类,价格,购买日期,已拥有天数,日均成本'
  const rows = items.map(item => {
    const days = calcDaysFn(item.purchaseDate)
    const daily = days > 0 ? (item.price / days).toFixed(2) : '0'
    return `"${item.name}","${item.category}",${item.price},"${item.purchaseDate}",${days},${daily}`
  })

  const csv = BOM + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  a.download = `assets-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importJSON(
  file: File,
  onProgress?: (message: string) => void
): Promise<{ items: AssetItem[]; count: number }> {
  const text = await file.text()

  let data: ExportData
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('文件格式错误：不是有效的 JSON')
  }

  if (!data.version || !Array.isArray(data.items)) {
    throw new Error('文件格式错误：缺少 version 或 items 字段')
  }

  onProgress?.('正在解析数据…')

  const items: AssetItem[] = []
  for (let i = 0; i < data.items.length; i++) {
    const raw = data.items[i]
    let image: Blob | null = null

    if (raw.image && typeof raw.image === 'string' && raw.image.startsWith('data:')) {
      image = await base64ToBlob(raw.image)
    }

    items.push({
      id: raw.id,
      name: raw.name,
      category: raw.category,
      price: raw.price,
      purchaseDate: raw.purchaseDate,
      image,
      createdAt: raw.createdAt
    })

    if (i % 10 === 0) {
      onProgress?.(`正在处理 ${i + 1}/${data.items.length}…`)
      await new Promise(r => setTimeout(r, 0))
    }
  }

  return { items, count: items.length }
}
