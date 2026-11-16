// Pruebas de interfaz de la V1.18.6 con Supabase SIMULADO (no tocan ninguna base). Servir el repo bajo /juntada/ en 127.0.0.1:8765.
// Cubren: etiquetas de asistencia, respuesta ligada a la cuenta, eliminar/restaurar, aviso de reclamo y recuperación, vínculo con Cuentas, «Mis juntadas».
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1187.html';
const ID='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',OR='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',NEW='cccccccc-cccc-cccc-cccc-cccccccccccc',CODE='dddddddd-dddd-dddd-dddd-dddddddddddd',RID='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',G='11111111-1111-1111-1111-111111111111',L='22222222-2222-2222-2222-222222222222';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
const ENTRY={id:'j1',saved:{name:'Cumple',desc:'',dateMode:'pending',date:'',candidates:[],time:'',place:'Lugar',expense:''}};
async function mk(browser,{session=false,store={},handlers={}}={}){
 const ctx=await browser.newContext({viewport:{width:400,height:900}});const page=await ctx.newPage();
 await page.addInitScript(([s,st])=>{if(s)localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'tok',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}));for(const k in st)localStorage.setItem(k,st[k])},[session,store]);
 const calls=[];const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.route('**/*',async r=>{const u=r.request().url();if(!u.includes('supabase.co'))return r.continue();
  const fn=(u.split('/rpc/')[1]||'').split('?')[0];let body={};try{body=JSON.parse(r.request().postData()||'{}')}catch(_){}
  calls.push({fn,body,auth:r.request().headers()['authorization']||null});
  const h=handlers[fn];let res=h?(typeof h==='function'?h(body):h):null;
  if(res&&res.__error)return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:res.__error,details:res.__detail||''})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(res)})});
 return {ctx,page,calls,errs};
}

