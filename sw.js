/* To Do List – offline cache for the app shell */
const CACHE = 'todo-app-v1';
const FILES = [
  './', './index.html', './manifest.json', './icons/icon.svg', './css/styles.css',
  ...['utils', 'state', 'storage', 'sync', 'actions', 'auth', 'quick-add', 'reminders', 'dictation', 'toasts', 'theme', 'derived', 'render', 'dialogs', 'backup', 'router', 'events', 'main'].map(f => `./js/${f}.js`)
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
