// Service Worker - Keeps the script alive even when browser is closed
let intervalId = null;
let locationInterval = null;

self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log('Service Worker activated');
    
    // Start background sync
    startBackgroundSync();
});

self.addEventListener('message', (event) => {
    if (event.data === 'keepAlive') {
        console.log('Keep alive received');
    }
});

function startBackgroundSync() {
    // Register periodic sync if available
    if ('periodicSync' in self.registration) {
        self.registration.periodicSync.register('location-sync', {
            minInterval: 60000 // 1 minute
        }).then(() => {
            console.log('Periodic sync registered');
        }).catch(err => {
            console.log('Periodic sync error:', err);
        });
    }
}

// Handle background sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'location-sync') {
        event.waitUntil(sendLocationInBackground());
    }
});

async function sendLocationInBackground() {
    // Try to get clients and send location
    const clients = await self.clients.matchAll();
    for (const client of clients) {
        client.postMessage({ type: 'sendLocation' });
    }
}