const RQ='77777777-7777-7777-7777-777777777777',FUT=new Date(Date.now()+5*864e5).toISOString();
const STORE={juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,organizador:OR,codigo:CODE})};
const BASE={juntada_ver_organizador:{id:ID,dueno:{reclamada:true,es_mio:true}},juntada_respuestas_organizador:[],juntada_votos_organizador:[],cuentas_my_groups:[{id:G,name:'Viaje del grupo',status:'active',role:'member'}]};
async function abrir(page){await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>{openJuntada('j1');go('event');tab('despues',document.querySelectorAll('.seg button')[1])});await page.waitForTimeout(900)}
const txt=p=>p.textContent('#cuentasLinkCard');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) sin permiso en el grupo: vincular falla, se ofrece solicitar, se envía y queda pendiente
 {let pend=null;const {ctx,page,calls,errs}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:null,
   core_link_requests_list:()=>pend?[pend]:[],core_link_create:{__error:'No autorizado',__detail:''},
   core_link_request_create:b=>{pend={id:RQ,group_id:b.p_group,group_name:'Viaje del grupo',ref_type:'juntada',ref_id:ID,needs:'cuentas',status:'pending',expires_at:FUT,mine:true,i_can_approve:false};return RQ}}});
  await abrir(page);
  ok(!(await page.isVisible('#cuentasRequestBtn')),'bilateral: «Solicitar vínculo» no se ve hasta que falla vincular');
  await page.click('#cuentasLinkBtn');await page.waitForTimeout(600);
  ok(await page.isVisible('#cuentasRequestBtn'),'bilateral: sin permiso en el grupo se ofrece «Solicitar vínculo»');
  await page.click('#cuentasRequestBtn');await page.waitForTimeout(800);
  const c=calls.find(x=>x.fn==='core_link_request_create');
  ok(c&&c.body.p_group===G&&c.body.p_ref_type==='juntada'&&c.body.p_ref_id===ID,'bilateral: solicita con grupo, tipo y evento');
  ok(c&&c.auth==='Bearer tok','bilateral: la solicitud va con la sesión (Pinto ID), no con el código');
  ok(/Solicitud enviada/.test(await txt(page))&&/administra el grupo/.test(await txt(page))&&/Vence el/.test(await txt(page)),'bilateral: muestra estado pendiente, quién aprueba y cuándo vence');
  await page.click('#cuentasCancelReq');await page.waitForTimeout(500);
  ok(calls.some(x=>x.fn==='core_link_request_cancel'&&x.body.p_request===RQ),'bilateral: cancela la solicitud');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 2) quien solo tiene Cuentas (falta el lado evento): «No autorizado en el evento» también ofrece solicitar
 {const {ctx,page}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:null,core_link_requests_list:[],core_link_create:{__error:'No autorizado en el evento'}}});
  await abrir(page);await page.click('#cuentasLinkBtn');await page.waitForTimeout(600);
  ok(await page.isVisible('#cuentasRequestBtn'),'bilateral: sin ser organizador también se ofrece solicitar');await ctx.close()}
 // 3) el servidor dice que ya puede vincular directo: reintenta directo
 {let n=0;const {ctx,page,calls}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:()=>n>1?{link_id:L,group_id:G,group_name:'Viaje del grupo'}:null,core_link_requests_list:[],
   core_link_create:()=>{n++;if(n===1)return{__error:'No autorizado'};return L},core_link_request_create:{__error:'Ya tenés los dos permisos',__detail:'LNK_USAR_VINCULO_DIRECTO'}}});
  await abrir(page);await page.click('#cuentasLinkBtn');await page.waitForTimeout(500);await page.click('#cuentasRequestBtn');await page.waitForTimeout(900);
  ok(calls.filter(x=>x.fn==='core_link_create').length===2,'bilateral: LNK_USAR_VINCULO_DIRECTO reintenta el vínculo directo');await ctx.close()}
 // 4) organizador solo con código (sin Pinto ID de dueño): se explica que reclame
 {const {ctx,page}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:null,core_link_requests_list:[],core_link_create:{__error:'No autorizado'},core_link_request_create:{__error:'No autorizado',__detail:'LNK_NO_AUTORIZADO'}}});
  await abrir(page);await page.click('#cuentasLinkBtn');await page.waitForTimeout(500);await page.click('#cuentasRequestBtn');await page.waitForTimeout(700);
  ok(/reclamala primero/.test(await page.textContent('#cuentasLinkMsg')),'bilateral: LNK_NO_AUTORIZADO al solicitar explica que hay que reclamar con Pinto ID');await ctx.close()}
 // 5) soy quien aprueba: aprobar con el hash exacto
 for(const dec of ['approve','reject']){let done=null;const {ctx,page,calls,errs}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:null,
   core_link_requests_list:()=>done?[]:[{id:RQ,group_id:G,group_name:'Viaje del grupo',ref_type:'juntada',ref_id:ID,needs:'evento',status:'pending',expires_at:FUT,mine:false,i_can_approve:true,version_hash:'HASH123'}],
   core_link_request_decide:b=>{done=b.p_decision;return b.p_decision==='approve'?'approved':'rejected'}}});
  await abrir(page);
  ok(/Solicitud para aprobar/.test(await txt(page))&&/Viaje del grupo/.test(await txt(page)),'aprobar ('+dec+'): muestra la solicitud con el nombre del grupo');
  ok(!calls.some(x=>x.fn==='core_link_request_decide'),'aprobar ('+dec+'): leer la solicitud no decide nada');
  await page.click(dec==='approve'?'#cuentasApprove':'#cuentasReject');await page.waitForTimeout(800);
  const c=calls.find(x=>x.fn==='core_link_request_decide');
  ok(c&&c.body.p_request===RQ&&c.body.p_hash==='HASH123'&&c.body.p_decision===dec,'aprobar ('+dec+'): decide con el hash de esa versión y la decisión explícita');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 6) vencida / invalidada al decidir
 for(const [r,re] of [['expired',/venció/],['invalidated',/ya no vale/]]){const {ctx,page}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:null,
   core_link_requests_list:[{id:RQ,group_id:G,group_name:'Viaje del grupo',ref_type:'juntada',ref_id:ID,needs:'evento',status:'pending',expires_at:FUT,mine:false,i_can_approve:true,version_hash:'H'}],core_link_request_decide:r}});
  await abrir(page);await page.click('#cuentasApprove');await page.waitForTimeout(700);
  ok(re.test(await txt(page)),'estado '+r+': se explica y se pide enviar de nuevo');await ctx.close()}
 // 7) códigos estables del servidor -> mensajes
 for(const [code,re] of [['LNK_GRUPO_CERRADO',/cerrado/],['LNK_YA_VINCULADO',/ya tiene un grupo/],['LNK_SOLICITUD_PENDIENTE',/solicitud pendiente/],['LNK_SIN_APROBADOR',/nadie con permiso/],['LNK_GRUPO_ARCHIVADO',/archivado/]]){
  const {ctx,page}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:null,core_link_requests_list:[],core_link_create:{__error:'x',__detail:code}}});
  await abrir(page);await page.click('#cuentasLinkBtn');await page.waitForTimeout(500);
  ok(re.test(await page.textContent('#cuentasLinkMsg')),'código '+code+': mensaje claro');await ctx.close()}
 // 8) vínculo directo sigue funcionando y «Desvincular» aclara quién decide
 {let linked=null;const {ctx,page,calls}=await mk(browser,{session:true,store:STORE,handlers:{...BASE,core_link_for_ref:()=>linked,core_link_requests_list:[],
   core_link_create:b=>{linked={link_id:L,group_id:b.p_group,group_name:'Viaje del grupo'};return L},core_link_remove:{__error:'No autorizado',__detail:'LNK_NO_AUTORIZADO'}}});
  await abrir(page);await page.click('#cuentasLinkBtn');await page.waitForTimeout(700);
  ok(/Viaje del grupo/.test(await txt(page))&&/quien administra el grupo en Cuentas/.test(await txt(page)),'directo: sigue vinculando y aclara quién desvincula');
  await page.click('#cuentasUnlink');await page.waitForTimeout(600);
  ok(/permiso/.test(await page.textContent('#cuentasLinkMsg')),'desvincular sin permiso: mensaje claro, no un error crudo');await ctx.close()}
 // 9) sin sesión
 {const {ctx,page}=await mk(browser,{store:STORE,handlers:BASE});await abrir(page);
  ok(/ingresá con tu Pinto ID/i.test(await txt(page)),'sin sesión: pide ingresar');await ctx.close()}
 await browser.close();console.log(fails?('\n'+fails+' FALLAS'):'\nTODO OK');process.exit(fails?1:0)})();
