const CACHE_NAME = 'assets-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) return

  event.respondWith(
    caches.match(request).then((cached) => {
      // For navigation requests, try network first, fall back to cache
      if (request.mode === 'navigate') {
        return fetch(request)
          .then((response) => {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            return response
          })
          .catch(() => cached || caches.match('/index.html'))
      }

      // For static assets (JS, CSS), cache-first
      if (isStaticAsset(request.url)) {
        return cached || fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      }

      // For everything else, network-first
      return fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => cached)
    })
  )
})

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|woff2?|ttf|ico)(\?.*)?$/.test(url)
}
