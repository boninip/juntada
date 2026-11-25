/* V1.19.17 · «Organizar gastos»: desde el evento se crea un grupo de Cuentas vinculado.
   Cuentas es la única autoridad de saldos: acá no se guarda ningún monto ni lista de personas. La autorización la valida el servidor. */
(()=>{
'use strict';
const CUENTAS_URL='https://boninip.github.io/cuentas/'; /* sin enlace al grupo exacto todavía (D-01): abre Cuentas y el grupo aparece en la lista */
const MONEDAS=['ARS','USD','EUR','BRL','UYU','CLP','MXN','GBP']; /* habilitadas en DEV al 25/11; el servidor valida */
const SENT='00000000-0000-0000-0000-000000000000';
const MSG={
 LNK_SIN_SESION:'Ingresá con tu Pintó ID para organizar los gastos.',
 LNK_NO_AUTORIZADO:'Solo quien organiza esta juntada puede crear el grupo.',
 LNK_TIPO_INVALIDO:'Algo salió mal de nuestro lado. No se creó nada.',
 CUE_MONEDA_INVALIDA:'Elegí una moneda de la lista.',
 CUE_MONEDA_NO_PERMITIDA:'Esa moneda todavía no está habilitada.',
 CUE_NOMBRE_INVALIDO:'El nombre tiene que tener entre 1 y 120 caracteres.',
 CUE_TOPE_GRUPOS:'Llegaste al máximo de grupos activos. Archivá alguno en Cuentas y probá de nuevo.'
};
const ESTADO={open:'Abierto',closed:'Cerrado',archived:'Archivado',trashed:'En papelera'};
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const code=e=>((e&&e.detail||'').match(/(?:LNK|CUE)_[A-Z_]+/)||[''])[0];
const ev=()=>{try{return typeof remoteEvent!=='undefined'&&remoteEvent&&remoteEvent.id?remoteEvent:null}catch(_){return null}};
const token=()=>{const e=ev();return e&&e.organizador&&e.organizador!==SENT?e.organizador:null};
const nombreEvento=()=>{try{if(typeof saved!=='undefined'&&saved&&saved.name)return saved.name}catch(_){}const n=document.querySelector('#event .js-name');return n?n.textContent.trim():''};
async function puedeCrear(){
 if(token())return true;
 try{const a=await rpc('juntada_mis_eventos',{});const x=(Array.isArray(a)?a:[]).find(e=>e.id===(ev()||{}).id);return !(x&&x.rol==='coorganizador')}catch(_){return false}
}
const summary=()=>rpc('core_link_summary_for_ref',{p_ref_type:'juntada',p_ref_id:ev().id,p_organizer:token()});

const css=document.createElement('style');
css.textContent='#jOrgOverlay{position:fixed;inset:0;z-index:10040;background:rgb(var(--velo-rgb)/.5);display:flex;align-items:flex-end;justify-content:center;padding:16px}#jOrgOverlay[hidden]{display:none}#jOrgOverlay .org-panel{width:100%;max-width:430px;max-height:calc(100vh - 32px);overflow:auto;background:var(--fondo);color:var(--texto);border:1px solid var(--borde);border-radius:20px;padding:20px}#jOrgOverlay h2{margin:0 0 8px;font-size:1.3rem}#jOrgOverlay p{margin:0 0 12px}#jOrgOverlay .field-hint{color:var(--texto-sec)}#jOrgOverlay .btn+.btn{margin-top:8px}#cuentasLinkCard .j-org{margin:0 0 14px;padding-bottom:14px;border-bottom:1px solid var(--borde)}';
document.head.append(css);

function panel(html){
 let o=$('jOrgOverlay');
 if(!o){o=document.createElement('div');o.id='jOrgOverlay';o.hidden=true;document.body.append(o);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!o.hidden&&!o.dataset.busy)cerrar()})}
 o.innerHTML='<div class="org-panel" role="dialog" aria-modal="true" aria-labelledby="jOrgT">'+html+'</div>';o.hidden=false;
 const f=o.querySelector('input,button');if(f)f.focus();return o;
}
function cerrar(){const o=$('jOrgOverlay');if(o){o.hidden=true;delete o.dataset.busy}}
function abrirCuentas(){location.assign(CUENTAS_URL)}

