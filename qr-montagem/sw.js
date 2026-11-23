// Romanzza Montagem: cache para obra com sinal fraco.
// Rede primeiro (sempre a versão nova quando há sinal; no-cache = pergunta ao servidor e ignora os 10 min de cache do Pages);
// sem sinal, usa o que já foi aberto antes.
// Escopo: só /qr-montagem/ (o resto do site não passa por aqui).
const CACHE = "montagem-v4";
// pedidos e desenhos do Agile Portal também ficam guardados: o montador abre de novo na obra sem sinal
const PORTAL = "https://portal.agilesolution.com.br";
const BASE = ["./", "index.html", "app.js", "manifest.webmanifest",
  "vendor/three.min.js", "vendor/zxing.min.js",
  "marca/romanzza-logo-branco.png", "marca/quattrocento-sans-400.woff2", "marca/quattrocento-sans-700.woff2",
  "marca/icone-192.png", "marca/favicon-32.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method !== "GET" || (u.origin !== location.origin && !(u.origin === PORTAL && u.pathname.startsWith("/pub/montagem/")))) return;
  e.respondWith(fetch(r, { cache: "no-cache" }).then(res => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true })));
});
