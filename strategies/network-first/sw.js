var scope = 'networkFirst';
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

function fetchAndCache(request, options) {
  debug('Strategy: network first [' + request.url + '] send request');
  options = options || {};
  var successResponses = options.successResponses ||
      globalOptions.successResponses;

  return fetch(request.clone()).then(function(response) {
    // Only cache GET requests with successful responses.
    // Since this is not part of the promise chain, it will be done
    // asynchronously and will not block the response from being returned to the
    // page.
    if (request.method === 'GET' && successResponses.test(response.status)) {
      openCache(options).then(function(cache) {
        cache.put(request, response);
      });
    }

    return response.clone();
  });
}
var urlString = '/strategies/network-first/data.json';
self.addEventListener('fetch', function(event) {
  debug('service workers: Responds to fetch');
  const url = new URL(event.request.url);
  var successResponses = globalOptions.successResponses;
  if (url.origin == location.origin && url.pathname == urlString) {
    event.respondWith(openCache().then(function(cache) {
      return fetchAndCache(event.request).then(function(response) {
        if (successResponses.test(response.status)) {
          return response;
        }
        throw new Error('Bad response');
      }).catch(function(error) {
        return cache.match(event.request).then(function(response) {
          if (response) {
            return response;
          }
          throw error;
        });
      });
    }));
  }
});
