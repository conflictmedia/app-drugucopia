/* eslint-disable no-restricted-globals */
/**
 * Drugucopia service worker.
 *
 * Round 1 (C2): adds offline support so the dose logger works at
 * festivals / bars / basements with no signal. Strategy:
 *
 *   1. Precache a small set of critical assets on install
 *      (app shell, logo, manifest, notification sound).
 *   2. For navigation requests, fall back to the cached app shell
 *      (network-first, fall back to cache when offline).
 *   3. For other same-origin GET requests, use stale-while-revalidate
 *      so cached substance data and JS chunks load instantly offline.
 *   4. Leave cross-origin requests alone (don't proxy them).
 *
 * Notification + notificationclick handlers are preserved unchanged.
 *
 * NOTE: Firestore / Firebase traffic is cross-origin and will fall
 * through to the network. Sync will simply fail offline and queue
 * locally; that's already handled by the sync context.
 */

// Bump this when changing the precache list or fetch strategy.
// The activate handler drops any cache with a different version.
const CACHE_VERSION = 'drugucopia-v9'
const PRECACHE_NAME = `${CACHE_VERSION}-precache`
const RUNTIME_NAME = `${CACHE_VERSION}-runtime`

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.webmanifest',
  '/notification.wav',
  '/robots.txt',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // BUGFIX: do NOT delete caches during install. The PREVIOUSLY-ACTIVE
      // service worker may still be serving from those caches while this new
      // one waits (or the user closes the tab before activation) — wiping
      // them here left the running old app with NO offline cache. Stale
      // caches are now cleaned up in 'activate' (after this SW takes over),
      // and stale JS chunks are already handled by the network-first chunk
      // strategy below.

      // Precache the critical app shell from the network (bypass HTTP cache).
      const cache = await caches.open(PRECACHE_NAME)
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }))
          } catch {
            /* skip missing asset */
          }
        }),
      )
      // Take over from the previous SW immediately.
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop ALL caches that don't match the current version.
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      )
      // BUGFIX: don't force-navigate every open tab. client.navigate()
      // aborts in-flight requests — including Firestore setDoc writes from
      // the sync engine — surfacing spurious "Sync write failed" toasts and
      // discarding unsaved form state mid-dose-entry. Instead, tell the
      // clients an update activated; they pick up new JS on their next
      // natural navigation (chunks are network-first anyway).
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION }).catch?.(() => { })
      })
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request

  // Only handle GET; let everything else (POST/PUT/DELETE) hit the network.
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Cross-origin requests (Firebase, Google Fonts, etc.) — bypass SW.
  if (url.origin !== self.location.origin) return

  // Navigation requests: network-first, fall back to cached app shell.
  // This is what makes the app open offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          // Cache the latest navigation response so a later offline
          // visit gets the freshest app shell we've seen.
          // BUGFIX: only cache successful basic responses — a 404/500/
          // opaque-redirect HTML page used to get stored under '/' and then
          // served as the "app shell" on the next offline launch.
          if (fresh && fresh.ok && fresh.type === 'basic') {
            const cache = await caches.open(RUNTIME_NAME)
            cache.put('/', fresh.clone()).catch(() => { })
          }
          return fresh
        } catch {
          const cached = await caches.match('/')
            ?? (await caches.match('/index.html'))
          if (cached) return cached
          // Last resort: a minimal offline placeholder.
          return new Response(
            '<!doctype html><meta charset="utf-8"><title>Offline</title>' +
            '<body style="font-family:system-ui;padding:2rem;text-align:center">' +
            '<h1>You&rsquo;re offline</h1>' +
            '<p>Drugucopia can&rsquo;t reach the network right now. ' +
            'Your logged doses are still saved locally and will sync when you reconnect.</p>' +
            '<p><button onclick="location.reload()">Try again</button></p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          )
        }
      })(),
    )
    return
  }

  // Same-origin static assets.
  //
  // For Next.js JS chunks (/_next/static/chunks/**) we use NETWORK-FIRST:
  // application code changes frequently and a stale cached chunk can leave
  // the user running old logic even after a deploy — which presents as
  // "the fix didn't work" even though the new code is on the server. We
  // always prefer the network response and only fall back to cache when
  // the network fails (offline).
  //
  // For everything else (images, fonts, JSON data) we keep
  // stale-while-revalidate — those assets change rarely and SWR gives
  // instant offline loads.
  const isJsChunk = url.pathname.startsWith('/_next/static/chunks/')

  if (isJsChunk) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_NAME)
        try {
          const fresh = await fetch(req)
          if (fresh && fresh.status === 200 && fresh.type === 'basic') {
            cache.put(req, fresh.clone()).catch(() => { })
          }
          return fresh
        } catch {
          const cached = await cache.match(req)
          if (cached) return cached
          return new Response('Offline and not cached', {
            status: 504,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }
      })(),
    )
    return
  }

  // Non-chunk assets: stale-while-revalidate.
  // Serves from cache immediately (instant offline), refreshes in background.
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_NAME)
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          // Only cache successful, basic (non-opaque) responses.
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone()).catch(() => { })
          }
          return res
        })
        .catch(() => null)

      // Return cached immediately if we have it; otherwise wait for network.
      if (cached) {
        // Revalidate in the background.
        event.waitUntil(network)
        return cached
      }
      const fresh = await network
      if (fresh) return fresh
      // No cache, no network — return a clean error so callers can handle it.
      return new Response('Offline and not cached', {
        status: 504,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, icon, data, requireInteraction } = event.data.payload
    self.registration.showNotification(title, {
      body,
      tag,
      icon: icon || '/logo.png',
      data,
      // Persist only when explicitly requested — a blanket
      // requireInteraction left "Peak 87%" notices stuck in the shade
      // forever after a dose ended (they are now closed programmatically
      // via the CLOSE_TAG message).
      requireInteraction: requireInteraction === true,
      vibrate: [200, 100, 200],
    })
  }

  // Close notifications by tag — lets the app clean up timeline
  // notifications when a dose ends (registration.getNotifications is not
  // reachable from the page for SW-shown notifications in all browsers,
  // so the SW does it on the app's behalf).
  if (event.data?.type === 'CLOSE_NOTIFICATIONS_WITH_TAG' && event.data.tag) {
    event.waitUntil(
      self.registration.getNotifications({ tag: event.data.tag }).then((notifications) => {
        notifications.forEach((n) => n.close())
      }).catch(() => { }),
    )
  }

  // Allow the page to trigger an immediate SW update.
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // Focus or open the app
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) {
          clients[0].focus()
        } else {
          self.clients.openWindow('/')
        }
      }),
  )
})
