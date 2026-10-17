(function(){
"use strict";
const root=document.getElementById("sawfish-gallery");
const lang=root&&root.dataset.lang==="en"?"en":"cs";
const base=root?root.dataset.base:"";
const dataUrl=lang==="en"?"../../data/sawfish-activities.json":"../data/sawfish-activities.json";
const words=lang==="en"?{cards:"Information cards",colored:"Colored sample",outline:"Black-and-white",download:"Download",print:"Print",close:"Close",difficulty:"Difficulty",level:"Level"}:{cards:"Informační karty",colored:"Barevný vzor",outline:"Černobílá karta",download:"Stáhnout",print:"Tisk",close:"Zavřít",difficulty:"Obtížnost",level:"Úroveň"};
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text)x.textContent=text;return x}
function dialog(){
 let d=document.getElementById("saw-art-dialog");if(d)return d;
 d=document.createElement("dialog");d.id="saw-art-dialog";d.setAttribute("aria-labelledby","saw-art-title");
 const head=el("div","saw-dialog-head"),title=el("h2","","");title.id="saw-art-title";
 const close=el("button","saw-dialog-close","×");close.type="button";close.setAttribute("aria-label",words.close);close.addEventListener("click",()=>d.close());head.append(title,close);
 const layout=el("div","saw-dialog-layout"),view=el("div","saw-dialog-view"),img=el("img","saw-dialog-image"),caption=el("p","saw-dialog-caption","");img.alt="";caption.hidden=true;view.append(img,caption);
 const side=el("aside","saw-dialog-side"),levels=el("div","saw-levels"),levelTitle=el("strong","",words.difficulty),levelButtons=[];
 levels.append(levelTitle);
 for(let i=1;i<=5;i++){const b=el("button","",(lang==="en"?"Level ":"Úroveň ")+i);b.type="button";b.dataset.levelChoice=String(i);levels.append(b);levelButtons.push(b)}
 const modes=el("div","saw-mode-buttons"),sample=el("button","",words.colored),outline=el("button","",words.outline);sample.type=outline.type="button";modes.append(sample,outline);
 const actions=el("div","saw-dialog-actions"),download=el("a","",words.download),print=el("button","",words.print);download.setAttribute("download","");print.type="button";print.addEventListener("click",()=>window.print());actions.append(download,print);
 side.append(levels,modes,actions);layout.append(view,side);d.append(head,layout);document.body.append(d);
 d.addEventListener("click",ev=>{if(ev.target===d)d.close()});
 d.parts={title,img,caption,levels,levelButtons,sample,outline,download,kind:"",dir:"",level:5,color:"",line:""};
 return d;
}
function open(btn){
 const d=dialog(),p=d.parts;
 p.title.textContent=btn.dataset.title||words.cards;p.kind=btn.dataset.kind||"card";p.caption.textContent=btn.dataset.story||"";p.caption.hidden=p.kind!=="story"||!p.caption.textContent;p.dir=btn.dataset.dir||base;p.level=Number(btn.dataset.level||5);p.color=btn.dataset.color;p.line=btn.dataset.line;p.levels.hidden=p.kind!=="basic";
 p.outline.textContent=p.kind==="card"?words.outline:(lang==="en"?"Coloring page":"Omalovánka");
 p.levelButtons.forEach(b=>b.classList.toggle("selected",Number(b.dataset.levelChoice)===p.level));
 function show(colored){
   const src=colored?p.color:p.line;p.img.src=src;p.img.alt=p.title.textContent;
   p.sample.classList.toggle("selected",colored);p.outline.classList.toggle("selected",!colored);
   p.download.href=src;p.download.download=(p.title.textContent.replace(/[^a-z0-9]+/gi,"-").toLowerCase()||"sawfish")+(colored?"-color":"-line")+(src.toLowerCase().split(/[?#]/)[0].endsWith(".svg")?".svg":".webp");
 }
 p.levelButtons.forEach(b=>b.onclick=()=>{p.level=Number(b.dataset.levelChoice);p.color=p.dir+"basic-lv"+p.level+"-sample.webp";p.line=p.dir+"basic-lv"+p.level+".webp";p.title.textContent=(lang==="en"?"Sawfish coloring page":"Omalovánka pilouna")+" · "+words.level.toLowerCase()+" "+p.level;p.levelButtons.forEach(x=>x.classList.toggle("selected",x===b));show(true)});
 p.sample.onclick=()=>show(true);p.outline.onclick=()=>show(false);show(true);if(!d.open)d.showModal();
}
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-art-open]");if(b)open(b)});
if(!root)return;
fetch(dataUrl).then(r=>{if(!r.ok)throw Error("data");return r.json()}).then(items=>{
 const cards=items.filter(x=>x.type==="card"&&(x.locale==="shared"||x.locale===lang));
 if(!cards.length){root.textContent=lang==="en"?"No information cards are available yet.":"Informační karty zatím nejsou k dispozici.";return}
 const section=el("section","saw-gallery-group");section.setAttribute("aria-label",words.cards);section.append(el("h3","",words.cards));const grid=el("div","saw-gallery-grid");
 cards.forEach(item=>{const card=el("article","saw-art-card"),button=el("button");button.type="button";button.dataset.artOpen="";button.dataset.kind="card";button.dataset.color=base+item.color;button.dataset.line=base+item.line;button.dataset.title=item.title[lang];
 const image=document.createElement("img");image.src=base+item.thumbnail;image.alt=item.title[lang];image.loading="lazy";button.append(image,el("strong","",item.title[lang]),el("small","",lang==="en"?"Level "+item.level:"Úroveň "+item.level));card.append(button);grid.append(card)});
 section.append(grid);root.append(section);
}).catch(()=>{root.textContent=lang==="en"?"Information cards could not be loaded.":"Informační karty se nepodařilo načíst."});
})();