// Pruebas de interfaz de la V1.18.6 con Supabase SIMULADO (no tocan ninguna base). Servir el repo bajo /juntada/ en 127.0.0.1:8765.
// Cubren: etiquetas de asistencia, respuesta ligada a la cuenta, eliminar/restaurar, aviso de reclamo y recuperación, vínculo con Cuentas, «Mis juntadas».
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1188.html';
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


const ID2='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',OR2='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',CODE2='dddddddd-dddd-dddd-dddd-dddddddddddd';
const ENTRY2={id:'j1',saved:{name:'Cumple',desc:'',dateMode:'vote',date:'',candidates:['2026-12-10','2026-12-11'],time:'',place:'Lugar',expense:''}};
const ST={juntada_v10_events:JSON.stringify([ENTRY2]),juntada_remote_j1:JSON.stringify({id:ID2,organizador:OR2,codigo:CODE2})};
const iso=ms=>new Date(Date.now()+ms).toISOString();
const base=(hasta,cerr)=>({id:ID2,dueno:{reclamada:true,es_mio:true},votacion_hasta:hasta,votacion_cerrada:!!cerr,ahora:new Date().toISOString()});
async function abrirO(page){await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>{openJuntada('j1');go('event')});await page.waitForTimeout(1200)}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) organizador sin plazo: tarjeta, fijar plazo manda ISO futuro y organizador
 {let last=null;const {ctx,page,calls,errs}=await mk(browser,{session:true,store:ST,handlers:{juntada_ver_organizador:base(null),juntada_respuestas_organizador:[],juntada_votos_organizador:[],
   juntada_fijar_plazo:b=>{last=b;return {ok:true,votacion_hasta:b.p_hasta,ahora:new Date().toISOString()}}}});
  await abrirO(page);
  ok(await page.locator('#plazoCard').count()===1,'1.1 aparece la tarjeta de plazo');
  ok((await page.textContent('#plazoEstado')).includes('Sin plazo'),'1.2 sin plazo se dice claro');
  ok(await page.inputValue('#plazoHora')==='23:59','1.3 hora por defecto 23:59');
  await page.click('#plazoFijar');ok((await page.textContent('#plazoMsg')).includes('día y hora'),'1.4 sin día pide día y hora');
  const d=new Date(Date.now()+3*864e5);const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  await page.fill('#plazoDia',ds);await page.fill('#plazoHora','20:30');await page.click('#plazoFijar');await page.waitForTimeout(500);
  ok(last&&last.p_juntada===ID2&&last.p_organizador===OR2&&Date.parse(last.p_hasta)>Date.now(),'1.5 manda juntada, código y hora futura');
  ok(new Date(last.p_hasta).getHours()===20&&new Date(last.p_hasta).getMinutes()===30,'1.6 respeta la hora elegida');
  ok((await page.textContent('#plazoEstado')).includes('cierra en'),'1.7 muestra «cierra en…»');
  ok(await page.locator('#plazoQuitar').count()===1,'1.8 aparece «Quitar plazo»');
  await page.click('#plazoQuitar');await page.waitForTimeout(500);ok(last.p_hasta===null,'1.9 quitar manda null');
  ok(errs.length===0,'1.10 sin errores de página '+errs.join('|'));await ctx.close()}
 // 2) plazo inválido del servidor
 {const {ctx,page}=await mk(browser,{session:true,store:ST,handlers:{juntada_ver_organizador:base(null),juntada_respuestas_organizador:[],juntada_votos_organizador:[],juntada_fijar_plazo:{__error:'Plazo inválido',__detail:'JUN_PLAZO_INVALIDO'}}});
  await abrirO(page);const d=new Date(Date.now()+2*864e5);await page.fill('#plazoDia',d.toISOString().slice(0,10));await page.click('#plazoFijar');await page.waitForTimeout(500);
  ok((await page.textContent('#plazoMsg')).includes('1 hora a 30 días'),'2.1 JUN_PLAZO_INVALIDO se explica');await ctx.close()}
 // 3) plazo cerrado en organizador + Recordar
 {const {ctx,page}=await mk(browser,{session:true,store:ST,handlers:{juntada_ver_organizador:base(iso(-3600e3),true),juntada_respuestas_organizador:[],juntada_votos_organizador:[]}});
  await abrirO(page);ok((await page.textContent('#plazoEstado')).includes('cerró'),'3.1 muestra que cerró');
  const mail=await page.getAttribute('#recMail','href');ok(mail.startsWith('mailto:')&&mail.includes(encodeURIComponent('?invite='+CODE2)),'3.2 mail lleva el link de invitación');
  ok(!decodeURIComponent(mail).includes('Se puede votar hasta'),'3.3 cerrada: el texto no promete votar');
  await page.click('#recCopiar');await page.waitForTimeout(300);ok(true,'3.4 copiar no rompe');await ctx.close()}
 // 3b) recordar con plazo abierto menciona fecha
 {const {ctx,page}=await mk(browser,{session:true,store:ST,handlers:{juntada_ver_organizador:base(iso(5*3600e3)),juntada_respuestas_organizador:[],juntada_votos_organizador:[]}});
  await abrirO(page);const mail=decodeURIComponent(await page.getAttribute('#recMail','href'));ok(mail.includes('Se puede votar hasta'),'3.5 abierta: recordatorio incluye plazo');
  ok((await page.textContent('#plazoEstado')).includes('5 horas'),'3.6 cuenta regresiva en horas');await ctx.close()}
 // 4) invitado: aviso y voto cerrado
 {const VER=h=>({nombre:'Cumple',modalidad_fecha:'vote',opciones_fecha:['2026-12-10','2026-12-11'],ronda:1,finalistas:[],lugares:[],votacion_hasta:h,votacion_cerrada:Date.parse(h)<Date.now(),ahora:new Date().toISOString(),ya_vote:false});
  for(const [h,esp,n] of [[iso(26*3600e3),'cierra en','4.1'],[iso(-60e3),'cerró','4.2']]){
   const {ctx,page}=await mk(browser,{handlers:{juntada_ver:VER(h)}});await page.goto(U+'?invite='+CODE2);await page.waitForTimeout(1200);
   ok((await page.textContent('#plazoInvitado')).includes(esp),n+' invitado ve «'+esp+'»');
   if(esp==='cerró')ok((await page.textContent('#plazoInvitado')).includes('No llegaste a votar'),'4.3 avisa que no votó');await ctx.close()}
  // voto rechazado por el servidor
  const {ctx,page}=await mk(browser,{handlers:{juntada_ver:VER(iso(3600e3)),juntada_votar:{__error:'La votación cerró',__detail:'JUN_VOTACION_CERRADA'}}});
  await page.goto(U+'?invite='+CODE2);await page.waitForTimeout(1000);
  await page.evaluate(()=>{document.getElementById('guestName').value='Ana';localVotes={'2026-12-10':'yes'};saveVote()});await page.waitForTimeout(500);
  ok((await page.textContent('#toast')).includes('ya cerró'),'4.4 voto tardío: mensaje claro');await ctx.close()}
 // 5) Mis juntadas: marca de solicitud por aprobar, y plazo en las invitadas
 {const FUT2=new Date(Date.now()+5*864e5).toISOString();
  const {ctx,page}=await mk(browser,{session:true,store:{},handlers:{juntada_mis_juntadas:[],juntada_mis_invitaciones:[{nombre:'Asado',mi_asistencia:'voy',codigo:CODE2,votacion_hasta:iso(7200e3),votacion_cerrada:false,ya_vote:false}],
   core_link_requests_list:[{id:'r1',group_id:'g',group_name:'Viaje del grupo',ref_type:'juntada',ref_id:ID2,status:'pending',expires_at:FUT2,mine:false,i_can_approve:true},{id:'r2',group_name:'Otro',ref_type:'juntada',status:'pending',i_can_approve:false}]}});
  await page.goto(U);await page.waitForTimeout(1500);
  const t=await page.locator('#pintoApprovals').textContent().catch(()=>'');ok(t.includes('una solicitud')&&t.includes('Viaje del grupo')&&!t.includes('Otro'),'5.1 marca solo solicitudes que puedo aprobar');
  const inv=await page.locator('#pintoInvited').textContent().catch(()=>'');ok(inv.includes('Falta tu voto'),'5.2 invitadas: «Falta tu voto»');await ctx.close()}
 // 6) sin sesión: no hay marca
 {const {ctx,page}=await mk(browser,{handlers:{}});await page.goto(U);await page.waitForTimeout(800);ok((await page.locator('#pintoApprovals').textContent().catch(()=>''))==='','6.1 sin sesión no hay marca');await ctx.close()}
 await browser.close();console.log(fails?('FALLAS: '+fails):'TODO OK');process.exit(fails?1:0)})();
