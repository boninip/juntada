const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/preview-v1161.html',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>go('create'));
 const cover=page.locator('#create .create-cover');
 assert.equal(await cover.isVisible(),true,'Create cover not visible');
 const state=await cover.evaluate(async el=>{
   const css=getComputedStyle(el);const bg=css.backgroundImage;
   if(!bg||bg==='none')return {ok:false,reason:'No CSS background',bg};
   const matches=[...bg.matchAll(/url\(["']([^"']+)["']\)/g)];
   if(!matches.length)return {ok:false,reason:'No image URL',backgroundStart:bg.slice(0,100)};
   const url=matches[matches.length-1][1];
   console.log('COVER_URL',url);const response=await fetch(url).then(r=>({status:r.status,contentType:r.headers.get('content-type'),finalUrl:r.url})).catch(e=>({error:String(e)}));console.log('COVER_FETCH',JSON.stringify(response));const image=new Image();
   const loaded=await new Promise(resolve=>{image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=url});
   return {ok:loaded&&image.naturalWidth>=900&&image.naturalHeight>=400,width:image.naturalWidth,height:image.naturalHeight,loaded,reason:!loaded?'Image failed to decode':image.naturalWidth<900?'Image resolution too small':null};
 });
 console.log('Create cover QA:',JSON.stringify(state));
 await page.screenshot({path:'qa-cover-v1161.png',fullPage:false});
 assert.equal(state.ok,true,'Create cover failed: '+JSON.stringify(state));
 assert.deepEqual(errors,[],'Browser JS errors');
 await browser.close();console.log('Cover QA PASS');
})().catch(e=>{console.error(e);process.exit(1)});
