const CACHE_PREFIX = 'higher-lower-shell-'
const CACHE_VERSION = '__CACHE_VERSION__'
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`
const APP_ROOT = new URL('./', self.registration.scope)
const BUILD_ASSETS = []
const SHELL_URLS = [
  APP_ROOT.href,
  new URL('manifest.webmanifest', APP_ROOT).href,
  new URL('icon.svg', APP_ROOT).href,
  new URL('icon-192.png', APP_ROOT).href,
  new URL('icon-512.png', APP_ROOT).href,
  new URL('icon-maskable-512.png', APP_ROOT).href,
  ...BUILD_ASSETS.map((asset) => new URL(asset, APP_ROOT).href),
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached && request.mode !== 'navigate') return cached

    try {
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone())
      return response
    } catch {
      if (cached) return cached
      if (request.mode === 'navigate') return (await cache.match(APP_ROOT.href)) || Response.error()
      return Response.error()
    }
  })())
})
