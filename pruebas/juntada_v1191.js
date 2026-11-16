// Pruebas de interfaz de la V1.19.1 (alineación con Cuentas) con Supabase SIMULADO. Servir el repo bajo /juntada/ en 127.0.0.1:8765.
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1191.html';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
async function mk(browser,{session=false}={}){
 const ctx=await browser.newContext({viewport:{width:400,height:900}});const page=await ctx.newPage();
 await page.addInitScript(s=>{if(s)localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'tok',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}))},session);
 const calls=[],errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.route('**/*',async r=>{const u=r.request().url();
  if(u.includes('boninip.github.io/cuentas')){calls.push({cuentas:true});return r.fulfill({status:200,contentType:'text/html',body:'<html>cuentas</html>'})}
  if(!u.includes('supabase.co'))return r.continue();
  calls.push({url:u,body:r.request().postData()});return r.fulfill({status:200,contentType:'application/json',body:'{}'})});
 return {ctx,page,calls,errs};
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) sin sesión
 {const {ctx,page,calls,errs}=await mk(browser);
  await page.goto(U);await page.waitForTimeout(1200);
  ok(await page.locator('#homeLoginCard').isVisible(),'1.1 inicio sin sesión: invita a ingresar con Pintó ID');
  const txt=await page.textContent('#home');
  ok(txt.includes('Mis planes')&&!txt.includes('Mis planes y grupos')&&!txt.includes('Mis juntadas'),'1.2 un solo nombre: Mis planes');
  ok(!/Pinto ID/.test(await page.content()),'1.3 se escribe Pintó ID, con acento, en pantalla');
  await page.click('#homeLoginCard');await page.waitForTimeout(400);
  ok(await page.locator('#miCuenta.active').count()===1&&await page.locator('#cuEmail').isVisible(),'1.4 abre Cuenta con campo de email');
  await page.fill('#cuEmail','mal');await page.click('#cuEnviar');
  ok((await page.textContent('#cuMsg')).includes('email válido'),'1.5 email inválido: avisa');
  await page.fill('#cuEmail','x@test.com');await page.click('#cuEnviar');await page.waitForTimeout(600);
  const o=calls.find(c=>c.url&&c.url.includes('/auth/v1/otp'));
  ok(o&&JSON.parse(o.body).email==='x@test.com','1.6 pide el enlace de acceso por mail');
  ok((await page.textContent('#cuMsg')).includes('Revisá tu correo'),'1.7 avisa que revise el correo');
  await page.click('#cuBack');await page.waitForTimeout(300);
  ok(await page.locator('#home.active').count()===1,'1.8 volver lleva al inicio');
  ok(errs.length===0,'1.9 sin errores de página '+errs.join('|'));await ctx.close()}
 // 2) con sesión
 {const {ctx,page,errs}=await mk(browser,{session:true});
  await page.goto(U);await page.waitForTimeout(1200);
  ok(await page.locator('#homeLoginCard').count()===0,'2.1 con sesión no aparece la invitación a ingresar');
  await page.click('#home .avatar');await page.waitForTimeout(400);
  ok((await page.textContent('#cuBody')).includes('p@test.com'),'2.2 el avatar abre Cuenta y muestra el email');
  await page.click('#cuSalir');await page.waitForTimeout(300);
  ok(await page.evaluate(()=>localStorage.getItem('planazo_auth_v1'))===null,'2.3 cerrar sesión borra la sesión');
  ok(await page.locator('#cuEmail').isVisible(),'2.4 después de salir ofrece ingresar');
  await page.click('#cuBack');await page.waitForTimeout(300);
  ok(await page.locator('#homeLoginCard').isVisible(),'2.5 el inicio vuelve a invitar a ingresar');
  ok(errs.length===0,'2.6 sin errores de página');await ctx.close()}
 // 3) menú lateral
 {const {ctx,page}=await mk(browser,{session:true});
  await page.goto(U);await page.waitForTimeout(1500);
  await page.click('#home .j-menu-trigger');await page.waitForTimeout(300);
  const t=await page.textContent('#jMenuOverlay');
  ok(t.includes('Cuenta')&&!t.includes('Mi perfil')&&t.includes('Mis planes'),'3.1 el menú dice Cuenta y Mis planes');
  await page.locator('#jMenuOverlay .j-menu-item',{hasText:'Cuenta'}).click();await page.waitForTimeout(400);
  ok(await page.locator('#miCuenta.active').count()===1,'3.2 «Cuenta» del menú abre la pantalla');await ctx.close()}
 // 4) gastos van a Cuentas
 {const {ctx,page,calls}=await mk(browser,{session:true});
  await page.goto(U);await page.waitForTimeout(1200);
  const txt=await page.textContent('#home');
  ok(txt.includes('Se abre en Cuentas'),'4.1 «Compartir gastos» avisa que se abre en Cuentas');
  await page.locator('#home .juntada-home-list-item',{hasText:'Compartir gastos'}).click();await page.waitForTimeout(600);
  ok(calls.some(c=>c.cuentas),'4.2 «Compartir gastos» abre Cuentas');await ctx.close()}
 {const {ctx,page,calls}=await mk(browser,{session:true});
  await page.goto(U);await page.waitForTimeout(1200);
  await page.locator('#home .juntada-home-list-item',{hasText:'Mi balance general'}).click();await page.waitForTimeout(600);
  ok(calls.some(c=>c.cuentas),'4.3 «Mi balance general» abre Cuentas');await ctx.close()}
 // 5) panel del organizador sin texto viejo
 {const html=require('fs').readFileSync(__dirname+'/../preview-v1191.html','utf8');
  ok(!html.includes('todavía no está habilitada')&&!html.includes('No hay solicitudes verificadas'),'5.1 desaparece el texto viejo «no habilitada»')}
 await browser.close();console.log(fails?'HAY FALLAS: '+fails:'TODO OK');process.exit(fails?1:0)})();
