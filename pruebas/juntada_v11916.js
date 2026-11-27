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
// 2) sin nada: sin contador y con texto vacio
{const {ctx,p,errs}=await mk({});await p.goto('http://127.0.0.1:8765/juntada/index.html');await p.waitForTimeout(1500);
 ok(await p.locator('#home .j-bell i').isHidden(),'sin pendientes no hay contador');
 await p.click('#home .j-bell');ok((await p.locator('#jActOverlay').innerText()).includes('nada pendiente'),'mensaje de vacio');
 ok(errs.length===0,'sin errores (vacio)');await ctx.close()}
await b.close();console.log('TODO OK')})().catch(e=>{console.error(e);process.exit(1)})
