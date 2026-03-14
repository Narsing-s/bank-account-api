const CACHE = "bank-ui-v1";
const ASSETS = [
  "/", "/index.html", "/style.css", "/script.js", "/config.js",
  "/manifest.json",
  "/i18n/en.json", "/i18n/te.json", "/i18n/hi.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Cache-first for static; network-first for /api
  if (url.pathname.startsWith("/api")) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(JSON.stringify({ message: "Offline" }), {
        status: 503, headers: {"Content-Type":"application/json"}
      }))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});
