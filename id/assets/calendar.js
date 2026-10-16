const $=id=>document.getElementById(id);
const EN=document.documentElement.lang==="en";
const STR=EN?{month:"long",empty:"No verified event is listed for this day yet.",official:"Verified official day",other:"Verified awareness day",more:" more",count:" verified events"}:{month:"long",empty:"Na tento den zatím nemáme zařazenou ověřenou událost.",official:"Ověřený oficiální den",other:"Ověřený připomínkový den",more:" dalších",count:" ověřených událostí"};
const LOCALE=EN?"en-GB":"cs-CZ";
let now=new Date(),cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate()),selected=new Date(cursor);
let view=window.innerWidth<620?"week":"month",events=[],organization="all",status="all";
const dateKey=d=>d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();
const dateLabel=(d,o)=>new Intl.DateTimeFormat(LOCALE,o).format(d);
const monday=d=>{const x=new Date(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return x};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const eventMatches=(e,d)=>{if(e.month!==d.getMonth()+1)return false;if(e.repeat==="lastFriday"){const last=new Date(d.getFullYear(),d.getMonth()+1,0);last.setDate(last.getDate()-((last.getDay()+2)%7));return d.getDate()===last.getDate()}return e.day===d.getDate()};
const visible=d=>events.filter(e=>eventMatches(e,d)&&(organization==="all"||e.organizationId===organization)&&(status==="all"||e.status===status));
const eventName=e=>EN?(e.nameEn||e.name):e.name;
const eventOrg=e=>EN?(e.organizationEn||e.organization):e.organization;
const eventDetail=e=>EN?(e.detailUrlEn||e.detailUrl):e.detailUrl;
function renderAgenda(){
 $("agenda-title").textContent=dateLabel(selected,{day:"numeric",month:STR.month,year:"numeric"});
 const root=$("agenda-list");root.replaceChildren();const arr=visible(selected);
 if(!arr.length){root.append(el("p","note",STR.empty));return}
 for(const item of arr){
  const card=el("div","agenda-item"),info=el("div");
  info.append(el("strong","",eventName(item)),el("span","",eventOrg(item)+" · "+(item.status==="official"?STR.official:STR.other)));
  const link=el("a","",item.detailUrl?(EN?"Open detail →":"Otevřít stránku →"):(EN?"Verify source ↗":"Ověřit zdroj ↗"));
  link.href=item.detailUrl?"./"+eventDetail(item):item.sourceUrl;
  if(!item.detailUrl){link.target="_blank";link.rel="noopener noreferrer"}
  card.append(info,link);root.append(card)
 }
}
function render(){
 for(const b of document.querySelectorAll("[data-view]")){const on=b.dataset.view===view;b.classList.toggle("selected-view",on);b.setAttribute("aria-pressed",String(on))}
 const root=$("cal-grid");root.replaceChildren();let start,end;
 if(view==="month"){const first=new Date(cursor.getFullYear(),cursor.getMonth(),1),last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);start=monday(first);end=addDays(monday(last),6);$("period-label").textContent=dateLabel(first,{month:STR.month,year:"numeric"})}
 else if(view==="week"){start=monday(cursor);end=addDays(start,6);$("period-label").textContent=dateLabel(start,{day:"numeric",month:"short"})+" – "+dateLabel(end,{day:"numeric",month:"short",year:"numeric"})}
 else{start=new Date(cursor);end=new Date(cursor);$("period-label").textContent=dateLabel(start,{weekday:"long",day:"numeric",month:STR.month,year:"numeric"})}
 root.style.gridTemplateColumns=view==="day"?"1fr":"repeat(7,minmax(0,1fr))";$("weekdays").hidden=view==="day";
 for(let d=new Date(start);d<=end;d=addDays(d,1)){
  const cell=el("div","day-cell"+(view==="month"&&d.getMonth()!==cursor.getMonth()?" muted":"")+(dateKey(d)===dateKey(now)?" today":"")+(dateKey(d)===dateKey(selected)?" is-active":""));
  const day=el("button","date-btn",view==="day"?dateLabel(d,{weekday:"long",day:"numeric",month:STR.month}):String(d.getDate()));
  day.type="button";day.setAttribute("aria-label",(EN?"Events ":"Události ")+dateLabel(d,{day:"numeric",month:STR.month}));day.addEventListener("click",()=>{selected=new Date(d);render()});cell.append(day);
  const arr=visible(d),max=view==="day"?999:2;
  for(const item of arr.slice(0,max)){
   const link=el(item.detailUrl?"a":"div","event-chip "+(item.status==="official"?"is-official":"is-other"),eventName(item));
   link.style.setProperty("--accent",item.accent||"#689dbb");link.title=eventName(item)+" – "+eventOrg(item);
   if(item.detailUrl)link.href="./"+eventDetail(item);link.append(el("small","",eventOrg(item)));cell.append(link)
  }
  if(arr.length>max){const b=el("button","more-btn","+"+(arr.length-max)+(EN?" more":" dalších"));b.type="button";b.addEventListener("click",()=>{selected=new Date(d);render();$("agenda").scrollIntoView({block:"nearest"})});cell.append(b)}
  root.append(cell)
 }
 renderAgenda();$("total-count").textContent=events.filter(e=>(organization==="all"||e.organizationId===organization)&&(status==="all"||e.status===status)).length+STR.count;
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;render()}));
$("prev").addEventListener("click",()=>{cursor=view==="month"?new Date(cursor.getFullYear(),cursor.getMonth()-1,1):addDays(cursor,view==="week"?-7:-1);selected=new Date(cursor);render()});
$("next").addEventListener("click",()=>{cursor=view==="month"?new Date(cursor.getFullYear(),cursor.getMonth()+1,1):addDays(cursor,view==="week"?7:1);selected=new Date(cursor);render()});
$("today").addEventListener("click",()=>{cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate());selected=new Date(cursor);render()});
$("org-filter").addEventListener("change",e=>{organization=e.target.value;render()});
$("status-filter").addEventListener("change",e=>{status=e.target.value;render()});
fetch(new URL("../data/events.json?v=20261016",import.meta.url)).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{events=data.events;const select=$("org-filter");const all=select.options[0];select.replaceChildren(all);const orgs=new Map();events.forEach(e=>{if(!orgs.has(e.organizationId))orgs.set(e.organizationId,eventOrg(e))});[...orgs].sort((a,b)=>a[1].localeCompare(b[1],LOCALE)).forEach(([id,label])=>{const o=document.createElement("option");o.value=id;o.textContent=label;select.append(o)});render()}).catch(()=>{$("cal-grid").replaceChildren(el("p","error",EN?"Calendar data could not be loaded.":"Data kalendáře se nepodařilo načíst."))});
