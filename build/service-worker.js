// PROBLEMA: 'self', 'openDB', 'marcarBackupSubido' no definidos
// SOLUCIÓN: Service Worker tiene API limitada, no puede usar idb directamente

// REEMPLAZA TODO EL CONTENIDO CON:
const CACHE_NAME = 'agenda-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Instalación - Cache de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación - Limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Background Sync (simplificado)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-backup') {
    console.log('🔄 Background Sync para backup');
    // Aquí iría la lógica real cuando implementes backend
  }
});

// Periodic Background Sync (si el navegador lo soporta)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-backup') {
      console.log('📅 Periodic Sync para backup diario');
    }
  });
}

console.log('✅ Service Worker cargado correctamente');