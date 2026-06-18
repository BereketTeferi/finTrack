// FinTrack Service Worker
// Caches the app shell for offline use + runtime caching for API requests
// Strategy:
//   - App shell (HTML, JS, CSS, images): stale-while-revalidate
//   - API GET requests: network-first (fall back to cache when offline)
//   - API POST/PUT/DELETE: network-only (no caching — these mutate data)
//   - Auth requests: never cache (always go to network)

const CACHE_VERSION = "fintrack-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const API_CACHE = `${CACHE_VERSION}-api`;

const APP_SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        // Don't fail install if some assets can't be cached (e.g. offline during install)
        console.warn("[SW] Some assets failed to cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: apply caching strategy based on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith("http")) return;

  // Skip Next.js HMR and dev-only endpoints
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Skip auth endpoints — never cache these
  if (url.pathname.startsWith("/api/auth/")) {
    return; // let the network handle it
  }

  // For POST/PUT/DELETE/PATCH: network-only
  if (request.method !== "GET") {
    return; // let the network handle it
  }

  // For API GET requests: network-first (fall back to cache)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // For app shell requests: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE));
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      // Only cache valid, same-origin responses
      if (response && response.status === 200 && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached); // network failed, return cache if available
  return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Network failed — try cache
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Handle messages from the page (e.g. SKIP_WAITING to apply updates immediately)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Push notification handler (for future use)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  const { title, body, icon } = payload;
  event.waitUntil(
    self.registration.showNotification(title || "FinTrack", {
      body: body || "",
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [100, 50, 100],
      data: payload.data || {},
    })
  );
});

// Notification click — open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
