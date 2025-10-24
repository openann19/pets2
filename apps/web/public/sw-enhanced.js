/**
 * Enhanced Service Worker for PawfectMatch PWA
 * Advanced caching strategies and offline functionality
 */

const CACHE_NAME = 'pawfectmatch-v1.0.0';
const STATIC_CACHE = 'pawfectmatch-static-v1.0.0';
const DYNAMIC_CACHE = 'pawfectmatch-dynamic-v1.0.0';
const IMAGE_CACHE = 'pawfectmatch-images-v1.0.0';
const API_CACHE = 'pawfectmatch-api-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Routes and their caching strategies
const ROUTES = {
  // Static assets - cache first
  static: {
    pattern: /\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cache: STATIC_CACHE
  },
  
  // Images - cache first with fallback
  images: {
    pattern: /\.(png|jpg|jpeg|webp|avif)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cache: IMAGE_CACHE
  },
  
  // API calls - network first
  api: {
    pattern: /^https:\/\/api\./,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: API_CACHE
  },
  
  // Pages - stale while revalidate
  pages: {
    pattern: /^\/(?!api)/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: DYNAMIC_CACHE
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll([
        '/',
        '/manifest.json',
        '/offline.html',
        // Add critical CSS and JS files
        '/_next/static/css/',
        '/_next/static/js/',
      ]);
    }).then(() => {
      console.log('[SW] Static assets cached successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy based on request
  const route = getRouteForRequest(request);
  
  if (route) {
    event.respondWith(handleRequest(request, route));
  }
});

// Get appropriate route configuration for request
function getRouteForRequest(request) {
  const url = new URL(request.url);
  
  for (const [name, config] of Object.entries(ROUTES)) {
    if (config.pattern.test(url.pathname) || config.pattern.test(url.href)) {
      return config;
    }
  }
  
  // Default to pages strategy
  return ROUTES.pages;
}

// Handle request based on caching strategy
async function handleRequest(request, route) {
  const { strategy, cache: cacheName } = route;
  
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName);
      
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName);
      
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName);
      
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await networkOnly(request);
      
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cacheName);
      
      default:
        return await fetch(request);
    }
  } catch (error) {
    console.error('[SW] Request handling failed:', error);
    return await handleOfflineFallback(request);
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached response even if stale
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network failed, ignore
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  return await networkResponsePromise || new Response('Offline', { status: 503 });
}

// Network Only Strategy
async function networkOnly(request) {
  return await fetch(request);
}

// Cache Only Strategy
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  return await cache.match(request) || new Response('Not cached', { status: 404 });
}

// Handle offline fallback
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
  
  // For API requests, return cached data or error
  if (url.pathname.startsWith('/api/')) {
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This data is not available offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // For images, return placeholder
  if (request.destination === 'image') {
    return new Response(
      `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial" font-size="16">
          Image not available offline
        </text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline actions when back online
    console.log('[SW] Performing background sync...');
    
    // Example: Sync offline likes/swipes
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await syncOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('[SW] Failed to sync action:', error);
      }
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have a new match! 🐾',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Match',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'PawfectMatch';
  }
  
  event.waitUntil(
    self.registration.showNotification('PawfectMatch', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/matches')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for offline actions
async function getOfflineActions() {
  // This would typically read from IndexedDB
  return [];
}

async function syncOfflineAction(action) {
  // Sync individual offline action
  const response = await fetch('/api/sync-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action)
  });
  
  if (!response.ok) {
    throw new Error('Sync failed');
  }
  
  return response.json();
}

async function removeOfflineAction(actionId) {
  // Remove synced action from offline storage
  console.log('[SW] Removing synced action:', actionId);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Enhanced service worker loaded');
