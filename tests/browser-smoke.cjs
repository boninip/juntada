// Humo de index.html: carga sin errores, inicio con 4 filas y el módulo de grupos de gastos inicializa (desde V1.19.5).
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
await page.goto('http://127.0.0.1:8765/');await page.evaluate(()=>localStorage.clear());await page.reload();
console.log('Startup errors:',errors);assert.equal(errors.length,0);
assert.equal(await page.locator('#home .juntada-home-list-item').count(),4);
await page.evaluate(()=>go('newExpenseGroup'));await page.locator('#expenseGroupName').fill('Viaje QA');await page.locator('#expenseGroupPeople').fill('Yo, Ana, Ger');
assert.equal(await page.locator('#newExpenseGroup button.btn').last().isEnabled(),true,'Expense module failed initialization: '+errors.join('; '));
await page.locator('#newExpenseGroup button.btn').last().click();assert.match(await page.locator('#juntadaExpenseGroups').innerText(),/Viaje QA/);
await browser.close();console.log('Browser smoke PASS')})().catch(e=>{console.error(e);process.exit(1)});
