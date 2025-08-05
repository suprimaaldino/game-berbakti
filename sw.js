const CACHE_NAME = 'family-mission-v1';
const urlsToCache = [
    './',
    './index.html',
    './assets/css/style.css',
    './assets/js/script.js',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/coin.gif',
    './assets/icons/gift.gif',
    './assets/icons/check.gif',
    './assets/sounds/tukar.mp3'
];

// Font dan CSS eksternal (di-cache jika berhasil, tapi jangan gagal jika tidak bisa)
const externalResources = [
    'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// Gabungkan semua yang wajib di-cache
const allUrls = [...urlsToCache, ...externalResources];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache)
                    .then(() => console.log('✅ Semua aset utama berhasil di-cache'))
                    .catch(err => console.warn('⚠️ Gagal cache aset utama:', err));
            })
            // Tidak menghentikan install meski eksternal gagal
    );
});

self.addEventListener('activate', event => {
    // Hapus cache lama jika ada
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                          .map(name => caches.delete(name))
            );
        })
    );

    // Pastikan SW baru langsung mengambil alih
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Hanya tangani permintaan dari origin ini (bukan third-party lain)
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        // Prioritaskan jaringan, fallback ke cache (untuk HTML)
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                // Jika ada di cache, gunakan
                if (cached) return cached;

                // Jika tidak, ambil dari jaringan
                return fetch(event.request).then(response => {
                    // Cegah cache response non-OK
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }

                    // Cache resource baru secara dinamis (hanya yang penting)
                    const requestUrl = new URL(event.request.url);
                    if (urlsToCache.includes(requestUrl.pathname) || 
                        urlsToCache.some(url => url.includes(requestUrl.pathname))) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }

                    return response;
                });
            }).catch(() => {
                // Fallback untuk gambar/audio jika offline
                if (event.request.destination === 'image') {
                    return caches.match('./assets/icons/coin.gif');
                }
                return new Response(null, { status: 404 });
            })
    );
});