// Offline support: cache the whole (tiny) app; serve cache-first, refresh in the background.
const CACHE = 'murdoku-v9';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/art.js', 'js/clues.js', 'js/generator.js', 'js/hints.js', 'js/sound.js', 'js/rng.js', 'js/solver.js', 'js/themes.js',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/playfair-display-latin-900-normal.woff2', 'fonts/playfair-display-latin-700-normal.woff2',
  'fonts/playfair-display-latin-400-normal.woff2', 'fonts/playfair-display-latin-400-italic.woff2',
  'fonts/old-standard-tt-latin-400-normal.woff2', 'fonts/old-standard-tt-latin-700-normal.woff2',
  'fonts/old-standard-tt-latin-400-italic.woff2', 'fonts/special-elite-latin-400-normal.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const network = fetch(e.request)
        .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
