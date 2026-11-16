/* Pintó ID beta: authenticated invitations. Existing local expenses stay unchanged. */
(()=>{
'use strict';
const BASE='https://sswgtcpaayisecwxxskp.supabase.co';
const KEY='sb_publishable_a8hB04TzAhc9NLwrCDtozg_FwVk377j';
const STORE='planazo_auth_v1';
const invite=new URL(location.href).searchParams.get('invite');
const safeToken=/^[a-f0-9]{64}$/.test(invite||'')?invite:null;
const host=document.querySelector('#accounts .pad');
if(!host)return;
const style=document.createElement('style');
style.textContent='.planazo-panel{margin:18px 0;padding:18px;border:1px solid #d9e8ef;border-radius:20px;background:#fff;box-shadow:0 4px 15px #1736590a}.planazo-panel h2{margin:0 0 8px;color:#24518b}.planazo-panel p{margin:8px 0 12px}.planazo-panel input{width:100%;margin:5px 0 12px}.planazo-panel button{margin:5px 0}.planazo-status{font-size:14px;color:#53677a;overflow-wrap:anywhere}.planazo-panel .planazo-actions{display:flex;flex-wrap:wrap;gap:8px}.planazo-panel .planazo-actions button{flex:1;min-width:130px}.planazo-panel [hidden]{display:none!important}';
style.textContent += '.pinto-invite-details{margin:18px 0;border:1px solid #d9e8ef;border-radius:18px;background:#fff;overflow:hidden}.pinto-invite-details>summary{cursor:pointer;list-style:none;padding:18px;color:#24518b;font-weight:750;display:flex;justify-content:space-between;gap:8px}.pinto-invite-details>summary::-webkit-details-marker{display:none}.pinto-invite-details .planazo-panel{border:0;box-shadow:none;margin:0;padding-top:8px}.pinto-secondary-label{font-size:12px;color:#66798a;font-weight:500}';document.head.append(style);
const panel=document.createElement('section');panel.className='planazo-panel';panel.setAttribute('aria-label','Pintó ID');
panel.innerHTML='<h2>Pintó ID</h2><p>Tu cuenta para Juntada y, más adelante, Escapada.</p><div id="planazoGuest"><label for="planazoEmail">Tu email</label><input id="planazoEmail" type="email" autocomplete="email" placeholder="nombre@correo.com"><button class="btn" type="button" id="planazoLogin">Recibir enlace para ingresar</button><p class="planazo-status">Te enviamos un enlace de acceso a tu email. No necesitás contraseña.</p></div><div id="planazoUser" hidden><p id="planazoIdentity"></p><div class="planazo-actions"><button type="button" class="btn secondary" id="planazoLogout">Cerrar sesión</button></div><label for="planazoGroupName">Nuevo grupo online</label><input id="planazoGroupName" maxlength="120" placeholder="Ej. Asadito del sábado"><button class="btn" type="button" id="planazoCreate">Crear grupo online</button><div id="planazoCreated" hidden><p id="planazoCreatedName"></p><button class="btn secondary" type="button" id="planazoShare">Crear link para invitar</button><input id="planazoInviteLink" readonly aria-label="Link de invitación" hidden></div></div><div id="planazoInvitation" hidden><h3>Te invitaron a un grupo</h3><p id="planazoInviteName"></p><button type="button" class="btn" id="planazoAccept">Aceptar invitación</button></div><p class="planazo-status" id="planazoMessage" role="status" aria-live="polite"></p><p class="planazo-status">Beta: los grupos online todavía no sincronizan los gastos locales.</p>';
const inviteDetails=document.createElement('details');inviteDetails.className='pinto-invite-details';inviteDetails.innerHTML='<summary>Compartir gastos por invitación <span class="pinto-secondary-label">Opcional</span></summary>';inviteDetails.appendChild(panel);const priority=host.querySelector('.juntada-primary-expenses');if(priority)priority.insertAdjacentElement('afterend',inviteDetails);else host.prepend(inviteDetails);
const el=id=>document.getElementById(id);
const message=t=>{el('planazoMessage').textContent=t};
let session=null,createdGroup=null;
try{const raw=JSON.parse(localStorage.getItem(STORE)||'null');if(raw&&typeof raw.access_token==='string'&&typeof raw.refresh_token==='string')session=raw}catch(_){}
async function request(path,body,token){
 const r=await fetch(BASE+path,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok){const er=Error(data.msg||data.error_description||data.message||'Error HTTP '+r.status);er.detail=String(data.details||'');throw er}
 return data;
}
async function refresh(){
 if(!session)return false;
 if(session.expires_at>Date.now()+60000)return true;
 try{
  const data=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token});
  setSession(data);return true;
 }catch(_){setSession(null);return false}
}
function setSession(data){
 session=data?{access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+(data.expires_in||3600)*1000,email:data.user?.email||session?.email||''}:null;
 try{if(session)localStorage.setItem(STORE,JSON.stringify(session));else localStorage.removeItem(STORE)}catch(_){}
 render();
}
function render(){
 el('planazoGuest').hidden=!!session;el('planazoUser').hidden=!session;
 el('planazoIdentity').textContent=session?'Sesión iniciada'+(session.email?' como '+session.email:''):'';
 el('planazoAccept').textContent=session?'Aceptar invitación':'Ingresá para aceptar';
}
async function call(fn,args,auth=true){
 if(auth&&!(await refresh()))throw Error('Iniciá sesión para continuar');
 return request('/rest/v1/rpc/'+fn,args,auth?session.access_token:null);
}
el('planazoLogin').onclick=async()=>{
 const email=el('planazoEmail').value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message('Ingresá un email válido');return}
 const button=el('planazoLogin');button.disabled=true;
 try{
  const redirect=new URL(location.pathname,location.origin);
  if(safeToken)redirect.searchParams.set('invite',safeToken);
  await request('/auth/v1/otp?redirect_to='+encodeURIComponent(redirect.toString()),{email,create_user:true});
  message('Revisá tu correo y abrí el enlace de acceso. Si no llega, revisá spam.');
 }catch(e){message('No se pudo enviar el enlace: '+e.message)}
 finally{button.disabled=false}
};
el('planazoLogout').onclick=()=>{setSession(null);message('Sesión cerrada')};
el('planazoCreate').onclick=async()=>{
 const name=el('planazoGroupName').value.trim();if(!name){message('Escribí un nombre para el grupo');return}
 const button=el('planazoCreate');button.disabled=true;
 try{createdGroup=await call('planazo_group_create',{p_name:name});el('planazoCreated').hidden=false;el('planazoCreatedName').textContent='Grupo creado: '+name;el('planazoInviteLink').hidden=true;message('Grupo online creado. Ahora podés generar un link de invitación.')}
 catch(e){message(e.message)}finally{button.disabled=false}
};
el('planazoShare').onclick=async()=>{
 if(!createdGroup)return;
 const button=el('planazoShare');button.disabled=true;
 try{
  const token=await call('planazo_invite_create',{p_group_id:createdGroup});
  const url=new URL(location.pathname,location.origin);url.searchParams.set('invite',token);
  el('planazoInviteLink').value=url.toString();el('planazoInviteLink').hidden=false;
  if(navigator.share){try{await navigator.share({title:'Invitación a Juntada',text:'¡Sumate a mi grupo en Juntada!',url:url.toString()});message('Link listo para compartir');return}catch(e){if(e.name!=='AbortError')throw e}}
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url.toString());message('Link copiado. Pegalo en WhatsApp.')}
  else message('Copiá el link del campo para compartirlo.');
 }catch(e){message(e.message)}finally{button.disabled=false}
};
el('planazoAccept').onclick=async()=>{
 if(!session){message('Ingresá con tu email para aceptar esta invitación.');el('planazoEmail').focus();return}
 const button=el('planazoAccept');button.disabled=true;
 try{await call('planazo_invite_accept',{p_token:safeToken});message('¡Ya sos parte del grupo!');el('planazoInvitation').hidden=true;const url=new URL(location.href);url.searchParams.delete('invite');history.replaceState(null,'',url)}
 catch(e){message(e.message)}finally{button.disabled=false}
};
async function init(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 if(hash.has('access_token')&&hash.has('refresh_token')){
  const data={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_in:Number(hash.get('expires_in'))||3600};
  try{const r=await fetch(BASE+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+data.access_token}});if(!r.ok)throw Error('Enlace inválido');data.user=await r.json();setSession(data);message('¡Bienvenido a Pintó!')}catch(e){message('No pudimos validar el acceso: '+e.message)}
  history.replaceState(null,'',location.pathname+location.search);
 }
 await refresh();render();
 if(safeToken){
  el('planazoInvitation').hidden=false;
  try{const result=await call('planazo_invite_preview',{p_token:safeToken},false);if(!Array.isArray(result)||!result.length)throw Error('El link venció o no es válido');el('planazoInviteName').textContent='Grupo: '+result[0].group_name;message(session?'Podés aceptar la invitación.':'Iniciá sesión para unirte al grupo.')}
  catch(e){el('planazoInvitation').hidden=true;message(e.message)}
  if(typeof go==='function')go('accounts');
 }
}

