const CACHE_NAME = 'expresate-amor-v2';
const BASE = '/expresateconamor';

const ARCHIVOS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/style.css',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  BASE + '/images/rosa-eterna-roja.webp',
  BASE + '/images/rosa-eterna-lila.webp',
  BASE + '/images/docena-eterna.webp',
  BASE + '/images/docena-rosas.webp',
  BASE + '/images/bouquet-primaveral.webp',
  BASE + '/images/ramo-12-rosas.webp'
];

// Instalar y guardar en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: guardando archivos en caché');
      return cache.addAll(ARCHIVOS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Interceptar peticiones — primero caché, luego red
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => {
        // Si no hay red y no está en caché, mostrar página principal
        if (e.request.destination === 'document') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});
