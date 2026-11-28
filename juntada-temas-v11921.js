/* V1.19.20 · Invitación en una sola tarjeta (fecha, lugar, nombre y respuesta juntos; «Quién va» plegado) con estilo editorial sobrio (pinto-temas v3, PROPUESTA).
 * El servidor decide todo (juntada_ver, juntada_responder, juntada_asistentes, juntada_reaccionar, juntada_configurar_invitacion, juntada_configurar_foto).
 * Aquí solo se pinta. Sin tema ni foto queda la invitación sobria de siempre.
 * Los códigos de error se leen de er.detail (JUN_*); nunca se decide por el texto del mensaje.
 * La foto depende de la migración NNNN_PROPUESTA_juntada_foto_portada.sql (NO aplicada): sin ella juntada_ver no trae foto_path y los controles de foto no aparecen. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY={'Voy':'voy','Aún no sé':'aun_no_se','No voy':'no_voy'};
const ES={voy:'Voy',aun_no_se:'Aún no sé',no_voy:'No voy'};
const EMOJIS=['🎉','🙌','😂','❤️'];
const aServ=k=>(window.PintoTemas&&window.PintoTemas.aJuntada?window.PintoTemas.aJuntada:{voy:'voy',aun_no_se:'tal_vez',no_voy:'no_puedo'})[k];
const code=()=>typeof remoteInvite!=='undefined'?remoteInvite:null;
const codigoDe=er=>String((er&&er.detail)||'').trim();
const fechaConcreta=d=>/^\d{4}-\d{2}-\d{2}$/.test(String((d&&(d.fecha_confirmada||d.fecha))||'').trim());
const sinMovimiento=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const fotoUrl=p=>p&&typeof SB_URL==='string'?SB_URL+'/storage/v1/object/public/juntada-fotos/'+String(p).split('/').map(encodeURIComponent).join('/'):'';
const COLORES={cumple:['#F6EEEA','#8C3B4F'],asado:['#2E2420','#D39A66'],previa:['#1D1C2B','#C4B07A'],playa:['#EEF3F2','#2F6670'],ruta:['#EFE8DB','#9C4A2F'],montana:['#E8EDE8','#3E5E4C']};
const TINTES=['#EADCDD','#DCE6E8','#EDE4CC','#DCE5DC','#E3DFEE','#EBDDD0'];
const ICO={gasto:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12M3 13h18M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0"/></svg>',cal:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',pin:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>'};

const css=document.createElement('style');
css.textContent=[
'.vh{position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
'#invite.inv-carga .pad{visibility:hidden}',
'#invite.con-tema .banner,#invite.con-tema h1.js-name,#invite.con-tema .detail,#invite.con-tema .js-description,#invite.con-tema .rsvp-section{display:none}',
'#invite.con-foto .banner{height:auto!important;min-height:0!important;padding:0!important;background:none!important;overflow:hidden}#invite.con-foto .banner img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}',
'#temaInv{margin:0 0 12px}',
'.pt-escena{position:relative}.pt-foto{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;background:#0001}',
'.pt-escena.marco{padding:14px 14px 0;background:color-mix(in srgb,var(--pt-ac) 9%,var(--pt-bg))}.pt-escena.marco .pt-foto{border:1px solid color-mix(in srgb,var(--pt-tx) 25%,transparent);border-radius:4px;aspect-ratio:3/2}',
'.pt-tema .pt-tema__titulo{color:var(--pt-tx)}',
'.pt-chips{display:flex;flex-direction:column;gap:6px;margin:2px 0}.pt-chips:empty{display:none}.pt-chip:first-child{font:400 20px/1.25 var(--pt-font)!important}.pt-chip:first-child>span::first-letter{text-transform:uppercase}.pt-chip:first-child svg{margin-top:4px}.pt-chip{display:flex;align-items:flex-start;gap:10px;font:500 15px/1.35 var(--font-sans,system-ui);padding:0;border:0;background:none}.pt-chip svg{flex:none;margin-top:2px;color:var(--pt-ac)}.pt-chip[hidden]{display:none}',
'.pt-desc{margin:0;font-size:14px;line-height:1.45;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-line}.pt-desc.abierta{-webkit-line-clamp:unset;display:block}.pt-desc[hidden]{display:none}.pt-mas{align-self:flex-start;background:none;border:0;padding:4px 0;min-height:32px;color:var(--pt-ac);font:600 13px var(--font-sans,system-ui);cursor:pointer;text-decoration:underline}.pt-mas[hidden]{display:none}',
'#temaInv .guest-identity.card{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:6px 0 0!important}#temaInv .guest-identity label{display:block;margin:0 0 4px;color:var(--pt-tx)!important;font:600 11px/1.2 var(--font-sans,system-ui);letter-spacing:.12em;text-transform:uppercase}#temaInv .guest-identity input{width:100%;box-sizing:border-box;min-height:46px;padding:0 12px;border-radius:10px!important;border:1px solid color-mix(in srgb,var(--pt-tx) 45%,transparent)!important;background:color-mix(in srgb,var(--pt-tx) 7%,var(--pt-bg))!important;color:var(--pt-tx)!important;font-size:16px;margin:0!important}#temaInv .guest-identity .field-hint{display:none}',
'#temaInv #guestName{margin:0!important}',
'.nombre-err{margin:6px 0 0;padding:6px 10px;border-radius:8px;background:#fff;color:#B3261E;font-weight:600;font-size:13px}.nombre-err[hidden]{display:none}',
'.pt-estado{margin:0;font-size:13px;min-height:0;opacity:.9}.pt-estado:empty{display:none}',
'.pt-tema[aria-busy="true"] .pt-btn{opacity:.7}',
'#invite.con-tema>.pad>.btn.secondary{background:none;border:0;box-shadow:none;text-decoration:underline;min-height:44px;margin-top:4px}',
'#quienVa{padding:0}#quienVa>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;min-height:52px;padding:12px 16px;font-weight:600}#quienVa>summary>span:first-child{white-space:nowrap}#quienVa>summary::-webkit-details-marker{display:none}#quienVa>summary::after{content:"";flex:none;width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .15s}#quienVa[open]>summary::after{transform:rotate(-135deg)}#quienVa .qv-res{flex:1;min-width:0;white-space:normal;line-height:1.3;font-weight:400;color:var(--texto-suave,#5b6b6f);font-size:14px}#quienVa .qv-cuerpo{padding:0 16px 16px}#quienVa>summary:focus-visible{outline:3px solid var(--primario,#1f5f6b);outline-offset:-3px;border-radius:12px}',
'.qv-stats{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 0 10px;font-size:14px}.qv-stat b{font-size:16px}',
'.qv-lista{list-style:none;margin:0 0 10px;padding:0;display:flex;flex-direction:column;gap:8px}.qv-lista li{display:flex;align-items:center;gap:10px}.qv-av{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:600 12px var(--font-sans,system-ui);color:#1D2F33}.qv-lista .qv-n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qv-lista small{color:var(--texto-suave,#5b6b6f)}',
'.qv-resumen{margin:0 0 10px;font-size:15px}',
'.qv-react{display:flex;gap:8px;flex-wrap:wrap}.qv-react button{min-width:48px;min-height:48px;border-radius:10px;border:1px solid var(--borde,#c9d6d8);background:transparent;font-size:22px;cursor:pointer}.qv-react button[aria-pressed="true"]{background:var(--tinte,#eafaff);border-color:var(--primario,#1f5f6b)}.qv-react button:focus-visible{outline:3px solid var(--primario,#1f5f6b);outline-offset:2px}',
'@media (prefers-reduced-motion:no-preference){.qv-react button.pop{animation:qv-pop .25s ease-out}@keyframes qv-pop{50%{transform:scale(1.25)}}}',
'#invConfigCard fieldset{border:0;margin:14px 0 0;padding:0;min-width:0}#invConfigCard legend{font-weight:700;margin:0 0 8px;padding:0}',
'.ic-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:10px 8px}.ic-tile{margin:0!important;position:relative;display:flex;flex-direction:column;gap:6px;cursor:pointer}.ic-tile .sw{display:block;height:48px;border-radius:12px;border:2px solid var(--borde,#c9d6d8)}.ic-tile .nm{font-size:13px;font-weight:600;text-align:center}.ic-tile input:checked~.sw{outline:3px solid var(--primario,#1f5f6b);outline-offset:2px}.ic-tile input:focus-visible~.sw{outline:3px dashed var(--primario,#1f5f6b);outline-offset:2px}',
'.ic-chips{display:flex;flex-wrap:wrap;gap:8px}.ic-chip{margin:0!important;position:relative;cursor:pointer}.ic-chip span{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid var(--borde,#c9d6d8);font-weight:600;font-size:14px}.ic-chip input:checked+span{background:var(--primario,#1f5f6b);border-color:var(--primario,#1f5f6b);color:#fff}.ic-chip input:focus-visible+span{outline:3px dashed var(--primario,#1f5f6b);outline-offset:2px}',
'.ic-switch{display:flex;gap:10px;align-items:flex-start;min-height:44px;cursor:pointer}.ic-switch input{width:22px;height:22px;margin-top:2px}',
'.ic-foto{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.ic-foto img{width:96px;height:64px;object-fit:cover;border-radius:10px;border:1px solid var(--borde,#c9d6d8)}.ic-foto-vacia{width:96px;height:64px;border-radius:10px;border:2px dashed var(--borde,#c9d6d8);display:grid;place-items:center;font-size:12px;color:var(--texto-suave,#5b6b6f)}',
'#invConfigCard .ic-aviso{margin:10px 0 0;padding:10px 12px;border-radius:12px;background:#fff1e6;color:#8a4a12;font-weight:600}#invConfigCard .ic-aviso[hidden]{display:none}',
'#icPrev{margin-top:14px;max-width:420px}#icPrev:empty{display:none}',
'#icGuardar{margin-top:14px;width:100%}#icGuardar[disabled]{opacity:.55}'
].join('\n');
document.head.append(css);

/* ---------- Héroe (invitación y vista previa) ---------- */
function armarHero(box,o){
 const T=window.PintoTemas;if(!T||!T.TEMAS[o.tema])return false;
 T.render(box,{tema:o.tema,titulo:o.titulo,kicker:o.kicker||'Te invitan',respuesta:o.respuesta||null,onResponder:o.onResponder||(()=>{})});
 const svg=box.firstElementChild;
 const src=o.fotoSrc||fotoUrl(o.fotoPath);
 if(src&&svg&&svg.tagName.toLowerCase()==='svg'){
  const wrap=document.createElement('div');wrap.className='pt-escena'+(o.fotoModo==='dentro'?' marco':'');svg.replaceWith(wrap);
  const img=document.createElement('img');img.alt='Foto de portada';img.decoding='async';img.src=src;img.className='pt-foto';
  img.onerror=()=>{wrap.replaceWith(svg)};
  wrap.append(img);
 }
 const cuerpo=box.querySelector('.pt-tema__cuerpo'),h=box.querySelector('.pt-regla')||box.querySelector('.pt-tema__titulo');
 if(cuerpo&&h){
  const chips=document.createElement('div');chips.className='pt-chips';
  chips.innerHTML='<span class="pt-chip" data-src=".js-date" hidden>'+ICO.cal+'<span></span></span><span class="pt-chip" data-src=".js-place" hidden>'+ICO.pin+'<span></span></span><span class="pt-chip" data-src=".js-expense" hidden>'+ICO.gasto+'<span></span></span>';
  h.after(chips);
  const d=document.createElement('p');d.className='pt-desc';d.hidden=true;chips.after(d);
  const m=document.createElement('button');m.type='button';m.className='pt-mas';m.textContent='Ver más';m.hidden=true;m.setAttribute('aria-expanded','false');d.after(m);
  m.onclick=()=>{const ab=d.classList.toggle('abierta');m.textContent=ab?'Ver menos':'Ver más';m.setAttribute('aria-expanded',String(ab))};
  if(o.fecha!=null||o.lugar!=null){const v=[o.fecha,o.lugar];chips.querySelectorAll('.pt-chip').forEach((c,i)=>{if(v[i]){c.querySelector('span').textContent=v[i];c.hidden=false}})}
  const est=document.createElement('p');est.className='pt-estado';est.setAttribute('aria-live','polite');cuerpo.append(est);
 }
 return true;
}
function refrescarChips(){
 const box=$('temaInv');if(!box)return;
 box.querySelectorAll('.pt-chip[data-src]').forEach(c=>{const f=document.querySelector('#invite '+c.dataset.src),t=f?f.textContent.trim():'';c.querySelector('span').textContent=t;c.hidden=!t});
 const d=box.querySelector('.pt-desc'),f=document.querySelector('#invite .js-description'),t=f?f.textContent.trim():'';
 if(d){d.textContent=t;d.hidden=!t;const m=box.querySelector('.pt-mas');if(m)m.hidden=!t||t.length<90}
}

