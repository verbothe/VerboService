const V='culto-v3';
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
