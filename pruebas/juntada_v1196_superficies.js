// V1.19.6 · superficies como Cuentas (claro) con tokens comunes; el oscuro no cambia. Chromium, Supabase simulado.
const {chromium}=require('playwright');
const U=process.env.JUNTADA_URL||'http://127.0.0.1:8765/juntada/preview-v1196.html';
let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log(c?'ok   ':'FALLA',m)};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 const exp={light:{body:'rgb(230, 241, 240)',app:'rgb(250, 248, 244)',hdr:'rgb(250, 248, 244)'},dark:{body:'rgb(18, 32, 31)',app:'rgb(27, 45, 44)',hdr:'rgb(27, 45, 44)'}};
 for(const modo of ['light','dark']){const p=await b.newPage({viewport:{width:500,height:900}});
  await p.addInitScript(m=>localStorage.setItem('juntada_theme',m),modo);
  await p.route('**/*supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
  const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(1200);
  const c=await p.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,app:getComputedStyle(document.querySelector('.app')).backgroundColor,hdr:getComputedStyle(document.querySelector('#home header')).backgroundColor,w:getComputedStyle(document.querySelector('#home .hero h1')).fontWeight}));
  for(const k of ['body','app','hdr'])ok(c[k]===exp[modo][k],modo+': '+k+' '+c[k]+(c[k]===exp[modo][k]?'':' (esperado '+exp[modo][k]+')'));
  ok(c.w==='500',modo+': título de portada con peso 500 como Cuentas ('+c.w+')');ok(errs.length===0,modo+': sin errores de página '+errs.join('|'));await p.close()}
 await b.close();console.log(fails?'HAY FALLAS':'TODO OK');process.exit(fails?1:0)})();
