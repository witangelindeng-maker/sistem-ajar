/* V.56r - Service Worker Sistem Ajar (network-first).
   Dulu (V.47c): cache-first + skipWaiting + clients.claim.
   Masalah: SW baru langsung ngambil alih halaman di tengah Tes, dan
   Index.html listener controllerchange langsung location.reload() -> Tes hilang.
   Sekarang: network-first (selalu ambil Index.html terbaru kalau online,
   cache cuma cadangan kalau offline). CACHE diganti namanya biar cache lama dibuang.
   Catatan: controllerchange di Index.html sudah ditahan kalau Tes lagi jalan (V.56r),
   jadi reload cuma terjadi kalau Tes tidak jalan / setelah Tes selesai. */
var CACHE = 'sistem-ajar-v56r';
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
  /* Network-first: utamakan versi terbaru dari server. Kalau offline/gagal, pakai cache. */
  e.respondWith(fetch(e.request).then(function(res) {
    var salin = res.clone();
    caches.open(CACHE).then(function(c) { c.put(e.request, salin); });
    return res;
  }).catch(function() {
    return caches.match(e.request).then(function(r) { return r || caches.match('Index.html'); });
  }));
});
