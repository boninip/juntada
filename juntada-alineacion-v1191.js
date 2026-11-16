/* Juntada V1.19.1 · alineación con Cuentas: pantalla «Cuenta» (login / cerrar sesión) y aviso de ingreso en el inicio. */
(()=>{
'use strict';
const BASE='https://sswgtcpaayisecwxxskp.supabase.co';
const KEY='sb_publishable_a8hB04TzAhc9NLwrCDtozg_FwVk377j';
const STORE='planazo_auth_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sesion(){try{const s=JSON.parse(localStorage.getItem(STORE)||'null');return s&&typeof s.refresh_token==='string'?s:null}catch(_){return null}}
async function otp(email){
 const redirect=new URL(location.pathname,location.origin);
 const r=await fetch(BASE+'/auth/v1/otp?redirect_to='+encodeURIComponent(redirect.toString()),{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email,create_user:true})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.msg||d.error_description||d.message||'Error '+r.status);
}
const css=document.createElement('style');
css.textContent='#miCuenta .cu-card{background:#fff;border-radius:17px;box-shadow:0 4px 16px #193a5410;padding:18px;margin-top:16px}#miCuenta .cu-card h2{margin:0 0 8px;color:#24518b}#miCuenta .cu-msg{min-height:20px;margin-top:10px;color:#64778b;font-size:14px}#homeLoginCard{margin:0 16px 12px;padding:14px 16px;border:1px solid #d9e8ef;border-radius:16px;background:#fff;display:flex;gap:12px;align-items:center;cursor:pointer;text-align:left;width:calc(100% - 32px);font:inherit;color:#173659}#homeLoginCard b{display:block;color:#24518b}#homeLoginCard small{color:#64778b}';
document.head.append(css);

/* Pantalla Cuenta */
const sec=document.createElement('section');sec.id='miCuenta';sec.className='screen';
sec.innerHTML='<header><div class="headleft"><button class="back" type="button" id="cuBack" aria-label="Volver">‹</button><span class="screen-title">Cuenta</span></div></header><div class="pad"><div class="cu-card" id="cuBody"></div><div class="cu-card"><h2>Gastos</h2><p class="field-hint" style="margin:0 0 6px">Los gastos compartidos se manejan en Cuentas.</p><button class="btn secondary" type="button" id="cuIrCuentas">Abrir Cuentas</button></div></div>';
(document.getElementById('home').parentNode||document.body).append(sec);
function pintar(){
 const s=sesion(),b=$('cuBody');
 if(s){
  b.innerHTML='<h2>Pintó ID</h2><p style="margin:0 0 4px">Sesión iniciada'+(s.email?' como <b>'+esc(s.email)+'</b>':'')+'.</p><p class="field-hint" style="margin:0 0 6px">Con tu Pintó ID ves tus planes en todos tus celulares.</p><button class="btn secondary" type="button" id="cuSalir">Cerrar sesión</button><p class="cu-msg" role="status" aria-live="polite" id="cuMsg"></p>';
  $('cuSalir').onclick=()=>{try{localStorage.removeItem(STORE)}catch(_){}pintar();pintarHome();$('cuMsg').textContent='Sesión cerrada.'};
 }else{
  b.innerHTML='<h2>Ingresá con Pintó ID</h2><label for="cuEmail">Tu email</label><input id="cuEmail" type="email" autocomplete="email" placeholder="nombre@correo.com"><button class="btn" type="button" id="cuEnviar">Recibir enlace de acceso</button><p class="field-hint">No necesitás contraseña. Te llega un enlace por email.</p><p class="cu-msg" role="status" aria-live="polite" id="cuMsg"></p>';
  $('cuEnviar').onclick=async()=>{
   const email=$('cuEmail').value.trim(),m=$('cuMsg');
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){m.textContent='Ingresá un email válido';return}
   const bt=$('cuEnviar');bt.disabled=true;
   try{await otp(email);m.textContent='Revisá tu correo y abrí el enlace de acceso. Si no llega, revisá spam.'}
   catch(e){m.textContent='No se pudo enviar el enlace: '+e.message}
   finally{bt.disabled=false}
  };
 }
}
function mostrar(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));window.scrollTo(0,0)}
function abrir(){pintar();mostrar('miCuenta')}
$('cuBack').onclick=()=>mostrar('home');
$('cuIrCuentas').onclick=()=>{location.href='https://boninip.github.io/cuentas/'};

/* Menú: «Mi perfil» pasa a ser «Cuenta». Avatar abre Cuenta. */
function menu(){
 const b=[...document.querySelectorAll('#jMenuOverlay .j-menu-item')].find(x=>/Mi perfil/.test(x.textContent));
 if(!b)return false;
 const n=b.cloneNode(true);n.querySelector('span').textContent='Cuenta';
 n.addEventListener('click',()=>{document.getElementById('jMenuOverlay').classList.remove('open');document.body.style.overflow='';abrir()});
 b.replaceWith(n);return true;
}
let t=0;const ti=setInterval(()=>{if(menu()||++t>40)clearInterval(ti)},100);
document.querySelectorAll('.avatar').forEach(a=>{a.style.cursor='pointer';a.setAttribute('role','button');a.setAttribute('tabindex','0');a.setAttribute('aria-label','Cuenta');a.onclick=abrir;a.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();abrir()}}});

/* Inicio: invitación suave a ingresar (solo sin sesión) */
function pintarHome(){
 const lista=document.querySelector('#home .juntada-home-list');if(!lista)return;
 let c=$('homeLoginCard');
 if(sesion()){if(c)c.remove();return}
 if(c)return;
 c=document.createElement('button');c.type='button';c.id='homeLoginCard';
 c.innerHTML='<span><b>Ingresá con Pintó ID</b><small>Para ver tus planes en todos tus celulares.</small></span><span style="margin-left:auto;color:#24518b">›</span>';
 c.onclick=abrir;lista.parentNode.insertBefore(c,lista);
}
pintarHome();
})();
