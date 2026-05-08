import type { AssetItem } from '../types/asset'

const DB_NAME = 'asset_vault'
const LEGACY_DB_NAME = 'personal_assets'
const STORE_NAME = 'items'

let dbPromise: Promise<IDBDatabase> | null = null
let legacyMigrationPromise: Promise<void> | null = null

function openDatabase(name: string) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by_createdAt', 'createdAt')
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function migrateLegacyAssets(db: IDBDatabase) {
  if (legacyMigrationPromise) return legacyMigrationPromise

  legacyMigrationPromise = new Promise((resolve) => {
    const legacyRequest = indexedDB.open(LEGACY_DB_NAME, 1)

    legacyRequest.onupgradeneeded = () => {
      legacyRequest.transaction?.abort()
    }

    legacyRequest.onerror = () => resolve()
    legacyRequest.onblocked = () => resolve()

    legacyRequest.onsuccess = () => {
      const legacyDb = legacyRequest.result
      if (!legacyDb.objectStoreNames.contains(STORE_NAME)) {
        legacyDb.close()
        resolve()
        return
      }

      const readTransaction = legacyDb.transaction(STORE_NAME, 'readonly')
      const readRequest = readTransaction.objectStore(STORE_NAME).getAll()

      readRequest.onerror = () => {
        legacyDb.close()
        resolve()
      }

      readRequest.onsuccess = () => {
        const legacyItems = (readRequest.result ?? []) as AssetItem[]
        if (legacyItems.length === 0) {
          legacyDb.close()
          resolve()
          return
        }

        const writeTransaction = db.transaction(STORE_NAME, 'readwrite')
        const store = writeTransaction.objectStore(STORE_NAME)
        for (const item of legacyItems) {
          store.put(item)
        }

        writeTransaction.oncomplete = () => {
          legacyDb.close()
          resolve()
        }
        writeTransaction.onerror = () => {
          legacyDb.close()
          resolve()
        }
      }
    }
  })

  return legacyMigrationPromise
}

async function openDb() {
  if (dbPromise) return dbPromise

  dbPromise = openDatabase(DB_NAME)
  const db = await dbPromise
  await migrateLegacyAssets(db)

  return db
}

async function getStore(mode: IDBTransactionMode) {
  const db = await openDb()
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

export async function getAllAssets() {
  const store = await getStore('readonly')
  return new Promise<AssetItem[]>((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve((request.result ?? []) as AssetItem[])
    request.onerror = () => reject(request.error)
  })
}

export async function saveAsset(item: AssetItem) {
  const store = await getStore('readwrite')
  return new Promise<void>((resolve, reject) => {
    const request = store.put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteAsset(id: string) {
  const store = await getStore('readwrite')
  return new Promise<void>((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
