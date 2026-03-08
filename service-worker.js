var CACHE = 'homepay-v7';
var FILES = ['./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(function(cached){
    if(cached)return cached;
    return fetch(e.request).then(function(res){
      if(res&&res.status===200){var c=res.clone();caches.open(CACHE).then(function(ca){ca.put(e.request,c)})}
      return res;
    }).catch(function(){if(e.request.mode==='navigate')return caches.match('./index.html')});
  }));
});
