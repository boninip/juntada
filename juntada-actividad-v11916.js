/* V1.19.16 · Campanita y «Actividad». Solo lee con las funciones que ya existen (juntada_ver, juntada_solicitudes, juntada_mis_eventos); el servidor decide qué se ve. */
(()=>{
'use strict';
const SENT='00000000-0000-0000-0000-000000000000';
const JS='juntada_v10_events';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sesion=()=>!!(window.PintoAuth&&typeof window.PintoAuth.has==='function'&&window.PintoAuth.has());
const locales=()=>{try{return JSON.parse(localStorage.getItem(JS)||'[]').filter(x=>x&&x.id&&!x.cancelada)}catch(_){return[]}};
const cred=id=>{try{return JSON.parse(localStorage.getItem('juntada_remote_'+id)||'null')}catch(_){return null}};
const cuanto=ms=>{const m=Math.max(1,Math.round(ms/6e4));return m<60?m+' min':Math.round(m/60)+' h'};
let items=[],cargado=false;
const css=document.createElement('style');
css.textContent='.j-bell{position:relative;flex:none;width:44px;height:44px;margin:0 8px 0 auto;padding:0;border:0;border-radius:12px;background:var(--tinte);color:var(--primario-txt);display:grid;place-items:center;cursor:pointer}.j-bell svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.j-bell i{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:var(--coral-btn);color:#fff;font:700 12px/20px system-ui,sans-serif;font-style:normal;text-align:center;box-sizing:border-box}.j-bell i[hidden]{display:none}#jActOverlay{position:fixed;inset:0;z-index:10030;background:rgb(var(--velo-rgb)/.5);display:flex;align-items:flex-start;justify-content:center;padding:70px 16px 16px}#jActOverlay[hidden]{display:none}#jActOverlay .act-panel{width:100%;max-width:420px;max-height:calc(100vh - 100px);overflow:auto;background:var(--fondo);border:1px solid var(--borde);border-radius:20px;padding:16px}#jActOverlay h2{margin:0 0 8px;font-size:1.3rem;color:var(--texto)}#jActOverlay .act-item{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:10px 4px;background:transparent;border:0;border-top:1px solid var(--borde);text-align:left;color:var(--texto);font:inherit;cursor:pointer}#jActOverlay .act-item small{display:block;color:var(--texto-sec);font-size:.85rem}#jActOverlay .act-vacio{color:var(--texto-sec);margin:8px 0 12px}#jActOverlay .act-cerrar{margin-top:10px}';
document.head.append(css);
async function recolectar(){
 const out=[],vistos=new Set(),t=[];
 for(const x of locales().slice(0,8)){
  const c=cred(x.id);if(!c||!c.id)continue;vistos.add(c.id);const nombre=(x.saved&&x.saved.name)||'Juntada';
  if(c.codigo)t.push(rpc('juntada_ver',{p_codigo:c.codigo}).then(d=>{if(d&&d.votacion_hasta&&!d.votacion_cerrada&&d.ya_vote===false){const ms=new Date(d.votacion_hasta)-Date.now();if(ms>0&&ms<=48*36e5)out.push({t:'plazo',lid:x.id,nombre,ms})}}).catch(()=>{}));
  if(c.organizador)t.push(rpc('juntada_solicitudes',{p_juntada:c.id,p_organizador:c.organizador}).then(s=>{const n=(Array.isArray(s)?s:[]).filter(q=>q.estado==='pendiente').length;if(n)out.push({t:'sol',lid:x.id,nombre,n})}).catch(()=>{}));
 }
 if(sesion())t.push(rpc('juntada_mis_eventos',{}).then(async arr=>{
  for(const e of (Array.isArray(arr)?arr:[]).filter(e=>!e.eliminada_at&&!vistos.has(e.id)).slice(0,6)){
   try{const s=await rpc('juntada_solicitudes',{p_juntada:e.id,p_organizador:SENT});const n=(Array.isArray(s)?s:[]).filter(q=>q.estado==='pendiente').length;if(n)out.push({t:'sol',remoto:true,nombre:e.nombre,n})}catch(_){}
  }}).catch(()=>{}));
 await Promise.all(t);return out;
}
const total=()=>items.reduce((a,i)=>a+(i.n||1),0);
function badge(){document.querySelectorAll('.j-bell i').forEach(b=>{const n=total();b.hidden=!n;b.textContent=n>9?'9+':String(n)});document.querySelectorAll('.j-bell').forEach(b=>b.setAttribute('aria-label',total()?'Actividad, '+total()+' pendientes':'Actividad, sin pendientes'))}
function montar(){
 ['home','miCuenta'].forEach(id=>{const h=document.querySelector('#'+id+' header');if(!h||h.querySelector('.j-bell'))return;const b=document.createElement('button');b.type='button';b.className='j-bell';b.setAttribute('aria-haspopup','dialog');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg><i hidden></i>';b.onclick=abrir;const av=h.querySelector('.avatar');av?av.before(b):h.append(b)});
 badge();
}
function abrir(){
 let o=$('jActOverlay');
 if(!o){o=document.createElement('div');o.id='jActOverlay';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','jActTitulo');o.hidden=true;document.body.append(o);o.addEventListener('click',e=>{if(e.target===o)cerrar()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!o.hidden)cerrar()})}
 o.dataset.prev='';
 const filas=items.map((i,k)=>'<button type="button" class="act-item" data-k="'+k+'"><span><b>'+(i.t==='sol'?esc(i.n+(i.n===1?' pedido de ingreso':' pedidos de ingreso')):'Vence en '+esc(cuanto(i.ms)))+'</b><small>'+(i.t==='sol'?'en ':'votá en ')+'«'+esc(i.nombre)+'»</small></span></button>').join('');
 o.innerHTML='<div class="act-panel"><h2 id="jActTitulo">Actividad</h2>'+(filas||'<p class="act-vacio">No tenés nada pendiente. Acá vas a ver pedidos de ingreso por aprobar y votaciones por vencer.'+(sesion()?'':' Ingresá con tu Pintó ID para ver también tus juntadas de otros celulares.')+'</p>')+'<button type="button" class="btn secondary act-cerrar">Cerrar</button></div>';
 o.querySelector('.act-cerrar').onclick=cerrar;
 o.querySelectorAll('.act-item').forEach(b=>b.onclick=()=>{const i=items[+b.dataset.k];cerrar();if(i.lid&&typeof openJuntada==='function')openJuntada(i.lid);else if(typeof showMyEvents==='function'){go('myEvents');showMyEvents()}});
 o.hidden=false;o.dataset.prev=(document.activeElement&&document.activeElement.className)||'';(o.querySelector('.act-item')||o.querySelector('.act-cerrar')).focus();
 refrescar();
}
function cerrar(){const o=$('jActOverlay');if(o)o.hidden=true;const b=document.querySelector('.j-bell');if(b)b.focus()}
let ult=0;
async function refrescar(force){
 if(!force&&Date.now()-ult<3e4)return;ult=Date.now();
 try{items=await recolectar()}catch(_){items=[]}cargado=true;badge();
 const o=$('jActOverlay');if(o&&!o.hidden){const f=o.querySelector('.act-cerrar');if(f)abrir()}
}
const go0=window.go;if(typeof go0==='function')window.go=function(id){const r=go0.apply(this,arguments);if(id==='home'||id==='miCuenta'){setTimeout(()=>{montar();refrescar()},0)}return r};
let n=0;const tm=setInterval(()=>{montar();if(document.querySelector('.j-bell')&&n>3)clearInterval(tm);if(++n>40)clearInterval(tm)},250);
setTimeout(()=>refrescar(true),400);setTimeout(()=>refrescar(true),2500);setInterval(()=>{if(document.visibilityState==='visible')refrescar(true)},3e5);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refrescar()});
})();
