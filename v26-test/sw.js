const CACHE_NAME = 'kopilka-family-v26-test-2';
const APP_FILES = ['./','./index.html','./manifest.json','../icon.svg','../icon-192.png','../icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('kopilka-family-v26-test-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
 if (event.request.method !== 'GET') return;
 const url = new URL(event.request.url);
 if (url.origin !== self.location.origin) return;
 if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response => {if(response&&response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(event.request,response.clone()));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response&&response.ok&&response.type==='basic')caches.open(CACHE_NAME).then(cache=>cache.put(event.request,response.clone()));return response;})));
});
