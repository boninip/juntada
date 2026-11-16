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
 if(!r.ok)throw Error(data.msg||data.error_description||data.message||'Error HTTP '+r.status);
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
render();init().catch(e=>message(e.message));
})();
