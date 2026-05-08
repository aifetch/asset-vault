export interface AssetItem {
  id: string
  name: string
  category: string
  price: number
  purchaseDate: string
  image: Blob | null
  createdAt: number
}

export interface AssetDraft {
  name: string
  category: string
  price: number | null
  purchaseDate: string
  image: Blob | null
}
