// Service Worker for Quiz Blog Client
const CACHE_NAME = 'quiz-blog-v1'
const STATIC_CACHE = 'quiz-blog-static-v1'
const DYNAMIC_CACHE = 'quiz-blog-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/Favicon.svg'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/categories/,
  /\/api\/course-categories/,
  /\/api\/notes/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
            .map(cacheName => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request))
    return
  }

  // Handle other requests
  event.respondWith(handleOtherRequests(request))
})

// Handle API requests with cache-first strategy for GET requests
async function handleApiRequest(request) {
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))
  
  if (request.method === 'GET' && shouldCache) {
    try {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Return cached response and update cache in background
        updateCacheInBackground(request)
        return cachedResponse
      }
    } catch (error) {
      console.warn('Cache match failed:', error)
    }
  }

  try {
    const networkResponse = await fetch(request)
    
    // Cache successful GET responses
    if (request.method === 'GET' && networkResponse.ok && shouldCache) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Return cached response if network fails
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    throw error
  }
}

// Handle document requests (HTML pages)
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // Return cached index.html for offline support
    const cachedResponse = await caches.match('/')
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Handle other requests (images, fonts, etc.)
async function handleOtherRequests(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Return cached response or placeholder
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Resource not available', { status: 503 })
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
  } catch (error) {
    console.warn('Background cache update failed:', error)
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle any queued offline actions
  console.log('Background sync triggered')
}

// Handle push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/Favicon.svg',
      badge: '/Favicon.svg',
      vibrate: [100, 50, 100],
      data: data.data || {}
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})
