// キャッシュ名（変更でiOSに強制更新させる）
const CACHE = 'kakeibo-v3';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./index.html', './manifest.json']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// fetchイベントは一切介入しない
// → すべてのリクエスト（API含む）をブラウザに任せる
self.addEventListener('fetch', e => {
  // 自サイトのGETのみキャッシュ
  if (
    e.request.method !== 'GET' ||
    !e.request.url.startsWith(self.location.origin)
  ) {
    // POSTや外部URLはService Workerを完全スルー
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).catch(() => caches.match('./index.html'))
    )
  );
});
