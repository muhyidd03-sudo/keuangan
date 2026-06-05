const CACHE_NAME = 'keuangan-pribadi-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install Service Worker & simpan file aset ke CacheStorage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan aset penting ke dalam cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivasi & bersihkan cache versi lama jika ada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache versi lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intersepsi request internet, alihkan ke Cache jika sedang Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Kembalikan dari cache jika ada, jika tidak lakukan fetch normal ke internet
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback jika internet mati total dan request tidak ada di cache
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});