// Pruebas de interfaz de la V1.18.6 con Supabase SIMULADO (no tocan ninguna base). Servir el repo bajo /juntada/ en 127.0.0.1:8765.
// Cubren: etiquetas de asistencia, respuesta ligada a la cuenta, eliminar/restaurar, aviso de reclamo y recuperación, vínculo con Cuentas, «Mis juntadas».
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1186.html';
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
  if(res&&res.__error)return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:res.__error})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(res)})});
 return {ctx,page,calls,errs};
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) invitado sin cuenta: etiquetas nuevas, valores guardados viejos, sin sesión
 {const {ctx,page,calls,errs}=await mk(browser,{handlers:{juntada_ver:{id:ID,nombre:'Cumple',descripcion:'',fecha:'sáb',hora:'20:00',lugar:'Casa',modalidad_fecha:'fixed',opciones_fecha:[],gastos:'',lugares:[],fecha_confirmada:'',cancelada:false,ronda:1,finalistas:[]},juntada_responder:{ok:true,id:RID,ligada:false}}});
  await page.goto(U+'?invite='+CODE);await page.waitForTimeout(900);
  const labels=await page.$$eval('.rsvp button',b=>b.map(x=>x.textContent.trim()));
  ok(JSON.stringify(labels)===JSON.stringify(['Voy','Aún no sé','No voy']),'asistencia: botones «Voy / Aún no sé / No voy» ('+labels.join(' | ')+')');
  await page.fill('#guestName','Ana');await page.click('.rsvp button:has-text("No voy")');await page.waitForTimeout(500);
  const c=calls.find(x=>x.fn==='juntada_responder');
  ok(c&&c.body.p_asistencia==='no_puedo','asistencia: «No voy» guarda el valor de siempre (no_puedo)');
  ok(c&&c.auth===null,'invitado sin sesión: la llamada va anónima');
  ok(/No voy/.test(await page.textContent('#rsvpStatus')),'asistencia: el estado muestra «No voy»');
  ok(JSON.parse(await page.evaluate(k=>localStorage.getItem(k),'juntada_resp_'+CODE)).ligada===false,'respuesta anónima: queda guardado su id para ligarla después');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 2) invitado con sesión: se liga y avisa
 {const {ctx,page,calls,errs}=await mk(browser,{session:true,handlers:{juntada_ver:{id:ID,nombre:'Cumple',descripcion:'',fecha:'sáb',hora:'20:00',lugar:'Casa',modalidad_fecha:'fixed',opciones_fecha:[],gastos:'',lugares:[],fecha_confirmada:'',cancelada:false,ronda:1,finalistas:[]},juntada_responder:{ok:true,id:RID,ligada:true}}});
  await page.goto(U+'?invite='+CODE);await page.waitForTimeout(900);
  await page.fill('#guestName','Beto');await page.click('.rsvp button:has-text("Aún no sé")');await page.waitForTimeout(500);
  const c=calls.find(x=>x.fn==='juntada_responder');
  ok(c&&c.body.p_asistencia==='tal_vez','«Aún no sé» guarda tal_vez');
  ok(c&&c.auth==='Bearer tok','invitado con sesión: la llamada lleva la sesión de Pinto ID');
  ok(/ligada a tu cuenta Pinto ID/.test(await page.textContent('#rsvpStatus')),'invitado con sesión: aviso en pantalla de que quedó ligada');
  ok(/Beto/.test(await page.textContent('#rsvpStatus')),'el nombre que se muestra es el que escribió');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 2b) sesión vencida: no se manda (evita 401 al invitado)
 {const {ctx,page,calls}=await mk(browser,{handlers:{juntada_ver:{id:ID,nombre:'Cumple',descripcion:'',fecha:'',hora:'',lugar:'',modalidad_fecha:'fixed',opciones_fecha:[],gastos:'',lugares:[],fecha_confirmada:'',cancelada:false,ronda:1,finalistas:[]},juntada_responder:{ok:true,id:RID,ligada:false}}});
  await page.addInitScript(()=>localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'viejo',refresh_token:'r',expires_at:Date.now()-1000,email:'x'})));
  await page.goto(U+'?invite='+CODE);await page.waitForTimeout(900);await page.fill('#guestName','Cleo');await page.click('.rsvp button:has-text("Voy")');await page.waitForTimeout(500);
  const c=calls.find(x=>x.fn==='juntada_responder');ok(c&&c.auth===null,'sesión vencida: la respuesta va anónima, no se rompe');await ctx.close()}
 // 3) organizador local: aviso de reclamo y recuperación con su código
 {const {ctx,page,calls,errs}=await mk(browser,{store:{juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,organizador:OR,codigo:CODE})},handlers:{juntada_ver_organizador:{id:ID,dueno:{reclamada:true,es_mio:false}},juntada_respuestas_organizador:[],juntada_votos_organizador:[],juntada_recuperar:{ok:true,recuperada:true,organizador:NEW}}});
  await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>{openJuntada('j1');go('event')});await page.waitForTimeout(300);await page.evaluate(()=>loadResponses());await page.waitForTimeout(700);
  ok(await page.isVisible('#pintoOwnerNotice'),'reclamo ajeno: el organizador local ve el aviso');
  await page.click('#pintoRecover');ok(!calls.some(c=>c.fn==='juntada_recuperar'),'recuperar: el primer toque solo pide confirmar');
  await page.click('#pintoRecover');await page.waitForTimeout(500);
  ok(calls.some(c=>c.fn==='juntada_recuperar'&&c.body.p_organizador===OR),'recuperar: llama con su código');
  ok(JSON.parse(await page.evaluate(()=>localStorage.getItem('juntada_remote_j1'))).organizador===NEW,'recuperar: guarda el código nuevo en el celular');
  ok(!(await page.isVisible('#pintoOwnerNotice')),'recuperar: el aviso desaparece');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 3b) dueño propio: sin aviso
 {const {ctx,page}=await mk(browser,{store:{juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,organizador:OR,codigo:CODE})},handlers:{juntada_ver_organizador:{id:ID,dueno:{reclamada:true,es_mio:true}},juntada_respuestas_organizador:[],juntada_votos_organizador:[]}});
  await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>{openJuntada('j1');go('event')});await page.evaluate(()=>loadResponses());await page.waitForTimeout(600);
  ok(!(await page.isVisible('#pintoOwnerNotice')),'dueño: no ve aviso de reclamo');await ctx.close()}
 // 4) eliminar (baja lógica) → papelera → restaurar
 {const {ctx,page,calls,errs}=await mk(browser,{store:{juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,organizador:OR,codigo:CODE})},handlers:{juntada_eliminar:{ok:true},juntada_restaurar:{ok:true,restaurada:true}}});
  await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>deleteLocalJuntada('j1'));await page.click('[data-choice="yes"]');await page.waitForTimeout(600);
  ok(calls.some(c=>c.fn==='juntada_eliminar'&&c.body.p_juntada===ID&&c.body.p_organizador===OR),'eliminar: usa la baja lógica con su código');
  ok(!calls.some(c=>c.fn==='juntada_actualizar'),'eliminar: ya no usa la cancelación irreversible');
  ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('juntada_v10_events')).length===0),'eliminar: sale de la lista');
  await page.evaluate(()=>{go('myEvents');showMyEvents()});await page.waitForTimeout(300);
  ok(/Cumple/.test(await page.textContent('#papeleraBox')),'papelera: aparece en «Eliminadas»');
  await page.click('[data-restore]');await page.waitForTimeout(600);
  ok(calls.some(c=>c.fn==='juntada_restaurar'&&c.body.p_organizador===OR),'restaurar: llama con su código');
  ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('juntada_v10_events')).length===1&&!!localStorage.getItem('juntada_remote_j1')),'restaurar: vuelve a la lista con su acceso de organizadora');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 5) vínculo con Cuentas (lado Juntada)
 {let linked=null;const {ctx,page,calls,errs}=await mk(browser,{session:true,store:{juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,organizador:OR,codigo:CODE})},handlers:{
   core_link_for_ref:()=>linked,cuentas_my_groups:[{id:G,name:'Viaje del grupo',status:'active',role:'admin'},{id:'zz',name:'Viejo',status:'archived',role:'admin'}],
   core_link_create:b=>{if(b.p_group==='ERR')return{__error:'No autorizado'};linked={link_id:L,group_id:b.p_group,group_name:'Viaje del grupo'};return L},core_link_remove:()=>{linked=null;return null},juntada_ver_organizador:{id:ID,dueno:{reclamada:false,es_mio:false}},juntada_respuestas_organizador:[],juntada_votos_organizador:[]}});
  await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>{openJuntada('j1');go('event');tab('despues',document.querySelectorAll('.seg button')[1])});await page.waitForTimeout(900);
  ok(await page.isVisible('#cuentasLinkCard'),'Cuentas: aparece la tarjeta en «Cerrar cuentas»');
  ok((await page.$$eval('#cuentasGroupSel option',o=>o.map(x=>x.textContent))).join('|')==='Viaje del grupo','Cuentas: ofrece solo grupos no archivados');
  await page.click('#cuentasLinkBtn');await page.waitForTimeout(700);
  ok(calls.some(c=>c.fn==='core_link_create'&&c.body.p_ref_type==='juntada'&&c.body.p_ref_id===ID&&c.body.p_organizer===OR&&c.body.p_group===G),'Cuentas: vincula con el id del evento y su código');
  ok(/Viaje del grupo/.test(await page.textContent('#cuentasLinkCard'))&&/no borra nada de Cuentas/.test(await page.textContent('#cuentasLinkCard')),'Cuentas: muestra el grupo vinculado y que eliminar no borra Cuentas');
  await page.click('#cuentasUnlink');await page.waitForTimeout(700);
  ok(calls.some(c=>c.fn==='core_link_remove'&&c.body.p_link===L),'Cuentas: desvincula');
  ok(await page.isVisible('#cuentasLinkBtn'),'Cuentas: tras desvincular vuelve a ofrecer vincular');
  await page.evaluate(()=>{document.getElementById('cuentasGroupSel').innerHTML='<option value="ERR">x</option>'});await page.click('#cuentasLinkBtn');await page.waitForTimeout(600);
  ok(/Necesitás poder vincular en ese grupo/.test(await page.textContent('#cuentasLinkMsg')),'Cuentas: el error del servidor se explica en criollo');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await ctx.close()}
 // 5b) sin sesión: pide ingresar
 {const {ctx,page}=await mk(browser,{store:{juntada_v10_events:JSON.stringify([ENTRY]),juntada_remote_j1:JSON.stringify({id:ID,organizador:OR,codigo:CODE})},handlers:{juntada_ver_organizador:{id:ID,dueno:{reclamada:false}},juntada_respuestas_organizador:[],juntada_votos_organizador:[]}});
  await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>{openJuntada('j1');go('event');tab('despues',document.querySelectorAll('.seg button')[1])});await page.waitForTimeout(600);
  ok(/ingresá con tu Pinto ID/i.test(await page.textContent('#cuentasLinkCard')),'Cuentas sin sesión: indica ingresar con Pinto ID');await ctx.close()}
 // 6) Mis juntadas en Pinto: eliminadas del dueño, juntadas a las que respondí, ligar respuestas
 {const {ctx,page,calls,errs}=await mk(browser,{session:true,store:{['juntada_resp_'+CODE]:JSON.stringify({id:RID,ligada:false})},handlers:{
   juntada_mis_eventos:[{id:ID,nombre:'Vigente',fecha_texto:'sáb',cancelada:false,suspendida:false,eliminada_at:null},{id:'ffffffff-ffff-ffff-ffff-ffffffffffff',nombre:'Borrada',fecha_texto:'',cancelada:false,suspendida:false,eliminada_at:'2026-11-10T00:00:00Z'}],
   juntada_mis_invitaciones:[{id:'x1',nombre:'Asado',fecha_texto:'dom',mi_asistencia:'tal_vez',codigo:CODE}],juntada_vincular_respuesta:{ok:true},juntada_restaurar:{ok:true,restaurada:true}}});
  await page.goto(U);await page.waitForTimeout(600);await page.evaluate(()=>go('accounts'));await page.waitForTimeout(1000);await page.evaluate(()=>{document.getElementById('pintoMine').open=true});
  const t=await page.textContent('#pintoMine');
  ok(/Vigente/.test(t)&&!/Vigente[\s\S]*Borrada[\s\S]*Vigente/.test(t),'Mis juntadas: lista la vigente');
  ok(/Eliminadas/.test(t)&&/Borrada/.test(t),'Mis juntadas: las eliminadas van aparte');
  ok(/Asado/.test(t)&&/Aún no sé/.test(t),'Mis juntadas: muestra a cuáles respondí, con la etiqueta nueva');
  await page.click('#pintoLinkResp');await page.waitForTimeout(600);
  ok(calls.some(c=>c.fn==='juntada_vincular_respuesta'&&c.body.p_respuesta===RID),'ligar respuestas: usa el id guardado en el celular');
  ok(/el nombre que ven los demás sigue siendo el que escribiste/i.test(await page.textContent('#planazoMessage')),'ligar respuestas: aclara que el nombre visible no cambia');
  await page.click('[data-rest]');await page.waitForTimeout(600);
  ok(calls.some(c=>c.fn==='juntada_restaurar'&&c.body.p_organizador===null),'restaurar como dueño: sin código, por cuenta');
  ok(errs.length===0,'sin errores de JS '+errs.join('|'));await page.screenshot({path:'/tmp/jun-v1186.png',fullPage:true});await ctx.close()}
 await browser.close();console.log(fails?('\n'+fails+' FALLAS'):'\nTODO OK');process.exit(fails?1:0)})();
