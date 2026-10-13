const root=document.getElementById('activity-root');
const groups=[
 ['coloring','Omalovánky','Úrovně LV1 až LV5; odkazy pouze na vydané materiály.'],
 ['tracing','Obtahovačky','Zobrazíme jen skutečně dostupné úrovně.'],
 ['story','Příběhy','Příběhy z horského prostředí.'],
 ['info-card','Informační karty','Naučné karty s informacemi o zvířeti.'],
 ['other','Další dostupné aktivity','Další pracovní listy pro objevitele.']
];
function create(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
fetch(new URL('../data/activities.json',import.meta.url))
.then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
.then(data=>{
 root.replaceChildren();
 for(const [type,title,caption] of groups){
  const area=create('section','category');
  area.append(create('h3','',title),create('p','desc',caption));
  const items=(data.activities||[]).filter(a=>a.type===type&&a.collectionIds?.includes('international-days-snow-leopard')&&a.verified===true&&a.url&&a.previewUrl);
  if(!items.length)area.append(create('p','empty','Zatím není zveřejněný žádný ověřený materiál této kategorie.'));
  else{
   const list=create('div','activity-list');
   for(const item of items){
    const card=create('article','activity'),img=create('img');
    img.src=item.previewUrl;img.alt=item.name+' – náhled';img.loading='lazy';
    img.addEventListener('error',()=>card.remove());
    const link=create('a','','Otevřít aktivitu →');link.href=item.url;
    card.append(img,create('strong','',item.name),create('div','level',item.level||''),link);
    list.append(card);
   }
   area.append(list);
  }
  root.append(area);
 }
}).catch(()=>{root.replaceChildren(create('p','error','Registr aktivit se nepodařilo načíst.'))});
