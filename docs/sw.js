// Offline support. The site's own files load network-first, so updates show straight away when online;
// fonts and the drag library load cache-first. API calls are never cached.
const VERSION = "bc82ef7313"; // set by tools/build.js
const CACHE = "dft-sjt-" + VERSION;
const CORE = [
  "./", "styles.css", "design.css", "questions.js", "guide.js", "app.js", "design.js", "phrases.js",
  "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"
];
const CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("dft-sjt-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.includes("/api/")) return;

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }

  if (url.origin !== self.location.origin) return;
  // Revalidate with the server every time (cheap with ETags), so an update is never hidden behind the HTTP cache.
  // Page loads use redirect "manual" so a Cloudflare redirect (e.g. /index.html to /) is passed back for the browser to follow.
  const fresh = new Request(req.url, {cache: "no-cache", credentials: "same-origin", redirect: req.mode === "navigate" ? "manual" : "follow"});
  event.respondWith(fetch(fresh).then(res => {
    // Cloudflare redirects /index.html to /, and browsers refuse redirected responses for page loads, so never cache those.
    if (res.ok && !res.redirected) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === "navigate" ? caches.match("./") : Response.error()))));
});
