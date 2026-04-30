const cacheName = "idc-you-pick-v2";

const filesToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/brand-logo-192.webp",
  "./assets/brand-logo-512.webp",
  "./assets/logos/alfredos.png",
  "./assets/logos/arbys.png",
  "./assets/logos/burgerking.png",
  "./assets/logos/chickenexpress.png",
  "./assets/logos/chickfila.png",
  "./assets/logos/dominos.png",
  "./assets/logos/goldenchick.jpeg",
  "./assets/logos/ihop.png",
  "./assets/logos/KFC.png",
  "./assets/logos/mcdonalds.png",
  "./assets/logos/raisingcanes.png",
  "./assets/logos/sonic.png",
  "./assets/logos/subway.png",
  "./assets/logos/tacobell.png",
  "./assets/logos/tacobueno.png",
  "./assets/logos/wendys.png",
  "./assets/logos/whataburger.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(filesToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
