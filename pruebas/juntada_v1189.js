// Pruebas de interfaz de la V1.18.6 con Supabase SIMULADO (no tocan ninguna base). Servir el repo bajo /juntada/ en 127.0.0.1:8765.
// Cubren: etiquetas de asistencia, respuesta ligada a la cuenta, eliminar/restaurar, aviso de reclamo y recuperación, vínculo con Cuentas, «Mis juntadas».
const {chromium}=require('playwright');
const U='http://127.0.0.1:8765/juntada/preview-v1189.html';
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



const UID='99999999-9999-9999-9999-999999999999',G1='11111111-1111-1111-1111-111111111111';
const EXP=[{id:'e1_aaaa',name:'Asado',payer:'Pau',cents:10000,shares:[{person:'Pau',cents:5000},{person:'Ana',cents:5000}],created:Date.now(),groupId:null},
 {id:'e2_bbbb',name:'Bebidas',payer:'Ana',cents:3001,shares:[{person:'Pau',cents:1500},{person:'Ana',cents:1501}],created:Date.now(),groupId:null}];
const ST2={juntada_expenses_v1:JSON.stringify(EXP),juntada_settlements_v1:JSON.stringify([{id:'s1',person:'Ana',cents:500,direction:'paidByMe',created:Date.now()}])};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 // 1) pasada completa
 {let n=0;const {ctx,page,calls,errs}=await mk(browser,{session:true,store:ST2,handlers:{'':{id:UID},cuentas_group_create:G1,cuentas_guest_add:()=>'a'+(++n)+'0000000-0000-0000-0000-000000000000',cuentas_expense_add:'m1'}});
  await page.goto(U);await page.waitForTimeout(1500);await page.evaluate(()=>go('balances'));
  ok(await page.locator('#migGastosCard').isVisible(),'1.1 con sesión y gastos aparece la tarjeta');
  await page.click('#migEmpezar');ok((await page.textContent('#migDetalle')).includes('2 gasto')||(await page.textContent('#migDetalle')).includes('1 grupo'),'1.2 muestra resumen');
  ok((await page.textContent('#migDetalle')).includes('1 pago(s) registrados no se pasan'),'1.3 avisa que los pagos no se pasan');
  await page.selectOption('#migYo','Pau');await page.click('#migConfirmar');await page.waitForTimeout(1200);
  const ex=calls.filter(c=>c.fn==='cuentas_expense_add'),gu=calls.filter(c=>c.fn==='cuentas_guest_add');
  ok(calls.filter(c=>c.fn==='cuentas_group_create').length===1,'1.4 crea un solo grupo');
  ok(gu.length===1&&gu[0].body.p_name==='Ana','1.5 agrega solo a Ana como invitada (yo no)');
  ok(ex.length===2,'1.6 pasa los 2 gastos');
  ok(ex.every(c=>Object.values(c.body.p_shares).reduce((a,b)=>a+b,0)===c.body.p_amount_minor),'1.7 cada reparto suma el importe');
  ok(ex.every(c=>/^mig-/.test(c.body.p_key)&&c.body.p_key.length>=8),'1.8 clave de idempotencia por gasto');
  ok(ex.every(c=>c.auth),'1.9 llamadas con sesión');
  ok((await page.evaluate(()=>localStorage.getItem('juntada_expenses_v1'))).includes('Asado'),'1.10 la copia vieja no se borra');
  ok(errs.length===0,'1.11 sin errores de página '+errs.join('|'));await ctx.close()}
 // 2) corte a mitad y reintento sin duplicar
 {let n=0,fail=true;const {ctx,page,calls}=await mk(browser,{session:true,store:ST2,handlers:{'':{id:UID},cuentas_group_create:G1,cuentas_guest_add:()=>'a'+(++n)+'0000000-0000-0000-0000-000000000000',
   cuentas_expense_add:b=>{if(b.p_description==='Bebidas'&&fail){return {__error:'Error de red'}}return 'm1'}}});
  await page.goto(U);await page.waitForTimeout(1500);await page.evaluate(()=>go('balances'));await page.click('#migEmpezar');await page.selectOption('#migYo','Pau');await page.click('#migConfirmar');await page.waitForTimeout(1000);
  ok((await page.textContent('#migEstado')).includes('Se cortó'),'2.1 si se corta, lo dice y deja reintentar');
  fail=false;await page.click('#migConfirmar');await page.waitForTimeout(1200);
  const asado=calls.filter(c=>c.fn==='cuentas_expense_add'&&c.body.p_description==='Asado').length;
  ok(asado===1,'2.2 reintentar no vuelve a mandar el gasto ya pasado');
  ok(calls.filter(c=>c.fn==='cuentas_group_create').length===1&&calls.filter(c=>c.fn==='cuentas_guest_add').length===1,'2.3 reintentar no repite grupo ni invitados');await ctx.close()}
 // 3) reparto roto: no toca nada
 {const bad=[{...EXP[0],shares:[{person:'Pau',cents:100},{person:'Ana',cents:100}]}];const {ctx,page,calls}=await mk(browser,{session:true,store:{juntada_expenses_v1:JSON.stringify(bad)},handlers:{'':{id:UID}}});
  await page.goto(U);await page.waitForTimeout(1500);await page.evaluate(()=>go('balances'));await page.click('#migEmpezar');
  ok((await page.textContent('#migDetalle')).includes('reparto mal'),'3.1 reparto que no suma: avisa');
  ok(calls.filter(c=>c.fn.startsWith('cuentas_')).length===0&&(await page.locator('#migConfirmar').count())===0,'3.2 no se llama a Cuentas ni se ofrece confirmar');await ctx.close()}
 // 4) sin sesión o sin gastos: no aparece
 {const {ctx,page}=await mk(browser,{session:false,store:ST2,handlers:{}});await page.goto(U);await page.waitForTimeout(1200);await page.evaluate(()=>go('balances'));ok(!(await page.locator('#migGastosCard').isVisible().catch(()=>false)),'4.1 sin sesión no aparece');await ctx.close()}
 {const {ctx,page}=await mk(browser,{session:true,store:{},handlers:{'':{id:UID}}});await page.goto(U);await page.waitForTimeout(1200);await page.evaluate(()=>go('balances'));ok(!(await page.locator('#migGastosCard').isVisible().catch(()=>false)),'4.2 sin gastos no aparece');await ctx.close()}
 await browser.close();console.log(fails?('FALLAS: '+fails):'TODO OK');process.exit(fails?1:0)})();
