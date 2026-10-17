// Meu treino: service worker (modo offline + notificações).
// Se você mudar ESTE arquivo ou a lista de arquivos do app, troque a versão abaixo.
// Mudanças só no conteúdo do index.html, css ou js NÃO precisam trocar a versão:
// o app sempre tenta buscar a versão nova primeiro.
importScripts('js/config.js');
const VERSION = 'v4';
const APP = 'meu-treino-app-' + VERSION;
const EXT = 'meu-treino-ext-' + VERSION;
const SCOPE = new URL('./', self.location).pathname;

const APP_FILES = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './css/estilo.css',
  './js/dados.js', './js/util.js', './js/hoje.js', './js/treino.js', './js/progresso.js',
  './js/mais.js', './js/pdf.js', './js/avisos.js', './js/app.js', './js/config.js',
];
const PDF_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';

// ---------------------------------------------------------------- Offline

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const app = await caches.open(APP);
    await Promise.all(APP_FILES.map((u) => app.add(new Request(u, { cache: 'reload' })).catch(() => {})));
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
  const doApp = url.origin === self.location.origin && url.pathname.startsWith(SCOPE);
  if (doApp && req.mode === 'navigate') { e.respondWith(networkFirst(e, './index.html')); return; }
  if (doApp) { e.respondWith(networkFirst(e, null)); return; }
  if (url.hostname === 'fonts.googleapis.com') { e.respondWith(staleWhileRevalidate(e, EXT)); return; }
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdnjs.cloudflare.com') { e.respondWith(cacheFirst(e, EXT)); return; }
});

// Arquivos do app: tenta a internet por até 3 segundos; se não der, usa a cópia salva.
async function networkFirst(e, key) {
  const cache = await caches.open(APP);
  const k = key || new URL(e.request.url).pathname;
  const net = fetch(e.request).then((res) => {
    if (res && res.ok) cache.put(k, res.clone());
    return res;
  });
  e.waitUntil(net.catch(() => {}));
  try {
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 3000))]);
  } catch (err) {
    const saved = (await cache.match(k, { ignoreSearch: true })) || (key && (await cache.match('./')));
    if (saved) return saved;
    try { return await net; } catch (err2) { return Response.error(); }
  }
}

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

// ---------------------------------------------------------------- Notificações

function mostrar(title, body, tag, tab) {
  return self.registration.showNotification(title, {
    body, tag, renotify: true, icon: 'icon-192.png', badge: 'icon-192.png',
    vibrate: [300, 150, 300], data: { tab: tab || '' },
  }).catch(() => {});
}

async function appNaTela() {
  const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  return cs.some((c) => c.visibilityState === 'visible');
}

// Descanso e cronômetro: o app manda a hora; o aviso só aparece se o app não estiver na tela.
const PEND = new Map();
self.addEventListener('message', (e) => {
  const m = e.data || {};
  if (m.t === 'cancelar') { PEND.delete(m.tag); return; }
  if (m.t !== 'agendar') return;
  const id = Math.random();
  PEND.set(m.tag, id);
  const ms = Math.max(0, m.at - Date.now());
  e.waitUntil(new Promise((fim) => setTimeout(async () => {
    if (PEND.get(m.tag) === id) {
      PEND.delete(m.tag);
      if (!(await appNaTela())) await mostrar(m.title, m.body, m.tag, m.tab);
    }
    fim();
  }, ms)));
});

// Lembretes com o app fechado (Chrome/Android com o app instalado).
function abrirDB() {
  return new Promise((ok, erro) => {
    const r = indexedDB.open('meu-treino', 2);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('ph')) d.createObjectStore('ph', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('cfg')) d.createObjectStore('cfg', { keyPath: 'id' });
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error);
  });
}
function ler(d, id) {
  return new Promise((ok) => { const g = d.transaction('cfg').objectStore('cfg').get(id); g.onsuccess = () => ok(g.result); g.onerror = () => ok(null); });
}
function gravar(d, v) {
  return new Promise((ok) => { const t = d.transaction('cfg', 'readwrite'); t.objectStore('cfg').put(v); t.oncomplete = ok; t.onerror = ok; });
}
function dia(dt) { const p = (n) => ('0' + n).slice(-2); return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate()); }
function dias(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5); }

async function lembretes() {
  const d = await abrirDB();
  const c = await ler(d, 'cfg');
  if (!c || !c.on || c.push) return; // com o servidor ligado, quem manda os lembretes é ele
  const agora = new Date();
  if (agora.getHours() < 8 || agora.getHours() >= 21) return;
  const hoje = dia(agora);
  const st = (await ler(d, 'avisos')) || { id: 'avisos' };
  let mudou = false;

  if (c.f.idle && c.lb && c.lt) {
    const n = dias(c.lt, hoje);
    if (n >= c.ld && st.idle !== hoje) {
      const w = (c.pl || {})[agora.getDay()];
      await mostrar('Faz ' + n + ' dias sem treinar', w ? 'Hoje é dia de ' + w + '. Bora?' : 'Que tal um treino leve hoje?', 'parado', 'treino');
      st.idle = hoje; mudou = true;
    }
  }
  if (c.f.bk && c.st && dias(c.st, hoje) >= 7) {
    const a = c.lbk ? dias(c.lbk, hoje) : null;
    if ((a === null || a >= 14) && (!st.bk || dias(st.bk, hoje) >= 7)) {
      await mostrar(a === null ? 'Você ainda não fez backup' : 'Faz ' + a + ' dias sem backup', 'Se o celular der problema, você perde seus dados. Toque pra salvar.', 'backup', 'mais');
      st.bk = hoje; mudou = true;
    }
  }
  if (c.f.med && c.lm) {
    const m = dias(c.lm, hoje);
    if (m >= 14 && (!st.med || dias(st.med, hoje) >= 7)) {
      await mostrar('Hora de medir de novo', 'Sua última medição foi há ' + m + ' dias.', 'medidas', 'prog');
      st.med = hoje; mudou = true;
    }
  }
  if (mudou) await gravar(d, st);
}

self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'lembretes') e.waitUntil(lembretes().catch(() => {}));
});

// Push do servidor: chega vazio e o texto é buscado no próprio servidor.
self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let msgs = [];
    try {
      const s = await self.registration.pushManager.getSubscription();
      const r = await fetch(PUSH_URL.replace(/\/+$/, '') + '/msg', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify({ endpoint: s.endpoint }) });
      msgs = (await r.json()).msgs || [];
    } catch (err) {}
    if (!msgs.length) msgs = [{ title: 'Meu treino', body: 'Você tem um aviso. Toque pra abrir.', tag: 'geral', tab: '' }];
    for (const m of msgs) await mostrar(m.title, m.body, m.tag, m.tab);
  })());
});

// Tocar na notificação: abre o app (ou traz pra frente) na aba certa.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const tab = (e.notification.data || {}).tab || '';
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) {
      if (new URL(c.url).pathname.startsWith(SCOPE)) {
        await c.focus();
        if (tab) c.postMessage({ t: 'abrir', tab });
        return;
      }
    }
    await self.clients.openWindow('./' + (tab ? '#' + tab : ''));
  })());
});
