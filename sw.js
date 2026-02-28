// PWAのインストール条件を満たすための最小限のService Worker
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('[Service Worker] Activate');
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // ネットワークリクエストをそのまま通す
    e.respondWith(fetch(e.request));
});