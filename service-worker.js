const CACHE_NAME = "cours-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

// INSTALLATION
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );

});

// ACTIVATION
self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(keys => {

      return Promise.all(
        keys.map(key => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })
      );

    })
  );

  self.clients.claim();

});

// FETCH
self.addEventListener("fetch", event => {

  // 🔥 FIREBASE toujours en ligne
  if (
    event.request.url.includes("firestore") ||
    event.request.url.includes("googleapis")
  ) {

    event.respondWith(fetch(event.request));
    return;

  }

  // HTML toujours à jour
  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match("./index.html"))
    );

    return;

  }

  // cache fichiers statiques
  event.respondWith(

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request);

      })

  );

});
