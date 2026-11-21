/* V.47c - Service Worker Sistem Ajar (tahan banting).
   Dulu: caches.addAll() gagal total kalau 1 file saja tidak ada
   (misal ikon-sistem-ajar.png salah nama) -> SW tidak ter-install ->
   Chrome bilang "aplikasi ini tidak dapat diinstal".
   Sekarang: tiap file disimpan satu-satu, yang gagal dilewati saja. */
var CACHE = 'sistem-ajar-v47c';
var FILE = ['Index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'ikon-sistem-ajar.png'];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return Promise.all(FILE.map(function(f) { return c.add(f).catch(function(){}); }));
  }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function(r) {
    return r || fetch(e.request).then(function(res) {
      var salin = res.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, salin); });
      return res;
    }).catch(function() { return caches.match('Index.html'); });
  }));
});
