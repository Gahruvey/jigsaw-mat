// Offline support: keeps the game files cached so it opens without a connection.
// Bump VERSION whenever you upload a new index.html so phones pick up the update.
const VERSION = 'jigsaw-mat-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Serve from cache right away, refresh the cache in the background.
  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(e.request).then(hit => {
        const net = fetch(e.request)
          .then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
