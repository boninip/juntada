// V1.19.4 — menú sin ítems vacíos, Gastos hacia Cuentas, logo de Juntada en Mis planes. Supabase SIMULADO. Servir el repo bajo /juntada/ en 127.0.0.1:8765.
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1195.html';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{localStorage.setItem('juntada_v10_events',JSON.stringify([{id:'j1',saved:{name:'Cumple',desc:'',dateMode:'pending',date:'',candidates:[],time:'',place:'Lugar',expense:'split'}}]))});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/*',r=>{const u=r.request().url();if(u.includes('boninip.github.io/cuentas'))return r.fulfill({status:200,contentType:'text/html',body:'cuentas'});if(u.includes('supabase.co'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});return r.continue()});
await p.goto(U);await p.waitForTimeout(1200);
const abrir=async()=>{await p.locator('.j-menu-trigger:visible').first().click();await p.waitForTimeout(300)};
await abrir();
const items=await p.$$eval('.j-menu-item',e=>e.map(x=>x.textContent.trim()));
ok(JSON.stringify(items)===JSON.stringify(['Inicio','Mis planes','Crear juntada','Invitaciones','Gastos','Cuenta']),'1.1 el menú tiene solo ítems con acción: '+items.join(' · '));
ok(!(await p.locator('.j-menu-panel').textContent()).match(/Notificaciones|Configuración|Ayuda|Organización|Votaciones/),'1.2 no hay ítems sin acción ni duplicados');
ok((await p.locator('.j-menu-heading span').first().textContent()).trim()==='Juntada.','1.3 el encabezado del menú dice Juntada.');
await p.locator('.j-menu-close').click();await p.waitForTimeout(300);
// cada ítem hace algo visible
for(const [label,screen] of [['Inicio','home'],['Mis planes','myEvents'],['Crear juntada','create'],['Invitaciones','invitationsHub'],['Cuenta','miCuenta']]){
 await abrir();await p.locator('.j-menu-item',{hasText:label}).first().click();await p.waitForTimeout(500);
 const a=await p.evaluate(()=>{const s=document.querySelector('.screen.active');return s&&s.id});
 ok(a===screen,'2 «'+label+'» abre '+screen+' (abrió '+a+')');
 if(screen==='create'){await p.evaluate(()=>go('home'));await p.waitForTimeout(200)}
}
await p.evaluate(()=>go('home'));await p.waitForTimeout(300);
await abrir();await p.locator('.j-menu-item',{hasText:'Gastos'}).first().click();await p.waitForTimeout(600);
ok(p.url().includes('boninip.github.io/cuentas'),'2.1 «Gastos» abre Cuentas ('+p.url().slice(0,50)+')');
await p.goto(U);await p.waitForTimeout(1000);
await p.evaluate(()=>showMyEvents());await p.waitForTimeout(500);
ok((await p.locator('#myEvents header .logo').textContent()).trim()==='Juntada.','3.1 Mis planes muestra el logo de Juntada');
const t=await p.locator('#myEvents').textContent();
ok(!/próximamente/i.test(t)&&/Cuentas/.test(t),'3.2 Mis planes no promete gastos «próximamente»');
await p.evaluate(()=>go('invitationsHub'));await p.waitForTimeout(300);
const inv=await p.locator('#invitationsHub').textContent();
ok(!/Solicitudes enviadas|requiere la integración/.test(inv)&&/Unirme con código/.test(inv),'3.3 Invitaciones sin sección vacía de «solicitudes enviadas»');
ok(/Juntada/.test(await p.title())&&!/V1\.16/.test(await p.title()),'4.1 el título de la pestaña es de Juntada');
ok(await p.evaluate(()=>!!document.querySelector('link[rel=icon]')),'4.2 hay ícono de pestaña');
// «Pintó» solo con acento en pantalla: sin «Pinto ID»
await p.evaluate(()=>go('home'));const all=await p.evaluate(()=>document.body.innerText);
ok(!/Pinto ID|Planazo/.test(all),'4.3 sin «Pinto ID» ni «Planazo» visibles en el inicio');
// «Cerrar cuentas» sin tarjetas sin acción
await p.goto(U);await p.waitForTimeout(900);
await p.evaluate(()=>{showMyEvents();openJuntada('j1')});await p.waitForTimeout(900);
await p.evaluate(()=>{const t=document.querySelectorAll('#event .juntada-two-tabs button')[1];tab('despues',t)});await p.waitForTimeout(400);
const cc=await p.locator('#event').innerText();
ok(!/Próximamente|Estamos probando|Diseño en prueba/.test(cc),'6.1 «Cerrar cuentas» no tiene tarjetas ni botones «Próximamente»');
ok(/Cerrar cuentas/.test(cc)&&/Ver gastos de esta juntada/.test(cc)&&/Abrir Cuentas/.test(cc)&&!/Total de esta juntada/.test(cc),'6.2 «Cerrar cuentas»: Ver gastos y Abrir Cuentas, sin totales vacíos');
// gastos viejos: aviso en Cuenta solo si hay
await p.goto(U);await p.waitForTimeout(900);await p.evaluate(()=>document.querySelector('.avatar').click());await p.waitForTimeout(300);
ok(await p.locator('#cuViejos').isHidden(),'7.1 sin gastos viejos, Cuenta no ofrece pasarlos');
const ctx2=await b.newContext({viewport:{width:390,height:844}});
await ctx2.addInitScript(()=>{localStorage.setItem('juntada_expenses_v1',JSON.stringify([{id:'e1_aaaa',name:'Asado',payer:'Pau',cents:10000,shares:[{person:'Pau',cents:5000},{person:'Ana',cents:5000}],created:Date.now(),groupId:null}]))});
const p2=await ctx2.newPage();await p2.route('**/*supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'}));
await p2.goto(U);await p2.waitForTimeout(1000);await p2.evaluate(()=>document.querySelector('.avatar').click());await p2.waitForTimeout(300);
ok(await p2.locator('#cuViejos').isVisible()&&/1 gasto guardado/.test(await p2.locator('#cuViejosTxt').textContent()),'7.2 con gastos viejos, Cuenta lo avisa');
await p2.locator('#cuPasar').click();await p2.waitForTimeout(400);
ok((await p2.evaluate(()=>document.querySelector('.screen.active').id))==='balances','7.3 el botón lleva al balance donde está «Pasar a Cuentas»');
await ctx2.close();
ok(errs.length===0,'5 sin errores de página '+errs.join('|'));
await b.close();console.log(fails?'HAY FALLAS':'TODO OK')})();
