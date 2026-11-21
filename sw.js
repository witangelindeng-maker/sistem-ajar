/* V.56f - Service Worker Sistem Ajar: biar bisa di-Install jadi aplikasi.
   File ini WAJIB ada di repo (seperti aplikasi keuangan dulu) supaya
   Chrome mengizinkan tombol "Install aplikasi". */
var CACHE = 'sistem-ajar-v56f';
var FILE = ['Index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'ikon-sistem-ajar.png'];
self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILE); }).then(function() { return self.skipWaiting(); }));
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
