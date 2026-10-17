// Service worker mínimo: só existe pra o Android aceitar instalar como app.
// Não guarda nada em cache (o modo offline fica pra depois).
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request));
});
