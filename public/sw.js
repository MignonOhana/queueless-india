const CACHE_NAME = 'queueless-v3'

// Only cache truly static assets - NOT pages (pages need fresh server responses)
const STATIC_ASSETS = [
  '/offline.html',
  '/favicon.png',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Install: cache only static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  // Activate immediately, don't wait for old SW to die
  self.skipWaiting()
})

// Activate: delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch strategy:
// - Static assets (icons, fonts, images) → cache-first
// - Pages & API routes → network-first (always fresh from server)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Skip non-GET requests and chrome-extension URLs
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) return

  // Skip API routes - always go to network
  if (url.pathname.startsWith('/api/')) return

  // Skip Supabase requests - always network
  if (url.hostname.includes('supabase.co')) return

  // Static assets → cache-first
  const isStaticAsset =
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ico|json)$/) ||
    url.pathname.startsWith('/_next/static/')

  if (isStaticAsset) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
          return response
        })
      })
    )
    return
  }

  // Pages → network-first, fallback to offline.html
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match('/offline.html')
    })
  )
})

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const options = {
    body: data.body || 'Your queue position has updated',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/customer/dashboard' },
    actions: [
      { action: 'open', title: '📍 Go to Queue' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }
  event.waitUntil(
    self.registration.showNotification(data.title || '🎫 QueueLess Update', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action !== 'dismiss') {
    event.waitUntil(self.clients.openWindow(event.notification.data.url))
  }
})
