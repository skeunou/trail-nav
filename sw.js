const APP="tn-app-v2";
const TILES="tn-tiles-v1";
const SHELL=[
  "./","./index.html","./manifest.json","./icon-192.png","./icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@turf/turf@7.1.0/turf.min.js",
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap"
];
const isTile=u=>/tile\.(opentopomap|openstreetmap)\.org/.test(u);

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(APP).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const u=e.request.url;
  if(isTile(u)){
    e.respondWith(caches.open(TILES).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(net=>{c.put(e.request,net.clone());return net;}).catch(()=>new Response("",{status:404})))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{
    if(net&&net.status===200&&(u.startsWith("http"))){const cl=net.clone();caches.open(APP).then(c=>c.put(e.request,cl));}
    return net;
  }).catch(()=>caches.match("./index.html"))));
});
self.addEventListener("message",e=>{
  if(e.data==="clearTiles")caches.delete(TILES);
});
