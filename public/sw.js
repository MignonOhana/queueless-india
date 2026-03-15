const CACHE = 'queueless-v1'
const PRECACHE = ['/', '/home', '/login', '/offline.html']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/offline.html')))
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
  event.waitUntil(self.registration.showNotification(data.title || '🎫 QueueLess Update', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action !== 'dismiss') {
    event.waitUntil(self.clients.openWindow(event.notification.data.url))
  }
})
