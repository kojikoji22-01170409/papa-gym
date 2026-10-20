// Offline support: network-first for pages (so updates arrive), cache fallback when offline,
// stale-while-revalidate for hashed assets.
const CACHE = 'papa-gym-v3';
const SCOPE = self.registration.scope;
// Keep in sync with the exercise ids in src/lib/exercises.ts (checked by a test).
const GIFS = ['squat', 'back-lunge', 'hip-lift', 'calf-raise', 'pushup', 'wall-pushup', 'chair-dip', 'superman', 'plank', 'side-plank', 'dead-bug', 'bird-dog', 'hamstring', 'hip-flexor', 'chest-shoulder', 'cat-cow', 'calf-stretch', 'glute-hug', 'childs-pose', 'scapula-stretch', 'forward-fold', 'thoracic-reach', 'carry-squat', 'kid-plank'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll([SCOPE, `${SCOPE}manifest.webmanifest`, `${SCOPE}icon.svg`]);
      // The demo GIFs are optional: one failing download must not block the install.
      await Promise.allSettled(GIFS.map((id) => c.add(`${SCOPE}gifs/${id}.gif`)));
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(SCOPE)) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SCOPE, copy));
          return res;
        })
        .catch(() => caches.match(SCOPE)),
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
