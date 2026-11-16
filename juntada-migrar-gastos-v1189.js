/* V1.18.9 · Migración asistida de gastos viejos a Cuentas. Solo con Pintó ID y a pedido de la persona.
   No borra ni modifica la copia vieja. Reintentar no duplica (clave de idempotencia por gasto). */
(()=>{
'use strict';
const KEY='juntada_expenses_v1',GROUPS='juntada_expense_groups_v1',SETTLEMENTS='juntada_settlements_v1',PROG='juntada_migracion_gastos_v1';
const rd=k=>{try{const a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[]}catch(_){return []}};
const prog=()=>{try{return JSON.parse(localStorage.getItem(PROG)||'null')||{}}catch(_){return {}}};
const saveProg=p=>{try{localStorage.setItem(PROG,JSON.stringify(p))}catch(_){}};
const norm=s=>String(s).trim().toLocaleLowerCase('es-AR');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=c=>(c/100).toLocaleString('es-AR',{style:'currency',currency:'ARS'});
const logged=()=>typeof pintoBearer==='function'&&!!pintoBearer();
/* Arma el plan: un grupo de Cuentas por grupo viejo; los gastos sin grupo van a uno por defecto. */
function plan(){
 const groups=rd(GROUPS),exps=rd(KEY),sets=rd(SETTLEMENTS);
 const buckets=new Map();
 const add=(id,name)=>{if(!buckets.has(id))buckets.set(id,{id,name,expenses:[],people:new Set()});return buckets.get(id)};
 for(const g of groups)add(g.id,g.name||'Grupo');
 for(const e of exps){const id=e.groupId&&groups.some(g=>g.id===e.groupId)?e.groupId:'_sin_grupo';
  const b=add(id,id==='_sin_grupo'?'Gastos de la juntada':null);b.expenses.push(e);
  (e.shares||[]).forEach(s=>b.people.add(s.person));if(e.payer)b.people.add(e.payer)}
 for(const g of groups){const b=buckets.get(g.id);(g.members||[]).forEach(m=>b.people.add(m))}
 const out=[...buckets.values()].filter(b=>b.expenses.length);
 return {buckets:out,settlements:sets,total:exps.length};
}
/* Valida antes de tocar nada: cada gasto debe tener reparto que suma el importe. */
function problemas(p){
 const bad=[];
 for(const b of p.buckets)for(const e of b.expenses){
  const sum=(e.shares||[]).reduce((a,s)=>a+s.cents,0);
  if(!Number.isSafeInteger(e.cents)||e.cents<=0||sum!==e.cents||!(e.shares||[]).length)bad.push(e.name||e.id);
 }
 return bad;
}
async function run(p,yo,ui){
 const st=prog();st.groups=st.groups||{};st.done=st.done||{};
 let ok=0,skipped=0;
 for(const b of p.buckets){
  const g=st.groups[b.id]=st.groups[b.id]||{cuentas:null,guests:{}};
  if(!g.cuentas){g.cuentas=await rpc('cuentas_group_create',{p_name:b.name.slice(0,120),p_currency:'ARS'});saveProg(st)}
  const me=await currentUser();
  const ids={};
  for(const person of b.people){
   if(norm(person)===norm(yo)){ids[norm(person)]=me;continue}
   if(!g.guests[norm(person)]){g.guests[norm(person)]=await rpc('cuentas_guest_add',{p_group:g.cuentas,p_name:person.slice(0,40)});saveProg(st)}
   ids[norm(person)]=g.guests[norm(person)];
  }
  for(const e of b.expenses){
   if(st.done[e.id]){skipped++;continue}
   const shares={};for(const s of e.shares)shares[ids[norm(s.person)]]=(shares[ids[norm(s.person)]]||0)+s.cents;
   await rpc('cuentas_expense_add',{p_group:g.cuentas,p_currency:'ARS',p_amount_minor:e.cents,p_payer:ids[norm(e.payer)],p_participants:null,p_shares:shares,p_description:String(e.name||'Gasto').slice(0,300),p_occurred_on:e.created?new Date(e.created).toISOString().slice(0,10):null,p_key:'mig-'+e.id.slice(0,90).padEnd(8,'0'),p_category:null,p_fx:null});
   st.done[e.id]=1;saveProg(st);ok++;ui&&ui(ok+skipped);
  }
 }
 st.finished=Date.now();saveProg(st);
 return {ok,skipped,groups:Object.values(st.groups).map(x=>x.cuentas)};
}
async function currentUser(){
 const tok=pintoBearer();const r=await fetch(SB_URL+'/auth/v1/user',{headers:{apikey:SB_KEY,Authorization:'Bearer '+tok}});
 const d=await r.json();if(!d||!d.id)throw Error('No pude identificar tu cuenta');return d.id;
}
function panel(){
 let c=document.getElementById('migGastosCard');
 if(!c){const host=document.getElementById('balances')||document.getElementById('accounts');if(!host)return null;c=document.createElement('div');c.id='migGastosCard';c.className='card';c.style.cssText='margin-top:16px;padding:16px';(host.querySelector('.pad')||host).appendChild(c)}
 return c;
}
function pintar(){
 const c=panel();if(!c)return;
 const p=plan();
 if(!logged()||!p.total){c.hidden=true;return}
 c.hidden=false;
 const st=prog();
 if(st.finished&&Object.keys(st.done||{}).length>=p.total){
  c.innerHTML='<strong>Gastos pasados a Cuentas</strong><p class="sub">Ya pasaste '+p.total+' gasto(s). La copia vieja quedó como estaba; no se borró nada.</p>';return}
 c.innerHTML='<strong>Pasar estos gastos a Cuentas</strong><p class="sub">Cuentas es donde viven los gastos compartidos. Tenés '+p.total+' gasto(s) en este teléfono. No se borra nada de acá.</p><button type="button" class="btn secondary" id="migEmpezar">Revisar y pasar</button><div id="migDetalle"></div>';
 c.querySelector('#migEmpezar').onclick=()=>detalle(c,p);
}
function detalle(c,p){
 const bad=problemas(p),d=c.querySelector('#migDetalle');
 const people=[...new Set(p.buckets.flatMap(b=>[...b.people]))];
 if(bad.length){d.innerHTML='<p class="field-hint" role="alert">No se puede pasar todavía: estos gastos tienen el reparto mal ('+bad.map(esc).join(', ')+'). Corregilos y volvé a intentar.</p>';return}
 d.innerHTML='<p class="sub">'+p.buckets.length+' grupo(s) en Cuentas:</p><ul>'+p.buckets.map(b=>'<li>'+esc(b.name)+': '+b.expenses.length+' gasto(s), '+money(b.expenses.reduce((a,e)=>a+e.cents,0))+'</li>').join('')+'</ul>'
  +'<label for="migYo">¿Cuál de estas personas sos vos?</label><select id="migYo">'+people.map(x=>'<option>'+esc(x)+'</option>').join('')+'</select>'
  +'<p class="field-hint">Vas a quedar como administradora o administrador. Las demás personas se agregan como invitadas sin cuenta; después pueden sumarse con su Pintó ID.</p>'
  +(p.settlements.length?'<p class="field-hint" role="note">Los '+p.settlements.length+' pago(s) registrados no se pasan: Cuentas los pide confirmados por quien recibe. Registralos de nuevo allá.</p>':'')
  +'<button type="button" class="btn" id="migConfirmar">Pasar a Cuentas</button><p id="migEstado" class="sub" role="status"></p>';
 d.querySelector('#migConfirmar').onclick=async ev=>{
  const b=ev.currentTarget;b.disabled=true;const est=d.querySelector('#migEstado');
  try{const r=await run(p,d.querySelector('#migYo').value,n=>est.textContent='Pasando… '+n+' de '+p.total);est.textContent='Listo: '+r.ok+' gasto(s) pasados a Cuentas.';setTimeout(pintar,800)}
  catch(e){est.textContent='Se cortó: '+e.message+'. Podés volver a tocar el botón: lo ya pasado no se duplica.';b.disabled=false}
 };
}
window.__migGastos={plan,problemas,run};
document.addEventListener('DOMContentLoaded',()=>setTimeout(pintar,800));
if(document.readyState!=='loading')setTimeout(pintar,800);
})();
