/* ============================================================================
   sw.js — offline support for Good Hope Kids.

   The room's wifi is not reliable and a lesson starts on time either way. Once
   a lesson has been opened on a device, its slides and art stay on that device
   and present with no network at all.

   CAREFUL THINGS

   - Only same-origin GETs under /kids are touched, and never /kids/__me,
     /kids/__auth or /kids/__signout: a cached answer about who is signed in
     would be wrong the moment it mattered.
   - Only 200s are cached. Caching the gate screen or a 401 would leave a
     signed-out device showing a stale app shell.
   - Lesson data is network-first, so a rebuilt lesson shows up; art and the
     shell are cache-first, because they are big and they do not change.
   ========================================================================== */

var VERSION = "kids-v2";
var SHELL = [
  "/kids/",
  "/kids/index.html",
  "/kids/app.css",
  "/kids/app.js",
  "/kids/slides.js",
  "/kids/public/logo.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        return name === VERSION ? null : caches.delete(name);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function cacheable(request) {
  if (request.method !== "GET") return false;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (!url.pathname.startsWith("/kids/")) return false;
  if (url.pathname.indexOf("/kids/__") === 0) return false;
  return true;
}

function save(request, response) {
  if (response && response.status === 200 && response.type === "basic") {
    var copy = response.clone();
    caches.open(VERSION).then(function (cache) { cache.put(request, copy); });
  }
  return response;
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (!cacheable(request)) return;

  var url = new URL(request.url);

  /* Loading a PAGE always asks the network first, even though the shell is
     cached. The gate lives at the same URLs as the app: if a signed-out
     browser were handed the cached shell, the app would start, get a 401 for
     who-am-I, reload, and be handed the cached shell again — forever. Falling
     back to the cache keeps the app working on a dead wifi. */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(function (response) { return save(request, response); })
        .catch(function () {
          return caches.match(request).then(function (hit) {
            return hit || caches.match("/kids/index.html");
          });
        })
    );
    return;
  }

  var isData = url.pathname.indexOf("/kids/data/") === 0;

  if (isData) {
    // Fresh when we can reach the network, last known good when we cannot.
    event.respondWith(
      fetch(request).then(function (response) { return save(request, response); })
        .catch(function () {
          return caches.match(request).then(function (hit) {
            return hit || new Response('{"error":"offline"}', {
              status: 503, headers: { "content-type": "application/json" }
            });
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) { return save(request, response); });
    })
  );
});
