/* V1.19.18 · Temas de invitación, «Quién va», reacciones y ajustes del organizador.
 * El servidor decide todo (juntada_ver, juntada_responder, juntada_asistentes, juntada_reaccionar, juntada_configurar_invitacion).
 * Aquí solo se pinta. Sin tema (null) queda la invitación sobria de siempre.
 * Los códigos de error se leen de er.detail (JUN_*); nunca se decide por el texto del mensaje. */
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

const css=document.createElement('style');
css.textContent='#invite.con-tema .banner,#invite.con-tema h1.js-name,#invite.con-tema .rsvp,#invite.con-tema .rsvp-intro,#invite.con-tema .rsvp-section>h2{display:none}'
+'#invite.con-tema .rsvp-section:not(:has(#rsvpStatus:not([hidden]))){display:none}#invite.con-tema .rsvp-section{margin-top:0}'
+'#temaInv{margin:0 0 14px}#temaInv:empty{display:none}.pt-tema .pt-tema__titulo{color:var(--pt-tx)}'
+'#quienVa .qv-cuentas{font-weight:600;margin:0 0 8px}#quienVa ul{list-style:none;margin:0 0 10px;padding:0;display:flex;flex-direction:column;gap:6px}#quienVa li{display:flex;justify-content:space-between;gap:8px}#quienVa li small{color:var(--texto-suave,#5b6b6f)}'
+'#quienVa .qv-react{display:flex;gap:8px;flex-wrap:wrap}#quienVa .qv-react button{min-width:44px;min-height:44px;border-radius:12px;border:1.5px solid var(--borde,#c9d6d8);background:transparent;font-size:20px;cursor:pointer}#quienVa .qv-react button[aria-pressed="true"]{background:var(--tinte,#eafaff);border-color:var(--primario,#1f5f6b)}#quienVa .qv-react button:focus-visible{outline:3px solid var(--primario,#1f5f6b);outline-offset:2px}'
+'#invConfigCard .ic-fila{margin:10px 0}#invConfigCard select{width:100%}#invConfigCard .ic-aviso{margin:8px 0;padding:10px 12px;border-radius:12px;background:#fff1e6;color:#8a4a12;font-weight:600}#invConfigCard .ic-aviso[hidden]{display:none}#icPrev{margin-top:10px;max-width:420px}';
document.head.append(css);

/* ---------- Invitado ---------- */
let ver=null,resp=null,lista=null,miEmoji=null,busy=false;
const clavePrev=()=>'juntada_guest_progress_'+code();
const claveEmoji=()=>'juntada_react_'+code();
function respGuardada(){
 try{const s=JSON.parse(localStorage.getItem(clavePrev())||'null');if(!s)return null;
  const a=({'Tal vez':'Aún no sé','No puedo':'No voy'})[s.attendance]||s.attendance;return KEY[a]||null}catch(_){return null}
}
const nombreActual=()=>(($('guestName')||{}).value||'').trim();
function marcarBotones(key){
 resp=key;
 document.querySelectorAll('#invite .rsvp button').forEach(b=>b.classList.toggle('on',KEY[b.textContent.trim()]===key));
 const box=$('temaInv');
 if(box&&box.dataset.tema&&window.PintoTemas){
  box.querySelectorAll('.pt-btn').forEach(b=>{const on=b.dataset.r===key;b.setAttribute('aria-pressed',String(on));b.classList.toggle('is-cta',false)});
  const f=box.querySelector('.pt-tema__frase');if(f)f.textContent=window.PintoTemas.frase(box.dataset.tema,key);
 }
}
async function responder(key){
 const c=code();
 if(!c){toast('Para responder, abrí el enlace que compartiste por WhatsApp');return}
 const name=nombreActual();
 if(!name){toast('Escribí tu nombre');const i=$('guestName');if(i)i.focus();return}
 if(busy||!KEY[ES[key]])return;busy=true;
 try{
  const res=await rpc('juntada_responder',{p_codigo:c,p_nombre:name,p_asistencia:aServ(key)});
  marcarBotones(key);
  const st=$('rsvpStatus');if(st){st.hidden=false;st.textContent='✓ ¡Listo, '+name+'! Confirmaste: '+ES[key]+'.'}
  const g=$('guestPreview');if(g)g.innerHTML='<p class="sub">¡Listo! Tu respuesta fue enviada a la organizadora. Podés cambiarla seleccionando otra opción.</p>';
  if(typeof saveGuestProgress==='function')saveGuestProgress({name,attendance:ES[key]});
  if(typeof pintoNoteResponse==='function')pintoNoteResponse(res);
  toast('Confirmación guardada online');
  cargarAsistentes();
 }catch(e){toast('No se pudo enviar: '+(e.friendly||e.message))}
 finally{busy=false}
}
/* Los botones de siempre también pasan por acá (misma equivalencia aJuntada). */
window.rsvp=function(value){return responder(KEY[value])};

