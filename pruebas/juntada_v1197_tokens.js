// V1.19.5 · tokens comunes de Pinto. Estático (verificador + texto) y ejecutado (colores calculados en Chrome). Supabase simulado.
const {chromium}=require('playwright');const fs=require('fs');const cp=require('child_process');const crypto=require('crypto');
const U='http://127.0.0.1:8765/juntada/preview-v1197.html';const SHA_V1='a3c56f82dd46b9ed719db66d152168e16f43407b1b0061624782e57f33d03b98';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
const rd=f=>fs.readFileSync(f,'utf8');
// A) estático
ok(crypto.createHash('sha256').update(rd('tokens/pinto-tokens.css')).digest('hex')===SHA_V1,'A1 tokens/pinto-tokens.css es la copia v1 sin cambios (sha256)');
let r=cp.spawnSync('python3',['tools/pinto_tokens_check.py','tokens/pinto-tokens.css','tokens/pinto-tokens.css']);ok(r.status===0,'A2 el verificador corre y da OK sobre el bloque');
const h=rd('preview-v1197.html');ok(h.includes('href="tokens/pinto-tokens.css?v=1"'),'A3 la pantalla carga tokens/pinto-tokens.css');
ok(h.indexOf('tokens/pinto-tokens.css')<h.indexOf('juntada-tema-v1195.css'),'A4 los tokens se cargan antes que el tema');
const names=[...rd('tokens/pinto-tokens.css').matchAll(/(--[a-z0-9-]+):/g)].map(m=>m[1]);
const propios=[h,rd('juntada-tema-v1195.css')].join('\n');
const pisa=names.filter(n=>new RegExp('(^|[;{\\s])'+n+'\\s*:').test(propios));
ok(pisa.length===0,'A5 ni la pantalla ni el tema redefinen tokens comunes '+pisa.join(','));
// B) ejecutado
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 for(const modo of ['light','dark']){
  const ctx=await b.newContext({viewport:{width:400,height:900}});const p=await ctx.newPage();
  await p.addInitScript(m=>localStorage.setItem('juntada_theme',m),modo);
  await p.route('**/*',r=>{const u=r.request().url();if(!u.includes('supabase.co'))return r.continue();r.fulfill({status:200,contentType:'application/json',body:'{}'})});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(U);await p.waitForTimeout(1000);
  const v=await p.evaluate(()=>{const g=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim().toUpperCase();
   return {eff:document.documentElement.dataset.eff,primario:g('--primario'),txt:g('--primario-txt'),fondo:g('--fondo'),texto:g('--texto'),tinte:g('--tinte'),navy:g('--navy'),ink:g('--ink'),muted:g('--muted'),pale:g('--pale'),coral:g('--coral')}});
  const e=modo==='light'?{primario:'#1F5F6B',fondo:'#FAF8F4',texto:'#1D2F33',navy:'#1F5F6B',ink:'#1D2F33',muted:'#5B6E70',pale:'#E6F1F0',coral:'#F2C14E',tinte:'#E6F1F0'}:{primario:'#2A7A89',fondo:'#12201F',texto:'#E8F0EE',navy:'#6FB8C4',ink:'#E8F0EE',muted:'#9DB5B3',pale:'#244240',coral:'#F2C14E',tinte:'#244240'};
  ok(v.eff===modo,'B '+modo+': Apariencia aplicada ('+v.eff+')');
  for(const k of Object.keys(e))ok(v[k]===e[k],'B '+modo+': '+k+' = '+v[k]+(v[k]===e[k]?'':' (esperado '+e[k]+')'));
  const bg=await p.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  ok(modo==='dark'?bg==='rgb(18, 32, 31)':true,'B '+modo+': fondo del cuerpo '+bg);
  ok(errs.length===0,'B '+modo+': sin errores de página '+errs.join('|'));await ctx.close()}
 await b.close();console.log(fails?'HAY FALLAS':'TODO OK');process.exit(fails?1:0)})();
