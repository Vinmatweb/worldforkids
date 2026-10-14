const root=document.getElementById("activity-root");
const groups=[
 ["coloring","Omalovánky","Omalovánky LV1 až LV5; každá úroveň má samostatný barevný vzor."],
 ["tracing","Obtahovačky","Dostupné úrovně LV1–LV3. Návrhy ke kontrole jsou označené."],
 ["story","Příběhy","12 obrázkových dílů. Krátké texty se doplní později."],
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
  const area=create("section","category");
  area.dataset.category=type;
  area.append(create("h3","",title),create("p","desc",caption));
  const items=(data.activities||[]).filter(a=>a.type===type&&a.language==="cs"&&a.collectionIds?.includes("international-days-snow-leopard")&&a.verified===true&&a.url&&a.previewUrl);
  if(!items.length)area.append(create("p","empty","Zatím zde není zveřejněný schválený materiál."));
  else{
   const list=create("div","activity-list");
   for(const item of items){
    const card=create("article","activity"),img=create("img");
    img.src=item.previewUrl;img.alt=item.name+" "+item.level+" – náhled";img.loading="lazy";
    card.append(img,create("strong","",item.name),create("div","level",item.level+" · "+item.format));
    if(item.reviewStatus)card.append(create("span","review-status","Ke kontrole"));
    const link=create("a","",linkLabel(item));link.href=item.url;link.setAttribute("download",item.fileName);link.setAttribute("aria-label",linkLabel(item)+" "+item.level);
    card.append(link);list.append(card);
   }
   area.append(list);
  }
  root.append(area);
 }
}).catch(()=>{root.replaceChildren(create("p","error","Registr aktivit se nepodařilo načíst."))});