/* V1.18.4 etapa C: «Mis planes en Pintó». Aditivo: no cambia cómo se crean ni se abren los eventos. */
const mine=document.createElement('details');mine.id='pintoMine';mine.className='pinto-invite-details';
mine.innerHTML='<summary>Mis planes en Pintó <span class="pinto-secondary-label">Opcional</span></summary><div style="padding:0 18px 18px"><p class="pinto-secondary-label" id="pintoMineHelp"></p><div id="pintoMineList" role="list"></div><button type="button" class="btn secondary" id="pintoClaim" style="margin-top:10px;width:100%;display:none">Vincular mis juntadas a mi cuenta</button><button type="button" class="btn secondary" id="pintoMineLogin" style="margin-top:10px;width:100%;display:none">Ingresar con mi email</button></div>';
inviteDetails.before(mine);
el('pintoMineLogin').onclick=()=>{inviteDetails.open=true;const e=el('planazoEmail');if(e){e.scrollIntoView({block:'center'});e.focus()}};
const localCreds=()=>{const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!/^juntada_remote_/.test(k))continue;try{const c=JSON.parse(localStorage.getItem(k)||'null');if(c&&/^[0-9a-f-]{36}$/i.test(c.id||'')&&/^[0-9a-f-]{36}$/i.test(c.organizador||''))out.push(c)}catch(_){}}}catch(_){}return out};
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const show=(id,on)=>{el(id).style.display=on?'':'none'};
async function loadMine(){
 if(!session){el('pintoMineList').innerHTML='';el('pintoMineHelp').textContent='Ingresá con tu email para ver tus juntadas desde cualquier celular. Es opcional: quien tenga el link sigue pudiendo responder sin registrarse.';show('pintoClaim',false);show('pintoMineLogin',true);return}
 show('pintoMineLogin',false);
 try{
  const list=await call('juntada_mis_eventos',{});const all=Array.isArray(list)?list:[];ownedDeleted=all.filter(e=>e.eliminada_at);const arr=all.filter(e=>!e.eliminada_at);
  el('pintoMineList').innerHTML=arr.length?arr.map(e=>'<div role="listitem" style="padding:8px 0;border-top:1px solid #e3eef4"><b>'+esc(e.nombre||'Juntada')+'</b><div class="pinto-secondary-label">'+esc(e.cancelada?'Cancelada':e.suspendida?'En pausa':(e.fecha_texto||''))+'</div></div>').join(''):'<p class="pinto-secondary-label">Todavía no tenés juntadas vinculadas a tu cuenta.</p>';
  const pend=localCreds().length;
  el('pintoMineHelp').textContent=pend?'Las juntadas que organizaste en este celular se pueden vincular a tu cuenta para encontrarlas desde cualquier lado. Quien tenga el link sigue pudiendo responder sin registrarse.':'Acá aparecen las juntadas vinculadas a tu cuenta.';
  show('pintoClaim',!!pend);
 }catch(e){el('pintoMineList').innerHTML='';message(e.message)}
}
el('pintoClaim').onclick=async()=>{
 const b=el('pintoClaim');b.disabled=true;let ok=0,taken=0,fail=0;
 try{for(const c of localCreds()){try{await call('juntada_reclamar',{p_juntada:c.id,p_organizador:c.organizador});ok++}catch(e){if(/ya tiene due/i.test(e.message))taken++;else fail++}}
  message((ok?ok+(ok===1?' juntada vinculada a tu cuenta. ':' juntadas vinculadas a tu cuenta. '):'')+(taken?taken+' ya tenía(n) otra persona como dueña. ':'')+(fail?fail+' no se pudo vincular.':'')||'No había juntadas para vincular.');
  await loadMine();
 }finally{b.disabled=false}
};
/* V1.18.6: etapas D y E, eliminar/restaurar, aviso de reclamo, vínculo con Cuentas (lado Juntada). Aditivo. */
window.PintoAuth={call:(fn,args)=>call(fn,args),has:()=>!!session};
const friendly=m=>/No autorizado en el evento/i.test(m)?'Necesitás ser quien organiza esta juntada.':/ya está vinculado/i.test(m)?'Esta juntada ya tiene un grupo de Cuentas vinculado.':/No autorizado/i.test(m)?'Necesitás poder vincular en ese grupo de Cuentas (lo permite quien lo administra).':/Pasó el plazo/i.test(m)?'Pasaron más de 30 días: ya no se puede restaurar.':m;
const LNK={LNK_NO_AUTORIZADO:'No tenés permiso para esto. Hace falta organizar la juntada con tu Pintó ID o poder vincular en el grupo.',LNK_NO_PENDIENTE:'Esta solicitud ya no está pendiente.',LNK_SIN_SESION:'Iniciá sesión con tu Pintó ID para continuar.',LNK_TIPO_INVALIDO:'Tipo de vínculo inválido.',LNK_USAR_VINCULO_DIRECTO:'Ya podés vincular directamente.',LNK_GRUPO_ARCHIVADO:'Ese grupo está archivado.',LNK_GRUPO_CERRADO:'Ese grupo está cerrado: no admite vínculos nuevos.',LNK_YA_VINCULADO:'Esta juntada ya tiene un grupo de Cuentas vinculado.',LNK_SOLICITUD_PENDIENTE:'Ya hay una solicitud pendiente para este vínculo.',LNK_SIN_APROBADOR:'No hay nadie con permiso para aprobar este vínculo.',LNK_DECISION_INVALIDA:'Decisión inválida.',LNK_VERSION:'La solicitud cambió: revisala de nuevo.'};
const lnk=e=>{const c=(e&&e.detail||'').match(/LNK_[A-Z_]+/);return c&&LNK[c[0]]?LNK[c[0]]:friendly(e&&e.message||'')};
const lnkCode=e=>((e&&e.detail||'').match(/LNK_[A-Z_]+/)||[''])[0];
/* Papelera local: eventos eliminados con su código de organizadora, 30 días */
const PAPELERA='juntada_papelera_v1',DIAS=30;
const papelera=()=>{try{const a=JSON.parse(localStorage.getItem(PAPELERA)||'[]');return(Array.isArray(a)?a:[]).filter(x=>x&&x.id&&x.entry&&x.credential&&Date.now()-x.at<DIAS*864e5)}catch(_){return[]}};
window.pintoPapeleraAdd=item=>{try{const a=papelera().filter(x=>x.id!==item.id);a.push(item);localStorage.setItem(PAPELERA,JSON.stringify(a))}catch(_){}};
async function restoreLocal(item){
 await rpc('juntada_restaurar',{p_juntada:item.credential.id,p_organizador:item.credential.organizador});
 const all=getJuntadas().filter(x=>x.id!==item.id);all.push(item.entry);localStorage.setItem(JSTORE,JSON.stringify(all));
 localStorage.setItem('juntada_remote_'+item.id,JSON.stringify(item.credential));
 localStorage.setItem(PAPELERA,JSON.stringify(papelera().filter(x=>x.id!==item.id)));
}
function renderPapelera(){
 const list=document.getElementById('myEventsList');if(!list)return;
 let box=document.getElementById('papeleraBox');
 if(!box){box=document.createElement('div');box.id='papeleraBox';list.after(box)}
 const items=papelera();
 box.innerHTML=items.length?'<h3 style="margin:22px 0 6px">Eliminadas</h3><p class="sub">Se pueden restaurar durante 30 días.</p>'+items.map(x=>'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #e3eef4"><span>'+esc(x.entry&&x.entry.saved&&x.entry.saved.name||'Juntada')+'</span><button type="button" class="btn secondary" data-restore="'+esc(x.id)+'" style="width:auto;padding:8px 14px">Restaurar</button></div>').join(''):'';
 box.querySelectorAll('[data-restore]').forEach(b=>b.onclick=async()=>{
  const item=papelera().find(x=>x.id===b.dataset.restore);if(!item)return;b.disabled=true;
  try{await restoreLocal(item);showMyEvents();if(typeof toast==='function')toast('Juntada restaurada. El mismo enlace vuelve a funcionar.')}
  catch(e){b.disabled=false;if(typeof toast==='function')toast('No se pudo restaurar: '+friendly(e.message))}
 });
}
const _sme=showMyEvents;showMyEvents=function(){_sme.apply(this,arguments);renderPapelera()};
/* Aviso al organizador local si alguien vinculó la juntada a su cuenta, y recuperación con su código */
window.pintoCheckOwner=async()=>{
 const box=document.getElementById('pintoOwnerNotice');if(!box||typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.organizador)return;
 try{
  const d=await rpc('juntada_ver_organizador',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador});
  const o=d&&d.dueno;if(!o||!o.reclamada||o.es_mio){box.hidden=true;return}
  box.hidden=false;
  box.innerHTML='<b>Esta juntada está vinculada a una cuenta Pintó ID</b><p class="field-hint">Si fuiste vos, no hace falta hacer nada. Si no, podés recuperarla con tu código de organizadora: se renueva el código y esa cuenta pierde el control.</p><button type="button" class="btn secondary" id="pintoRecover">Recuperar la juntada</button>';
  const b=box.querySelector('#pintoRecover');let armed=false;
  b.onclick=async()=>{
   if(!armed){armed=true;b.textContent='Tocá de nuevo para confirmar';return}
   b.disabled=true;
   try{
    const r=await rpc('juntada_recuperar',{p_juntada:remoteEvent.id,p_organizador:remoteEvent.organizador});
    if(r&&r.recuperada&&r.organizador){
     const key='juntada_remote_'+currentJuntadaId;let c={};try{c=JSON.parse(localStorage.getItem(key)||'{}')}catch(_){}
     c.organizador=r.organizador;localStorage.setItem(key,JSON.stringify(c));remoteEvent.organizador=r.organizador;
    }
    box.hidden=true;if(typeof toast==='function')toast('Recuperaste la juntada. Tu código de organizadora se renovó.');
   }catch(e){b.disabled=false;b.textContent='Recuperar la juntada';if(typeof toast==='function')toast('No se pudo recuperar: '+friendly(e.message))}
  };
 }catch(_){}
};
if(typeof loadResponses==='function'){const _lr=loadResponses;loadResponses=function(){setTimeout(()=>window.pintoCheckOwner(),0);return _lr.apply(this,arguments)}}
/* Etapa E (lado Juntada): vínculo con un grupo de Cuentas. Cuentas es la única autoridad sobre gastos y saldos. */
window.pintoRenderCuentasLink=async()=>{
 const box=document.getElementById('cuentasLinkCard');if(!box)return;
 if(typeof remoteEvent==='undefined'||!remoteEvent||!remoteEvent.id){box.hidden=true;return}
 box.hidden=false;const head='<h3 style="margin:0 0 6px">Grupo de Cuentas</h3>';
 const open='<a class="btn secondary" href="https://boninip.github.io/cuentas/" target="_blank" rel="noopener">Abrir Cuentas</a>';
 if(!session){box.innerHTML=head+'<p class="field-hint">Para vincular un grupo de Cuentas ingresá con tu Pintó ID desde el ícono de arriba a la derecha. Los gastos se cargan en Cuentas; acá solo se muestra el vínculo.</p>';return}
 box.innerHTML=head+'<p class="field-hint">Cargando…</p>';
 const msg=t=>{const m=box.querySelector('#cuentasLinkMsg');if(m)m.textContent=t};
 const again=()=>window.pintoRenderCuentasLink();
 try{
  const l=await call('core_link_for_ref',{p_ref_type:'juntada',p_ref_id:remoteEvent.id,p_organizer:remoteEvent.organizador});
  if(l){
   box.innerHTML=head+'<p><b>'+esc(l.group_name)+'</b></p><p class="field-hint">Los gastos, saldos y pagos se ven y se cargan en Cuentas. Eliminar la juntada no borra nada de Cuentas. Desvincular lo decide quien administra el grupo en Cuentas.</p>'+open+' <button type="button" class="btn outline" id="cuentasUnlink">Desvincular</button><p class="field-hint" id="cuentasLinkMsg" role="status"></p>';
   box.querySelector('#cuentasUnlink').onclick=async()=>{try{await call('core_link_remove',{p_link:l.link_id});again()}catch(e){msg(lnk(e))}};
   return;
  }
  /* solicitudes pendientes de este evento (solo vigentes: el servidor no lista las vencidas ni las cerradas) */
  const reqs=((await call('core_link_requests_list',{p_group:null}))||[]).filter(q=>q.ref_type==='juntada'&&q.ref_id===remoteEvent.id);
  const ap=reqs.find(q=>q.i_can_approve),mine=reqs.find(q=>q.mine&&!q.i_can_approve);
  const vence=q=>{try{return new Date(q.expires_at).toLocaleDateString('es-AR',{day:'numeric',month:'long'})}catch(_){return ''}};
  if(ap){
   box.innerHTML=head+'<p><b>Solicitud para aprobar</b></p><p>Piden vincular esta juntada con el grupo <b>'+esc(ap.group_name)+'</b>. Vence el '+esc(vence(ap))+'.</p><p class="field-hint">Al aprobar, los gastos de la juntada se cargan en ese grupo de Cuentas. Leer el aviso no alcanza: tenés que aprobar o rechazar.</p><button type="button" class="btn secondary" id="cuentasApprove">Aprobar</button> <button type="button" class="btn outline" id="cuentasReject">Rechazar</button><p class="field-hint" id="cuentasLinkMsg" role="status"></p>';
   const decide=async d=>{box.querySelectorAll('button').forEach(b=>b.disabled=true);try{
     const r=await call('core_link_request_decide',{p_request:ap.id,p_hash:ap.version_hash,p_decision:d,p_correlation:null});
     if(r==='expired'||r==='invalidated'){box.innerHTML=head+'<p>'+(r==='expired'?'La solicitud venció (pasaron 7 días). Pedí que la envíen de nuevo.':'La solicitud ya no vale: cambió algo en la juntada o en el grupo. Pedí que la envíen de nuevo.')+'</p><button type="button" class="btn outline" id="cuentasBack">Entendido</button>';box.querySelector('#cuentasBack').onclick=again;return}
     again();if(typeof toast==='function')toast(r==='approved'?'Vínculo aprobado':'Solicitud rechazada')
    }catch(e){box.querySelectorAll('button').forEach(b=>b.disabled=false);msg(lnk(e))}};
   box.querySelector('#cuentasApprove').onclick=()=>decide('approve');box.querySelector('#cuentasReject').onclick=()=>decide('reject');return;
  }
  if(mine){
   box.innerHTML=head+'<p><b>Solicitud enviada</b></p><p>Esperando que '+(mine.needs==='cuentas'?'quien administra el grupo <b>'+esc(mine.group_name)+'</b> en Cuentas':'quien organiza la juntada')+' la apruebe. Vence el '+esc(vence(mine))+'.</p><button type="button" class="btn outline" id="cuentasCancelReq">Cancelar solicitud</button><p class="field-hint" id="cuentasLinkMsg" role="status"></p>';
   box.querySelector('#cuentasCancelReq').onclick=async()=>{try{await call('core_link_request_cancel',{p_request:mine.id});again()}catch(e){msg(lnk(e))}};return;
  }
  /* última solicitud ya cerrada de este evento (0038): vencida, rechazada, cancelada o invalidada */
  let ult='';try{
   const h=((await call('core_link_requests_history',{p_group:null,p_days:30}))||[]).filter(q=>q.ref_type==='juntada'&&q.ref_id===remoteEvent.id&&q.status!=='approved')[0];
   if(h){const T={expired:'venció sin respuesta',rejected:'fue rechazada',cancelled:'se canceló',invalidated:'dejó de valer porque cambió algo en la juntada o en el grupo'};
    ult='<p class="field-hint" id="cuentasLastReq">Tu última solicitud con el grupo <b>'+esc(h.group_name)+'</b> '+(T[h.status]||'se cerró')+'. Podés enviar una nueva.</p>'}
  }catch(_){}
  const gs=(await call('cuentas_my_groups',{})||[]).filter(g=>g.status!=='archived');
  if(!gs.length){box.innerHTML=head+'<p class="field-hint">No tenés grupos en Cuentas todavía. Creá uno en Cuentas y volvé a esta pantalla.</p>'+open;return}
  box.innerHTML=head+ult+'<p class="field-hint">Elegí el grupo donde se cargan los gastos de esta juntada. Si no podés vincular en ese grupo, podés solicitar el vínculo y lo aprueba quien lo administra.</p><label for="cuentasGroupSel">Grupo</label><select id="cuentasGroupSel">'+gs.map(g=>'<option value="'+esc(g.id)+'">'+esc(g.name)+'</option>').join('')+'</select><button type="button" class="btn secondary" id="cuentasLinkBtn" style="margin-top:8px">Vincular</button> <button type="button" class="btn outline" id="cuentasRequestBtn" style="margin-top:8px;display:none">Solicitar vínculo</button><p class="field-hint" id="cuentasLinkMsg" role="status"></p>';
  const sel=()=>box.querySelector('#cuentasGroupSel').value;
  const reqBtn=box.querySelector('#cuentasRequestBtn');
  box.querySelector('#cuentasGroupSel').onchange=()=>{reqBtn.style.display='none';msg('')};
  box.querySelector('#cuentasLinkBtn').onclick=async()=>{const b=box.querySelector('#cuentasLinkBtn');b.disabled=true;try{await call('core_link_create',{p_group:sel(),p_ref_type:'juntada',p_ref_id:remoteEvent.id,p_organizer:remoteEvent.organizador});again()}catch(e){b.disabled=false;
    /* sin permiso en el grupo: se ofrece solicitar; lo decide el servidor */
    if(/^No autorizado( en el evento)?$/i.test(e.message||'')||lnkCode(e)==='LNK_NO_AUTORIZADO'){reqBtn.style.display='';msg('No podés vincular directo. Podés solicitar el vínculo: lo aprueba quien administra el grupo en Cuentas o quien organiza la juntada.')}else msg(lnk(e))}};
  reqBtn.onclick=async()=>{reqBtn.disabled=true;try{
    await call('core_link_request_create',{p_group:sel(),p_ref_type:'juntada',p_ref_id:remoteEvent.id,p_correlation:null});again();if(typeof toast==='function')toast('Solicitud enviada')
   }catch(e){reqBtn.disabled=false;
    if(lnkCode(e)==='LNK_USAR_VINCULO_DIRECTO'){reqBtn.style.display='none';box.querySelector('#cuentasLinkBtn').click();return}
    if(lnkCode(e)==='LNK_NO_AUTORIZADO')msg('Para solicitar hace falta que organices esta juntada con tu Pintó ID. Si la creaste con un código, reclamala primero desde Mis planes en Pintó.');else msg(lnk(e))}};
 }catch(e){box.innerHTML=head+'<p class="field-hint">'+esc(lnk(e))+'</p>'}
};
/* Etapa D: respuestas ligadas a mi cuenta, y juntadas a las que respondí con ella */
const respPend=()=>{const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!/^juntada_resp_/.test(k))continue;try{const c=JSON.parse(localStorage.getItem(k)||'null');if(c&&/^[0-9a-f-]{36}$/i.test(c.id||'')&&!c.ligada)out.push({k,c})}catch(_){}}}catch(_){}return out};
const ASIS={voy:'Voy',tal_vez:'Aún no sé',no_puedo:'No voy'};
const plazoLinea=e=>{if(!e.votacion_hasta)return '';const cerr=e.votacion_cerrada;const f=new Date(e.votacion_hasta).toLocaleString('es-AR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});return '<div class="pinto-secondary-label">'+(cerr?'Votación cerrada':(e.ya_vote===false?'Falta tu voto · cierra '+f:'Cierra '+f))+'</div>'};
async function loadInvited(){
 let box=document.getElementById('pintoInvited');if(!box){box=document.createElement('div');box.id='pintoInvited';el('pintoMineList').after(box)}
 if(!session){box.innerHTML='';return}
 try{
  const arr=await call('juntada_mis_invitaciones',{});
  const pend=respPend();
  box.innerHTML=(Array.isArray(arr)&&arr.length?'<h3 style="margin:14px 0 4px">Juntadas a las que respondí</h3>'+arr.map(e=>'<div role="listitem" style="padding:8px 0;border-top:1px solid #e3eef4"><b>'+esc(e.nombre||'Juntada')+'</b><div class="pinto-secondary-label">'+esc((ASIS[e.mi_asistencia]||'')+(e.fecha_texto?' · '+e.fecha_texto:''))+'</div>'+plazoLinea(e)+(e.codigo?'<a href="'+esc(location.pathname+'?invite='+e.codigo)+'">Abrir</a>':'')+'</div>').join(''):'')
   +(pend.length?'<button type="button" class="btn secondary" id="pintoLinkResp" style="margin-top:10px;width:100%">Vincular mis respuestas de este celular a mi cuenta ('+pend.length+')</button>':'');
  const b=box.querySelector('#pintoLinkResp');
  if(b)b.onclick=async()=>{b.disabled=true;let ok=0,fail=0;for(const x of respPend()){try{await call('juntada_vincular_respuesta',{p_respuesta:x.c.id});x.c.ligada=true;localStorage.setItem(x.k,JSON.stringify(x.c));ok++}catch(_){fail++}}message((ok?ok+' respuesta(s) vinculada(s). El nombre que ven los demás sigue siendo el que escribiste. ':'')+(fail?fail+' no se pudieron vincular.':''));loadInvited()};
 }catch(e){box.innerHTML=''}
}

async function loadApprovals(){
 let box=document.getElementById('pintoApprovals');if(!box){box=document.createElement('div');box.id='pintoApprovals';el('pintoMineList').before(box)}
 if(!session){box.innerHTML='';return}
 try{
  const q=((await call('core_link_requests_list',{p_group:null}))||[]).filter(x=>x.ref_type==='juntada'&&x.status==='pending'&&x.i_can_approve);
  box.innerHTML=q.length?'<div role="status" style="margin:10px 0;padding:12px 14px;border-radius:14px;background:#fff6e0;color:#7a4b00;font-weight:600">Tenés '+(q.length===1?'una solicitud':q.length+' solicitudes')+' para aprobar: '+q.map(x=>esc(x.group_name||'un grupo de Cuentas')).join(', ')+'. Abrí la juntada para decidir.</div>':'';
 }catch(_){box.innerHTML=''}
}
let ownedDeleted=[];
function renderDeletedOwned(){
 let box=document.getElementById('pintoDeleted');if(!box){box=document.createElement('div');box.id='pintoDeleted';el('pintoMineList').after(box)}
 box.innerHTML=ownedDeleted.length?'<h3 style="margin:14px 0 4px">Eliminadas</h3><p class="pinto-secondary-label">Se pueden restaurar durante 30 días.</p>'+ownedDeleted.map(e=>'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #e3eef4"><span>'+esc(e.nombre||'Juntada')+'</span><button type="button" class="btn secondary" data-rest="'+esc(e.id)+'" style="width:auto;padding:8px 14px">Restaurar</button></div>').join(''):'';
 box.querySelectorAll('[data-rest]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await call('juntada_restaurar',{p_juntada:b.dataset.rest,p_organizador:null});message('Juntada restaurada.');await loadMine()}catch(e){b.disabled=false;message(friendly(e.message))}});
}
const _loadMine=loadMine;loadMine=async function(){await _loadMine();loadInvited();loadApprovals();renderDeletedOwned()};

const _render=render;render=function(){_render();loadMine()};
render();init().catch(e=>message(e.message));
})();
