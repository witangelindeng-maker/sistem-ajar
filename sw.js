/* V.56j - Service Worker Sistem Ajar: NETWORK-FIRST untuk Index.html.
   Dulu (V.53/V.47c): cache-first -> halaman lama yang kesimpen disajiin terus,
   makanya klik link nyangkut di V.43 & harus Ctrl+Shift+R.
   Sekarang: tiap buka link, SW ngecek internet DULU (cache:'reload' = lewatin cache browser).
   Kalau ada versi baru -> langsung dipakai. Kalau offline -> baru pakai yang kesimpen.
   Jadi klik link = selalu versi terbaru, tanpa pencet 3 tombol lagi. */
var CACHE = 'sistem-ajar-v56j';
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
  var url = new URL(e.request.url);
  var isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('Index.html') || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isHTML) {
    /* HALAMAN: NETWORK-FIRST - selalu coba internet dulu, baru simpanan */
    e.respondWith(fetch(e.request, {cache: 'reload'}).then(function(res) {
      var salin = res.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, salin); });
      return res;
    }).catch(function() {
      return caches.match(e.request).then(function(r){ return r || caches.match('Index.html'); });
    }));
    return;
  }
  /* ASET (ikon/manifest/dll): CACHE-FIRST + update di belakang - cepat & hemat kuota */
  e.respondWith(caches.match(e.request).then(function(r) {
    var ambil = fetch(e.request).then(function(res) {
      var salin = res.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, salin); });
      return res;
    }).catch(function(){ return r; });
    return r || ambil;
  }));
});
