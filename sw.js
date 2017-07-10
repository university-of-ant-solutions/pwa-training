self.addEventListener('install', event => {
  console.log('V1 installing…');

  // cache a cat PNG
  event.waitUntil(
    caches.open('static-v1').then(cache => cache.add('/cat.png'))
  );
});

self.addEventListener('activate', event => {
  console.log('V1 now ready to handle fetches!');
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // serve the cat PNG from the cache if the request is
  // same-origin and the path is '/dog.png'
  console.log(url);
  if (url.origin == location.origin && url.pathname == '/dog.png') {
    event.respondWith(caches.match('/cat.png'));
  }
});