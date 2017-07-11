const expectedCaches = ['static-v2'];

self.addEventListener('install', event => {
  console.log('V2 installing…');

  // cache a horse png into a new cache, static-v2
  event.waitUntil(
    caches.open(expectedCaches).then(cache => cache.add('/horse.png'))
  );
});

self.addEventListener('activate', event => {
  // delete any caches that aren't in expectedCaches
  // which will get rid of static-v1
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('V2 now ready to handle fetches!');
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // serve the horse png from the cache if the request is
  // same-origin and the path is '/dog.png'
  if (url.origin == location.origin && url.pathname == '/dog.png') {
    event.respondWith(caches.match('/horse.png'));
  }
});