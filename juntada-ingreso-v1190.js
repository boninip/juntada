/* V1.19.0 · Solicitudes de ingreso y coorganizadores. El servidor decide todo (RLS + funciones); acá solo se pide y se muestra. */
(()=>{
'use strict';
const BASE='https://sswgtcpaayisecwxxskp.supabase.co';
const KEY='sb_publishable_a8hB04TzAhc9NLwrCDtozg_FwVk377j';
const SENTINELA='00000000-0000-0000-0000-000000000000'; // el servidor ignora el código si la sesión es de dueño/coorganizador
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const code=new URLSearchParams(location.search).get('invite');
const msgErr=e=>{const d=String((e&&e.detail)||'');
 if(/JUN_REQUIERE_APROBACION/.test(d))return 'Necesitás que quien organiza te apruebe para participar.';
 if(/JUN_SIN_PINTO_ID/.test(d))return 'Esa persona todavía no usó su Pintó ID en esta juntada. Pedile que abra el link con su cuenta.';
 if(/JUN_SESION/.test(d))return 'Ingresá con tu Pintó ID para continuar.';
 const m=String((e&&e.message)||'').replace(/\s*\(HTTP \d+\)\s*$/,'');
 if(/Acceso no autorizado/i.test(m))return 'Esto solo lo puede hacer quien organiza.';
 return m||'No se pudo completar. Probá de nuevo.'};
const estilo=document.createElement('style');
estilo.textContent='#ingresoOverlay{position:fixed;inset:0;z-index:10020;background:#f4f9f8;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto}#ingresoOverlay .ing-card{max-width:420px;width:100%;background:#ffffff;border:1px solid #dceef2;border-radius:24px;padding:30px 24px;box-shadow:0 12px 35px #1f5f6b12;text-align:center}#ingresoOverlay h1{color:#1f5f6b;font-size:25px;line-height:1.2;margin:0 0 10px}#ingresoOverlay p{color:#5b6e70;font-size:16px;line-height:1.55;margin:0 0 16px}#ingresoOverlay input{margin:4px 0 12px;text-align:left}#ingresoOverlay .ing-msg{font-size:14px;margin:8px 0 0}#ingCard .ing-row{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:9px 0;border-top:1px solid #dce6e4}#ingCard .ing-row b{flex:1;min-width:0;overflow-wrap:anywhere}#ingCard .ing-btns{display:flex;gap:6px}#ingCard .ing-btns button{margin:0;padding:8px 12px;font-size:13px;width:auto}#ingCard .ing-chk{display:flex;gap:10px;align-items:flex-start;margin:6px 0 4px;font-weight:700}#ingCard .ing-chk input{width:20px;height:20px;margin:2px 0 0;flex:none}#ingCard select{margin:6px 0}#ingCard h3{margin:16px 0 6px}#ingCard h3:first-child{margin-top:0}';
document.head.append(estilo);

/* ---------- Invitada: pide entrar ---------- */
async function otp(email){
 const redirect=new URL(location.pathname,location.origin);redirect.searchParams.set('invite',code);
 const r=await fetch(BASE+'/auth/v1/otp?redirect_to='+encodeURIComponent(redirect.toString()),{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email,create_user:true})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.msg||d.error_description||d.message||'Error '+r.status);
}
function overlay(d){
 let o=document.getElementById('ingresoOverlay');
 if(!o){o=document.createElement('div');o.id='ingresoOverlay';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');document.body.append(o)}
 const nom=esc(d.nombre||'Juntada');
 const acc=d.acceso;
 let h='<div class="ing-card"><div class="logo" style="margin-bottom:14px">Juntada<span>.</span></div><h1>'+nom+'</h1>';
 if(acc==='iniciar_sesion')h+='<p>Quien organiza pidió aprobar a cada persona antes de entrar. Para pedirlo, ingresá con tu Pintó ID: te mandamos un enlace por mail.</p><label for="ingEmail" style="text-align:left">Tu email</label><input id="ingEmail" type="email" autocomplete="email" placeholder="nombre@correo.com"><button type="button" class="btn" id="ingEnviar">Enviarme el enlace</button>';
 else if(acc==='solicitar')h+='<p>Quien organiza aprueba a cada persona antes de que entre. Poné tu nombre y pedí entrar.</p><label for="ingNombre" style="text-align:left">Tu nombre</label><input id="ingNombre" type="text" maxlength="80" autocomplete="name" placeholder="Cómo te conocen"><button type="button" class="btn" id="ingPedir">Pedir entrar</button>';
 else if(acc==='pendiente')h+='<p>Tu solicitud está pendiente. Cuando quien organiza la apruebe, vas a poder entrar desde este mismo enlace.</p><button type="button" class="btn secondary" id="ingRevisar">Revisar de nuevo</button>';
 else if(acc==='rechazada')h+='<p>Quien organiza no aprobó tu ingreso a esta juntada. Si creés que fue un error, hablalo con esa persona.</p>';
 h+='<p class="ing-msg" id="ingMsg" role="status"></p></div>';
 o.innerHTML=h;
 const msg=t=>{const m=document.getElementById('ingMsg');if(m)m.textContent=t};
 const b1=document.getElementById('ingEnviar');if(b1)b1.onclick=async()=>{const em=document.getElementById('ingEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){msg('Ingresá un email válido.');return}b1.disabled=true;try{await otp(em);msg('Revisá tu correo y abrí el enlace. Después volvés acá y pedís entrar. Si no llega, mirá spam.')}catch(e){msg('No se pudo enviar el enlace: '+e.message)}finally{b1.disabled=false}};
 const b2=document.getElementById('ingPedir');if(b2)b2.onclick=async()=>{const n=document.getElementById('ingNombre').value.trim();if(!n){msg('Poné tu nombre.');return}b2.disabled=true;try{const r=await rpc('juntada_solicitar_ingreso',{p_codigo:code,p_nombre:n});if(r.estado==='aprobada')location.reload();else overlay({...d,acceso:r.estado})}catch(e){msg(msgErr(e));b2.disabled=false}};
 const b3=document.getElementById('ingRevisar');if(b3)b3.onclick=()=>revisar(true);
}
async function revisar(manual){
 try{const d=await rpc('juntada_ver',{p_codigo:code});
  if(d.acceso==='permitido'||d.acceso==='libre'){if(document.getElementById('ingresoOverlay'))location.reload();return}
  if(d.requiere_aprobacion)overlay(d);
  if(manual){const m=document.getElementById('ingMsg');if(m)m.textContent='Todavía sin respuesta.'}
 }catch(_){}
}
if(code&&/^[0-9a-f-]{36}$/i.test(code)){
 revisar(false);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.getElementById('ingresoOverlay'))revisar(false)});
}

/* ---------- Quien organiza o coorganiza ---------- */
let org=null,sols=[],coos=[],resp=[];
const orgOk=()=>typeof remoteEvent!=='undefined'&&remoteEvent&&remoteEvent.organizador;
const ids=()=>({p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador});
function tarjeta(){
 let c=document.getElementById('ingCard');
 if(!c){const a=document.getElementById('plazoCard')||document.querySelector('#event .organizer-actions');if(!a)return null;c=document.createElement('div');c.id='ingCard';c.className='card';a.before(c)}
 return c;
}
async function cargar(){
 if(!orgOk())return;
 try{
  const id=remoteEvent.id;
  const [d,s,c,r]=await Promise.all([rpc('juntada_ver_organizador',ids()),rpc('juntada_solicitudes',ids()),rpc('juntada_coorganizadores',ids()),rpc('juntada_respuestas_organizador',ids())]);
  if(!remoteEvent||remoteEvent.id!==id)return;
  org=d;sols=Array.isArray(s)?s:[];coos=Array.isArray(c)?c:[];resp=Array.isArray(r)?r:[];pintar();
 }catch(_){}
}
async function accion(fn,args,okMsg){
 const m=document.getElementById('ingMsgOrg');if(m)m.textContent='';
 try{await rpc(fn,Object.assign(ids(),args));await cargar();const m2=document.getElementById('ingMsgOrg');if(m2&&okMsg)m2.textContent=okMsg;return true}
 catch(e){const m2=document.getElementById('ingMsgOrg');if(m2)m2.textContent=msgErr(e);return false}
}
function pintar(){
 if(!org)return;const c=tarjeta();if(!c)return;
 const soyOrg=org.rol==='organizador';
 const pend=sols.filter(s=>s.estado==='pendiente'),dec=sols.filter(s=>s.estado!=='pendiente');
 const candidatos=resp.filter(r=>r.ligada&&!r.coorganizador);
 let h='<h3>Quién puede entrar</h3>'
  +'<label class="ing-chk"><input type="checkbox" id="ingApro"'+(org.requiere_aprobacion?' checked':'')+'><span>Pedir aprobación para entrar</span></label>'
  +'<p class="sub">'+(org.requiere_aprobacion?'Cada persona necesita Pintó ID y que la apruebes. Quienes ya respondieron siguen pudiendo participar.':'Sin aprobación: entra cualquiera con el link, con o sin Pintó ID.')+'</p>';
 if(org.requiere_aprobacion||sols.length){
  h+='<h3>Solicitudes'+(pend.length?' ('+pend.length+' pendiente'+(pend.length===1?'':'s')+')':'')+'</h3>';
  if(!sols.length)h+='<p class="sub">Todavía no hay solicitudes.</p>';
  h+=pend.map(s=>'<div class="ing-row"><b>'+esc(s.nombre)+'</b><div class="ing-btns"><button type="button" class="btn" data-ap="'+esc(s.id)+'">Aprobar</button><button type="button" class="btn outline" data-re="'+esc(s.id)+'">Rechazar</button></div></div>').join('');
  h+=dec.map(s=>'<div class="ing-row"><b>'+esc(s.nombre)+'</b><span class="sub">'+(s.estado==='aprobada'?'Aprobada':'Rechazada')+'</span><div class="ing-btns"><button type="button" class="btn outline" '+(s.estado==='aprobada'?'data-re':'data-ap')+'="'+esc(s.id)+'">'+(s.estado==='aprobada'?'Quitar':'Aprobar')+'</button></div></div>').join('');
 }
 h+='<h3>Coorganización</h3>';
 if(!soyOrg)h+='<p class="sub">Coorganizás esta juntada. Podés hacer todo menos eliminarla y cambiar quién coorganiza.</p>';
 else h+='<p class="sub">Quien coorganiza puede editar, fijar fecha, abrir rondas y aprobar ingresos. No puede eliminar la juntada ni cambiar quién coorganiza. Tiene que haber usado su Pintó ID en esta juntada.</p>';
 h+=coos.map(x=>'<div class="ing-row"><b>'+esc(x.nombre)+(x.soy_yo?' (vos)':'')+'</b>'+((soyOrg||x.soy_yo)?'<div class="ing-btns"><button type="button" class="btn outline" data-qc="'+esc(x.id)+'">'+(x.soy_yo&&!soyOrg?'Dejar de coorganizar':'Quitar')+'</button></div>':'')+'</div>').join('');
 if(soyOrg){
  if(candidatos.length)h+='<label for="ingElegir">Sumar coorganización</label><select id="ingElegir"><option value="">Elegí una persona…</option>'+candidatos.map(r=>'<option value="r:'+esc(r.id)+'">'+esc(r.nombre)+'</option>').join('')+'</select><button type="button" class="btn secondary" id="ingSumar">Sumar</button>';
  else h+='<p class="sub">Para sumar a alguien, tiene que haber respondido con su Pintó ID.</p>';
 }
 h+='<p class="field-hint" id="ingMsgOrg" role="status"></p>';
 c.innerHTML=h;
 const a=c.querySelector('#ingApro');if(a)a.onchange=()=>{const v=a.checked;a.disabled=true;accion('juntada_config_ingreso',{p_requiere:v}).finally(()=>{a.disabled=false})};
 c.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>{b.disabled=true;accion('juntada_decidir_solicitud',{p_solicitud:b.dataset.ap,p_aprobar:true},'Aprobada.')});
 c.querySelectorAll('[data-re]').forEach(b=>b.onclick=()=>{b.disabled=true;accion('juntada_decidir_solicitud',{p_solicitud:b.dataset.re,p_aprobar:false},'Rechazada.')});
 c.querySelectorAll('[data-qc]').forEach(b=>b.onclick=async()=>{b.disabled=true;const era=!soyOrg;const ok=await accion('juntada_coorganizador_quitar',{p_id:b.dataset.qc},'Listo.');if(ok&&era){location.reload()}});
 const s=c.querySelector('#ingSumar');if(s)s.onclick=()=>{const v=c.querySelector('#ingElegir').value;if(!v){c.querySelector('#ingMsgOrg').textContent='Elegí una persona.';return}s.disabled=true;accion('juntada_coorganizador_designar',{p_respuesta:v.slice(2),p_solicitud:null},'Coorganización sumada.')};
 if(!soyOrg)document.querySelectorAll('#event [data-delete],#event .danger,#event [onclick*="deleteLocalJuntada"]').forEach(e=>{e.hidden=true});
}
function enganchar(){
 if(typeof loadResponses!=='function'||window.__ingHook)return;window.__ingHook=1;
 const prev=loadResponses;
 loadResponses=async function(g){await prev(g);if(orgOk())cargar()};
}

