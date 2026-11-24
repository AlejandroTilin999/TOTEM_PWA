/* =========================================================
   TÓTEM · Service Worker
   ---------------------------------------------------------
   - Archivos de la página (CSS, JS, imágenes, íconos): CACHE-FIRST
     Primero busca en la caché y solo si no está va a la red.
     Es lo más rápido y funciona sin conexión.
   - Páginas HTML: NETWORK-FIRST
     Primero intenta la red para mostrar la versión más nueva;
     si no hay conexión, usa la copia guardada en la caché.
   - Fuentes de Google: se guardan la primera vez que se usan.

   IMPORTANTE: cada vez que cambies algo de la página, sube el
   número de VERSION (v1 → v2) para que se descargue lo nuevo.
   ========================================================= */

const VERSION = 'totem-v8';
const CACHE_ESTATICO = `${VERSION}-estatico`;
const CACHE_FUENTES = 'totem-fuentes';

// Archivos que se guardan al instalar (precaché)
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './css/estilos.css',
  './js/app.js',
  // íconos
  './img/iconos/favicon-32.png',
  './img/iconos/apple-touch-icon.png',
  './img/iconos/icon-192.png',
  './img/iconos/icon-512.png',
  './img/iconos/icon-maskable-512.png',
  // salas
  './img/salas/sala_1.png',
  './img/salas/sala_2.png',
  './img/salas/sala_3.png',
  './img/salas/sala_4.png',
  './img/salas/sala_5.png',
  './img/salas/sala_6.png',
  './img/salas/sala_7.png',
  // personajes y objetos
  './img/sprites/nino_idle.png',
  './img/sprites/nino_celebra.png',
  './img/sprites/nina_idle.png',
  './img/sprites/nina_run.png',
  './img/sprites/alebrije.png',
  './img/sprites/totem.png',
  './img/sprites/borron.png',
  './img/sprites/devorador.png',
  './img/sprites/devorador_come.png',
  './img/sprites/niebla.png',
  './img/sprites/olvido.png',
  './img/sprites/olvido_rugir.png',
  './img/sprites/libro_0.png',
  './img/sprites/libro_1.png',
  './img/sprites/libro_2.png',
  './img/sprites/libro_3.png',
  './img/sprites/estante_2.png',
  './img/sprites/chispa.png',
  './img/sprites/atril.png',
];

// 1) INSTALACIÓN: guarda todos los archivos en la caché
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_ESTATICO)
      // cache: 'reload' evita que se guarde una copia vieja del navegador
      .then(cache => cache.addAll(ARCHIVOS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// 2) ACTIVACIÓN: borra las cachés de versiones anteriores
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(
        nombres
          .filter(n => n !== CACHE_ESTATICO && n !== CACHE_FUENTES)
          .map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// 3) PETICIONES: decide de dónde sale cada archivo
self.addEventListener('fetch', evento => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);

  // Fuentes de Google: cache-first con su propia caché
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    evento.respondWith(cacheFirst(peticion, CACHE_FUENTES));
    return;
  }

  // Solo manejamos archivos de nuestro propio sitio
  if (url.origin !== self.location.origin) return;

  // Páginas HTML: network-first
  if (peticion.mode === 'navigate' || peticion.headers.get('accept')?.includes('text/html')) {
    evento.respondWith(networkFirst(peticion));
    return;
  }

  // Todo lo demás (CSS, JS, imágenes): cache-first
  evento.respondWith(cacheFirst(peticion, CACHE_ESTATICO));
});

// Cache-first: caché → red (y guarda lo nuevo)
async function cacheFirst(peticion, nombreCache) {
  const guardado = await caches.match(peticion);
  if (guardado) return guardado;
  try {
    const respuesta = await fetch(peticion);
    if (respuesta.ok || respuesta.type === 'opaque') {
      const cache = await caches.open(nombreCache);
      cache.put(peticion, respuesta.clone());
    }
    return respuesta;
  } catch (error) {
    return new Response('', { status: 503, statusText: 'Sin conexión' });
  }
}

// Network-first: red (y actualiza la caché) → caché si no hay conexión
async function networkFirst(peticion) {
  try {
    const respuesta = await fetch(peticion);
    const cache = await caches.open(CACHE_ESTATICO);
    cache.put(peticion, respuesta.clone());
    return respuesta;
  } catch (error) {
    return (await caches.match(peticion)) || (await caches.match('./index.html'));
  }
}
