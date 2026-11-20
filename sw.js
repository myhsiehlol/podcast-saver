const CACHE = 'podcast-saver-static-v1';
const ASSETS = ['./','./index.html','./style.css','./logic.js','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  // Share GET requests carry title/text/url; always return local application shell.
  if(url.searchParams.has('text')||url.searchParams.has('url')||url.searchParams.has('title')){
    event.respondWith(caches.match('./index.html').then(cached=>cached||fetch('./index.html')));return;
  }
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request)));
});
