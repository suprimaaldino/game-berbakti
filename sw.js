const CACHE_NAME = 'family-mission-v1';
const urlsToCache = [
  '/game-berbakti/',
  '/game-berbakti/index.html',
  '/game-berbakti/assets/css/style.css',
  '/game-berbakti/assets/js/script.js',
  '/game-berbakti/assets/icons/icon-192.png',
  '/game-berbakti/assets/icons/icon-512.png',
  '/game-berbakti/assets/icons/coin.gif',
  '/game-berbakti/assets/icons/gift.gif',
  '/game-berbakti/assets/icons/check.gif',
  '/game-berbakti/assets/sounds/tukar.mp3'
];

// Eksternal (tidak wajib di-cache saat install)
const externalResources = [
  'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache)
          .then(() => console.log('✅ Semua aset utama berhasil di-cache'))
          .catch(err => console.warn('⚠️ Gagal cache aset utama:', err));
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // HTML: prioritas jaringan, fallback ke cache
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/game-berbakti/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          // Cache dinamis hanya untuk aset lokal
          if (requestUrl.origin === self.location.origin &&
              urlsToCache.some(url => url.endsWith(requestUrl.pathname))) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        });
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/game-berbakti/assets/icons/coin.gif');
        }
        return new Response(null, { status: 404 });
      })
  );
});