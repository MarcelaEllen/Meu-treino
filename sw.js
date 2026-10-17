// Meu treino: service worker do modo offline.
// Se você mudar ESTE arquivo, troque a versão abaixo pra o celular limpar o cache antigo.
// Mudanças só no index.html NÃO precisam trocar a versão: ele sempre tenta buscar a versão nova primeiro.
const VERSION = 'v2';
const APP = 'meu-treino-app-' + VERSION;
const EXT = 'meu-treino-ext-' + VERSION;
const SCOPE = new URL('./', self.location).pathname;

const APP_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const PDF_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';

// Instalação: guarda o app, o gerador de PDF e a fonte pra funcionar sem internet.
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const app = await caches.open(APP);
    await Promise.all(APP_FILES.map((u) => app.add(u).catch(() => {})));
    const ext = await caches.open(EXT);
    try {
      const pdf = await fetch(PDF_LIB, { mode: 'cors' });
      if (pdf.ok) await ext.put(PDF_LIB, pdf);
    } catch (err) {}
    try {
      const css = await fetch(FONT_CSS, { mode: 'cors' });
      if (css.ok) {
        const txt = await css.clone().text();
        await ext.put(FONT_CSS, css);
        const fonts = [...txt.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((m) => m[1]);
        await Promise.all(fonts.map((u) => fetch(u, { mode: 'cors' }).then((r) => r.ok && ext.put(u, r)).catch(() => {})));
      }
    } catch (err) {}
    await self.skipWaiting();
  })());
});

// Ativação: apaga caches de versões antigas.
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('meu-treino-') && k !== APP && k !== EXT).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' && url.pathname.startsWith(SCOPE)) { e.respondWith(networkFirst(e)); return; }
  if (url.origin === self.location.origin && url.pathname.startsWith(SCOPE)) { e.respondWith(staleWhileRevalidate(e, APP)); return; }
  if (url.hostname === 'fonts.googleapis.com') { e.respondWith(staleWhileRevalidate(e, EXT)); return; }
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdnjs.cloudflare.com') { e.respondWith(cacheFirst(e, EXT)); return; }
});

// O app (index.html): tenta a internet por até 3 segundos; se não der, abre a cópia salva.
async function networkFirst(e) {
  const cache = await caches.open(APP);
  const net = fetch(e.request).then((res) => {
    if (res && res.ok) cache.put('./index.html', res.clone());
    return res;
  });
  e.waitUntil(net.catch(() => {}));
  try {
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 3000))]);
  } catch (err) {
    const saved = (await cache.match('./index.html')) || (await cache.match('./'));
    if (saved) return saved;
    try { return await net; } catch (err2) { return Response.error(); }
  }
}

// Ícones, manifest e CSS da fonte: entrega a cópia salva na hora e atualiza por trás.
async function staleWhileRevalidate(e, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(e.request);
  const net = fetch(e.request).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
    return res;
  }).catch(() => null);
  e.waitUntil(net);
  return hit || (await net) || Response.error();
}

// Arquivos de fonte e o gerador de PDF não mudam: usa a cópia salva sempre que existir.
async function cacheFirst(e, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(e.request);
  if (hit) return hit;
  try {
    const res = await fetch(e.request);
    if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
    return res;
  } catch (err) {
    return Response.error();
  }
}
