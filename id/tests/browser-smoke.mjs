import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
let errors=[];
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await desktop.newPage();
 page.on('pageerror',e=>errors.push('desktop: '+e.message));
 await page.goto(origin+'/id/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('#total-count')?.textContent.includes('7 ověřených dnů v katalogu'));
 assert.equal(await page.locator('[data-view="month"]').getAttribute('aria-pressed'),'true');
 assert.ok(await page.locator('.day-cell').count()>=28);
 await page.locator('[data-view="week"]').click();
 assert.equal(await page.locator('.day-cell').count(),7);
 await page.locator('[data-view="day"]').click();
 assert.equal(await page.locator('.day-cell').count(),1);
 await page.locator('#org-filter').selectOption('naturewatch');
 assert.match(await page.locator('#total-count').innerText(),/^1 ověřených/);
 await page.locator('#status-filter').selectOption('official');
 assert.match(await page.locator('#total-count').innerText(),/^0 ověřených/);
 await page.locator('#status-filter').selectOption('all');
 await page.locator('#org-filter').selectOption('all');
 await page.locator('#today').click();
 await page.locator('[data-view="month"]').click();
 await page.locator('#prev').click();
 await page.locator('#next').click();
 await page.locator('a[href="./irbis/"]').first().click();
 await page.waitForURL('**/id/irbis/');
 assert.match(await page.title(),/Levhart sněžný/);
 assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,follow');
 assert.equal(await page.locator('script[src*="googlesyndication"]').count(),0);
 await page.waitForFunction(()=>document.querySelectorAll('#activity-root .activity').length===23);
 assert.equal(await page.locator('#activity-root [data-category="coloring"] .activity').count(),5);
 assert.equal(await page.locator('#activity-root [data-category="story"] .activity').count(),12);
 assert.equal(await page.locator('#activity-root [data-category="info-card"] .activity').count(),6);
 assert.equal(await page.locator('#activity-root [data-category="tracing"] .activity').count(),0);
 assert.equal(await page.locator('#activity-root a[href*="etsy"]').count(),0);
 const imageResults=await page.locator('#activity-root .activity img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{
  img.loading='eager';try{await img.decode();return img.naturalWidth>0}catch{return false}
 })));
 assert.equal(imageResults.every(Boolean),true);
 const linkStatuses=await page.locator('#activity-root .activity a').evaluateAll(links=>Promise.all(links.map(async a=>{
  const r=await fetch(a.href,{method:'HEAD'});return r.status;
 })));
 assert.deepEqual(linkStatuses,Array(23).fill(200));
 assert.equal(await page.locator('.map img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
 await page.locator('a.backlink').click();
 await page.waitForURL('**/id/');
 const mobile=await browser.newContext({viewport:{width:375,height:812},isMobile:true,deviceScaleFactor:2});
 const m=await mobile.newPage();
 m.on('pageerror',e=>errors.push('mobile: '+e.message));
 await m.goto(origin+'/id/',{waitUntil:'networkidle'});
 assert.equal(await m.locator('[data-view="week"]').getAttribute('aria-pressed'),'true');
 assert.equal(await m.locator('.day-cell').count(),7);
 await m.locator('[data-view="month"]').click();
 assert.ok(await m.locator('.day-cell').count()>=28);
 await m.goto(origin+'/id/irbis/',{waitUntil:'networkidle'});
 await m.waitForFunction(()=>document.querySelectorAll('#activity-root .activity').length===23);
 assert.equal(await m.locator('.map img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
 assert.equal(await m.locator('meta[name="robots"]').getAttribute('content'),'noindex,follow');
 assert.deepEqual(errors,[]);
 await mobile.close();await desktop.close();
 console.log('PASS: Desktop and mobile calendar, 23 verified activities, working files, noindex, no ads and no JS errors.');
}finally{await browser.close()}
