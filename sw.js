const staticCacheName = 'site-static-v5';
const dynamicCacheName = 'site-dynamic-v5';
const assets = [
  '/',
  '/manifest.json',
  '/index.html',
  '/pages/fallback.html',
  '/css/materialize.min.css',
  '/css/styles.css',
  '/js/app.js',
  '/js/materialize.min.js',
  '/js/ui.js',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v92/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
];

// Cache size limit function
const limitCacheSize = async (name, size) => {
  let cache = await caches.open(name);
  let keys = await cache.keys();
  if (keys.length > size) {
    cache.delete(keys[0]).then(() => limitCacheSize(name, size));
  }
};

// Install the service worker. After installing the service worker, the service is in waiting mode
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('Caching...');
      cache.addAll(assets);
    })
  );
});

// Activate the service worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (e) => {
  if (e.request.url.indexOf('firestore.googleapis.com') === -1) {
    e.respondWith(
      caches
        .match(e.request)
        .then((cacheRes) => {
          return (
            cacheRes ||
            fetch(e.request).then(async (fetchRes) => {
              const cache = await caches.open(dynamicCacheName);
              cache.put(e.request.url, fetchRes.clone());
              limitCacheSize(dynamicCacheName, 15);
              return fetchRes;
            })
          );
        })
        .catch(() => {
          if (e.request.url.indexOf('.html') > -1) {
            return caches.match('/pages/fallback.html');
          }
        })
    );
  }
});
