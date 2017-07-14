var scope = 'cacheOnly';
var globalOptions = {
  cache: {
    name: scope,
    maxAgeSeconds: null,
    maxEntries: null,
    queryOptions: null
  },
  debug: true,
  networkTimeoutSeconds: null,
  preCacheItems: [],
  // A regular expression to apply to HTTP response codes. Codes that match
  // will be considered successes, while others will not, and will not be
  // cached.
  successResponses: /^0|([123]\d\d)|(40[14567])|410$/
};

function debug(message, options) {
  options = options || {};
  var flag = options.debug || globalOptions.debug;
  if (flag) {
    console.log(message);
  }
}

var cleanResponse = function (originalResponse) {
  // If this is not a redirected response, then we don't have to do anything.
  if (!originalResponse.redirected) {
    return Promise.resolve(originalResponse);
  }

  // Firefox 50 and below doesn't support the Response.body stream, so we may
  // need to read the entire body to memory as a Blob.
  var bodyPromise = 'body' in originalResponse ?
    Promise.resolve(originalResponse.body) :
    originalResponse.blob();

  return bodyPromise.then(function(body) {
    // new Response() is happy when passed either a stream or a Blob.
    return new Response(body, {
      headers: originalResponse.headers,
      status: originalResponse.status,
      statusText: originalResponse.statusText
    });
  });
};

function openCache(options) {
  var cacheName;
  if (options && options.cache) {
    cacheName = options.cache.name;
  }
  cacheName = cacheName || globalOptions.cache.name;

  return caches.open(cacheName);
}

// ------- Actions ------- //

self.addEventListener('install', function(event) {
  debug('service workers: Installation');
  // event.waitUntil();
});

self.addEventListener('activate', function(event) {
  debug('service workers: Activation');
  // event.waitUntil();
});


self.addEventListener('fetch', function(event) {
  debug('service workers: Responds to fetch');
  if (event.request.method === 'GET') {

  }
});