/* ---------- Invitado ---------- */
let ver=null,resp=null,lista=null,miEmoji=null,busy=false,idNode=null,idHome=null;
const clavePrev=()=>'juntada_guest_progress_'+code();
const claveEmoji=()=>'juntada_react_'+code();
function respGuardada(){
 try{const s=JSON.parse(localStorage.getItem(clavePrev())||'null');if(!s)return null;
  const a=({'Tal vez':'Aún no sé','No puedo':'No voy'})[s.attendance]||s.attendance;return KEY[a]||null}catch(_){return null}
}
const nombreActual=()=>(($('guestName')||{}).value||'').trim();
function estado(txt){const e=document.querySelector('#temaInv .pt-estado');if(e)e.textContent=txt||''}
function marcarBotones(key){
 resp=key;
 document.querySelectorAll('#invite .rsvp button').forEach(b=>b.classList.toggle('on',KEY[b.textContent.trim()]===key));
 const box=$('temaInv');
 if(box&&box.dataset.tema&&window.PintoTemas){
  box.querySelectorAll('.pt-btn').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.r===key));b.classList.remove('is-cta')});
  const f=box.querySelector('.pt-tema__frase');if(f)f.textContent=window.PintoTemas.frase(box.dataset.tema,key);
 }
}
function errNombre(msg){
 const i=$('guestName');if(!i)return;
 let e=$('nombreErr');
 if(!e){e=document.createElement('p');e.id='nombreErr';e.className='nombre-err';e.setAttribute('role','alert');e.hidden=true;i.after(e);i.addEventListener('input',()=>errNombre(''))}
 e.textContent=msg||'';e.hidden=!msg;
 if(msg){i.setAttribute('aria-invalid','true');i.setAttribute('aria-describedby','nombreErr');i.focus();i.scrollIntoView({block:'center',behavior:sinMovimiento()?'auto':'smooth'})}
 else{i.removeAttribute('aria-invalid');i.removeAttribute('aria-describedby')}
}
async function responder(key){
 const c=code();
 if(!c){toast('Para responder, abrí el enlace que compartiste por WhatsApp');return}
 const name=nombreActual();
 if(!name){errNombre('Escribí tu nombre para responder.');return}
 if(busy||!KEY[ES[key]])return;
 busy=true;const prev=resp;marcarBotones(key);
 const box=$('temaInv');if(box)box.setAttribute('aria-busy','true');
 try{
  const res=await rpc('juntada_responder',{p_codigo:c,p_nombre:name,p_asistencia:aServ(key)});
  const st=$('rsvpStatus');if(st){st.hidden=false;st.textContent='✓ ¡Listo, '+name+'! Confirmaste: '+ES[key]+'.'}
  estado('✓ Anotado como «'+ES[key]+'». Podés cambiarlo cuando quieras.');
  const g=$('guestPreview');if(g)g.innerHTML='<p class="sub">¡Listo! Tu respuesta fue enviada a la organizadora. Podés cambiarla seleccionando otra opción.</p>';
  if(typeof saveGuestProgress==='function')saveGuestProgress({name,attendance:ES[key]});
  if(typeof pintoNoteResponse==='function')pintoNoteResponse(res);
  toast('Confirmación guardada online');
  cargarAsistentes();
 }catch(e){marcarBotones(prev);estado('');toast('No se pudo enviar: '+(e.friendly||e.message))}
 finally{busy=false;if(box)box.removeAttribute('aria-busy')}
}
/* Los botones de siempre también pasan por acá (misma equivalencia aJuntada). */
window.rsvp=function(value){return responder(KEY[value])};