function pintarTema(){
 const inv=$('invite');if(!inv)return;
 let box=$('temaInv');
 const ok=ver&&ver.tema&&window.PintoTemas&&window.PintoTemas.TEMAS[ver.tema];
 if(!ok){if(box)box.remove();inv.classList.remove('con-tema');return}
 if(!box){box=document.createElement('div');box.id='temaInv';const pad=inv.querySelector('.pad');if(!pad)return;pad.prepend(box)}
 inv.classList.add('con-tema');
 const kicker='Te invitan';
 window.PintoTemas.render(box,{tema:ver.tema,titulo:ver.nombre,kicker,respuesta:resp,onResponder:k=>responder(k)});
}

function textoConteo(c){
 const v=c.voy||0,t=c.tal_vez||0,n=c.no_puedo||0;
 return v+(v===1?' va':' van')+' · '+t+(t===1?' aún no sabe':' aún no saben')+' · '+n+(n===1?' no va':' no van');
}
function pintarQuienVa(){
 const inv=$('invite');const sec=inv&&inv.querySelector('.rsvp-section');if(!sec)return;
 let card=$('quienVa');
 if(!lista){if(card)card.remove();return}
 if(!card){card=document.createElement('div');card.id='quienVa';card.className='card';sec.after(card)}
 const nom=nombreActual().toLowerCase();
 if(lista.asistentes&&resp&&miEmoji===null){const yo=lista.asistentes.find(a=>String(a.nombre||'').trim().toLowerCase()===nom);if(yo&&yo.emoji)miEmoji=yo.emoji}
 let h='<h2 style="margin-top:0">Quién va</h2><p class="qv-cuentas" role="status">'+esc(textoConteo(lista.conteos||{}))+'</p>';
 if(lista.oculta)h+='<p class="sub">La organización eligió no mostrar los nombres.</p>';
 else if(lista.asistentes&&lista.asistentes.length)h+='<ul>'+lista.asistentes.map(a=>'<li><span>'+esc(a.nombre)+(a.emoji?' '+esc(a.emoji):'')+'</span>'+(a.asistencia==='tal_vez'?'<small>Aún no sé</small>':'')+'</li>').join('')+'</ul>';
 if(resp)h+='<p class="sub" style="margin:0 0 6px">Tu reacción (una por persona; tocá la misma para sacarla):</p><div class="qv-react" role="group" aria-label="Tu reacción">'+EMOJIS.map(e=>'<button type="button" data-e="'+e+'" aria-pressed="'+(miEmoji===e)+'" aria-label="Reaccionar '+e+'">'+e+'</button>').join('')+'</div>';
 card.innerHTML=h;
 card.querySelectorAll('.qv-react button').forEach(b=>b.onclick=()=>reaccionar(b.dataset.e));
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
  await cargarAsistentes();pintarQuienVa();
 }catch(e){toast(MSG_REACC[codigoDe(e)]||'No se pudo guardar tu reacción.')}
 finally{busy=false}
}
async function iniciarInvitado(){
 const c=code()||new URLSearchParams(location.search).get('invite');
 if(!c||typeof rpc!=='function')return;
 try{
  ver=await rpc('juntada_ver',{p_codigo:c});
  if(ver&&ver.acceso&&ver.acceso!=='libre'&&ver.acceso!=='permitido'){ver=null;return}
  resp=respGuardada();
  try{miEmoji=JSON.parse(localStorage.getItem(claveEmoji())||'null')}catch(_){miEmoji=null}
  pintarTema();
  await cargarAsistentes();
  setInterval(()=>{if(document.visibilityState==='visible')cargarAsistentes()},6e4);
 }catch(_){}
}

