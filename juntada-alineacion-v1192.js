/* Juntada V1.19.2 · alineación con Cuentas: pantalla «Cuenta» (login, cerrar sesión y apariencia). El acceso a Pintó ID va en el avatar, no en el inicio. */
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
css.textContent='#miCuenta .cu-chips{display:flex;gap:8px;flex-wrap:wrap}#miCuenta .cu-chips button{flex:1;min-height:46px;border:1.5px solid #dce6e4;background:#ffffff;color:#1f5f6b;border-radius:12px;font:600 15px system-ui;cursor:pointer}#miCuenta .cu-chips button[aria-checked=true]{border-color:#1f5f6b;background:#e6f1f0;font-weight:800}html[data-eff=dark] #miCuenta .cu-card h2{color:#6fb8c4!important}html[data-eff=dark] #miCuenta .cu-msg{color:#9db5b3!important}html[data-eff=dark] #miCuenta .cu-chips button{background:#162625!important;border-color:#2f4644!important;color:#6fb8c4!important}html[data-eff=dark] #miCuenta .cu-chips button[aria-checked=true]{border-color:#6fb8c4!important;background:#244240!important}#miCuenta .cu-card{background:#ffffff;border-radius:17px;box-shadow:0 4px 16px #19475410;padding:18px;margin-top:16px}#miCuenta .cu-card h2{margin:0 0 8px;color:#1f5f6b}#miCuenta .cu-msg{min-height:20px;margin-top:10px;color:#5b6e70;font-size:14px}#homeLoginCard{margin:0 16px 12px;padding:14px 16px;border:1px solid #dce6e4;border-radius:16px;background:#ffffff;display:flex;gap:12px;align-items:center;cursor:pointer;text-align:left;width:calc(100% - 32px);font:inherit;color:#1d2f33}#homeLoginCard b{display:block;color:#1f5f6b}#homeLoginCard small{color:#5b6e70}';
document.head.append(css);

/* Pantalla Cuenta */
const sec=document.createElement('section');sec.id='miCuenta';sec.className='screen';
sec.innerHTML='<header><div class="headleft"><button class="back" type="button" id="cuBack" aria-label="Volver">‹</button><span class="screen-title">Cuenta</span></div></header><div class="pad"><div class="cu-card" id="cuBody"></div><div class="cu-card" id="cuTema"><h2>Apariencia</h2><p class="field-hint" style="margin:0 0 10px">Elegí cómo se ve Juntada. «Automático» sigue la configuración de tu celular.</p><div class="cu-chips" role="radiogroup" aria-label="Apariencia"><button type="button" role="radio" data-tema="auto">Automático</button><button type="button" role="radio" data-tema="light">Claro</button><button type="button" role="radio" data-tema="dark">Oscuro</button></div></div><div class="cu-card"><h2>Gastos</h2><p class="field-hint" style="margin:0 0 6px">Los gastos compartidos se manejan en Cuentas.</p><button class="btn secondary" type="button" id="cuIrCuentas">Abrir Cuentas</button><div id="cuViejos" hidden style="margin-top:14px"><p class="field-hint" id="cuViejosTxt" style="margin:0 0 8px"></p><button class="btn secondary" type="button" id="cuPasar">Pasar gastos viejos a Cuentas</button></div></div></div>';
(document.getElementById('home').parentNode||document.body).append(sec);
function pintar(){
 const s=sesion(),b=$('cuBody');
 if(s){
  b.innerHTML='<h2>Pintó ID</h2><p style="margin:0 0 4px">Sesión iniciada'+(s.email?' como <b>'+esc(s.email)+'</b>':'')+'.</p><p class="field-hint" style="margin:0 0 6px">Con tu Pintó ID ves tus planes en todos tus celulares.</p><button class="btn secondary" type="button" id="cuSalir">Cerrar sesión</button><p class="cu-msg" role="status" aria-live="polite" id="cuMsg"></p>';
  $('cuSalir').onclick=()=>{try{localStorage.removeItem(STORE)}catch(_){}pintar();avatar();$('cuMsg').textContent='Sesión cerrada.'};
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
function viejos(){let n=0;try{n=window.__migGastos?window.__migGastos.plan().total:0}catch(_){}const v=$('cuViejos');if(!v)return;v.hidden=!n;if(n)$('cuViejosTxt').textContent='Tenés '+n+' gasto'+(n===1?'':'s')+' guardado'+(n===1?'':'s')+' solo en este teléfono, de la versión anterior.'}
function abrir(){pintar();viejos();mostrar('miCuenta')}
$('cuBack').onclick=()=>mostrar('home');
$('cuPasar').onclick=()=>{try{go('balances')}catch(_){}};
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

/* Avatar: inicial de la sesión */
function avatar(){const s=sesion();const ini=s&&s.email?s.email.trim().charAt(0).toUpperCase():'P';document.querySelectorAll('.avatar').forEach(a=>{a.textContent=ini})}
avatar();
})();

/* Apariencia */
(()=>{
 const KEY='juntada_theme',mq=matchMedia('(prefers-color-scheme: dark)');
 const cur=()=>{try{const t=localStorage.getItem(KEY);return t==='dark'||t==='light'?t:'auto'}catch(_){return 'auto'}};
 function aplicar(){const t=cur();const d=t==='dark'||(t==='auto'&&mq.matches);document.documentElement.setAttribute('data-eff',d?'dark':'light');document.querySelectorAll('#cuTema [data-tema]').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.tema===t)))}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cuTema [data-tema]');if(!b)return;const t=b.dataset.tema;try{t==='auto'?localStorage.removeItem(KEY):localStorage.setItem(KEY,t)}catch(_){}aplicar()});
 try{mq.addEventListener('change',aplicar)}catch(_){}
 aplicar();window.juntadaAplicarTema=aplicar;
})();
