import vm from 'node:vm';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = process.cwd();
const source = await readFile('assets/js/featured-activities.js','utf8');
let checks=0;
for (const language of ['en','cz','de','es']) {
  const folder=language==='en'?'':language==='cz'?'cs':language;
  for (const type of ['omalovanky','obtahovacky','bludiste','spojovacky']) {
    const context=vm.createContext({console,window:{addEventListener(){}},fetch:async()=>({ok:true,text:()=>readFile(`assets/data/${type}.csv`,'utf8')})});
    vm.runInContext(source,context);
    vm.runInContext(`GUIDE_ACTIVITY_CONFIG={type:${JSON.stringify(type)},language:${JSON.stringify(language)},imageFolder:${JSON.stringify((folder?'../':'')+'public/'+type)}}`,context);
    const activities=await vm.runInContext('guideLoadCsv()',context);
    for(const activity of activities) for(const variant of activity.variants) {
      context.activity=activity;context.variant=variant;
      for(const fn of ['guideGetImageBase','guideGetPreviewBase']) {
        const base=vm.runInContext(`${fn}(activity,variant)`,context);
        const relative=base.startsWith('/worldforkids/')?base.slice('/worldforkids/'.length):path.relative(root,path.resolve(root,folder,base));
        const available=await Promise.all(['png','webp'].map(async ext=>{try{return (await stat(path.join(root,relative+'.'+ext))).size>0}catch{return false}}));
        assert(available.some(Boolean),`${language}/${type}/${activity.fileBase}/${variant}: ${fn} -> ${base}`);
        checks++;
      }
      if(type==='obtahovacky') {
        assert.notEqual(vm.runInContext('guideGetImageBase(activity,variant)',context),vm.runInContext('guideGetPreviewBase(activity,variant)',context),'Tracing preview must use its unbranded asset');
        assert(activity.variants.includes('sample'),'Tracing must offer its matching color sample');
      }
    }
    context.activities=activities;
    const top=vm.runInContext('guideSelectTopActivities(activities)',context);context.top=top;
    const bottom=vm.runInContext('guideSelectBottomActivities(activities,top)',context);
    assert.equal(top.length,3);assert.equal(bottom.length,3);
    assert(!bottom.some(b=>top.some(t=>t.id===b.id)),'Top and bottom selections must not overlap');
  }
}
console.log(`Featured guide assets passed: ${checks} preview/download paths, four activity types and four languages.`);