function moverNombre(box){
 const inv=$('invite');if(!idNode)idNode=inv.querySelector('.guest-identity');if(!idNode)return;
 if(!idHome)idHome={parent:idNode.parentNode,next:idNode.nextSibling};
 const b=box.querySelector('.pt-tema__botones');if(b)b.before(idNode);
}
function devolverNombre(){
 if(idNode&&idHome&&idHome.parent&&!idHome.parent.contains(idNode)){idHome.parent.insertBefore(idNode,idHome.next&&idHome.next.parentNode===idHome.parent?idHome.next:null)}
}
function pintarInvitacion(){
 const inv=$('invite');if(!inv||!ver)return;
 const pad=inv.querySelector('.pad');if(!pad)return;
 const T=window.PintoTemas;
 const conTema=!!(ver.tema&&T&&T.TEMAS[ver.tema]);
 let box=$('temaInv');
 const key=[ver.tema,ver.foto_path,ver.foto_modo,ver.nombre].join('|');
 if(conTema){
  if(!(box&&box.dataset.k===key)){
   devolverNombre();
   if(!box){box=document.createElement('div');box.id='temaInv';pad.prepend(box)}
   armarHero(box,{tema:ver.tema,titulo:ver.nombre,respuesta:resp,onResponder:k=>responder(k),fotoPath:ver.foto_path,fotoModo:ver.foto_modo});
   box.dataset.k=key;moverNombre(box);
   if(resp&&nombreActual())estado('✓ Anotado como «'+ES[resp]+'». Podés cambiarlo cuando quieras.');
  }
  inv.classList.add('con-tema');inv.classList.remove('con-foto');
  refrescarChips();setTimeout(refrescarChips,600);setTimeout(refrescarChips,1800);
 }else{
  if(box)box.remove();devolverNombre();inv.classList.remove('con-tema');
  const ban=inv.querySelector('.banner');
  if(ver.foto_path&&ban){inv.classList.add('con-foto');ban.innerHTML='<img alt="Foto de portada" decoding="async" src="'+esc(fotoUrl(ver.foto_path))+'">';const im=ban.querySelector('img');im.onerror=()=>{inv.classList.remove('con-foto');ban.innerHTML=''}}
  else inv.classList.remove('con-foto');
 }
 inv.classList.remove('inv-carga');
}

