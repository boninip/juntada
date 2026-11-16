/* V1.18.8 · Plazo de votación y recordatorios. El servidor decide (hora del servidor); acá solo se muestra y se pide. */
(()=>{
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let skew=0; // servidor - reloj local, en ms
const sync=ahora=>{const t=Date.parse(ahora);if(!isNaN(t))skew=t-Date.now()};
const nowS=()=>Date.now()+skew;
const fmt=iso=>new Date(iso).toLocaleString('es-AR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
function resta(iso){
 const ms=Date.parse(iso)-nowS();if(ms<=0)return null;
 const m=Math.floor(ms/6e4),h=Math.floor(m/60),d=Math.floor(h/24);
 if(d>=2)return d+' días';if(h>=2)return h+' horas';if(h>=1)return '1 hora';return Math.max(1,m)+' minutos';
}
function estado(d){
 if(!d||!d.votacion_hasta)return null;
 if(d.ahora)sync(d.ahora);
 const r=resta(d.votacion_hasta);
 return r?{abierta:true,texto:'La votación cierra en '+r+' ('+fmt(d.votacion_hasta)+').'}:{abierta:false,texto:'La votación cerró el '+fmt(d.votacion_hasta)+'. Decide quien organiza.'};
}
/* ---------- Invitado ---------- */
let invDatos=null;
function pintarInvitado(){
 const sec=document.getElementById('invite');if(!sec)return;
 let n=document.getElementById('plazoInvitado');
 const e=estado(invDatos);
 if(!e){if(n)n.remove();return}
 if(!n){n=document.createElement('div');n.id='plazoInvitado';n.setAttribute('role','status');n.style.cssText='margin:12px 0;padding:12px 14px;border-radius:14px;font-weight:600';const pad=sec.querySelector('.pad');(pad||sec).prepend(n)}
 n.textContent=e.texto;n.style.background=e.abierta?'#eaf4ff':'#fff1e6';n.style.color=e.abierta?'#24518b':'#8a4a12';
 if(!e.abierta&&invDatos.ya_vote===false)n.textContent+=' No llegaste a votar.';
}
async function cargarInvitado(){
 const code=new URLSearchParams(location.search).get('invite');if(!code||typeof rpc!=='function')return;
 try{invDatos=await rpc('juntada_ver',{p_codigo:code});pintarInvitado();setInterval(pintarInvitado,6e4)}catch(_){}
}
/* ---------- Organizador ---------- */
let orgDatos=null;
const link=()=>location.origin+location.pathname+'?invite='+encodeURIComponent(remoteEvent.codigo||'');
function textoRecordar(){
 const nom=(typeof saved!=='undefined'&&saved.name)||'la juntada';
 const h=orgDatos&&orgDatos.votacion_hasta&&!orgDatos.votacion_cerrada?' Se puede votar hasta el '+fmt(orgDatos.votacion_hasta)+'.':'';
 return 'Te recuerdo votar en «'+nom+'».'+h;
}
function card(){
 let c=document.getElementById('plazoCard');
 if(!c){const a=document.querySelector('#event .organizer-actions');if(!a)return null;c=document.createElement('div');c.id='plazoCard';c.className='card';a.before(c)}
 return c;
}
function pintarOrg(){
 if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador||!orgDatos)return;
 const c=card();if(!c)return;
 const e=estado(orgDatos);
 const votando=typeof saved!=='undefined'&&saved.dateMode==='vote';
 c.innerHTML='<h3 style="margin:0 0 6px">Plazo de votación</h3>'
  +'<p id="plazoEstado" class="sub" role="status">'+esc(e?e.texto:'Sin plazo: se puede votar hasta que decidas.')+'</p>'
  +'<div style="display:flex;gap:8px;flex-wrap:wrap"><div style="flex:1;min-width:140px"><label for="plazoDia">Día</label><input id="plazoDia" type="date"></div><div style="flex:1;min-width:110px"><label for="plazoHora">Hora</label><input id="plazoHora" type="time" value="23:59"></div></div>'
  +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" class="btn secondary" id="plazoFijar">'+(e?'Cambiar plazo':'Fijar plazo')+'</button>'+(e?'<button type="button" class="btn outline" id="plazoQuitar">Quitar plazo</button>':'')+'</div>'
  +'<p class="field-hint" id="plazoMsg" role="status"></p>'
  +'<h3 style="margin:14px 0 6px">Recordar</h3><p class="sub">Para quienes no usan Pinto, mandales un recordatorio vos.</p>'
  +'<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn secondary" id="recCompartir">Compartir</button><button type="button" class="btn outline" id="recCopiar">Copiar link</button><a class="btn outline" id="recMail" href="#">Por mail</a></div>';
 const hoy=new Date(nowS()),d=n=>new Date(hoy.getTime()+n*864e5);const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
 const dia=c.querySelector('#plazoDia');dia.min=iso(hoy);dia.max=iso(d(30));
 if(orgDatos.votacion_hasta){const x=new Date(orgDatos.votacion_hasta);dia.value=iso(x);c.querySelector('#plazoHora').value=String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')}
 const msg=t=>{c.querySelector('#plazoMsg').textContent=t};
 const enviar=async hasta=>{try{const r=await rpc('juntada_fijar_plazo',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador,p_hasta:hasta});orgDatos.votacion_hasta=r&&r.votacion_hasta!==undefined?r.votacion_hasta:hasta;orgDatos.votacion_cerrada=false;if(r&&r.ahora)orgDatos.ahora=r.ahora;pintarOrg();document.getElementById('plazoMsg').textContent=hasta?'Plazo guardado.':'Plazo quitado.'}catch(er){msg(er.detail==='JUN_PLAZO_INVALIDO'?'Ese plazo no vale: tiene que ser dentro de las próximas 1 hora a 30 días.':er.detail==='JUN_NO_DISPONIBLE'?'La juntada no está disponible.':'No se pudo guardar: '+er.message)}};
 c.querySelector('#plazoFijar').onclick=()=>{const dv=dia.value,hv=c.querySelector('#plazoHora').value;if(!dv||!hv){msg('Elegí día y hora.');return}const t=new Date(dv+'T'+hv);if(isNaN(t)||t.getTime()<=nowS()){msg('Elegí un momento futuro.');return}enviar(t.toISOString())};
 const q=c.querySelector('#plazoQuitar');if(q)q.onclick=()=>enviar(null);
 const t=textoRecordar();
 c.querySelector('#recMail').href='mailto:?subject='+encodeURIComponent('Recordatorio: votá en la juntada')+'&body='+encodeURIComponent(t+'\n'+link());
 c.querySelector('#recCompartir').onclick=async()=>{try{if(navigator.share)await navigator.share({text:t,url:link()});else{await navigator.clipboard.writeText(t+' '+link());msg('Tu navegador no comparte: copié el mensaje.')}}catch(_){}};
 c.querySelector('#recCopiar').onclick=async()=>{try{await navigator.clipboard.writeText(t+' '+link());msg('Link copiado.')}catch(_){msg('No pude copiar. Mantené apretado el link para copiarlo.')}};
}
function engancharOrg(){
 if(typeof loadResponses!=='function'||window.__plazoHook)return;window.__plazoHook=1;
 const prev=loadResponses;
 loadResponses=async function(g){
  await prev(g);
  if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador)return;
  try{const d=await rpc('juntada_ver_organizador',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador});if(d&&d.id===remoteEvent.id){orgDatos=d;if(d.ahora)sync(d.ahora);pintarOrg()}}catch(_){}
 };
}
document.addEventListener('DOMContentLoaded',()=>{engancharOrg();cargarInvitado()});
if(document.readyState!=='loading'){engancharOrg();cargarInvitado()}
setInterval(()=>{if(orgDatos&&document.getElementById('plazoEstado')){const e=estado(orgDatos);if(e)document.getElementById('plazoEstado').textContent=e.texto}},6e4);
})();
