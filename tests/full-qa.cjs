// QA de la pantalla publicada (index.html) desde V1.19.5. Reemplaza la versión anterior, que probaba los gastos locales
// con persistencia; desde V1.17.4 esos gastos son una vista previa que no guarda datos (los gastos reales viven en Cuentas).
// Corre en Chromium o WebKit (JUNTADA_BROWSER=webkit, JUNTADA_DEVICE=...). Sin Supabase: se bloquea la red hacia supabase.co.
const {chromium,webkit,devices}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const ios=process.env.JUNTADA_BROWSER==='webkit';
 const browser=ios?await webkit.launch():await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 const page=await browser.newPage(ios?{...devices[process.env.JUNTADA_DEVICE||'iPhone 13']}:{viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
 await page.addInitScript(()=>{try{if(!localStorage.getItem('juntada_theme'))localStorage.setItem('juntada_theme','light')}catch(e){}});
 const open=async id=>page.evaluate(id=>go(id),id);
 await page.goto('http://127.0.0.1:8765/');
 await page.evaluate(()=>{const t=localStorage.getItem('juntada_theme');localStorage.clear();localStorage.setItem('juntada_theme',t||'light')});await page.reload();
 assert.equal(await page.locator('.screen.active').getAttribute('id'),'home');console.log('PASS home initial');
 assert.equal(await page.locator('#home .juntada-home-list-item').count(),4);console.log('PASS navigation rows');
 assert.equal(await page.locator('#homeLoginCard').count(),0);console.log('PASS sin tarjeta de login en el inicio');
 const css=await page.evaluate(()=>{const g=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim().toUpperCase();return [g('--primario'),g('--fondo'),g('--navy')]});
 assert.deepEqual(css,['#1F5F6B','#FAF8F4','#1F5F6B']);console.log('PASS tokens comunes cargados (claro)');
 for(const id of ['create','accounts','balances','myEvents','quickExpense','newExpenseGroup']){await open(id);assert.equal(await page.locator('.screen.active').getAttribute('id'),id);console.log('PASS screen '+id)}
 await open('home');await page.click('#home .avatar');assert.equal(await page.locator('.screen.active').getAttribute('id'),'miCuenta');console.log('PASS el ícono de nombre abre Cuenta');
 await open('newExpenseGroup');await page.locator('#expenseGroupName').fill('QA Viaje');await page.locator('#expenseGroupPeople').fill('Yo, Ana, Ger');
 await page.locator('#newExpenseGroup button.btn').last().click();
 const groups=await page.evaluate(()=>JSON.parse(localStorage.getItem('juntada_expense_groups_v1')||'[]'));
 assert.equal(groups.length,1);assert.deepEqual(groups[0].members,['Yo','Ana','Ger']);console.log('PASS group creation');
 await page.reload();await open('balances');
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('juntada_expense_groups_v1')||'[]'))).length,1);console.log('PASS reload persistence');
 const rel=await page.evaluate(async()=>{const r=await fetch('./release.json?_t='+Date.now(),{cache:'no-store'});return r.json()});
 const meta=await page.evaluate(()=>document.querySelector('meta[name="juntada-build"]').content);
 assert.equal(rel.build,meta);console.log('PASS release.json coincide con la build de la pantalla ('+meta+')');
 assert.equal(errors.length,0,'Browser runtime errors: '+errors.join(' | '));
 await browser.close();console.log('FULL LOCAL QA PASS');
})().catch(e=>{console.error(e);process.exit(1)});
