// V1.19.18 · temas de invitación, «Quién va», reacciones, ajustes del organizador, campanita (recordatorios). Supabase SIMULADO.
// Servir /home/claude en 127.0.0.1:8765 (el repo queda bajo /juntada/).
const {chromium}=require('playwright');
const B='http://127.0.0.1:8765/juntada/index.html';
const ID='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',CODE='dddddddd-dddd-dddd-dddd-dddddddddddd',TOK='ffffffff-ffff-ffff-ffff-ffffffffffff';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
(async()=>{const br=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
async function mk(sc,{url=B,init=()=>{},session=false,viewport={width:390,height:900}}={}){
 const ctx=await br.newContext({viewport});const p=await ctx.newPage();const errs=[],calls=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(([s])=>{if(s)localStorage.setItem('planazo_auth_v1',JSON.stringify({access_token:'tok',refresh_token:'r',expires_at:Date.now()+3600000,email:'p@test.com'}))},[session]);
 await p.addInitScript(init);
 await p.route('**/*',async r=>{const u=r.request().url();
  if(u.includes('fonts.googleapis.com')||u.includes('fonts.gstatic.com'))return r.fulfill({status:200,contentType:'text/css',body:''});
  if(!u.includes('supabase.co'))return r.continue();
  const fn=(u.split('/rpc/')[1]||'').split('?')[0];let body={};try{body=JSON.parse(r.request().postData()||'{}')}catch(_){}
  calls.push({fn,body});const h=sc[fn];const res=h===undefined?{}:(typeof h==='function'?h(body):h);
  if(res&&res.__err)return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:res.__err,details:res.__det||''})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(res)})});
 await p.goto(url);await p.waitForTimeout(1800);return {ctx,p,errs,calls}}
const VER=(o={})=>Object.assign({id:ID,nombre:'Asado de Ana',fecha:'2026-12-24',hora:'21:00',lugar:'Casa',modalidad_fecha:'fixed',cancelada:false,acceso:'libre',tema:'asado',ocultar_asistentes:false,recordatorio_horas:24,ahora:new Date().toISOString()},o);
const ASIS=(o={})=>Object.assign({conteos:{voy:2,tal_vez:1,no_puedo:1},oculta:false,asistentes:[{nombre:'Beto',asistencia:'voy',emoji:'🎉'},{nombre:'Cami',asistencia:'tal_vez',emoji:null}]},o);
const INV=B+'?invite='+CODE;
const nlast=(calls,fn)=>calls.filter(c=>c.fn===fn);

// ===== A) Invitación con tema =====
{const {ctx,p,errs,calls}=await mk({juntada_ver:VER(),juntada_asistentes:ASIS(),juntada_responder:{ok:true,id:'R1',ligada:false},juntada_reaccionar:{ok:true}},{url:INV});
 ok(await p.locator('#temaInv[data-tema="asado"]').count()===1,'A1 la invitación se pinta con el tema que devuelve juntada_ver');
 ok(await p.evaluate(()=>document.getElementById('invite').classList.contains('con-tema')),'A2 la pantalla pasa a modo tema');
 ok(await p.locator('#invite .rsvp').isHidden(),'A3 los botones de siempre se reemplazan por los del tema');
 ok((await p.locator('#temaInv .pt-tema__titulo').innerText()).includes('Asado de Ana'),'A4 el título es el nombre del evento');
 // sin nombre no responde
 await p.locator('#temaInv .pt-btn[data-r="voy"]').click();await p.waitForTimeout(300);
 ok(nlast(calls,'juntada_responder').length===0,'A5 sin nombre no se llama a juntada_responder');
 await p.fill('#guestName','Dani');
 const mapa=[['voy','voy'],['aun_no_se','tal_vez'],['no_voy','no_puedo']];
 for(const [k,v] of mapa){const antes=nlast(calls,'juntada_responder').length;await p.locator('#temaInv .pt-btn[data-r="'+k+'"]').click();await p.waitForTimeout(500);
  const c=nlast(calls,'juntada_responder');ok(c.length===antes+1&&c[c.length-1].body.p_asistencia===v&&c[c.length-1].body.p_nombre==='Dani'&&c[c.length-1].body.p_codigo===CODE,'A6 '+k+' → p_asistencia '+v);}
 ok(await p.locator('#temaInv .pt-btn[data-r="no_voy"]').getAttribute('aria-pressed')==='true','A7 queda marcada la última respuesta');
 ok((await p.locator('#temaInv .pt-tema__frase').innerText()).includes('Brindamos'),'A8 la frase del tema cambia con la respuesta');
 ok(JSON.parse(await p.evaluate(c=>localStorage.getItem('juntada_guest_progress_'+c),CODE)).attendance==='No voy','A9 se guarda la respuesta en este navegador');
 ok(errs.length===0,'A10 sin errores de página '+errs.join(';'));await ctx.close()}

