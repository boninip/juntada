const {chromium}=require('playwright');const assert=require('assert');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
const ok=(c,m)=>{assert.ok(c,m);console.log('ok   '+m)};
async function mk(scenario){const ctx=await b.newContext({viewport:{width:360,height:780}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const calls=[];
 await p.route('**/*supabase.co/**',async r=>{const u=r.request().url();const fn=(u.match(/rpc\/([a-z_]+)/)||[])[1];calls.push(fn);const h=scenario[fn];const body=typeof h==='function'?h(JSON.parse(r.request().postData()||'{}')):(h===undefined?[]:h);await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)})});
 return {ctx,p,errs,calls}}
const en5h=new Date(Date.now()+5*36e5).toISOString();
// 1) con datos: plazo por vencer + pedidos de ingreso (local con credencial y juntada de otro celular)
{const {ctx,p,errs,calls}=await mk({juntada_ver:{id:'R1',fecha:'2026-12-24',votacion_hasta:en5h,votacion_cerrada:false},juntada_mis_invitaciones:[{nombre:'Asado QA',codigo:'C1',votacion_hasta:en5h,votacion_cerrada:false,ya_vote:false,ahora:new Date().toISOString()}],juntada_solicitudes:[{estado:'pendiente',nombre:'Ana'},{estado:'aprobada',nombre:'Beto'}],juntada_mis_eventos:[{id:'R9',nombre:'Fiesta de Ana',rol:'coorganizador'}]});
 await p.addInitScript(()=>{localStorage.setItem('juntada_v10_events',JSON.stringify([{id:'a1',saved:{name:'Asado QA',date:''}}]));localStorage.setItem('juntada_remote_a1',JSON.stringify({id:'R1',codigo:'C1',organizador:'O1'}));localStorage.setItem('planazo_auth_v1',JSON.stringify({refresh_token:'x',access_token:'tok',expires_at:Date.now()+3600000,email:'p@test.com'}))});
 await p.goto('http://127.0.0.1:8765/juntada/index.html');await p.waitForTimeout(4000);
 ok(await p.locator('#home .j-bell').isVisible(),'campanita visible en el inicio');
 const bd=(await p.locator('#home .j-bell i').innerText()).trim();ok(bd==='3'||bd==='2','contador muestra pendientes ('+bd+')');
 const bb=await p.locator('#home .j-bell').boundingBox();ok(bb.width>=44&&bb.height>=44,'campanita de 44 px');
 await p.click('#home .j-bell');await p.waitForTimeout(500);
 const txt=await p.locator('#jActOverlay').innerText();ok(/Vence en 5 h/.test(txt)&&/Asado QA/.test(txt),'lista el plazo por vencer');ok(/pedido de ingreso/.test(txt)&&/Fiesta de Ana/.test(txt),'lista pedidos de una juntada de otro celular');
 await p.keyboard.press('Escape');ok(await p.locator('#jActOverlay').isHidden(),'Escape cierra');
 await p.click('#home .j-bell');await p.click('#jActOverlay .act-item >> nth=0');await p.waitForTimeout(600);ok(await p.evaluate(()=>document.querySelector('.screen.active').id)!=='home','tocar un aviso abre esa pantalla');
 await p.evaluate(()=>go('miCuenta'));await p.waitForTimeout(1200);ok(await p.locator('#miCuenta .j-bell').count()===1,'campanita tambien en Mi perfil');
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'sin scroll horizontal');
 ok(errs.length===0,'sin errores de pagina '+errs.join(';'));await ctx.close()}
// 1b) descartar avisos y distancia al perfil
{const {ctx,p,errs}=await mk({juntada_ver:{id:'R1',fecha:'2026-12-24',votacion_hasta:en5h,votacion_cerrada:false},juntada_mis_invitaciones:[{nombre:'Asado QA',codigo:'C1',votacion_hasta:en5h,votacion_cerrada:false,ya_vote:false,ahora:new Date().toISOString()}],juntada_solicitudes:[{estado:'pendiente'}]});
 await p.addInitScript(()=>{localStorage.setItem('juntada_v10_events',JSON.stringify([{id:'a1',saved:{name:'Asado QA',date:''}}]));localStorage.setItem('juntada_remote_a1',JSON.stringify({id:'R1',codigo:'C1',organizador:'O1'}));localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'t',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}))});
 await p.goto('http://127.0.0.1:8765/juntada/index.html');await p.waitForTimeout(4000);
 const g=await p.evaluate(()=>{const b=document.querySelector('#home .j-bell').getBoundingClientRect(),a=document.querySelector('#home header .avatar').getBoundingClientRect();return a.left-b.right});
 ok(g>=0&&g<=16,'JUN-QA-062 la campanita queda pegada al perfil (separación '+Math.round(g)+' px)');
 const n0=+(await p.locator('#home .j-bell i').innerText()).replace('+','');
 await p.click('#home .j-bell');await p.waitForTimeout(400);
 const antes=await p.locator('#jActOverlay .act-fila').count();
 ok(antes>=2&&await p.locator('#jActOverlay .act-x').count()===antes,'JUN-QA-063 cada aviso tiene su botón para descartarlo');
 await p.locator('#jActOverlay .act-x').first().click();await p.waitForTimeout(300);
 ok(await p.locator('#jActOverlay .act-fila').count()===antes-1,'JUN-QA-064 descartar saca ese aviso');
 ok(+(await p.locator('#home .j-bell i').innerText().catch(()=>'0')||0)<n0,'JUN-QA-064b baja el contador');
 await p.keyboard.press('Escape');await p.reload();await p.waitForTimeout(4000);await p.click('#home .j-bell');await p.waitForTimeout(400);
 ok(await p.locator('#jActOverlay .act-fila').count()===antes-1,'JUN-QA-065 al recargar el aviso descartado no vuelve');
 if(await p.locator('#jActOverlay .act-limpiar').count()){await p.locator('#jActOverlay .act-limpiar').click();await p.waitForTimeout(300)}
 else await p.locator('#jActOverlay .act-x').first().click();
 await p.waitForTimeout(300);
 ok(await p.locator('#jActOverlay .act-fila').count()===0&&(await p.locator('#jActOverlay').innerText()).includes('nada pendiente'),'JUN-QA-066 «Limpiar todo» deja la lista vacía');
 ok(await p.locator('#home .j-bell i').isHidden(),'JUN-QA-066b sin contador al limpiar');
 ok(errs.length===0,'sin errores de página '+errs.join(';'));await ctx.close()}
// 2) sin nada: sin contador y con texto vacio
{const {ctx,p,errs}=await mk({});await p.goto('http://127.0.0.1:8765/juntada/index.html');await p.waitForTimeout(1500);
 ok(await p.locator('#home .j-bell i').isHidden(),'sin pendientes no hay contador');
 await p.click('#home .j-bell');ok((await p.locator('#jActOverlay').innerText()).includes('nada pendiente'),'mensaje de vacio');
 ok(errs.length===0,'sin errores (vacio)');await ctx.close()}
await b.close();console.log('TODO OK')})().catch(e=>{console.error(e);process.exit(1)})
