(function(){
"use strict";
const root=document.getElementById("irbis-card-gallery");
const lang=(root&&root.dataset.lang==="en")?"en":"cs";
const base=root?root.dataset.base:(lang==="en"?"../../assets/irbis/":"../assets/irbis/");
const dataUrl=lang==="en"?"../../data/irbis-activities.json":"../data/irbis-activities.json";
const W=lang==="en"?{
  color:"Color sample",bw:"Coloring page",trace:"Tracing page",download:"Download",print:"Print",close:"Close",difficulty:"Difficulty",level:"Level",cards:"Information cards",error:"The print file could not be loaded. Check your connection and try again.",pdf:"The print-ready PDF has opened in a new tab. Use its print control.",labels:{basic:"Snow leopard coloring page",story:"Story activity",card:"Information card"},age:{2:"Recommended age: 5–6",3:"Recommended age: 7–9",4:"Recommended age: 10+"}
}:{
  color:"Barevný vzor",bw:"Omalovánka",trace:"Obtahovačka",download:"Stáhnout",print:"Tisk",close:"Zavřít",difficulty:"Obtížnost",level:"Úroveň",cards:"Informační karty",error:"Tiskový soubor se nepodařilo načíst. Zkontroluj připojení a zkus to znovu.",pdf:"Tiskové PDF se otevřelo v nové kartě. Tisk spusť přímo v prohlížeči PDF.",labels:{basic:"Omalovánka levharta sněžného",story:"Příběhový obrázek",card:"Informační karta"},age:{2:"Doporučený věk: 5–6 let",3:"Doporučený věk: 7–9 let",4:"Doporučený věk: 10+ let"}
};
const el=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt)x.textContent=txt;return x};
let activities=null,activitiesPromise=null,opener=null,scrollY=0;
const version=url=>url+(url.includes("?")?"&":"?")+"v=20261019-irbis-v1";
function dialog(){
 let d=document.getElementById("saw-art-dialog");if(d)return d;
 d=document.createElement("dialog");d.id="saw-art-dialog";d.setAttribute("aria-labelledby","saw-art-title");
 const head=el("div","saw-dialog-head"),title=el("h2","saw-dialog-title");title.id="saw-art-title";
 const close=el("button","saw-dialog-close","×");close.type="button";close.setAttribute("aria-label",W.close);close.addEventListener("click",()=>d.close());head.append(title,close);
 const layout=el("div","saw-dialog-layout"),view=el("div","saw-dialog-view"),img=el("img","saw-dialog-image"),printImg=el("img","saw-dialog-print-image"),err=el("p","saw-print-error",W.error);
 img.alt="";printImg.alt="";err.hidden=true;err.setAttribute("role","status");err.setAttribute("aria-live","polite");view.append(img,printImg,err);
 const side=el("aside","saw-dialog-side"),levels=el("div","saw-levels"),levelLabel=el("strong","",W.difficulty);levels.append(levelLabel);const levelButtons=[];
 for(let n=1;n<=5;n++){const b=el("button","",W.level+" "+n);b.type="button";b.dataset.levelChoice=String(n);levels.append(b);levelButtons.push(b)}
 const modes=el("div","saw-mode-buttons"),color=el("button","",W.color),bw=el("button","",W.bw),trace=el("button","",W.trace);[color,bw,trace].forEach(b=>b.type="button");modes.append(color,bw,trace);
 const actions=el("div","saw-dialog-actions"),download=el("a","",W.download),print=el("button","",W.print);download.setAttribute("download","");print.type="button";
 print.addEventListener("click",async()=>{
   const p=d.parts,asset=p.variant;if(!asset)return;print.disabled=true;err.hidden=true;
   try{
     if(asset.print.toLowerCase().endsWith(".pdf")){
       const opened=window.open(version(base+asset.print),"_blank","noopener");
       if(!opened)throw new Error("PDF tab blocked");
       err.textContent=W.pdf;err.hidden=false;return;
     }
     const source=base+asset.print;printImg.removeAttribute("src");printImg.src=version(source);
     if(!printImg.complete)await new Promise((resolve,reject)=>{printImg.onload=resolve;printImg.onerror=()=>reject(new Error("print load failed"))});
     if(!printImg.naturalWidth)throw new Error("empty print image");
     if(printImg.decode)await printImg.decode();
     document.body.dataset.printOrientation=asset.orientation||"portrait";
     d.pageRule.textContent="@page{size:A4 "+(asset.orientation||"portrait")+";margin:0}";
     window.print();
   }catch(e){printImg.removeAttribute("src");err.textContent=W.error;err.hidden=false}
   finally{print.disabled=false}
 });
 actions.append(download,print);side.append(levels,modes,actions);layout.append(view,side);d.append(head,layout);document.body.append(d);
 d.addEventListener("click",ev=>{if(ev.target===d)d.close()});
 d.addEventListener("close",()=>{printImg.removeAttribute("src");err.hidden=true;if(opener&&opener.isConnected)opener.focus({preventScroll:true});window.scrollTo({top:scrollY,behavior:"instant"})});
 const pageRule=el("style");pageRule.id="irbis-print-page-rule";pageRule.textContent="@page{size:A4 portrait;margin:0}";document.head.append(pageRule);
 d.parts={title,img,printImg,err,print,download,levels,levelButtons,color,bw,trace,mode:"color",kind:"",level:5,item:null,variant:null,pageRule};
 return d;
}
function titleFor(kind,item,level){
 if(kind==="basic")return W.labels.basic+" · "+W.level+" "+level;
 if(kind==="card")return W.labels.card+" · LV"+(item.level||level)+" · "+(lang==="en"?"English":"česky");
 const id=item.id||"";return W.labels.story+" "+id.slice(-2)+"/12 · LV"+item.level;
}
function setMode(d,mode){
 const p=d.parts;let item=p.item;
 if(p.kind==="card")item=activities.cards.find(x=>x.level===p.level)[lang];
 else if(p.kind==="basic")item=activities.basic.find(x=>x.level===p.level);
 const v=item&&item[mode];if(!v){p.mode="bw";mode="bw";item=p.kind==="card"?activities.cards.find(x=>x.level===p.level)[lang]:p.kind==="basic"?activities.basic.find(x=>x.level===p.level):p.item}
 const variant=item&&item[mode];if(!variant)return;
 p.mode=mode;p.item=item;p.variant=variant;p.title.textContent=titleFor(p.kind,item,p.level);p.img.src=version(base+variant.preview);p.img.alt=p.title.textContent;p.printImg.removeAttribute("src");p.err.hidden=true;
 p.download.href=version(base+variant.download);p.download.download=variant.name;
 [[p.color,"color"],[p.bw,"bw"],[p.trace,"trace"]].forEach(([b,m])=>{b.hidden=!item[m];b.classList.toggle("selected",m===mode);b.setAttribute("aria-pressed",String(m===mode))});
}
function open(button){
 if(!activities){if(activitiesPromise)activitiesPromise.then(()=>open(button)).catch(()=>{});return}const d=dialog(),p=d.parts;opener=button;scrollY=window.scrollY;p.err.hidden=true;p.printImg.removeAttribute("src");
 p.kind=button.hasAttribute("data-basic-open")?"basic":button.hasAttribute("data-card-level")?"card":"story";
 p.level=p.kind==="basic"?Number(button.dataset.level||5):p.kind==="card"?Number(button.dataset.cardLevel||2):0;
 p.item=p.kind==="story"?activities.stories.find(x=>x.id===button.dataset.storyId):null;p.mode=button.dataset.mode||"color";
 p.levels.hidden=p.kind!=="basic";
 p.levelButtons.forEach(b=>{b.classList.toggle("selected",Number(b.dataset.levelChoice)===p.level);b.setAttribute("aria-pressed",String(Number(b.dataset.levelChoice)===p.level))});
 p.trace.hidden=!(p.kind==="basic"?activities.basic.find(x=>x.level===p.level)?.trace:p.kind==="story"?p.item?.trace:false);
 p.color.textContent=W.color;p.bw.textContent=p.kind==="card"?(lang==="en"?"Black and white":"Černobílá karta"):W.bw;
 if(p.kind==="card")p.level=Number(button.dataset.cardLevel||2);
 if(!p.item&&p.kind==="story")return;
 setMode(d,p.mode);if(!d.open)d.showModal();
}
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-art-open]");if(b){ev.preventDefault();open(b)}});
if(root){
 activitiesPromise=fetch(version(dataUrl)).then(r=>{if(!r.ok)throw Error("activity data");return r.json()}).then(items=>{
  activities=items;const grid=el("div","saw-gallery-grid");
  items.cards.forEach(item=>{
    const card=el("article","saw-art-card"),button=el("button","saw-card-open");button.type="button";button.dataset.artOpen="";button.dataset.cardLevel=String(item.level);button.setAttribute("aria-label",W.labels.card+" · LV"+item.level);
    const chosen=item[lang],thumb=el("img");thumb.src=version(base+chosen.color.preview);thumb.alt=titleFor("card",item,item.level);thumb.loading="lazy";thumb.decoding="async";button.append(thumb);
    const label=el("strong","card-level","LV"+item.level),age=el("small","age-label",W.age[item.level]);card.append(button,label,age);grid.append(card);
  });root.append(grid);
  document.querySelectorAll("[data-basic-open]").forEach(b=>{if(!b.dataset.level)b.dataset.level="5"});
  const levelBtns=()=>document.querySelectorAll("#saw-art-dialog [data-level-choice]");
  document.addEventListener("click",ev=>{const b=ev.target.closest("#saw-art-dialog [data-level-choice]");if(!b)return;const d=document.getElementById("saw-art-dialog"),p=d.parts;p.level=Number(b.dataset.levelChoice);const available=p.kind==="basic"?activities.basic.find(x=>x.level===p.level):null;if(p.mode==="trace"&&!available?.trace)p.mode="bw";p.levelButtons.forEach(x=>{x.classList.toggle("selected",x===b);x.setAttribute("aria-pressed",String(x===b))});setMode(d,p.mode)});
  const d=dialog();d.parts.color.addEventListener("click",()=>setMode(d,"color"));d.parts.bw.addEventListener("click",()=>setMode(d,"bw"));d.parts.trace.addEventListener("click",()=>setMode(d,"trace"));
 }).catch(()=>{root.textContent=lang==="en"?"Information cards are temporarily unavailable.":"Informační karty se nepodařilo načíst."});
}
})();