// ===== B) Sin tema: base sobria =====
{const {ctx,p,calls}=await mk({juntada_ver:VER({tema:null}),juntada_asistentes:ASIS(),juntada_responder:{ok:true,id:'R1'}},{url:INV});
 ok(await p.locator('#temaInv').count()===0,'B1 tema null → no hay invitación temática');
 ok(await p.locator('#invite .rsvp').isVisible()||await p.evaluate(()=>!document.getElementById('invite').classList.contains('con-tema')),'B2 queda la invitación sobria');
 await p.fill('#guestName','Dani');await p.evaluate(()=>{document.querySelectorAll('#invite .rsvp button')[1].click()});await p.waitForTimeout(500);
 const c=nlast(calls,'juntada_responder');ok(c.length===1&&c[0].body.p_asistencia==='tal_vez','B3 los botones de siempre usan la misma equivalencia (Aún no sé → tal_vez)');await ctx.close()}

// ===== C) Quién va y reacciones =====
{const {ctx,p,calls}=await mk({juntada_ver:VER(),juntada_asistentes:ASIS(),juntada_responder:{ok:true,id:'R1'},juntada_reaccionar:b=>b.p_emoji==='❤️'?{__err:'Primero respondé si vas',__det:'JUN_SIN_RESPUESTA'}:{ok:true,emoji:b.p_emoji}},{url:INV});
 const t=await p.locator('#quienVa').innerText();
 ok(/2 van/.test(t)&&/1 aún no sabe/.test(t)&&/1 no va/.test(t),'C1 los conteos se muestran siempre');
 ok(/Beto/.test(t)&&/🎉/.test(t)&&/Cami/.test(t),'C2 con lista visible: nombres y emoji');
 ok(await p.locator('#quienVa .qv-react').count()===0,'C3 antes de responder no hay reacciones');
 await p.fill('#guestName','Dani');await p.locator('#temaInv .pt-btn[data-r="voy"]').click();await p.waitForTimeout(700);
 ok(await p.locator('#quienVa .qv-react button').count()===4,'C4 después de responder aparecen 4 reacciones');
 ok((await p.locator('#quienVa .qv-react button').allInnerTexts()).join('|')==='🎉|🙌|😂|❤️','C5 son 🎉 🙌 😂 ❤️');
 await p.locator('#quienVa .qv-react button[data-e="🙌"]').click();await p.waitForTimeout(500);
 let r=nlast(calls,'juntada_reaccionar');ok(r.length===1&&r[0].body.p_emoji==='🙌'&&r[0].body.p_nombre==='Dani','C6 reaccionar manda el emoji y el nombre');
 ok(await p.locator('#quienVa .qv-react button[data-e="🙌"]').getAttribute('aria-pressed')==='true','C7 queda marcada');
 await p.locator('#quienVa .qv-react button[data-e="🙌"]').click();await p.waitForTimeout(500);
 r=nlast(calls,'juntada_reaccionar');ok(r[r.length-1].body.p_emoji===null,'C8 tocar la misma la saca (una por persona)');
 await p.locator('#quienVa .qv-react button[data-e="❤️"]').click();await p.waitForTimeout(500);
 ok(/Primero respondé/.test(await p.locator('#toast, .toast').first().innerText().catch(()=>'')),'C9 el error JUN_SIN_RESPUESTA se explica por código');
 await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER(),juntada_asistentes:ASIS({oculta:true,asistentes:null})},{url:INV});
 const t=await p.locator('#quienVa').innerText();
 ok(/2 van/.test(t)&&!/Beto/.test(t)&&/no mostrar los nombres/.test(t),'C10 lista oculta: solo números');await ctx.close()}
{const {ctx,p,calls}=await mk({juntada_ver:VER({acceso:'iniciar_sesion'}),juntada_asistentes:ASIS()},{url:INV});
 ok(await p.locator('#temaInv').count()===0&&nlast(calls,'juntada_asistentes').length===0,'C11 sin acceso (pide sesión) no se pinta tema ni se pide la lista');await ctx.close()}

