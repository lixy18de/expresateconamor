const CACHE_NAME = 'expresate-amor-v3';
const BASE = '/expresateconamor';

// Solo cachea archivos que SÍ existen — las imágenes se cachean cuando se visitan
const ARCHIVOS_CORE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/style.css',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png'
];

// Instalar — solo archivos core, sin imágenes para evitar errores
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: guardando archivos core en caché');
      return cache.addAll(ARCHIVOS_CORE);
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('SW: eliminando caché viejo:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Interceptar peticiones — caché primero, luego red
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Guardar en caché si es exitoso
        if (response && response.status === 200) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
        }
        return response;
      }).catch(() => {
        // Sin red — devolver index si es documento
        if (e.request.destination === 'document') {
          return caches.match(BASE + '/index.html');
        }
      });
    })
  );
});
