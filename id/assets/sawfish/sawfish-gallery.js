(function(){
"use strict";
const root=document.getElementById("sawfish-gallery");
const lang=root?.dataset.lang||"cs";
const base=root?.dataset.base||"";
const dataUrl=lang==="en"?"../../data/sawfish-activities.json":"../data/sawfish-activities.json";
const labels=lang==="en"?{coloring:"Coloring pages",story:"Story pictures",card:"Information cards",colored:"Colored sample",outline:"Coloring page",open:"Open image",download:"Download",print:"Print",close:"Close"}:{coloring:"Omalovánky",story:"Příběhové obrázky",card:"Informační karty",colored:"Barevný vzor",outline:"Omalovánka",open:"Otevřít obrázek",download:"Stáhnout",print:"Tisk",close:"Zavřít"};
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text)x.textContent=text;return x}
function ensureDialog(){let d=document.getElementById("saw-art-dialog");if(d)return d;
 d=document.createElement("dialog");d.id="saw-art-dialog";d.setAttribute("aria-labelledby","saw-art-title");
 const head=el("div","saw-dialog-head");const title=el("h2","",labels.open);title.id="saw-art-title";const close=el("button","saw-dialog-close","×");close.type="button";close.setAttribute("aria-label",labels.close);close.addEventListener("click",()=>d.close());head.append(title,close);
 const img=el("img","saw-dialog-image");img.alt="";const actions=el("div","saw-dialog-actions");
 const sample=el("button","",labels.colored);sample.type="button";sample.dataset.mode="color";
 const outline=el("button","",labels.outline);outline.type="button";outline.dataset.mode="line";
 const download=el("a","",labels.download);download.setAttribute("download","");
 const print=el("button","",labels.print);print.type="button";print.addEventListener("click",()=>window.print());
 actions.append(sample,outline,download,print);d.append(head,img,actions);document.body.append(d);
 d.addEventListener("click",e=>{if(e.target===d)d.close()});
 d._parts={title,img,sample,outline,download};
 return d}
function openArt(btn){const d=ensureDialog(),p=d._parts,color=btn.dataset.color,line=btn.dataset.line,title=btn.dataset.title||labels.open;
 p.title.textContent=title;p.img.src=color;p.img.alt=title;
 p.sample.onclick=()=>{p.img.src=color;p.sample.classList.add("selected");p.outline.classList.remove("selected");p.download.href=color;p.download.download=(title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()||"sawfish")+"-sample.webp"};
 p.outline.onclick=()=>{p.img.src=line;p.sample.classList.remove("selected");p.outline.classList.add("selected");p.download.href=line;p.download.download=(title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()||"sawfish")+"-coloring.webp"};
 p.sample.classList.add("selected");p.outline.classList.remove("selected");p.download.href=color;p.download.download=(title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()||"sawfish")+"-sample.webp";
 if(!d.open)d.showModal()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-art-open]");if(b)openArt(b)});
if(!root)return;
fetch(dataUrl).then(r=>{if(!r.ok)throw Error("activity data unavailable");return r.json()}).then(items=>{
 const groups={coloring:[],story:[],card:[]};
 items.filter(x=>x.locale==="shared"||x.locale===lang).forEach(x=>groups[x.type]?.push(x));
 for(const [type,list] of Object.entries(groups)){
  if(!list.length)continue;
  const section=el("section","saw-gallery-group");section.setAttribute("aria-label",labels[type]);
  section.append(el("h3","",labels[type]));const grid=el("div","saw-gallery-grid");
  list.forEach(item=>{const card=el("article","saw-art-card");const button=el("button");button.type="button";button.dataset.artOpen="";button.dataset.color=base+item.color;button.dataset.line=base+item.line;button.dataset.title=item.title[lang];
    const img=document.createElement("img");img.src=base+item.thumbnail;img.alt=item.title[lang];img.loading="lazy";button.append(img);
    const name=el("strong","",item.title[lang]);const level=el("small","",lang==="en"?"Level "+item.level:"Úroveň "+item.level);button.append(name,level);button.append(el("small","",labels.open));card.append(button);grid.append(card)});
  section.append(grid);root.append(section)
 }
}).catch(()=>{root.textContent=lang==="en"?"Activities could not be loaded right now.":"Aktivity se nyní nepodařilo načíst."});
})();