function textoStat(n,uno,varios){return '<span class="qv-stat"><b>'+n+'</b> '+(n===1?uno:varios)+'</span>'}
function avatar(nombre){
 const n=String(nombre||'?').trim(),ini=n.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))%997;
 return '<span class="qv-av" style="background:'+TINTES[h%TINTES.length]+'" aria-hidden="true">'+esc(ini)+'</span>';
}
function pintarQuienVa(){
 const inv=$('invite');const sec=inv&&inv.querySelector('.rsvp-section');if(!inv)return;
 let card=$('quienVa');
 if(!lista){if(card)card.remove();return}
 const destino=inv.classList.contains('con-tema')&&$('temaInv')?$('temaInv'):sec;if(!destino)return;
 const abierto=card?card.open:false;
 if(!card||card.tagName!=='DETAILS'){if(card)card.remove();card=document.createElement('details');card.id='quienVa';card.className='card'}
 if(card.previousElementSibling!==destino)destino.after(card);
 const c=lista.conteos||{},v=c.voy||0,t=c.tal_vez||0,n=c.no_puedo||0;
 const nom=nombreActual().toLowerCase();
 if(lista.asistentes&&resp&&miEmoji===null){const yo=lista.asistentes.find(a=>String(a.nombre||'').trim().toLowerCase()===nom);if(yo&&yo.emoji)miEmoji=yo.emoji}
 const total=v+t+n;
 const resumen=total===0?'Todavía nadie respondió':[v?v+(v===1?' va':' van'):'',t?t+(t===1?' aún no sabe':' aún no saben'):'',n?n+(n===1?' no va':' no van'):''].filter(Boolean).join(' · ');
 let h='<summary><span>Quién va</span><span class="qv-res" role="status">'+esc(resumen)+'</span></summary><div class="qv-cuerpo">';
 if(total===0)h+='<p class="sub">Podés ser la primera persona.</p>';
 else h+='<div class="qv-stats">'+textoStat(v,'va','van')+textoStat(t,'aún no sabe','aún no saben')+textoStat(n,'no va','no van')+'</div>';
 if(lista.oculta)h+='<p class="sub">La organización eligió no mostrar los nombres.</p>';
 else if(lista.asistentes&&lista.asistentes.length){
  h+='<ul class="qv-lista">'+lista.asistentes.map(a=>'<li>'+avatar(a.nombre)+'<span class="qv-n">'+esc(a.nombre)+(a.emoji?' '+esc(a.emoji):'')+'</span>'+(a.asistencia==='tal_vez'?'<small>Aún no sé</small>':'')+'</li>').join('')+'</ul>';
  const cuentas={};lista.asistentes.forEach(a=>{if(a.emoji)cuentas[a.emoji]=(cuentas[a.emoji]||0)+1});
  const r=EMOJIS.filter(e=>cuentas[e]).map(e=>e+' '+cuentas[e]);
  if(r.length)h+='<p class="qv-resumen" aria-label="Reacciones">'+r.join(' · ')+'</p>';
 }
 if(resp)h+='<p class="sub" style="margin:0 0 8px">Tu reacción (una por persona; tocá la misma para sacarla):</p><div class="qv-react" role="group" aria-label="Tu reacción">'+EMOJIS.map(e=>'<button type="button" data-e="'+e+'" aria-pressed="'+(miEmoji===e)+'" aria-label="Reaccionar '+e+'">'+e+'</button>').join('')+'</div>';
 card.innerHTML=h+'</div>';card.open=abierto;
 card.querySelectorAll('.qv-react button').forEach(b=>b.onclick=()=>{b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');reaccionar(b.dataset.e)});
}
async function cargarAsistentes(){
 const c=code();if(!c)return;
 try{lista=await rpc('juntada_asistentes',{p_codigo:c});pintarQuienVa()}
 catch(e){lista=null;pintarQuienVa()}
}
const MSG_REACC={JUN_SIN_RESPUESTA:'Primero respondé si vas.',JUN_REACCION_INVALIDA:'Esa reacción no está disponible.',JUN_REQUIERE_APROBACION:'Necesitás que te aprueben para participar.'};
async function reaccionar(emoji){
 const c=code();if(!c||!resp||busy)return;
 const nuevo=miEmoji===emoji?null:emoji;busy=true;
 try{
  await rpc('juntada_reaccionar',{p_codigo:c,p_nombre:nombreActual(),p_emoji:nuevo});
  miEmoji=nuevo;try{localStorage.setItem(claveEmoji(),JSON.stringify(nuevo))}catch(_){}
  await cargarAsistentes();
 }catch(e){toast(MSG_REACC[codigoDe(e)]||'No se pudo guardar tu reacción.')}
 finally{busy=false}
}
async function iniciarInvitado(){
 const c=code()||new URLSearchParams(location.search).get('invite');
 const inv=$('invite');if(inv)inv.classList.add('inv-carga');
 const quitar=()=>{const i=$('invite');if(i)i.classList.remove('inv-carga')};
 setTimeout(quitar,3000);
 if(!c||typeof rpc!=='function'){quitar();return}
 try{
  ver=await rpc('juntada_ver',{p_codigo:c});
  if(ver&&ver.acceso&&ver.acceso!=='libre'&&ver.acceso!=='permitido'){ver=null;quitar();return}
  resp=respGuardada();
  try{miEmoji=JSON.parse(localStorage.getItem(claveEmoji())||'null')}catch(_){miEmoji=null}
  pintarInvitacion();
  await cargarAsistentes();
  setInterval(()=>{if(document.visibilityState==='visible')cargarAsistentes()},6e4);
 }catch(_){quitar()}
}

/* ---------- Organizador ---------- */
const RECS=[[0,'Sin recordatorio'],[2,'2 h antes'],[12,'12 h antes'],[24,'24 h antes'],[48,'48 h antes'],[72,'3 días antes'],[168,'1 semana antes']];
const MSG_CFG={JUN_NO_AUTORIZADO:'Solo quien organiza puede cambiar esto.',JUN_TEMA_INVALIDO:'Ese tema no existe.',JUN_RECORDATORIO_INVALIDO:'El recordatorio va de 0 a 168 horas.',JUN_NO_DISPONIBLE:'Este evento ya no está disponible.',
 JUN_FOTO_INVALIDA:'Esa foto no es válida.',JUN_FOTO_NO_SUBIDA:'La foto no llegó a subirse. Probá de nuevo.',JUN_FOTO_MODO_INVALIDO:'Ese modo no existe.'};
let cfg=null,snap='',fotoLocal=null;
function cardCfg(){
 let c=$('invConfigCard');
 if(!c){const a=document.querySelector('#event .organizer-actions');if(!a)return null;c=document.createElement('div');c.id='invConfigCard';c.className='card';a.before(c)}
 return c;
}
const valTema=()=>{const r=document.querySelector('#invConfigCard input[name="icTema"]:checked');return r?r.value:''};
const valRec=()=>{const r=document.querySelector('#invConfigCard input[name="icRec"]:checked');return r?parseInt(r.value,10):24};
const valModo=()=>{const r=document.querySelector('#invConfigCard input[name="icModo"]:checked');return r?r.value:'reemplaza'};
const estadoForm=()=>[valTema(),$('icOcultar')&&$('icOcultar').checked,valRec()].join('|');
function avisoFecha(){
 const a=$('icAviso');if(!a||!cfg)return;
 const sin=valRec()>0&&!fechaConcreta(cfg);
 a.hidden=!sin;a.textContent=sin?'Esta juntada todavía no tiene un día concreto, así que no habrá recordatorio. Cuando fijes el día, se activa solo.':'';
}
function bonita(f){f=String(f||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(f)){try{return new Date(f+'T12:00:00').toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'short'})}catch(_){}}return f}
function previa(){
 const p=$('icPrev');if(!p||!cfg)return;
 const t=valTema();
 if(!t){p.className='';p.removeAttribute('data-tema');p.innerHTML='';return}
 armarHero(p,{tema:t,titulo:cfg.nombre||(typeof saved!=='undefined'&&saved&&saved.name)||'Tu juntada',kicker:'Así se ve',respuesta:null,fotoSrc:fotoLocal||'',fotoPath:cfg.foto_path,fotoModo:valModo(),fecha:bonita(cfg.fecha_confirmada||cfg.fecha),lugar:cfg.lugar||''});
}
function dirty(){const b=$('icGuardar');if(!b)return;const d=estadoForm()!==snap;b.disabled=!d;b.textContent=d?'Guardar invitación':'Sin cambios por guardar';avisoFecha();previa()}
function seccionFoto(){
 if(!('foto_path' in cfg))return '';
 const url=fotoLocal||fotoUrl(cfg.foto_path);
 return '<fieldset><legend>Foto de portada</legend><div class="ic-foto" id="icFotoFila">'+(url?'<img alt="Foto actual" src="'+esc(url)+'">':'<div class="ic-foto-vacia">Sin foto</div>')
  +'<div style="display:flex;flex-direction:column;gap:8px"><label class="btn secondary" for="icFotoArchivo" style="margin:0">'+(cfg.foto_path?'Cambiar foto':'Elegir foto')+'</label><input class="vh" type="file" id="icFotoArchivo" accept="image/*">'
  +(cfg.foto_path?'<button type="button" class="btn outline" id="icFotoQuitar">Quitar foto</button>':'')+'</div></div>'
  +'<div class="ic-chips" role="radiogroup" aria-label="Cómo se muestra la foto" style="margin-top:10px">'
  +[['reemplaza','A todo el ancho'],['dentro','Con marco']].map(m=>'<label class="ic-chip"><input class="vh" type="radio" name="icModo" value="'+m[0]+'"'+((cfg.foto_modo||'reemplaza')===m[0]?' checked':'')+'><span>'+m[1]+'</span></label>').join('')+'</div>'
  +'<p class="field-hint" id="icFotoMsg" role="status">Se achica sola antes de subir. Cualquiera con el enlace de la invitación puede verla.</p></fieldset>';
}
function pintarCfg(){
 if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador||!cfg||!window.PintoTemas)return;
 const c=cardCfg();if(!c)return;
 const T=window.PintoTemas.TEMAS;
 const nombre=(typeof saved!=='undefined'&&saved&&saved.name)||cfg.nombre||'';
 const sug=window.PintoTemas.temaAutomatico(nombre);
 const rec=cfg.recordatorio_horas==null?24:cfg.recordatorio_horas;
 const recs=RECS.some(r=>r[0]===rec)?RECS:RECS.concat([[rec,rec+' h antes']]);
 const tiles=[['','Sin tema']].concat(Object.keys(T).map(k=>[k,T[k].nombre])).map(([k,n])=>{
  const col=COLORES[k];const sw=col?'background:linear-gradient(135deg,'+col[0]+' 60%,'+col[1]+' 60%);border-color:'+col[1]:'background:var(--superficie,#fff)';
  return '<label class="ic-tile"><input class="vh" type="radio" name="icTema" value="'+k+'"'+((cfg.tema||'')===k?' checked':'')+'><span class="sw" style="'+sw+'"></span><span class="nm">'+esc(n)+'</span></label>'}).join('');
 c.innerHTML='<h3 style="margin:0 0 4px">Invitación</h3><p class="sub" style="margin:0">Elegí cómo se ve para quienes la abren.</p>'
  +'<fieldset><legend>Tema</legend><div class="ic-tiles" role="radiogroup" aria-label="Tema">'+tiles+'</div>'
  +(sug&&sug!==(cfg.tema||'')?'<p class="field-hint" id="icSug">Por el nombre, te sugerimos «'+esc(T[sug].nombre)+'». <button type="button" class="btn outline" id="icUsar" style="min-height:44px">Usar</button></p>':'')+'</fieldset>'
  +seccionFoto()
  +'<fieldset><legend>Quién va</legend><label class="ic-switch"><input type="checkbox" id="icOcultar"'+(cfg.ocultar_asistentes?' checked':'')+'><span>Ocultar los nombres. Se ven solo los números.</span></label></fieldset>'
  +'<fieldset><legend>Recordatorio a quienes dijeron «Voy» con Pinto ID</legend><div class="ic-chips" role="radiogroup" aria-label="Recordatorio">'+recs.map(r=>'<label class="ic-chip"><input class="vh" type="radio" name="icRec" value="'+r[0]+'"'+(r[0]===rec?' checked':'')+'><span>'+r[1]+(r[0]===24?' · recomendado':'')+'</span></label>').join('')+'</div>'
  +'<p class="ic-aviso" id="icAviso" role="status" hidden></p></fieldset>'
  +'<div id="icPrev" aria-label="Vista previa"></div>'
  +'<button type="button" class="btn" id="icGuardar" disabled>Sin cambios por guardar</button><p class="field-hint" id="icMsg" role="status"></p>';
 snap=estadoForm();
 c.querySelectorAll('input[name="icTema"],input[name="icRec"],#icOcultar').forEach(i=>i.addEventListener('change',dirty));
 const u=$('icUsar');if(u)u.onclick=()=>{const r=c.querySelector('input[name="icTema"][value="'+sug+'"]');if(r){r.checked=true;$('icSug').remove();dirty()}};
 $('icGuardar').onclick=guardarCfg;
 c.querySelectorAll('input[name="icModo"]').forEach(i=>i.addEventListener('change',cambiarModo));
 const f=$('icFotoArchivo');if(f)f.onchange=()=>{if(f.files&&f.files[0])subirFoto(f.files[0]);f.value=''};
 const q=$('icFotoQuitar');if(q)q.onclick=quitarFoto;
 avisoFecha();previa();
}
async function guardarCfg(){
 const b=$('icGuardar'),m=$('icMsg');if(!b||b.disabled)return;
 b.disabled=true;m.textContent='Guardando…';
 try{
  const r=await rpc('juntada_configurar_invitacion',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador,p_tema:valTema()||null,p_ocultar_asistentes:$('icOcultar').checked,p_recordatorio_horas:valRec()});
  cfg={...cfg,tema:r.tema,ocultar_asistentes:r.ocultar_asistentes,recordatorio_horas:r.recordatorio_horas};
  snap=estadoForm();m.textContent='✓ Guardado.';toast('Invitación guardada');dirty();
  if(r.recordatorio_horas>0&&!fechaConcreta(cfg))toast('Sin día concreto no habrá recordatorio');
 }catch(e){m.textContent=MSG_CFG[codigoDe(e)]||'No se pudo guardar. Probá de nuevo.';b.disabled=false}
}
/* Foto: se achica en el celular, se sube a Storage (carpeta = id de la juntada) y recién ahí el servidor la asigna. */
async function comprimir(file){
 let bmp=null;
 try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(_){}
 if(!bmp){bmp=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(file);i.onload=()=>ok(i);i.onerror=no;i.src=u})}
 const w0=bmp.width||bmp.naturalWidth,h0=bmp.height||bmp.naturalHeight;
 let escala=Math.min(1,1600/Math.max(w0,h0)),q=.82,blob=null;
 for(let k=0;k<6;k++){
  const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(w0*escala));cv.height=Math.max(1,Math.round(h0*escala));
  cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
  blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));
  if(blob&&blob.size<=900000)return blob;
  if(q>.55)q-=.1;else escala*=.8;
 }
 return blob;
}
const hex=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>b.toString(16).padStart(2,'0')).join('');
async function subirFoto(file){
 const m=$('icFotoMsg');const say=t=>{if(m)m.textContent=t};
 if(!/^image\//.test(file.type||'')){say('Elegí un archivo de imagen.');return}
 say('Preparando la foto…');
 try{
  const blob=await comprimir(file);
  if(!blob||blob.size>1000000){say('La foto sigue siendo muy pesada. Probá con otra.');return}
  const path=remoteEvent.id+'/'+hex(16)+'.jpg';
  const tok=typeof pintoBearer==='function'?pintoBearer():null;
  say('Subiendo…');
  const r=await fetch(SB_URL+'/storage/v1/object/juntada-fotos/'+path,{method:'POST',headers:Object.assign({apikey:SB_KEY,'Content-Type':'image/jpeg','x-upsert':'false'},tok?{Authorization:'Bearer '+tok}:{}),body:blob});
  if(!r.ok){say('No se pudo subir la foto. Probá de nuevo.');return}
  const res=await rpc('juntada_configurar_foto',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador,p_path:path,p_modo:valModo()});
  cfg={...cfg,foto_path:res.foto_path,foto_modo:res.foto_modo};fotoLocal=null;
  pintarCfg();const mm=$('icFotoMsg');if(mm)mm.textContent='✓ Foto guardada.';
 }catch(e){say(MSG_CFG[codigoDe(e)]||'No se pudo guardar la foto. Probá de nuevo.')}
}
async function quitarFoto(){
 const m=$('icFotoMsg');
 try{const res=await rpc('juntada_configurar_foto',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador,p_path:null,p_modo:null});
  cfg={...cfg,foto_path:res.foto_path,foto_modo:res.foto_modo};fotoLocal=null;pintarCfg();const mm=$('icFotoMsg');if(mm)mm.textContent='Foto quitada.'}
 catch(e){if(m)m.textContent=MSG_CFG[codigoDe(e)]||'No se pudo quitar la foto.'}
}
async function cambiarModo(){
 if(!cfg||!cfg.foto_path){previa();return}
 const m=$('icFotoMsg');
 try{const res=await rpc('juntada_configurar_foto',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador,p_path:cfg.foto_path,p_modo:valModo()});
  cfg={...cfg,foto_modo:res.foto_modo};previa();if(m)m.textContent='✓ Guardado.'}
 catch(e){if(m)m.textContent=MSG_CFG[codigoDe(e)]||'No se pudo cambiar.'}
}
async function cargarCfg(){
 if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador||!remoteEvent.codigo||(typeof isGuestLink!=='undefined'&&isGuestLink))return;
 try{cfg=await rpc('juntada_ver',{p_codigo:remoteEvent.codigo});pintarCfg()}catch(_){}
}
const go0=window.go;
if(typeof go0==='function')window.go=function(id){const r=go0.apply(this,arguments);if(id==='event')setTimeout(cargarCfg,50);if(id==='invite')setTimeout(()=>{pintarInvitacion();pintarQuienVa()},0);return r};

if(new URLSearchParams(location.search).get('invite'))iniciarInvitado();
})();
