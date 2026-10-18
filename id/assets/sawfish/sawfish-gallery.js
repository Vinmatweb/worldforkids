(function(){
"use strict";
const root=document.getElementById("sawfish-gallery");
const lang=root&&root.dataset.lang==="en"?"en":"cs";
const base=root?root.dataset.base:(lang==="en"?"../../assets/sawfish/":"../assets/sawfish/");
const dataUrl=lang==="en"?"../../data/sawfish-activities.json":"../data/sawfish-activities.json";
const printRoot=base+"print/";
const assetVersion="20261018-activity-files";
const versioned=url=>url?url+(url.includes("?")?"&":"?")+"v="+assetVersion:url;
const W=lang==="en"?{cards:"Information cards",card:"Information card",colored:"Color sample",outline:"Coloring page",trace:"Tracing page",download:"Download",print:"Print",close:"Close",difficulty:"Difficulty",level:"Level",open:"Open coloring page",ages:{2:"Recommended age: 5–6",3:"Recommended age: 7–9",4:"Recommended age: 10+"},maze:"Open mangrove maze"}:{cards:"Informační karty",card:"Informační karta",colored:"Barevný vzor",outline:"Omalovánka",trace:"Obtahovačka",download:"Stáhnout",print:"Tisk",close:"Zavřít",difficulty:"Obtížnost",level:"Úroveň",open:"Otevřít omalovánku",ages:{2:"Doporučený věk: 5–6 let",3:"Doporučený věk: 7–9 let",4:"Doporučený věk: 10+ let"},maze:"Otevřít bludiště mangrovů"};
const el=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt)x.textContent=txt;return x};
let opener=null,scrollY=0;
function dialog(){
 let d=document.getElementById("saw-art-dialog");if(d)return d;
 d=document.createElement("dialog");d.id="saw-art-dialog";d.setAttribute("aria-labelledby","saw-art-title");
 const head=el("div","saw-dialog-head"),title=el("h2","");title.id="saw-art-title";
 const close=el("button","saw-dialog-close","×");close.type="button";close.setAttribute("aria-label",W.close);close.addEventListener("click",()=>d.close());head.append(title,close);
 const layout=el("div","saw-dialog-layout"),view=el("div","saw-dialog-view"),img=el("img","saw-dialog-image");img.alt="";view.append(img);
 const side=el("aside","saw-dialog-side"),levels=el("div","saw-levels"),levelTitle=el("strong","",W.difficulty),levelButtons=[];
 levels.append(levelTitle);
 for(let i=1;i<=5;i++){const b=el("button","",(lang==="en"?"Level ":"Úroveň ")+i);b.type="button";b.dataset.levelChoice=String(i);levels.append(b);levelButtons.push(b)}
 const modes=el("div","saw-mode-buttons"),sample=el("button","",W.colored),outline=el("button","",W.outline),trace=el("button","",W.trace);
 [sample,outline,trace].forEach(b=>b.type="button");modes.append(sample,outline,trace);
 const actions=el("div","saw-dialog-actions"),download=el("a","",W.download),print=el("button","",W.print);download.setAttribute("download","");print.type="button";print.addEventListener("click",()=>window.print());actions.append(download,print);
 side.append(levels,modes,actions);layout.append(view,side);d.append(head,layout);document.body.append(d);
 d.addEventListener("click",ev=>{if(ev.target===d)d.close()});
 d.addEventListener("close",()=>{if(opener&&opener.isConnected)opener.focus({preventScroll:true});window.scrollTo({top:scrollY,behavior:"instant"})});
 d.parts={title,img,levels,levelButtons,sample,outline,trace,download,kind:"",mode:"color",level:5,dir:"",files:null};return d;
}
function open(btn){
 const d=dialog(),p=d.parts;opener=btn;scrollY=window.scrollY;
 p.kind=btn.dataset.kind||"card";p.title.textContent=btn.dataset.title||W.cards;p.level=Number(btn.dataset.level||5);p.dir=btn.dataset.dir||base;p.mode=btn.dataset.mode||"color";
 p.levels.hidden=p.kind!=="basic";
 p.trace.hidden=!btn.dataset.trace&&p.kind!=="basic";
 p.sample.textContent=W.colored;p.outline.textContent=p.kind==="card"? (lang==="en"?"Black-and-white":"Černobílá karta"):W.outline;
 p.levelButtons.forEach(b=>b.classList.toggle("selected",Number(b.dataset.levelChoice)===p.level));
 function filesForLevel(n){
  return {
   color:{preview:printRoot+"sawfish-color-sample-lv"+n+"-en.png",download:printRoot+"sawfish-color-sample-lv"+n+"-en.png",name:"sawfish-coloring-lv"+n+"-en-color-sample.png"},
   bw:{preview:printRoot+"sawfish-coloring-lv"+n+"-en-bw.png",download:printRoot+"sawfish-coloring-lv"+n+"-en-bw.pdf",name:"sawfish-coloring-lv"+n+"-en-bw.pdf"},
   trace:{preview:printRoot+"sawfish-tracing-lv"+n+"-en.png",download:printRoot+"sawfish-tracing-lv"+n+"-en.png",name:"sawfish-tracing-lv"+n+"-en.png"}
  };
 }
 function show(mode){
  p.mode=mode;p.files=p.kind==="basic"?filesForLevel(p.level):{
   color:{preview:btn.dataset.color,download:btn.dataset.printColor||btn.dataset.color,name:(btn.dataset.filename||"sawfish-activity")+"-color.png"},
   bw:{preview:btn.dataset.line,download:btn.dataset.printLine||btn.dataset.line,name:(btn.dataset.filename||"sawfish-activity")+"-bw"+((btn.dataset.printLine||"").endsWith(".pdf")?".pdf":".png")},
   trace:{preview:btn.dataset.trace,download:btn.dataset.printTrace||btn.dataset.trace,name:(btn.dataset.filename||"sawfish-activity")+"-tracing.png"}
  };
  const f=p.files[mode];if(!f||!f.preview)return;
  p.img.src=versioned(f.preview);p.img.alt=p.title.textContent;p.download.href=versioned(f.download);p.download.download=f.name;
  [[p.sample,"color"],[p.outline,"bw"],[p.trace,"trace"]].forEach(([b,m])=>{b.classList.toggle("selected",m===mode);b.setAttribute("aria-pressed",String(m===mode))});
 }
 p.levelButtons.forEach(b=>b.onclick=()=>{p.level=Number(b.dataset.levelChoice);p.title.textContent=(lang==="en"?"Sawfish coloring page":"Omalovánka pilouna")+ " · "+W.level+" "+p.level;p.levelButtons.forEach(x=>x.classList.toggle("selected",x===b));show(p.mode)});
 p.sample.onclick=()=>show("color");p.outline.onclick=()=>show("bw");p.trace.onclick=()=>show("trace");
 show(p.mode);if(!d.open)d.showModal();
}
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-art-open]");if(b){ev.preventDefault();open(b)}});
if(!root)return;
fetch(dataUrl).then(r=>{if(!r.ok)throw Error("data");return r.json()}).then(items=>{
 const cards=items.filter(x=>x.type==="card"&&x.locale===lang);
 const section=el("section","saw-gallery-group");section.setAttribute("aria-label",W.cards);const grid=el("div","saw-gallery-grid");
 cards.sort((a,b)=>a.level-b.level).forEach(item=>{
  const card=el("article","saw-art-card"),button=el("button","saw-card-open");button.type="button";button.dataset.artOpen="";button.dataset.kind="card";button.dataset.color=base+item.color;button.dataset.line=base+item.line;button.dataset.printColor=base+item.printColor;button.dataset.printLine=base+item.printLine;button.dataset.level=item.level;button.dataset.title=(lang==="en"?"Information card · LV":"Informační karta · LV")+item.level+" · "+(lang==="en"?"English":"česky");button.dataset.filename="sawfish-information-card-lv"+item.level+"-"+lang;
  const image=document.createElement("img");image.src=base+item.thumbnail;image.alt=button.dataset.title;image.loading="lazy";button.append(image);const label=el("strong","card-level","LV"+item.level);const age=el("small","age-label",W.ages[item.level]||"");card.append(button,label,age);grid.append(card);
 });
 if(cards.length){section.append(grid);root.append(section)}
 const topic=document.querySelector('[data-activity-topic="mangrove"]');
 const mazes=items.filter(x=>x.type==="maze"&&x.topic==="mangrove");
 if(topic&&mazes.length){const wrap=el("div","saw-related-activities"),label=el("strong","",lang==="en"?"Related activity: mangrove maze":"Související aktivita: bludiště mangrovů"),list=el("div","saw-related-buttons");wrap.append(label,list);
  mazes.forEach(item=>{const b=el("button","saw-open-activity",(lang==="en"?"Level ":"Úroveň ")+item.level+(item.variant?" · "+(lang==="en"?"variant ":"varianta ")+item.variant:""));b.type="button";b.dataset.artOpen="";b.dataset.kind="maze";b.dataset.level=item.level;b.dataset.color=base+item.color;b.dataset.line=base+item.line;b.dataset.printColor=base+item.color;b.dataset.printLine=base+item.line;b.dataset.title=(lang==="en"?"Mangrove maze · LV":"Bludiště mangrovů · LV")+item.level+(item.variant?" · "+item.variant:"");b.dataset.filename="sawfish-mangrove-maze-lv"+item.level+(item.variant?"-v"+item.variant:"")+"-"+(item.materialLocale||lang);list.append(b)});
  topic.append(wrap);
 }
}).catch(()=>{if(root)root.textContent=lang==="en"?"Information cards could not be loaded.":"Informační karty se nepodařilo načíst."});
})();