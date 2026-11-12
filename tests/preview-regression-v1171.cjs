const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 const results=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/preview-v1171.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('.screen.active').getAttribute('id'),'home');
  const homeBg=await page.locator('#home .hero').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.match(homeBg,/photo-1511988617509-a57c8a288659/);
  for(const id of ['create','accounts','balances','myEvents','quickExpense','newExpenseGroup']){
   await page.evaluate(id=>go(id),id);
   assert.equal(await page.locator('.screen.active').getAttribute('id'),id,'navigation '+id);
  }
  await page.evaluate(()=>go('event'));
  assert.equal(await page.locator('#v117Activity').count(),1);
  assert.match(await page.locator('.v117-participants').innerText(),/Solicitudes de ingreso/);
  await page.evaluate(()=>go('create'));
  await page.evaluate(()=>setDateMode('vote'));
  const modes=page.locator('#voteFields .vote-tool');
  await modes.first().click();
  const rects=await modes.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y}}));
  assert.equal(rects.length,2);
  assert.ok(Math.abs(rects[0].width-rects[1].width)<1,'date buttons same width');
  assert.ok(Math.abs(rects[0].height-rects[1].height)<1,'date buttons same height');
  assert.ok(Math.abs(rects[0].y-rects[1].y)<1,'date buttons aligned');
  await modes.last().click();
  assert.ok(await modes.last().evaluate(el=>el.classList.contains('active')),'range selection');
  await modes.first().click();
  assert.ok(await modes.first().evaluate(el=>el.classList.contains('active')),'single selection');
  const cover=await page.locator('#create .create-cover').evaluate(async el=>{
   const bg=getComputedStyle(el).backgroundImage;
   const url=bg.includes('juntada_create_cover_v115(4)-1.jpg')?'./juntada_create_cover_v115(4)-1.jpg':null;
   const image=new Image();
   const loaded=await new Promise(resolve=>{image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=url});
   return {url,loaded,width:image.naturalWidth,height:image.naturalHeight};
  });
  assert.equal(cover.loaded,true,JSON.stringify(cover));
  assert.equal(cover.width,960);assert.equal(cover.height,443);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
  assert.equal(overflow,false,'horizontal overflow '+width);
  assert.deepEqual(errors,[],'JavaScript errors');
  results.push({width,cover:'PASS',navigation:'PASS',home:'PASS',errors:0});
  await page.screenshot({path:'qa-preview-v1171-'+width+'.png'});
  await page.close();
 }
 await browser.close();
 console.log('PREVIEW REGRESSION PASS',JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