async function formulario(){
 const nombre=nombreEvento().slice(0,120);
 const o=panel('<h2 id="jOrgT">Organizar gastos</h2><p>Vamos a crear un grupo en Cuentas para esta juntada. Todavía no se invita a nadie: eso lo confirmás en Cuentas.</p>'
  +'<label for="jOrgName">Nombre del grupo</label><input id="jOrgName" maxlength="120" value="'+esc(nombre)+'">'
  +'<label for="jOrgCur">Moneda</label><select id="jOrgCur">'+MONEDAS.map(m=>'<option value="'+m+'"'+(m==='ARS'?' selected':'')+'>'+m+'</option>').join('')+'</select>'
  +'<p class="field-hint" id="jOrgCounts"></p><p class="field-hint" id="jOrgMsg" role="status" aria-live="polite"></p>'
  +'<button type="button" class="btn" id="jOrgGo">Crear grupo y abrir Cuentas</button><button type="button" class="btn outline" id="jOrgCancel">Cancelar</button>');
 o.querySelector('#jOrgCancel').onclick=cerrar;
 o.querySelector('#jOrgGo').onclick=crear;
 try{ /* solo conteos: nada de nombres ni copias */
  const e=ev();const r=await rpc('juntada_respuestas_organizador',{p_juntada:e.id,p_organizador:e.organizador||SENT});const c={voy:0,tal_vez:0,no_puedo:0};
  (Array.isArray(r)?r:[]).forEach(x=>{if(x.asistencia in c)c[x.asistencia]++});
  const el=$('jOrgCounts');if(el)el.textContent='Voy: '+c.voy+' · Aún no sé: '+c.tal_vez+' · No voy: '+c.no_puedo;
 }catch(_){}
}
const msg=t=>{const m=$('jOrgMsg');if(m)m.textContent=t};
async function crear(){
 const name=($('jOrgName').value||'').trim(),cur=$('jOrgCur').value;
 if(name.length<1||name.length>120)return msg(MSG.CUE_NOMBRE_INVALIDO);
 if(!/^[A-Z]{3}$/.test(cur))return msg(MSG.CUE_MONEDA_INVALIDA);
 const o=$('jOrgOverlay'),go=$('jOrgGo'),ca=$('jOrgCancel');o.dataset.busy='1';go.disabled=true;ca.disabled=true;msg('Creando el grupo…');
 try{
  await rpc('core_group_create_and_link',{p_name:name,p_currency:cur,p_ref_type:'juntada',p_ref_id:ev().id,p_organizer:token()});
  listo(name,true);
 }catch(e){
  delete o.dataset.busy;const c=code(e);
  if(c==='LNK_YA_VINCULADO')return yaTiene('Esta juntada ya tiene un grupo.');
  if(MSG[c]){go.disabled=false;ca.disabled=false;return msg(MSG[c])}
  /* error sin código o corte de conexión: no se reintenta a ciegas; primero se mira si quedó creado */
  try{const s=await summary();
   if(s)return yaTiene('Ya estaba creado, lo abrimos.');
   go.disabled=false;ca.disabled=false;msg('No pudimos crear el grupo. Probá de nuevo más tarde.');
  }catch(_){ca.disabled=false;go.hidden=true;msg('No pudimos confirmar si se creó. Revisá en Cuentas o volvé a probar.')}
 }
}
function listo(name,redirigir){
 const o=panel('<h2 id="jOrgT">Grupo creado</h2><p>'+(redirigir?'Abriendo Cuentas…':'Ya está en Cuentas.')+'</p><p class="field-hint">Buscá «'+esc(name)+'» en tus grupos. Ahí confirmás a quién invitar.</p><button type="button" class="btn" id="jOrgOpen">Abrir en Cuentas</button><button type="button" class="btn outline" id="jOrgClose">Cerrar</button>');
 o.dataset.busy='1';o.querySelector('#jOrgOpen').onclick=abrirCuentas;o.querySelector('#jOrgClose').onclick=cerrar;
 if(window.pintoRenderCuentasLink)window.pintoRenderCuentasLink();
 if(redirigir)setTimeout(()=>{if($('jOrgOverlay')&&!$('jOrgOverlay').hidden)abrirCuentas()},1500);
}
function yaTiene(texto){
 const o=panel('<h2 id="jOrgT">Organizar gastos</h2><p>'+esc(texto)+'</p><button type="button" class="btn" id="jOrgOpen">Abrir en Cuentas</button><button type="button" class="btn outline" id="jOrgClose">Cerrar</button>');
 o.querySelector('#jOrgOpen').onclick=abrirCuentas;o.querySelector('#jOrgClose').onclick=cerrar;
 if(window.pintoRenderCuentasLink)window.pintoRenderCuentasLink();
}

async function aumentar(){
 const box=$('cuentasLinkCard');if(!box||box.hidden||!ev())return;
 box.querySelectorAll('.j-org').forEach(n=>n.remove());
 if(box.querySelector('#cuentasUnlink')){ /* ya vinculado: estado y miembros, sin nombres ni montos */
  try{const s=await summary();if(!s||!box.querySelector('#cuentasUnlink'))return;
   const p=document.createElement('p');p.className='field-hint j-org';p.id='jOrgEstado';
   p.textContent=(ESTADO[s.group_status]||'Abierto')+' · '+s.members_active+(Number(s.members_active)===1?' miembro':' miembros');
   const b=box.querySelector('p');if(b)b.after(p)}catch(_){}
  return;
 }
 if(!(box.querySelector('#cuentasGroupSel')||/No tenés grupos en Cuentas/.test(box.textContent)))return; /* solicitudes en curso u otros estados: no se toca */
 if(!(await puedeCrear())||box.querySelector('.j-org'))return;
 const d=document.createElement('div');d.className='j-org';
 d.innerHTML='<p><b>Organizar gastos</b></p><p class="field-hint">Armá un grupo en Cuentas para dividir los gastos de esta juntada.</p><button type="button" class="btn" id="jOrgBtn">Organizar gastos</button>'+(box.querySelector('#cuentasGroupSel')?'<p class="field-hint" style="margin:12px 0 0">¿Ya tenés un grupo? Vinculalo acá abajo.</p>':'');
 const h=box.querySelector('h3');if(h)h.after(d);else box.prepend(d);
 d.querySelector('#jOrgBtn').onclick=formulario;
}

function envolver(){
 const orig=window.pintoRenderCuentasLink;if(typeof orig!=='function'||orig.__org)return false;
 const w=async function(){const r=await orig.apply(this,arguments);try{await aumentar()}catch(_){}return r};w.__org=true;window.pintoRenderCuentasLink=w;return true;
}
if(!envolver()){let n=0;const t=setInterval(()=>{if(envolver()||++n>40)clearInterval(t)},250)}
})();
