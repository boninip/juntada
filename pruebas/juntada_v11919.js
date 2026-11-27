// V1.19.19 · UX/UI pulido + foto de portada · temas de invitación, «Quién va», reacciones, ajustes del organizador, campanita (recordatorios). Supabase SIMULADO.
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
  if(u.includes('/storage/v1/object/public/'))return r.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==','base64')});
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
 ok(await p.locator('#nombreErr').isVisible()&&/Escribí tu nombre/.test(await p.locator('#nombreErr').innerText()),'A5b falta el nombre: error en línea (no solo un aviso que se va)');
 ok(await p.locator('#temaInv #guestName').count()===1,'A5c el campo de nombre queda dentro de la tarjeta, antes de los botones');
 ok((await p.locator('#temaInv .pt-chip:not([hidden])').count())>=1,'A5d fecha y lugar aparecen como chips en la tarjeta');
 ok(await p.locator('#invite .detail').first().isHidden(),'A5e no se repiten fecha y lugar debajo');
 await p.fill('#guestName','Dani');
 await p.waitForTimeout(100);ok(await p.locator('#nombreErr').isHidden(),'A5f al escribir, el error desaparece');
 const mapa=[['voy','voy'],['aun_no_se','tal_vez'],['no_voy','no_puedo']];
 for(const [k,v] of mapa){const antes=nlast(calls,'juntada_responder').length;await p.locator('#temaInv .pt-btn[data-r="'+k+'"]').click();await p.waitForTimeout(500);
  const c=nlast(calls,'juntada_responder');ok(c.length===antes+1&&c[c.length-1].body.p_asistencia===v&&c[c.length-1].body.p_nombre==='Dani'&&c[c.length-1].body.p_codigo===CODE,'A6 '+k+' → p_asistencia '+v);}
 ok(await p.locator('#temaInv .pt-btn[data-r="no_voy"]').getAttribute('aria-pressed')==='true','A7 queda marcada la última respuesta');
 ok((await p.locator('#temaInv .pt-tema__frase').innerText()).includes('Brindamos'),'A8 la frase del tema cambia con la respuesta');
 ok(JSON.parse(await p.evaluate(c=>localStorage.getItem('juntada_guest_progress_'+c),CODE)).attendance==='No voy','A9 se guarda la respuesta en este navegador');
 ok(/Dani: No voy/.test(await p.locator('#temaInv .pt-estado').innerText()),'A9b el estado queda escrito en la tarjeta');
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
 ok(await p.locator('#invConfigCard input[name="icTema"]').count()===7,'D1b selector visual: Sin tema + 6 temas');
 ok(await p.locator('#invConfigCard input[name="icRec"]:checked').getAttribute('value')==='24','D2 recordatorio: 24 h por defecto');
 ok(await p.locator('#icGuardar').isDisabled(),'D2b sin cambios, el botón de guardar está apagado');
 ok(await p.locator('#invConfigCard input[name="icTema"]:checked').getAttribute('value')==='','D2c arranca en «Sin tema»');
 ok((await p.locator('#icSug').innerText()).includes('Cumple'),'D3 sugiere el tema según el nombre («Cumple de Ana» → Cumple)');
 await p.click('#icUsar');ok(await p.locator('#invConfigCard input[name="icTema"]:checked').getAttribute('value')==='cumple','D4 «Usar» elige el tema sugerido');
 ok(await p.locator('#icPrev[data-tema="cumple"]').count()===1,'D5 hay vista previa del tema');
 ok(await p.locator('#icGuardar').isEnabled(),'D5b al cambiar algo, se habilita guardar');
 await p.locator('#icOcultar').check();await p.locator('label.ic-chip:has(input[name="icRec"][value="0"])').click();await p.click('#icGuardar');await p.waitForTimeout(600);
 const c=nlast(calls,'juntada_configurar_invitacion');
 ok(c.length===1&&c[0].body.p_juntada===ID&&c[0].body.p_organizador===TOK&&c[0].body.p_tema==='cumple'&&c[0].body.p_ocultar_asistentes===true&&c[0].body.p_recordatorio_horas===0,'D6 guarda tema, ocultar y recordatorio 0 (apagado)');
 ok(await p.locator('#icGuardar').isDisabled(),'D6b tras guardar vuelve a «sin cambios»');
 ok(await p.locator('#invConfigCard input[name="icModo"]').count()===0,'D6c sin migración de foto en la base (no viene foto_path): no aparecen controles de foto');
 ok(errs.length===0,'D7 sin errores de página '+errs.join(';'));await ctx.close()}
{const {ctx,p}=await abrirOrg({juntada_ver:VER({tema:null,nombre:'Cumple de Ana',fecha:'sábado a la noche',recordatorio_horas:24})});
 ok(await p.locator('#icAviso').isVisible(),'D8 fecha no concreta + recordatorio: se avisa que no habrá recordatorio');
 await p.locator('label.ic-chip:has(input[name="icRec"][value="0"])').click();ok(await p.locator('#icAviso').isHidden(),'D9 con recordatorio apagado no hay aviso');
 await p.locator('label.ic-chip:has(input[name="icRec"][value="48"])').click();ok(await p.locator('#icAviso').isVisible(),'D10 al volver a prenderlo, vuelve el aviso');await ctx.close()}
{const {ctx,p}=await abrirOrg({juntada_ver:VER({tema:'playa',nombre:'Cumple de Ana',fecha:'sábado',fecha_confirmada:'2026-12-24'})});
 ok(await p.locator('#icAviso').isHidden(),'D11 con fecha_confirmada concreta no hay aviso');
 ok(await p.locator('#invConfigCard input[name="icTema"]:checked').getAttribute('value')==='playa','D12 muestra el tema actual');await ctx.close()}
{const {ctx,p}=await abrirOrg({juntada_configurar_invitacion:{__err:'Acceso no autorizado',__det:'JUN_NO_AUTORIZADO'}});
 await p.locator('label.ic-tile:has(input[value="ruta"])').click();await p.click('#icGuardar');await p.waitForTimeout(500);
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

// ===== G) Foto de portada (base con la migración propuesta SIMULADA) =====
const FOTO=ID+'/aaaaaaaaaaaaaaaa.jpg';
{const {ctx,p}=await mk({juntada_ver:VER({tema:'cumple',foto_path:FOTO,foto_modo:'reemplaza'}),juntada_asistentes:ASIS()},{url:INV});
 ok(await p.locator('#temaInv img.pt-foto').count()===1&&(await p.locator('#temaInv img.pt-foto').getAttribute('src')).includes('/storage/v1/object/public/juntada-fotos/'+ID),'G1 modo «reemplaza»: la foto ocupa el lugar de la ilustración');
 ok(await p.locator('#temaInv svg').count()===0||await p.locator('#temaInv .pt-escena svg').count()===0,'G1b la ilustración no se ve');await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER({tema:'cumple',foto_path:FOTO,foto_modo:'dentro'}),juntada_asistentes:ASIS()},{url:INV});
 ok(await p.locator('#temaInv .pt-polaroid img').count()===1&&await p.locator('#temaInv .pt-escena svg').count()===1,'G2 modo «dentro»: marco con la foto sobre la ilustración');
 const bb=await p.locator('#temaInv .pt-polaroid').boundingBox(),eb=await p.locator('#temaInv .pt-escena').boundingBox();
 ok(bb.y>=eb.y-8&&bb.y+bb.height<=eb.y+eb.height+8,'G2b el marco queda dentro de la ilustración');await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER({tema:null,foto_path:FOTO}),juntada_asistentes:ASIS()},{url:INV});
 ok(await p.locator('#invite.con-foto .banner img').count()===1,'G3 sin tema pero con foto: la foto va como encabezado de la invitación sobria');await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER({tema:'cumple',foto_path:null}),juntada_asistentes:ASIS()},{url:INV});
 ok(await p.locator('#temaInv img').count()===0&&await p.locator('#temaInv svg').count()>=1,'G4 sin foto: queda la ilustración del tema');await ctx.close()}
{const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==','base64');
 let subidas=[];
 const {ctx,p,calls}=await abrirOrg({juntada_ver:VER({tema:null,nombre:'Cumple de Ana',foto_path:null,foto_modo:'reemplaza'}),juntada_configurar_foto:b=>({foto_path:b.p_path,foto_modo:b.p_modo||'reemplaza'})});
 await p.route('**/storage/v1/object/juntada-fotos/**',r=>{subidas.push({url:r.request().url(),ct:r.request().headers()['content-type'],n:(r.request().postDataBuffer()||Buffer.alloc(0)).length});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
 ok(await p.locator('#icFotoArchivo').count()===1&&await p.locator('input[name="icModo"]').count()===2,'G5 con la migración (viene foto_path) aparecen los controles de foto y los dos modos');
 await p.locator('label.ic-chip:has(input[name="icModo"][value="dentro"])').click();
 await p.setInputFiles('#icFotoArchivo',{name:'cumple.png',mimeType:'image/png',buffer:png});await p.waitForTimeout(1500);
 const cf=nlast(calls,'juntada_configurar_foto');
 ok(subidas.length===1&&subidas[0].ct==='image/jpeg'&&subidas[0].url.includes('/juntada-fotos/'+ID+'/')&&/\.jpg$/.test(subidas[0].url),'G6 sube un JPEG a la carpeta de la juntada con nombre aleatorio');
 ok(cf.length===1&&cf[0].body.p_path.startsWith(ID+'/')&&cf[0].body.p_modo==='dentro'&&cf[0].body.p_organizador===TOK,'G7 después de subir, pide al servidor asignarla (con el modo elegido)');
 ok(await p.locator('#icFotoQuitar').count()===1&&/Foto guardada/.test(await p.locator('#icFotoMsg').innerText()),'G8 queda la foto y el aviso «Foto guardada»');
 await p.locator('label.ic-chip:has(input[name="icModo"][value="reemplaza"])').click();await p.waitForTimeout(500);
 const cf2=nlast(calls,'juntada_configurar_foto');ok(cf2.length===2&&cf2[1].body.p_modo==='reemplaza'&&cf2[1].body.p_path===cf[0].body.p_path,'G9 cambiar el modo reasigna la misma foto');
 await p.click('#icFotoQuitar');await p.waitForTimeout(500);
 const cf3=nlast(calls,'juntada_configurar_foto');ok(cf3.length===3&&cf3[2].body.p_path===null,'G10 quitar la foto manda p_path null');await ctx.close()}
{const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==','base64');
 const {ctx,p,calls}=await abrirOrg({juntada_ver:VER({tema:null,nombre:'Cumple de Ana',foto_path:null})});
 await p.route('**/storage/v1/object/juntada-fotos/**',r=>r.fulfill({status:403,contentType:'application/json',body:'{"message":"nope"}'}));
 await p.setInputFiles('#icFotoArchivo',{name:'a.png',mimeType:'image/png',buffer:png});await p.waitForTimeout(1200);
 ok(nlast(calls,'juntada_configurar_foto').length===0&&/No se pudo subir/.test(await p.locator('#icFotoMsg').innerText()),'G11 si falla la subida, no se asigna nada y se explica');
 await p.setInputFiles('#icFotoArchivo',{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('hola')});await p.waitForTimeout(500);
 ok(/archivo de imagen/.test(await p.locator('#icFotoMsg').innerText()),'G12 un archivo que no es imagen se rechaza antes de subir');await ctx.close()}
{const {ctx,p}=await mk({juntada_ver:VER(),juntada_asistentes:ASIS(),juntada_responder:{__err:'Respuesta inválida'}},{url:INV});
 await p.fill('#guestName','Dani');await p.locator('#temaInv .pt-btn[data-r="voy"]').click();await p.waitForTimeout(600);
 ok(await p.locator('#temaInv .pt-btn[aria-pressed="true"]').count()===0,'G13 si la respuesta falla, el botón vuelve a su estado (no queda como confirmada)');await ctx.close()}
{global.window={};require('/home/claude/juntada/tokens/pinto-temas.js');const T=window.PintoTemas.TEMAS;
 ok(Object.values(T).every(t=>(t.escena.match(/<rect[^>]*>/g)||[]).every(r=>/width=/.test(r)&&/height=/.test(r))),'G14 ninguna escena tiene <rect> sin tamaño');}

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
