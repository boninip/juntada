// V1.19.17 · «Organizar gastos» con Supabase SIMULADO (no toca ninguna base). Servir el repo bajo /juntada/ en 127.0.0.1:8765.
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/index.html';
const ID='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',CODE='dddddddd-dddd-dddd-dddd-dddddddddddd',TOK='ffffffff-ffff-ffff-ffff-ffffffffffff';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
const ENTRY={id:'j1',saved:{name:'Cumple de Ana',desc:'',dateMode:'pending',date:'',candidates:[],time:'',place:'Lugar',expense:''}};
async function mk(browser,{session=true,token=TOK,handlers={},abort=[]}={}){
 const ctx=await browser.newContext({viewport:{width:400,height:900}});const page=await ctx.newPage();
 await page.addInitScript(([s,t])=>{if(s)localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'tok',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}));
  localStorage.setItem('juntada_v10_events',JSON.stringify([{id:'j1',saved:{name:'Cumple de Ana',desc:'',dateMode:'pending',date:'',candidates:[],time:'',place:'Lugar',expense:''}}]));
  localStorage.setItem('juntada_remote_j1',JSON.stringify(Object.assign({id:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',codigo:'dddddddd-dddd-dddd-dddd-dddddddddddd'},t?{organizador:t}:{})))},[session,token]);
 const calls=[],errs=[],nav=[];page.on('pageerror',e=>errs.push(e.message));
 await page.route('**/*',async r=>{const u=r.request().url();
  if(u.includes('boninip.github.io/cuentas')){nav.push(u);return r.fulfill({status:200,contentType:'text/html',body:'<title>Cuentas</title>'})}
  if(!u.includes('supabase.co'))return r.continue();
  const fn=(u.split('/rpc/')[1]||'').split('?')[0];let body={};try{body=JSON.parse(r.request().postData()||'{}')}catch(_){}
  calls.push({fn,body});
  if(abort.includes(fn))return r.abort();
  const h=handlers[fn];let res=h===undefined?{}:(typeof h==='function'?h(body):h);
  if(res&&res.__error)return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:res.__error,details:res.__detail||''})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(res)})});
 await page.goto(U);await page.waitForTimeout(1500);
 await page.evaluate(()=>{openJuntada('j1')});await page.waitForTimeout(800);
 await page.evaluate(()=>{tab('despues',document.querySelectorAll('.juntada-two-tabs button')[1])});await page.waitForTimeout(1500);
 return {ctx,page,calls,errs,nav};
}
const GRUPOS=[{id:'G1',name:'Viaje',status:'open'}];
const SIN_VINCULO={core_link_for_ref:null,core_link_summary_for_ref:null,cuentas_my_groups:GRUPOS,core_link_requests_list:[],core_link_requests_history:[],juntada_respuestas_organizador:[{id:'r1',nombre:'A',asistencia:'voy'},{id:'r2',nombre:'B',asistencia:'voy'},{id:'r3',nombre:'C',asistencia:'tal_vez'},{id:'r4',nombre:'D',asistencia:'no_puedo'}],juntada_mis_eventos:[{id:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',nombre:'Cumple de Ana',rol:'organizador'}]};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) camino feliz
 {const {ctx,page,calls,errs,nav}=await mk(browser,{handlers:{...SIN_VINCULO,core_group_create_and_link:{group_id:'G9',link_id:'L9'}}});
  ok(await page.locator('#jOrgBtn').isVisible(),'1.1 con vínculo ausente aparece «Organizar gastos»');
  await page.click('#jOrgBtn');await page.waitForTimeout(700);
  ok(await page.inputValue('#jOrgName')==='Cumple de Ana','1.2 nombre precargado con el del evento');
  ok(await page.inputValue('#jOrgCur')==='ARS','1.3 moneda ARS por defecto');
  ok((await page.textContent('#jOrgCounts')).replace(/\s+/g,' ').trim()==='Voy: 2 · Aún no sé: 1 · No voy: 1','1.4 muestra solo conteos');
  ok(!(await page.textContent('#jOrgOverlay')).match(/Beto|\bA\b.*\bB\b/),'1.5 no muestra nombres de invitados');
  await page.click('#jOrgGo');await page.waitForTimeout(600);
  const c=calls.find(x=>x.fn==='core_group_create_and_link');
  ok(c&&c.body.p_name==='Cumple de Ana'&&c.body.p_currency==='ARS'&&c.body.p_ref_type==='juntada'&&c.body.p_ref_id===ID&&c.body.p_organizer===TOK,'1.6 llama a core_group_create_and_link con los argumentos aprobados');
  ok((await page.textContent('#jOrgOverlay')).includes('Grupo creado'),'1.7 muestra «Grupo creado»');
  await page.waitForTimeout(2200);ok(nav.length>=1,'1.8 abre Cuentas');
  ok(errs.length===0,'1.9 sin errores de página '+errs.join(';'));await ctx.close()}
 // 2) errores con código
 for(const [det,txt] of [['LNK_NO_AUTORIZADO','Solo quien organiza'],['LNK_SIN_SESION','Ingresá con tu Pintó ID'],['CUE_MONEDA_NO_PERMITIDA','todavía no está habilitada'],['CUE_TOPE_GRUPOS','máximo de grupos'],['CUE_NOMBRE_INVALIDO','entre 1 y 120']]){
  const {ctx,page,calls}=await mk(browser,{handlers:{...SIN_VINCULO,core_group_create_and_link:{__error:'texto cualquiera que no se compara',__detail:det}}});
  await page.click('#jOrgBtn');await page.waitForTimeout(500);await page.click('#jOrgGo');await page.waitForTimeout(700);
  ok((await page.textContent('#jOrgMsg')).includes(txt)&&await page.locator('#jOrgGo').isEnabled(),'2 '+det+': mensaje por código y se puede volver a intentar');
  ok(!calls.some(x=>x.fn==='core_link_summary_for_ref'),'2 '+det+': no consulta el vínculo (error conocido)');await ctx.close()}
 // 3) ya vinculado
 {const {ctx,page}=await mk(browser,{handlers:{...SIN_VINCULO,core_group_create_and_link:{__error:'x',__detail:'LNK_YA_VINCULADO'}}});
  await page.click('#jOrgBtn');await page.waitForTimeout(400);await page.click('#jOrgGo');await page.waitForTimeout(700);
  ok((await page.textContent('#jOrgOverlay')).includes('ya tiene un grupo')&&await page.locator('#jOrgOpen').isVisible(),'3.1 LNK_YA_VINCULADO: abre el grupo existente');await ctx.close()}
 // 4b) corte con verificación: primero sin vínculo (para mostrar el botón), luego el resumen devuelve vínculo
 {let creado=false;
  const {ctx,page,calls}=await mk(browser,{abort:['core_group_create_and_link'],handlers:{...SIN_VINCULO,core_link_summary_for_ref:()=>creado?{link_id:'L',group_id:'G',group_name:'Cumple',group_status:'open',members_active:1}:null}});
  await page.click('#jOrgBtn');await page.waitForTimeout(400);creado=true;await page.click('#jOrgGo');await page.waitForTimeout(1200);
  ok((await page.textContent('#jOrgOverlay')).includes('Ya estaba creado'),'4.1 corte + vínculo existente: «Ya estaba creado, lo abrimos»');
  ok(calls.filter(x=>x.fn==='core_group_create_and_link').length===1,'4.2 no reintenta a ciegas');await ctx.close()}
 // 5) corte y sin vínculo
 {const {ctx,page,calls}=await mk(browser,{abort:['core_group_create_and_link'],handlers:{...SIN_VINCULO}});
  await page.click('#jOrgBtn');await page.waitForTimeout(400);await page.click('#jOrgGo');await page.waitForTimeout(1200);
  ok((await page.textContent('#jOrgMsg')).includes('Probá de nuevo')&&await page.locator('#jOrgGo').isEnabled(),'5.1 corte sin vínculo: mensaje y reintento manual');await ctx.close()}
 // 6) corte y no se puede verificar (el resumen falla recién después de mostrar el botón)
 {let rompe=false;const {ctx,page,calls}=await mk(browser,{abort:['core_group_create_and_link'],handlers:{...SIN_VINCULO,core_link_summary_for_ref:()=>rompe?{__error:'boom'}:null}});
  await page.click('#jOrgBtn');await page.waitForTimeout(400);rompe=true;await page.click('#jOrgGo');await page.waitForTimeout(1200);
  ok((await page.textContent('#jOrgMsg')).includes('No pudimos confirmar')&&calls.filter(x=>x.fn==='core_group_create_and_link').length===1,'6.1 corte sin poder verificar: «No pudimos confirmar» y no crea de nuevo');await ctx.close()}
 // 7) coorganizador: sin botón
 {const {ctx,page}=await mk(browser,{token:null,handlers:{...SIN_VINCULO,juntada_mis_eventos:[{id:ID,nombre:'Cumple de Ana',rol:'coorganizador'}]}});
  ok(await page.locator('#jOrgBtn').count()===0,'7.1 coorganizador: no ve el botón');await ctx.close()}
 // 8) dueño por sesión sin token: sí ve el botón y manda p_organizer null
 {const {ctx,page,calls}=await mk(browser,{token:null,handlers:{...SIN_VINCULO,core_group_create_and_link:{group_id:'G',link_id:'L'}}});
  ok(await page.locator('#jOrgBtn').isVisible(),'8.1 dueño por sesión: ve el botón');
  await page.click('#jOrgBtn');await page.waitForTimeout(400);await page.click('#jOrgGo');await page.waitForTimeout(500);
  const c=calls.find(x=>x.fn==='core_group_create_and_link');ok(c&&c.body.p_organizer===null,'8.2 p_organizer null (no el centinela)');await ctx.close()}
 // 9) nombre vacío: no llama
 {const {ctx,page,calls}=await mk(browser,{handlers:{...SIN_VINCULO}});
  await page.click('#jOrgBtn');await page.waitForTimeout(400);await page.fill('#jOrgName','   ');await page.click('#jOrgGo');await page.waitForTimeout(300);
  ok((await page.textContent('#jOrgMsg')).includes('entre 1 y 120')&&!calls.some(x=>x.fn==='core_group_create_and_link'),'9.1 nombre vacío: avisa y no llama al servidor');
  await page.keyboard.press('Escape');ok(await page.locator('#jOrgOverlay').isHidden(),'9.2 Escape cierra');await ctx.close()}
 // 10) vinculado: estado y miembros
 for(const [st,txt] of [['open','Abierto · 3 miembros'],['closed','Cerrado · 3 miembros'],['trashed','En papelera · 3 miembros']]){
  const {ctx,page}=await mk(browser,{handlers:{...SIN_VINCULO,core_link_for_ref:{link_id:'L',group_id:'G',group_name:'Cumple'},core_link_summary_for_ref:{link_id:'L',group_id:'G',group_name:'Cumple',group_status:st,members_active:3}}});
  ok((await page.textContent('#jOrgEstado')||'').trim()===txt&&await page.locator('#jOrgBtn').count()===0,'10 vinculado '+st+': muestra «'+txt+'» sin botón de organizar');await ctx.close()}
 // 11) sin sesión: sin botón
 {const {ctx,page}=await mk(browser,{session:false,handlers:{...SIN_VINCULO}});
  ok(await page.locator('#jOrgBtn').count()===0,'11.1 sin sesión: no hay botón (queda el aviso de ingreso)');await ctx.close()}
 await browser.close();console.log(fails?('FALLAS: '+fails):'TODO OK');process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