// ===== D) Ajustes del organizador =====
const ORG=()=>{localStorage.setItem('juntada_v10_events',JSON.stringify([{id:'j1',saved:{name:'Cumple de Ana',desc:'',dateMode:'fixed',date:'2026-12-24',candidates:[],time:'',place:'Lugar',expense:''}}]));localStorage.setItem('juntada_remote_j1',JSON.stringify({id:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',codigo:'dddddddd-dddd-dddd-dddd-dddddddddddd',organizador:'ffffffff-ffff-ffff-ffff-ffffffffffff'}))};
async function abrirOrg(sc,over={}){const o=await mk(Object.assign({juntada_ver:VER({tema:null,nombre:'Cumple de Ana'}),juntada_ver_organizador:{id:ID},juntada_respuestas_organizador:[],juntada_solicitudes:[]},sc),Object.assign({init:ORG},over));
 await o.p.evaluate(()=>openJuntada('j1'));await o.p.waitForTimeout(1500);return o}
{const {ctx,p,calls,errs}=await abrirOrg({juntada_configurar_invitacion:b=>({tema:b.p_tema,ocultar_asistentes:b.p_ocultar_asistentes,recordatorio_horas:b.p_recordatorio_horas})});
 ok(await p.locator('#invConfigCard').count()===1,'D1 aparece la tarjeta «Invitación» del organizador');
 ok(await p.locator('#icRec').inputValue()==='24','D2 recordatorio: 24 h por defecto');
 ok((await p.locator('#icSug').innerText()).includes('Cumple'),'D3 sugiere el tema según el nombre («Cumple de Ana» → Cumple)');
 await p.click('#icUsar');ok(await p.locator('#icTema').inputValue()==='cumple','D4 «Usar» elige el tema sugerido');
 ok(await p.locator('#icPrev[data-tema="cumple"]').count()===1,'D5 hay vista previa del tema');
 await p.check('#icOcultar');await p.selectOption('#icRec','0');await p.click('#icGuardar');await p.waitForTimeout(600);
 const c=nlast(calls,'juntada_configurar_invitacion');
 ok(c.length===1&&c[0].body.p_juntada===ID&&c[0].body.p_organizador===TOK&&c[0].body.p_tema==='cumple'&&c[0].body.p_ocultar_asistentes===true&&c[0].body.p_recordatorio_horas===0,'D6 guarda tema, ocultar y recordatorio 0 (apagado)');
 ok(errs.length===0,'D7 sin errores de página '+errs.join(';'));await ctx.close()}
{const {ctx,p}=await abrirOrg({juntada_ver:VER({tema:null,nombre:'Cumple de Ana',fecha:'sábado a la noche',recordatorio_horas:24})});
 ok(await p.locator('#icAviso').isVisible(),'D8 fecha no concreta + recordatorio: se avisa que no habrá recordatorio');
 await p.selectOption('#icRec','0');ok(await p.locator('#icAviso').isHidden(),'D9 con recordatorio apagado no hay aviso');
 await p.selectOption('#icRec','48');ok(await p.locator('#icAviso').isVisible(),'D10 al volver a prenderlo, vuelve el aviso');await ctx.close()}
{const {ctx,p}=await abrirOrg({juntada_ver:VER({tema:'playa',nombre:'Cumple de Ana',fecha:'sábado',fecha_confirmada:'2026-12-24'})});
 ok(await p.locator('#icAviso').isHidden(),'D11 con fecha_confirmada concreta no hay aviso');
 ok(await p.locator('#icTema').inputValue()==='playa','D12 muestra el tema actual');await ctx.close()}
{const {ctx,p}=await abrirOrg({juntada_configurar_invitacion:{__err:'Acceso no autorizado',__det:'JUN_NO_AUTORIZADO'}});
 await p.click('#icGuardar');await p.waitForTimeout(500);
 ok(/Solo quien organiza/.test(await p.locator('#icMsg').innerText()),'D13 error JUN_NO_AUTORIZADO explicado por código');await ctx.close()}

// ===== E) Campanita: recordatorios, plazo, fecha =====
const HOME=()=>{localStorage.setItem('juntada_v10_events',JSON.stringify([{id:'a1',saved:{name:'Asado QA',date:''}}]));localStorage.setItem('juntada_remote_a1',JSON.stringify({id:'R1',codigo:'C1',organizador:'O1'}))};
const en5h=new Date(Date.now()+5*36e5).toISOString();
{const {ctx,p,calls}=await mk({
  juntada_ver:VER({fecha:'2026-12-24'}),juntada_solicitudes:[],juntada_mis_eventos:[],
  juntada_mis_invitaciones:[{nombre:'Fiesta de Lu',codigo:'C9',votacion_hasta:en5h,votacion_cerrada:false,ya_vote:false,ahora:new Date().toISOString()},{nombre:'Ya voté',codigo:'C8',votacion_hasta:en5h,votacion_cerrada:false,ya_vote:true}],
  core_notifications_list:[{id:'N1',domain:'juntada',kind:'event_reminder',read_at:null,data:{nombre:'Asado de Ana',inicio:'2026-12-24T21:00:00Z'}},{id:'N2',domain:'juntada',kind:'event_reminder',read_at:'2026-11-26T00:00:00Z',data:{nombre:'Ya leído'}},{id:'N3',domain:'cuentas',kind:'otra_cosa',read_at:null,data:{}}],
  core_notifications_read:1},{init:HOME,session:true});
 await p.waitForTimeout(3000);
 ok((await p.locator('#home .j-bell i').innerText()).trim()==='2','E1 contador: 1 recordatorio sin leer + 1 plazo por vencer (lo leído y otros tipos no cuentan)');
 await p.click('#home .j-bell');await p.waitForTimeout(400);
 const t=await p.locator('#jActOverlay').innerText();
 ok(/Recordatorio: «Asado de Ana»/.test(t)&&!/Ya leído/.test(t),'E2 muestra el recordatorio sin leer y no el leído');
 ok(/Vence en 5 h/.test(t)&&/Fiesta de Lu/.test(t)&&!/Ya voté/.test(t),'E3 el plazo sale de juntada_mis_invitaciones (ya_vote real): solo donde falta votar');
 await p.locator('#jActOverlay .act-item', {hasText:'Recordatorio'}).click();await p.waitForTimeout(600);
 const r=nlast(calls,'core_notifications_read');ok(r.length===1&&r[0].body.p_id==='N1','E4 tocar el recordatorio lo marca leído (core_notifications_read con su id)');await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER({fecha:'',recordatorio_horas:24}),juntada_solicitudes:[]},{init:HOME});
 await p.waitForTimeout(3000);await p.click('#home .j-bell');await p.waitForTimeout(300);
 ok(/Sin día concreto/.test(await p.locator('#jActOverlay').innerText()),'E5 sin fecha concreta y con recordatorio: la campanita avisa al organizador');await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER({fecha:'',recordatorio_horas:0}),juntada_solicitudes:[]},{init:HOME});
 await p.waitForTimeout(3000);ok(await p.locator('#home .j-bell i').isHidden(),'E6 con recordatorio apagado no hay aviso de fecha');await ctx.close()}
{const {ctx,p,calls}=await mk({core_notifications_list:[{id:'N1',kind:'event_reminder',read_at:null,data:{nombre:'X'}}]},{});
 await p.waitForTimeout(2500);ok(nlast(calls,'core_notifications_list').length===0,'E7 sin sesión no se piden notificaciones');await ctx.close()}

// ===== F) Pantalla chica, claro y oscuro =====
for(const esquema of ['light','dark']){
 const ctx=await br.newContext({viewport:{width:360,height:780},colorScheme:esquema});const p=await ctx.newPage();
 await p.route('**/*',async r=>{const u=r.request().url();if(u.includes('fonts.g'))return r.fulfill({status:200,contentType:'text/css',body:''});if(!u.includes('supabase.co'))return r.continue();
  const fn=(u.split('/rpc/')[1]||'').split('?')[0];const m={juntada_ver:VER({tema:'previa'}),juntada_asistentes:ASIS()};return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(m[fn]||{})})});
 await p.goto(INV);await p.waitForTimeout(1800);
 ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'F '+esquema+': sin scroll horizontal a 360 px');
 const bb=await p.locator('#temaInv .pt-btn').first().boundingBox();ok(bb.height>=44,'F '+esquema+': botones de 44 px');
 await p.screenshot({path:'/tmp/inv-'+esquema+'.png',fullPage:true});await ctx.close()}

await br.close();console.log(fails?('FALLARON '+fails):'TODO OK');process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