/* ---------- Mis planes: lo que organizo o coorganizo con mi Pintó ID ---------- */
const abrirLocal=async id=>{
 const d=await rpc('juntada_abrir_gestion',{p_juntada:id});
 const lid='p'+String(d.id).replace(/-/g,'').slice(0,12);
 localStorage.setItem('juntada_remote_'+lid,JSON.stringify({id:d.id,codigo:d.codigo,organizador:SENTINELA}));
 const all=getJuntadas().filter(x=>x.id!==lid);
 all.unshift({id:lid,updated:Date.now(),saved:{name:d.nombre,desc:d.descripcion||'',dateMode:d.modalidad_fecha||'fixed',date:d.fecha||'',time:d.hora||'',place:d.lugar||'',candidates:d.opciones_fecha||[],expense:d.gastos||'',roundNumber:d.ronda||1,finalists:d.finalistas||[]},confirmedDate:d.fecha_confirmada||'',confirmedPlace:'',places:Array.isArray(d.lugares)?d.lugares:[],guestResponses:{},guestVotes:{},placeVotes:{},suspendida:!!d.cancelada});
 localStorage.setItem(JSTORE,JSON.stringify(all));
 openJuntada(lid);
};
async function pintarMios(){
 const lista=document.getElementById('myEventsList');if(!lista||!window.PintoAuth||!window.PintoAuth.has())return;
 let arr;try{arr=await rpc('juntada_mis_eventos',{})}catch(_){return}
 arr=(Array.isArray(arr)?arr:[]).filter(e=>!e.eliminada_at);
 const locales=new Set();for(const x of getJuntadas()){try{const c=JSON.parse(localStorage.getItem('juntada_remote_'+x.id)||'null');if(c&&c.id)locales.add(c.id)}catch(_){}}
 const faltan=arr.filter(e=>!locales.has(e.id));
 let box=document.getElementById('ingMiosBox');
 if(!faltan.length){if(box)box.remove();return}
 if(!box){box=document.createElement('div');box.id='ingMiosBox';lista.after(box)}
 box.innerHTML='<h3 style="margin:22px 0 6px">Con tu Pintó ID</h3><p class="sub">Juntadas que organizás o coorganizás y no están en este celular.</p>'+faltan.map(e=>'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #dce6e4"><span><b>'+esc(e.nombre||'Juntada')+'</b><br><span class="sub">'+(e.rol==='coorganizador'?'Coorganizás':'Organizás')+'</span></span><button type="button" class="btn secondary" style="width:auto;margin:0" data-abrir="'+esc(e.id)+'">Abrir</button></div>').join('');
 box.querySelectorAll('[data-abrir]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await abrirLocal(b.dataset.abrir)}catch(e){b.disabled=false;if(typeof toast==='function')toast(msgErr(e))}});
}
function engancharMios(){
 if(typeof showMyEvents!=='function'||window.__ingMios)return;window.__ingMios=1;
 const prev=showMyEvents;showMyEvents=function(){prev.apply(this,arguments);pintarMios()};
}
const init=()=>{enganchar();engancharMios()};
document.addEventListener('DOMContentLoaded',init);if(document.readyState!=='loading')init();
})();
