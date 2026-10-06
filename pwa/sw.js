/* ============================================================================
   TEACHER'S UTILITY BELT SIN INTERNET
   ----------------------------------------------------------------------------
   El wifi de una sala falla justo cuando se va a sortear algo. Este service
   worker guarda la app entera en la PRIMERA visita, así que desde la segunda
   abre aunque no haya red.

   Plantilla: `vite.config.js` la completa al construir con la lista de todos
   los archivos publicados (__PRECACHE__) y una versión que cambia cuando
   cambia cualquiera de ellos (__VERSION__). Así no hay una lista escrita a
   mano que se quede atrás.

   Dos maneras de responder:
     · la página (navegación): primero la red, para que las actualizaciones
       lleguen; pero si no contesta en 3 segundos, la copia guardada. Un wifi
       «conectado» que no responde es el caso común en una sala, y esperar a que
       el navegador se rinda tarda un minuto.
     · lo demás (JS, CSS, fuentes, íconos): primero la copia. Llevan el hash en
       el nombre, así que una versión nueva trae nombres nuevos y no hay nada
       viejo que servir por error.
   ========================================================================== */
const VERSION = '__VERSION__';
const CACHE = `utility-belt-${VERSION}`;
/* La app se llamó Chasquibox hasta el 6-oct-2026 y vivía en /Chasquibox/. Las
   copias de entonces quedan en el mismo origen: también se borran. */
const PREFIJOS = ['utility-belt-', 'chasquibox-'];
const PRECACHE = __PRECACHE__;
const BASE = new URL(self.registration.scope).pathname;
const INDEX = `${BASE}index.html`;
const ESPERA_RED_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE.map(f => BASE + f)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(nombres => Promise.all(
      nombres.filter(n => PREFIJOS.some(p => n.startsWith(p)) && n !== CACHE).map(n => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

const redConPlazo = (request) => new Promise((resolve, reject) => {
  const plazo = setTimeout(() => reject(new Error('sin respuesta')), ESPERA_RED_MS);
  fetch(request).then(
    r => { clearTimeout(plazo); resolve(r); },
    e => { clearTimeout(plazo); reject(e); },
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      redConPlazo(request)
        .then(r => {
          /* La copia se saca YA: dentro del `then` de caches.open llegaría
             cuando el navegador ya empezó a leer la respuesta. */
          if (r.ok) {
            const copia = r.clone();
            caches.open(CACHE).then(c => c.put(INDEX, copia));
          }
          return r;
        })
        .catch(() => caches.match(INDEX, { ignoreVary: true }).then(c => c || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then(guardado => guardado || fetch(request).then(r => {
      if (r.ok && r.type === 'basic') {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(request, copia));
      }
      return r;
    }))
  );
});