/* ---------- Organizador ---------- */
const RECS=[[0,'Sin recordatorio'],[2,'2 horas antes'],[12,'12 horas antes'],[24,'24 horas antes (recomendado)'],[48,'48 horas antes'],[72,'3 días antes'],[168,'1 semana antes']];
const MSG_CFG={JUN_NO_AUTORIZADO:'Solo quien organiza puede cambiar esto.',JUN_TEMA_INVALIDO:'Ese tema no existe.',JUN_RECORDATORIO_INVALIDO:'El recordatorio va de 0 a 168 horas.',JUN_NO_DISPONIBLE:'Este evento ya no está disponible.'};
let cfg=null;
function cardCfg(){
 let c=$('invConfigCard');
 if(!c){const a=document.querySelector('#event .organizer-actions');if(!a)return null;c=document.createElement('div');c.id='invConfigCard';c.className='card';a.before(c)}
 return c;
}
function avisoFecha(rec){
 const a=$('icAviso');if(!a||!cfg)return;
 const sin=rec>0&&!fechaConcreta(cfg);
 a.hidden=!sin;
 a.textContent=sin?'Esta juntada todavía no tiene un día concreto, así que no habrá recordatorio. Cuando fijes el día, se activa solo.':'';
}
function pintarCfg(){
 if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador||!cfg||!window.PintoTemas)return;
 const c=cardCfg();if(!c)return;
 const T=window.PintoTemas.TEMAS;
 const nombre=(typeof saved!=='undefined'&&saved&&saved.name)||cfg.nombre||'';
 const sug=window.PintoTemas.temaAutomatico(nombre);
 const rec=cfg.recordatorio_horas==null?24:cfg.recordatorio_horas;
 const recs=RECS.some(r=>r[0]===rec)?RECS:RECS.concat([[rec,rec+' horas antes']]);
 c.innerHTML='<h3 style="margin:0 0 6px">Invitación</h3><p class="sub">Elegí cómo se ve para quienes la abren.</p>'
  +'<div class="ic-fila"><label for="icTema">Tema</label><select id="icTema"><option value="">Sin tema (sobrio)</option>'+Object.keys(T).map(k=>'<option value="'+k+'"'+(cfg.tema===k?' selected':'')+'>'+esc(T[k].nombre)+'</option>').join('')+'</select>'
  +(sug&&sug!==cfg.tema?'<p class="field-hint" id="icSug">Por el nombre, te sugerimos «'+esc(T[sug].nombre)+'». <button type="button" class="btn outline" id="icUsar">Usar</button></p>':'')+'</div>'
  +'<div class="ic-fila"><label><input type="checkbox" id="icOcultar"'+(cfg.ocultar_asistentes?' checked':'')+'> Ocultar la lista de quién va (se ven solo los números)</label></div>'
  +'<div class="ic-fila"><label for="icRec">Recordatorio a quienes dijeron «Voy» con Pintó ID</label><select id="icRec">'+recs.map(r=>'<option value="'+r[0]+'"'+(r[0]===rec?' selected':'')+'>'+r[1]+'</option>').join('')+'</select></div>'
  +'<p class="ic-aviso" id="icAviso" role="status" hidden></p>'
  +'<button type="button" class="btn secondary" id="icGuardar">Guardar invitación</button><p class="field-hint" id="icMsg" role="status"></p><div id="icPrev"></div>';
 const prev=()=>{const t=$('icTema').value,p=$('icPrev');if(!p)return;if(!t){p.className='';p.removeAttribute('data-tema');p.innerHTML='';return}window.PintoTemas.render(p,{tema:t,titulo:nombre||'Tu juntada',kicker:'Así se ve',respuesta:null,onResponder:()=>{}})};
 $('icTema').onchange=prev;
 const u=$('icUsar');if(u)u.onclick=()=>{$('icTema').value=sug;$('icSug').remove();prev()};
 $('icRec').onchange=()=>avisoFecha(+$('icRec').value);
 $('icGuardar').onclick=guardarCfg;
 prev();avisoFecha(rec);
}
async function guardarCfg(){
 const b=$('icGuardar'),m=$('icMsg');if(!b||b.disabled)return;
 b.disabled=true;m.textContent='Guardando…';
 try{
  const r=await rpc('juntada_configurar_invitacion',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador,p_tema:$('icTema').value||null,p_ocultar_asistentes:$('icOcultar').checked,p_recordatorio_horas:parseInt($('icRec').value,10)});
  cfg={...cfg,tema:r.tema,ocultar_asistentes:r.ocultar_asistentes,recordatorio_horas:r.recordatorio_horas};
  m.textContent='✓ Guardado.';toast('Invitación guardada');avisoFecha(r.recordatorio_horas);
  if(r.recordatorio_horas>0&&!fechaConcreta(cfg))toast('Sin día concreto no habrá recordatorio');
 }catch(e){m.textContent=MSG_CFG[codigoDe(e)]||'No se pudo guardar. Probá de nuevo.'}
 finally{b.disabled=false}
}
async function cargarCfg(){
 if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador||!remoteEvent.codigo||(typeof isGuestLink!=='undefined'&&isGuestLink))return;
 try{cfg=await rpc('juntada_ver',{p_codigo:remoteEvent.codigo});pintarCfg()}catch(_){}
}
const go0=window.go;
if(typeof go0==='function')window.go=function(id){const r=go0.apply(this,arguments);if(id==='event')setTimeout(cargarCfg,50);if(id==='invite')setTimeout(()=>{pintarTema();pintarQuienVa()},0);return r};

if(new URLSearchParams(location.search).get('invite'))iniciarInvitado();
})();
