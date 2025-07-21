// Service Worker for Blood for Bangladesh PWA
const CACHE_NAME = 'blood-for-bangladesh-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/auth/login',
    '/search',
    '/request',
    '/dashboard',
    '/offline',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip API requests for caching (they should be fresh)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Try to fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache if not a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // If network fails, try to serve offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline');
                        }
                    });
            })
    );
});

// Background sync for blood request notifications
self.addEventListener('sync', (event) => {
    if (event.tag === 'blood-request-notification') {
        event.waitUntil(
            // This would sync pending notifications when connection is restored
            console.log('Background sync: blood-request-notification')
        );
    }
});

// Push notification event - display notifications to user
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: event.data.text() };
        }
    }

    const options = {
        body: data.body || 'New blood request needs your help',
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        image: data.image,
        data: {
            url: data.url || data.requestId ? `/requests/${data.requestId}` : '/dashboard',
            requestId: data.requestId,
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'view',
                title: 'View Request',
                icon: '/android-chrome-192x192.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        requireInteraction: true, // Keep notification until user interacts
        tag: data.requestId ? `blood-request-${data.requestId}` : 'blood-request', // Use specific tag for each request
        vibrate: [200, 100, 200], // Vibration pattern
        sound: 'default'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Blood Request - Blood for Bangladesh', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        // Get the request ID from notification data
        const requestId = event.notification.data?.requestId;
        const url = requestId ? `/requests/${requestId}` : event.notification.data?.url || '/dashboard';

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window/tab open
                    for (const client of clientList) {
                        if (client.url.includes(url) && 'focus' in client) {
                            return client.focus();
                        }
                    }

                    // Check for any open app window and navigate it
                    for (const client of clientList) {
                        if (client.url.includes(location.origin) && 'focus' in client) {
                            return client.focus().then(() => {
                                // Send message to navigate to the specific request
                                return client.postMessage({
                                    type: 'NAVIGATE_TO_REQUEST',
                                    requestId: requestId,
                                    url: url
                                });
                            });
                        }
                    }

                    // If no matching window found, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow(url);
                    }
                })
                .catch(error => {
                    console.error('Error handling notification click:', error);
                    // Fallback: try to open dashboard
                    if (clients.openWindow) {
                        return clients.openWindow('/dashboard');
                    }
                })
        );
    } else if (event.action === 'dismiss') {
        // User dismissed the notification, no action needed
        console.log('Notification dismissed by user');
    }
});

// Message event for communicating with the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
