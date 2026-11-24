/* Service worker – בוקרשט, מידע למטייל – גרסה 20261124-01 */
const VER="buc-20261124-01", TILES="buc-tiles", IMGS="buc-img", API="buc-api";
const CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("buc-")&&![VER,TILES,IMGS,API].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function trim(name,max){const c=await caches.open(name),ks=await c.keys();if(ks.length>max)for(const k of ks.slice(0,ks.length-max))await c.delete(k)}
async function cacheFirst(req,name,max){const c=await caches.open(name),m=await c.match(req);if(m)return m;try{const r=await fetch(req);if(r&&(r.ok||r.type==="opaque")){c.put(req,r.clone());trim(name,max)}return r}catch(e){return m||Response.error()}}
async function netFirst(req,name){const c=await caches.open(name);try{const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}catch(e){const m=await c.match(req);return m||Response.error()}}
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return; const u=new URL(req.url);
  if(req.mode==="navigate"){e.respondWith(netFirst(req,VER).then(r=>r.ok?r:caches.match("index.html")));return}
  if(u.origin===location.origin){e.respondWith(caches.match(req).then(m=>{const f=fetch(req).then(r=>{if(r.ok)caches.open(VER).then(c=>c.put(req,r.clone()));return r}).catch(()=>m);return m||f}));return}
  if(/tile\.openstreetmap|basemaps\.cartocdn|tile\.openstreetmap\.de/.test(u.host)){e.respondWith(cacheFirst(req,TILES,600));return}
  if(/upload\.wikimedia\.org/.test(u.host)){e.respondWith(cacheFirst(req,IMGS,250));return}
  if(/open-meteo|er-api|wikipedia\.org|routing\.openstreetmap|project-osrm|nominatim/.test(u.host)){e.respondWith(netFirst(req,API));return}
});
