// Pruebas de interfaz de la V1.19.0 (solicitudes de ingreso y coorganizadores) con Supabase SIMULADO (no tocan ninguna base).
// Servir el repo bajo /juntada/ en 127.0.0.1:8765.
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1190.html';
const ID='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',CODE='dddddddd-dddd-dddd-dddd-dddddddddddd',SENT='00000000-0000-0000-0000-000000000000';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
async function mk(browser,{session=false,store={},handlers={}}={}){
 const ctx=await browser.newContext({viewport:{width:400,height:900}});const page=await ctx.newPage();
 await page.addInitScript(([s,st])=>{if(s)localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'tok',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}));for(const k in st)localStorage.setItem(k,st[k])},[session,store]);
 const calls=[];const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.route('**/*',async r=>{const u=r.request().url();if(!u.includes('supabase.co'))return r.continue();
  const fn=(u.split('/rpc/')[1]||'').split('?')[0];let body={};try{body=JSON.parse(r.request().postData()||'{}')}catch(_){}
  calls.push({fn,body,url:u,auth:r.request().headers()['authorization']||null});
  const h=handlers[fn];let res=h?(typeof h==='function'?h(body):h):{};
  if(res&&res.__error)return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:res.__error,details:res.__detail||''})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(res)})});
 return {ctx,page,calls,errs};
}
const AHORA=new Date().toISOString();
const base=o=>({id:ID,nombre:'Cumple de Ana',cancelada:false,ahora:AHORA,...o});
const lim=acceso=>base({requiere_aprobacion:true,acceso});
const FULL=base({descripcion:'d',fecha:'',hora:'',lugar:'Casa',modalidad_fecha:'pending',opciones_fecha:[],gastos:'',lugares:[],fecha_confirmada:'',ronda:1,finalistas:[],requiere_aprobacion:false,acceso:'libre'});
const ENTRY={id:'j1',saved:{name:'Cumple',desc:'',dateMode:'pending',date:'',candidates:[],time:'',place:'Lugar',expense:''}};
const ORG=(o)=>({id:ID,ronda:1,finalistas:[],revisiones:{},dueno:{reclamada:true,es_mio:true},rol:'organizador',requiere_aprobacion:true,solicitudes_pendientes:1,votacion_hasta:null,votacion_cerrada:false,ahora:AHORA,...o});
const SOLS=[{id:'s1',nombre:'Ana',estado:'pendiente'},{id:'s2',nombre:'Luz',estado:'rechazada'}];
const RESP=[{id:'r1',nombre:'Beto',asistencia:'voy',ligada:true,coorganizador:false},{id:'r2',nombre:'Anon',asistencia:'voy',ligada:false,coorganizador:false}];
const store=()=>({juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,codigo:CODE,organizador:'ffffffff-ffff-ffff-ffff-ffffffffffff'})});
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) invitada sin sesión
 {const {ctx,page,calls,errs}=await mk(browser,{handlers:{juntada_ver:lim('iniciar_sesion')}});
  await page.goto(U+'?invite='+CODE);await page.waitForTimeout(1500);
  ok(await page.locator('#ingresoOverlay').isVisible(),'1.1 sin sesión y con aprobación: aparece el aviso');
  ok((await page.textContent('#ingresoOverlay')).includes('Cumple de Ana')&&await page.locator('#ingEmail').isVisible(),'1.2 muestra el nombre y pide email');
  await page.fill('#ingEmail','x@test.com');await page.click('#ingEnviar');await page.waitForTimeout(600);
  const o=calls.find(c=>c.url.includes('/auth/v1/otp'));
  ok(o&&o.body.email==='x@test.com'&&decodeURIComponent(o.url).includes('invite='+CODE),'1.3 el enlace de acceso vuelve a esta misma invitación');
  ok(errs.length===0,'1.4 sin errores de página '+errs.join('|'));await ctx.close()}
 // 2) con sesión: pide entrar
 {let est='solicitar';const {ctx,page,calls}=await mk(browser,{session:true,handlers:{juntada_ver:()=>lim(est),juntada_solicitar_ingreso:b=>{est='pendiente';return {ok:true,estado:'pendiente'}}}});
  await page.goto(U+'?invite='+CODE);await page.waitForTimeout(1500);
  ok(await page.locator('#ingNombre').isVisible(),'2.1 con sesión pide el nombre');
  await page.click('#ingPedir');await page.waitForTimeout(300);ok((await page.textContent('#ingMsg')).includes('Poné tu nombre'),'2.2 no deja pedir sin nombre');
  await page.fill('#ingNombre','Beto');await page.click('#ingPedir');await page.waitForTimeout(600);
  const c=calls.find(x=>x.fn==='juntada_solicitar_ingreso');
  ok(c&&c.body.p_codigo===CODE&&c.body.p_nombre==='Beto'&&c.auth,'2.3 manda la solicitud con sesión');
  ok((await page.textContent('#ingresoOverlay')).includes('pendiente'),'2.4 queda como pendiente');await ctx.close()}
 // 3) pendiente -> aprobada: al revisar, entra
 {let est='pendiente';const {ctx,page,calls}=await mk(browser,{session:true,handlers:{juntada_ver:()=>est==='permitido'?base({...FULL,requiere_aprobacion:true,acceso:'permitido'}):lim(est)}});
  await page.goto(U+'?invite='+CODE);await page.waitForTimeout(1500);
  ok((await page.textContent('#ingresoOverlay')).includes('pendiente'),'3.1 pendiente muestra el estado');
  est='permitido';await page.click('#ingRevisar');await page.waitForTimeout(1800);
  ok((await page.locator('#ingresoOverlay').count())===0,'3.2 al aprobarla, el aviso desaparece y se ve la juntada');await ctx.close()}
 // 4) rechazada
 {const {ctx,page}=await mk(browser,{session:true,handlers:{juntada_ver:lim('rechazada')}});await page.goto(U+'?invite='+CODE);await page.waitForTimeout(1500);
  ok((await page.textContent('#ingresoOverlay')).includes('no aprobó')&&(await page.locator('#ingPedir').count())===0,'4.1 rechazada: lo dice y no deja pedir de nuevo');await ctx.close()}
 // 5) juntada libre: nada cambia
 {const {ctx,page,errs}=await mk(browser,{handlers:{juntada_ver:FULL}});await page.goto(U+'?invite='+CODE);await page.waitForTimeout(1500);
  ok((await page.locator('#ingresoOverlay').count())===0,'5.1 sin aprobación no hay aviso');ok(errs.length===0,'5.2 sin errores');await ctx.close()}
 // 6) organizadora
 {const {ctx,page,calls,errs}=await mk(browser,{session:true,store:store(),handlers:{juntada_ver_organizador:ORG(),juntada_solicitudes:SOLS,juntada_coorganizadores:[],juntada_respuestas_organizador:RESP,juntada_decidir_solicitud:{ok:true},juntada_config_ingreso:{ok:true},juntada_coorganizador_designar:{ok:true}}});
  await page.goto(U);await page.waitForTimeout(1200);await page.evaluate(()=>openJuntada('j1'));await page.waitForTimeout(1800);
  ok(await page.locator('#ingCard').isVisible(),'6.1 la tarjeta de ingreso aparece en el panel');
  const t=await page.textContent('#ingCard');ok(t.includes('Ana')&&t.includes('Aprobar')&&t.includes('Rechazar')&&t.includes('1 pendiente'),'6.2 lista la solicitud pendiente');
  ok(t.includes('Luz')&&t.includes('Rechazada'),'6.3 muestra las ya decididas');
  await page.click('#ingCard [data-ap="s1"]');await page.waitForTimeout(500);
  const d=calls.find(c=>c.fn==='juntada_decidir_solicitud');ok(d&&d.body.p_solicitud==='s1'&&d.body.p_aprobar===true&&d.body.p_juntada===ID,'6.4 aprobar manda la decisión correcta');
  const opts=await page.$$eval('#ingElegir option',o=>o.map(x=>x.textContent));ok(opts.includes('Beto')&&!opts.includes('Anon'),'6.5 solo se puede sumar a quien tiene Pinto ID');
  await page.selectOption('#ingElegir','r:r1');await page.click('#ingSumar');await page.waitForTimeout(500);
  const s=calls.find(c=>c.fn==='juntada_coorganizador_designar');ok(s&&s.body.p_respuesta==='r1'&&s.body.p_solicitud===null,'6.6 sumar coorganización manda la respuesta elegida');
  await page.uncheck('#ingApro');await page.waitForTimeout(500);
  const k=calls.find(c=>c.fn==='juntada_config_ingreso');ok(k&&k.body.p_requiere===false,'6.7 apagar la aprobación se manda al servidor');
  ok(errs.length===0,'6.8 sin errores '+errs.join('|'));await ctx.close()}
 // 7) coorganizadora: no puede nombrar
 {const {ctx,page}=await mk(browser,{session:true,store:store(),handlers:{juntada_ver_organizador:ORG({rol:'coorganizador'}),juntada_solicitudes:SOLS,juntada_coorganizadores:[{id:'c1',nombre:'Yo',soy_yo:true}],juntada_respuestas_organizador:RESP}});
  await page.goto(U);await page.waitForTimeout(1200);await page.evaluate(()=>openJuntada('j1'));await page.waitForTimeout(1800);
  const t=await page.textContent('#ingCard');
  ok(t.includes('Coorganizás')&&t.includes('Dejar de coorganizar'),'7.1 la coorganizadora ve su rol y puede renunciar');
  ok((await page.locator('#ingElegir').count())===0&&(await page.locator('#ingSumar').count())===0,'7.2 no puede sumar a otras personas');await ctx.close()}
 // 8) Mis planes: abrir con Pinto ID
 {const {ctx,page,calls,errs}=await mk(browser,{session:true,handlers:{juntada_mis_eventos:[{id:ID,nombre:'Fiesta de Ana',rol:'coorganizador'}],juntada_abrir_gestion:{...FULL,codigo:CODE,rol:'coorganizador',suspendida:false},juntada_ver_organizador:ORG({rol:'coorganizador'}),juntada_solicitudes:[],juntada_coorganizadores:[],juntada_respuestas_organizador:[]}});
  await page.goto(U);await page.waitForTimeout(1200);await page.evaluate(()=>{go('myEvents');showMyEvents()});await page.waitForTimeout(1200);
  ok(await page.locator('#ingMiosBox').isVisible()&&(await page.textContent('#ingMiosBox')).includes('Coorganizás'),'8.1 Mis planes lista lo que coorganizo con mi Pinto ID');
  await page.click('#ingMiosBox [data-abrir]');await page.waitForTimeout(1500);
  const g=calls.find(c=>c.fn==='juntada_abrir_gestion');ok(g&&g.body.p_juntada===ID&&g.auth,'8.2 abrir pide la gestión con sesión');
  const cred=await page.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('juntada_remote_p'));return k&&JSON.parse(localStorage.getItem(k))});
  ok(cred&&cred.id===ID&&cred.codigo===CODE&&cred.organizador===SENT,'8.3 guarda la credencial sin código de organizadora');
  ok(await page.evaluate(()=>document.getElementById('event').classList.contains('active')),'8.4 abre el panel de la juntada');
  ok(errs.length===0,'8.5 sin errores '+errs.join('|'));await ctx.close()}
 await browser.close();console.log(fails?'\nFALLARON '+fails:'\nTODO OK');process.exit(fails?1:0)})();
