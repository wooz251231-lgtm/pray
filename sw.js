// 캐시 버전 — 구조를 크게 바꿀 때 숫자를 올리면 옛 캐시가 정리됩니다.
const CACHE = 'gido-hanji-v1';
const ASSETS = ['./icon-192.png','./icon-512.png','./manifest.webmanifest'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  var isContent = url.endsWith('/') || url.endsWith('index.html') || url.endsWith('data.js');

  if(isContent){
    // 콘텐츠: 네트워크 우선 → 접속 시 항상 최신, 오프라인이면 캐시
    e.respondWith(
      fetch(e.request).then(function(res){
        var copy=res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      }).catch(function(){ return caches.match(e.request); })
    );
  } else {
    // 정적 자원(아이콘 등): 캐시 우선
    e.respondWith(
      caches.match(e.request).then(function(hit){
        return hit || fetch(e.request);
      })
    );
  }
});
