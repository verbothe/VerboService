const V='culto-v4';
const ARQ=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ARQ)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const rede=(r,ms)=>new Promise((ok,er)=>{const t=setTimeout(()=>er(new Error('lento')),ms);fetch(r).then(x=>{clearTimeout(t);ok(x)},y=>{clearTimeout(t);er(y)})});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(r.mode==='navigate'){
      try{const x=await rede(r,2500);c.put(r,x.clone());return x}
      catch(err){return (await c.match(r,{ignoreSearch:true}))||(await c.match('index.html'))||fetch(r)}
    }
    const guardado=await c.match(r);
    const atualiza=fetch(r).then(x=>{c.put(r,x.clone());return x}).catch(()=>null);
    return guardado||(await atualiza)||Response.error();
  })());
});

self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{}}catch(x){d={titulo:'Verbo Service',corpo:e.data?e.data.text():''}}
  const tag=d.culto_id?('prog-'+d.culto_id):'verbo';
  e.waitUntil((async()=>{
    await self.registration.showNotification(d.titulo||'Verbo Service',{body:d.corpo||'',icon:'icon-192.png',badge:'icon-192.png',tag,renotify:true,data:{culto_id:d.culto_id||null}});
    const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cs.some(c=>c.visibilityState==='visible')){
      await new Promise(r=>setTimeout(r,1500));
      (await self.registration.getNotifications({tag})).forEach(n=>n.close());
    }
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const id=e.notification.data&&e.notification.data.culto_id;
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cs.length){const c=cs[0];await c.focus();if(id)c.postMessage({abrir:id});return}
    await self.clients.openWindow(id?('./?abrir='+id):'./');
  })());
});
