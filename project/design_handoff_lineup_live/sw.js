// Lineup service worker: app shell precache, network-first data with cache fallback, cache-first libraries.
const SHELL = 'lineup-shell-v1', DATA = 'lineup-data-v1', LIB = 'lineup-lib-v1';
const PRECACHE = ['./', './Lineup%20Live.dc.html', './support.js', './lineup-engine.js', './lineup-live.js', './lineup-live-view.js', './ios-frame.jsx', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const API = /open-meteo\.com|tidesandcurrents\.noaa\.gov|cwwp2\.dot\.ca\.gov\/data\/d\d\/cc\/|router\.project-osrm\.org/;
const LIBS = /unpkg\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/;
const NEVER = /api\.tomtom\.com|api\.mapbox\.com|\/cctv\/image\/|skylinewebcams|youtube\.com|ytimg\.com/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  const keep = [SHELL, DATA, LIB];
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('lineup-') && keep.indexOf(k) < 0).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }
async function networkFirst(req, name, ms) {
  const c = await caches.open(name);
  try { const r = await Promise.race([fetch(req), timeout(ms)]); if (r && r.ok) c.put(req, r.clone()); return r; }
  catch (e) { const hit = await c.match(req, { ignoreSearch: false }); if (hit) return hit; throw e; }
}
async function cacheFirst(req, name) {
  const c = await caches.open(name), hit = await c.match(req);
  if (hit) return hit;
  const r = await fetch(req); if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r;
}
async function staleWhileRevalidate(req, name) {
  const c = await caches.open(name), hit = await c.match(req, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || Response.error();
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (NEVER.test(url)) return;
  if (API.test(url)) { e.respondWith(networkFirst(req, DATA, 8000)); return; }
  if (LIBS.test(url)) { e.respondWith(cacheFirst(req, LIB)); return; }
  if (new URL(url).origin === self.location.origin) e.respondWith(staleWhileRevalidate(req, SHELL));
});
