const CACHE='bank-portal-v6';
const STATIC=['/','/index.html?v=6','/style.css?v=6','/script.js?v=6','/manifest.json?v=6','/config.js?v=6'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return}e.respondWith(fetch(e.request).then(r=>{if(r.ok&&u.origin===location.origin)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request)))})