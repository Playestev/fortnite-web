const CACHE_PREFIX = "gankergames-";
const CACHE_VERSION = "gankergames-v4";

self.addEventListener("install", () => {
  // Activa inmediatamente la versión nueva.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Elimina las versiones anteriores del caché de Ganker Games.
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith(CACHE_PREFIX) &&
              cacheName !== CACHE_VERSION
          )
          .map((cacheName) => caches.delete(cacheName))
      );

      // Toma el control de las pestañas abiertas.
      await self.clients.claim();
    })()
  );
});

/*
  No agregues un evento "fetch" por ahora.

  Así el navegador siempre solicita la versión actualizada
  de las páginas, componentes y archivos de tu app.
*/