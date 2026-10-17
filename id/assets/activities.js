const root=document.getElementById("activity-root");
const groups=[
 ["coloring","Omalovánky","Omalovánky LV1 až LV5; každá úroveň má samostatný barevný vzor."],
 ["tracing","Obtahovačky","Dostupné úrovně LV1–LV3. Návrhy ke kontrole jsou označené."],
 ["story","Příběhy","12 barevných příběhových obrázků; každý lze přepnout na odpovídající omalovánku."],
 ["info-card","Informační karty","Černobílá i barevná verze informačních karet."],
 ["other","Další dostupné aktivity","Další pracovní listy pro malé objevitele."]
];
function create(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function linkLabel(item){
 if(item.type==="info-card")return "Otevřít informační kartu PDF →";
 if(item.type==="story")return "Stáhnout příběhovou omalovánku PNG →";
 if(item.type==="tracing")return "Stáhnout obtahovačku PNG →";
 return "Stáhnout omalovánku PNG →";
}
fetch(new URL("../data/activities.json",import.meta.url))
.then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
.then(data=>{
 root.replaceChildren();
 for(const [type,title,caption] of groups){
  const area=create("section","category");area.dataset.category=type;
  area.append(create("h3","",title),create("p","desc",caption));
  const items=(data.activities||[]).filter(a=>a.type===type&&a.language==="cs"&&a.collectionIds?.includes("international-days-snow-leopard")&&a.verified===true&&a.url&&a.previewUrl);
  if(type==="story"){
   const nav=create("div","story-jumps");
   [["1–3","story-parts-01-03"],["4–6","story-parts-04-06"],["7–9","story-parts-07-09"],["10–12","story-parts-10-12"]].forEach(([label,id])=>{const a=create("a","","Díly "+label+" ↓");a.href="#"+id;nav.append(a)});
   area.append(nav);root.append(area);
   for(const slot of document.querySelectorAll("[data-story-slot]")){
    const [lo,hi]=slot.dataset.storySlot.split("-").map(Number);
    for(const item of items.filter(a=>a.storyPart>=lo&&a.storyPart<=hi)){
     const card=create("article","activity"),preview=create("button","activity-preview"),img=create("img");
     preview.type="button";preview.dataset.artOpen="";preview.dataset.preview=item.previewUrl;preview.dataset.lineart=item.url;preview.dataset.filename=item.fileName;preview.dataset.title=item.name+" · "+item.level;
     img.src=item.previewUrl;img.alt=item.name+" "+item.level+" – barevný vzor, otevřít zvětšený náhled";img.loading="lazy";
     preview.append(img);card.append(preview,create("strong","",item.name),create("div","level",item.level+" · "+item.format));
     const link=create("a","",linkLabel(item));link.href=item.url;link.setAttribute("download",item.fileName);link.setAttribute("aria-label",linkLabel(item)+" "+item.level);
     card.append(link);slot.append(card);
    }
   }
   continue;
  }
  if(!items.length)area.append(create("p","empty","Zatím zde není zveřejněný schválený materiál."));
  else{
   const list=create("div","activity-list");
   for(const item of items){
    const card=create("article","activity"),preview=create("button","activity-preview"),img=create("img");
    preview.type="button";preview.dataset.artOpen="";preview.dataset.preview=item.previewUrl;preview.dataset.lineart=item.url;preview.dataset.filename=item.fileName;preview.dataset.title=item.name+" · "+item.level;
    img.src=item.previewUrl;img.alt=item.name+" "+item.level+" – barevný vzor, otevřít zvětšený náhled";img.loading="lazy";
    preview.append(img);card.append(preview,create("strong","",item.name),create("div","level",item.level+" · "+item.format));
    if(item.reviewStatus)card.append(create("span","review-status","Ke kontrole"));
    const link=create("a","",linkLabel(item));link.href=item.url;link.setAttribute("download",item.fileName);link.setAttribute("aria-label",linkLabel(item)+" "+item.level);
    card.append(link);list.append(card);
   }
   area.append(list);
  }
  root.append(area);
 }
}).catch(()=>{root.replaceChildren(create("p","error","Registr aktivit se nepodařilo načíst."))});

function installArtViewer(){
 const dialog=document.createElement("dialog");dialog.className="art-dialog";dialog.setAttribute("aria-label","Zvětšený náhled aktivity");
 const head=create("div","art-dialog-head"),title=create("strong","art-dialog-title","");
 const close=create("button","control","Zavřít");close.type="button";close.addEventListener("click",()=>dialog.close());
 head.append(title,close);const wrap=create("div","art-dialog-image-wrap"),image=create("img","art-dialog-image");
 image.alt="";wrap.append(image);const actions=create("div","art-dialog-actions");
 const toggle=create("button","primary","Zobrazit omalovánku"),download=create("a","","Stáhnout omalovánku"),print=create("button","","Tisknout");
 print.type="button";actions.append(toggle,download,print);dialog.append(head,wrap,actions);document.body.append(dialog);
 let showingPreview=true,previewUrl="",lineartUrl="",filename="";
 function render(){image.src=showingPreview?previewUrl:lineartUrl;toggle.textContent=showingPreview?"Zobrazit omalovánku":"Zobrazit barevný vzor";download.href=lineartUrl;download.download=filename}
 toggle.addEventListener("click",()=>{showingPreview=!showingPreview;render()});
 print.addEventListener("click",()=>{showingPreview=false;render();window.print()});
 document.addEventListener("click",event=>{
  const trigger=event.target.closest("[data-art-open]");if(!trigger)return;
  previewUrl=trigger.dataset.preview;lineartUrl=trigger.dataset.lineart;filename=trigger.dataset.filename||"omalovanka.png";title.textContent=trigger.dataset.title||"Omalovánka";showingPreview=true;render();dialog.showModal();
 });
 dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
}
installArtViewer();
