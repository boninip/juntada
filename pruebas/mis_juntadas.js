// Prueba de «Mis juntadas en Pinto» con Supabase simulado. Servir el repo bajo /juntada/ en 127.0.0.1:8765 (el HTML usa <base href="/juntada/">).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:400,height:900}});const page=await ctx.newPage();
const ID='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',OR='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
await page.addInitScript(([i,o])=>{localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'t',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}));localStorage.setItem('juntada_remote_j1',JSON.stringify({id:i,organizador:o}))},[ID,OR]);
const calls=[];let owned=[];
await page.route('**/*',async r=>{const u=r.request().url();if(!u.includes('supabase.co'))return r.continue();const fn=u.split('/rpc/')[1];calls.push(fn+' '+r.request().postData());
 const J=v=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(v)});
 if(fn==='juntada_mis_eventos')return J(owned);
 if(fn==='juntada_reclamar'){owned=[{id:ID,nombre:'Cumple',fecha_texto:'sáb 20',cancelada:false,suspendida:false}];return J(null)}
 return J(null)});
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto('http://127.0.0.1:8765/juntada/preview-v1184.html');await page.waitForTimeout(600);
await page.evaluate(()=>go('accounts'));await page.waitForTimeout(800);console.log(await page.evaluate(()=>JSON.stringify({s:[...document.querySelectorAll('.screen')].filter(x=>getComputedStyle(x).display!=='none').map(x=>x.id),mh:document.getElementById('pintoMine').hidden,uh:document.getElementById('planazoUser').hidden,claim:document.getElementById('pintoClaim').hidden})));
await page.evaluate(()=>{document.getElementById('pintoMine').open=true});const ok=(c,m)=>console.log(c?'ok   ':'FALLA',m);
ok(await page.isVisible('#pintoMine'),'mis juntadas: visible con sesión');
ok(/Todavía no tenés/.test(await page.textContent('#pintoMineList')),'mis juntadas: vacío al principio');
ok(await page.isVisible('#pintoClaim')&&!(await page.isVisible('#pintoMineLogin')),'mis juntadas: ofrece vincular las del celu');
await page.click('#pintoClaim');await page.waitForTimeout(500);
ok(calls.some(c=>c.startsWith('juntada_reclamar')&&c.includes(ID)&&c.includes(OR)),'vincular: llama a juntada_reclamar con el id y el código');
ok(/Cumple/.test(await page.textContent('#pintoMineList')),'mis juntadas: aparece la vinculada');
ok(/1 juntada vinculada/.test(await page.textContent('#planazoMessage')),'vincular: mensaje claro');
ok(errs.length===0,'sin errores de JS '+errs.join('|'));
await page.screenshot({path:'/tmp/jun-mine.png',fullPage:true});
await b.close()})();
