import { getOccurrence, eventOccursOn, calendarDateKey } from "./calendar-dates.mjs";
const $ = id => document.getElementById(id);
const EN = document.documentElement.lang === "en";
const TXT = EN ? {
  month:"long", empty:"No verified event is listed for this day yet.",
  loadError:"Calendar data could not be loaded.",
  count:(n,y)=>n+(n===1?" event":" events")+" listed for "+y,
  dayTypes:{un:"UN observance",unesco:"UNESCO day",campaign:"Campaign / conservation initiative",national:"National day",other:"Other awareness day"},
  organizerMissing:"Organizer not yet verified",
  source:"Verification source", detail:"Open detail →", verify:"Verify source ↗",
  more:n=>"+"+n+(n===1?" more":" more"),
  monthLabel:"Month",yearLabel:"Year",agenda:"Selected day",
  origin:"Origin",organizer:"Organisation",
  activities:"Learn about animals together through colouring pages, stories and learning cards.",
  verifiedCopy:"Each event links to a verification source. Organisations are named when their role is confirmed."
} : {
  month:"long", empty:"Na tento den zatím nemáme zařazenou ověřenou událost.",
  loadError:"Data kalendáře se nepodařilo načíst.",
  count:(n,y)=>n+(n===1?" událost":([2,3,4].includes(n)?" události":" událostí"))+" v roce "+y,
  dayTypes:{un:"Den OSN",unesco:"Den UNESCO",campaign:"Kampaň / ochranářská iniciativa",national:"Národní den",other:"Ostatní připomínkový den"},
  organizerMissing:"Pořadatel zatím neověřen",
  source:"Ověřovací zdroj", detail:"Otevřít stránku →", verify:"Ověřit zdroj ↗",
  more:n=>"+"+n+(n===1?" další":(n>=2&&n<=4?" další":" dalších")),
  monthLabel:"Měsíc",yearLabel:"Rok",agenda:"Vybraný den",
  origin:"Původ",organizer:"Pořadatel",
  activities:"Poznávejte zvířata společně pomocí omalovánek, příběhů a naučných karet.",
  verifiedCopy:"Každá událost odkazuje na ověřovací zdroj. Organizaci uvádíme, když je její role potvrzená."
};
const LOCALE = EN ? "en-GB" : "cs-CZ";
const monthFormatter = new Intl.DateTimeFormat(LOCALE,{month:"long"});
const todayDate = new Date();
const dateFromKey = key => { const p=String(key).split("-").map(Number); return new Date(p[0],p[1]-1,p[2]); };
const keyDate = key => /^\d{4}-\d{2}-\d{2}$/.test(key||"") && calendarDateKey(dateFromKey(key))===key;
const monday = d => { const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()-(x.getDay()+6)%7); return x; };
const addDays = (d,n) => { const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()+n); return x; };
const addMonths = (d,n) => { const first=new Date(d.getFullYear(),d.getMonth()+n,1); const day=Math.min(d.getDate(),new Date(first.getFullYear(),first.getMonth()+1,0).getDate()); return new Date(first.getFullYear(),first.getMonth(),day); };
const el = (tag,cls,value) => { const n=document.createElement(tag); if(cls)n.className=cls; if(value!==undefined)n.textContent=value; return n; };
const params = new URLSearchParams(location.search);
let selected = keyDate(params.get("date")) ? dateFromKey(params.get("date")) : new Date(todayDate.getFullYear(),todayDate.getMonth(),todayDate.getDate());
let view = ["month","week","day"].includes(params.get("view")) ? params.get("view") : (innerWidth<620?"week":"month");
let events = [], organization=params.get("org")||"all", classification=params.get("type")||"all";
function eventName(e){return EN?(e.nameEn||e.name):e.name}
function organizerNames(e){return (e.organizers||[]).map(o=>EN?o.nameEn:o.name).filter(Boolean)}
function detailPath(e){return EN?(e.detailUrlEn||e.detailUrl):e.detailUrl}
function detailHref(e){const path=detailPath(e);return path?(path.startsWith("/")?new URL(path,location.origin).href:new URL("./"+path,location.href).href):null}
function typeName(e){return EN?e.typeLabelEn:e.typeLabel}
function categoryName(e){return TXT.dayTypes[e.classification]||TXT.dayTypes.other}
function eventMatchesFilters(e){
 const ids=(e.organizers||[]).map(o=>o.id);
 return (organization==="all"||ids.includes(organization))&&(classification==="all"||e.classification===classification);
}
function visible(date){return events.filter(e=>eventMatchesFilters(e)&&eventOccursOn(e,date))}
function formatOccurrence(e,year){
 const o=getOccurrence(e,year);if(!o)return "";
 const s=dateFromKey(o.start),end=dateFromKey(o.end),options={day:"numeric",month:TXT.month,year:"numeric"};
 return new Intl.DateTimeFormat(LOCALE,options).format(s)+(o.start===o.end?"":" – "+new Intl.DateTimeFormat(LOCALE,options).format(end));
}
function eventLink(parent,e,kind,label){
 const href=kind==="detail"?detailHref(e):e.sourceUrl;if(!href)return;
 const a=el("a","",label);a.href=href;
 if(kind==="source"){a.target="_blank";a.rel="noopener noreferrer"}
 parent.append(a);
}
function syncAddress(){
 const url=new URL(location.href);
 url.searchParams.set("date",calendarDateKey(selected));
 url.searchParams.set("view",view);
 organization==="all"?url.searchParams.delete("org"):url.searchParams.set("org",organization);
 classification==="all"?url.searchParams.delete("type"):url.searchParams.set("type",classification);
 history.replaceState(null,"",url.pathname+url.search+url.hash);
 document.querySelectorAll("[data-language-link]").forEach(a=>{
  const target=new URL(a.getAttribute("href"),location.href);
  target.search=url.search; a.href=target.href;
 });
}
function renderAgenda(){
 $("agenda-title").textContent=new Intl.DateTimeFormat(LOCALE,{day:"numeric",month:TXT.month,year:"numeric"}).format(selected);
 const root=$("agenda-list");root.replaceChildren();const list=visible(selected);
 if(!list.length){root.append(el("p","note",TXT.empty));return}
 for(const item of list){
  const card=el("article","agenda-item"),info=el("div","agenda-info");
  info.append(el("strong","",eventName(item)));
  info.append(el("span","agenda-date",formatOccurrence(item,selected.getFullYear())));
  info.append(el("span","agenda-type",categoryName(item)+" · "+typeName(item)));
  const names=organizerNames(item);
  info.append(el("span","agenda-organizer",names.length?TXT.organizer+": "+names.join(", "):TXT.organizerMissing));
  if(item.origin)info.append(el("span","agenda-origin",TXT.origin+": "+(EN?item.origin.en:item.origin.cs)));
  const links=el("div","agenda-links");
  if(detailHref(item))eventLink(links,item,"detail",TXT.detail);
  eventLink(links,item,"source",TXT.source+" ↗");
  card.append(info,links);root.append(card);
 }
}
function renderCount(){
 const year=selected.getFullYear(),n=events.filter(e=>eventMatchesFilters(e)&&getOccurrence(e,year)).length;
 $("total-count").textContent=TXT.count(n,year);
}
function updatePickers(){
 $("month-select").value=String(selected.getMonth());
 $("year-select").value=String(selected.getFullYear());
}
function render(){
 document.querySelectorAll("[data-view]").forEach(b=>{const on=b.dataset.view===view;b.classList.toggle("selected-view",on);b.setAttribute("aria-pressed",String(on))});
 const root=$("cal-grid");root.replaceChildren();
 let start,end;
 if(view==="month"){
  const first=new Date(selected.getFullYear(),selected.getMonth(),1),last=new Date(selected.getFullYear(),selected.getMonth()+1,0);
  start=monday(first);end=addDays(monday(last),6);
  $("period-label").textContent=new Intl.DateTimeFormat(LOCALE,{month:TXT.month,year:"numeric"}).format(first);
 }else if(view==="week"){
  start=monday(selected);end=addDays(start,6);
  const opt={day:"numeric",month:"short"},yr={day:"numeric",month:"short",year:"numeric"};
  $("period-label").textContent=new Intl.DateTimeFormat(LOCALE,opt).format(start)+" – "+new Intl.DateTimeFormat(LOCALE,yr).format(end);
 }else{
  start=new Date(selected);end=new Date(selected);
  $("period-label").textContent=new Intl.DateTimeFormat(LOCALE,{weekday:"long",day:"numeric",month:TXT.month,year:"numeric"}).format(selected);
 }
 root.style.gridTemplateColumns=view==="day"?"1fr":"repeat(7,minmax(0,1fr))";
 $("weekdays").hidden=view==="day";
 for(let d=new Date(start);d<=end;d=addDays(d,1)){
  const key=calendarDateKey(d),active=key===calendarDateKey(selected);
  const cell=el("div","day-cell"+(view==="month"&&d.getMonth()!==selected.getMonth()?" muted":"")+(key===calendarDateKey(todayDate)?" today":"")+(active?" is-active":""));
  const day=el("button","date-btn",view==="day"?new Intl.DateTimeFormat(LOCALE,{weekday:"long",day:"numeric",month:TXT.month}).format(d):String(d.getDate()));
  day.type="button";day.dataset.date=key;day.setAttribute("aria-label",new Intl.DateTimeFormat(LOCALE,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d));day.setAttribute("aria-pressed",String(active));
  day.addEventListener("click",()=>{selected=new Date(d);render()});cell.append(day);
  const arr=visible(d),max=view==="day"?999:2;
  for(const item of arr.slice(0,max)){
   const href=detailHref(item)||item.sourceUrl,link=el("a","event-chip is-"+(item.classification||"other"));
   link.href=href;if(!detailHref(item)){link.target="_blank";link.rel="noopener noreferrer"}
   link.title=eventName(item)+" · "+(organizerNames(item).join(", ")||typeName(item));
   link.append(el("span","event-title",eventName(item)));
   link.append(el("small","event-meta",organizerNames(item).join(", ")||typeName(item)));
   cell.append(link);
  }
  if(arr.length>max){
   const more=arr.length-max,b=el("button","more-btn",TXT.more(more));b.type="button";
   b.setAttribute("aria-label",(EN?"Show all events for ":"Zobrazit všechny události pro ")+new Intl.DateTimeFormat(LOCALE,{day:"numeric",month:"long",year:"numeric"}).format(d));
   b.addEventListener("click",()=>{selected=new Date(d);render();$("agenda").scrollIntoView({block:"nearest"})});cell.append(b);
  }
  root.append(cell);
 }
 updatePickers();renderAgenda();renderCount();syncAddress();
}
function setDateAndRender(date){selected=new Date(date.getFullYear(),date.getMonth(),date.getDate());render()}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;render()}));
$("prev").addEventListener("click",()=>setDateAndRender(view==="month"?addMonths(selected,-1):addDays(selected,view==="week"?-7:-1)));
$("next").addEventListener("click",()=>setDateAndRender(view==="month"?addMonths(selected,1):addDays(selected,view==="week"?7:1)));
$("today").addEventListener("click",()=>setDateAndRender(todayDate));
$("month-select").addEventListener("change",e=>setDateAndRender(new Date(selected.getFullYear(),Number(e.target.value),Math.min(selected.getDate(),new Date(selected.getFullYear(),Number(e.target.value)+1,0).getDate()))));
$("year-select").addEventListener("change",e=>setDateAndRender(new Date(Number(e.target.value),selected.getMonth(),Math.min(selected.getDate(),new Date(Number(e.target.value),selected.getMonth()+1,0).getDate()))));
$("org-filter").addEventListener("change",e=>{organization=e.target.value;render()});
$("status-filter").addEventListener("change",e=>{classification=e.target.value;render()});
$("month-select").setAttribute("aria-label",TXT.monthLabel);$("year-select").setAttribute("aria-label",TXT.yearLabel);
const monthSelect=$("month-select");monthSelect.replaceChildren();
for(let i=0;i<12;i++){const opt=document.createElement("option");opt.value=String(i);opt.textContent=monthFormatter.format(new Date(2026,i,1));monthSelect.append(opt)}
const yearSelect=$("year-select");yearSelect.replaceChildren();
const yearStart=Math.min(2024,todayDate.getFullYear()),yearEnd=Math.max(todayDate.getFullYear()+10,2035);
for(let y=yearStart;y<=yearEnd;y++){const opt=document.createElement("option");opt.value=String(y);opt.textContent=String(y);yearSelect.append(opt)}
function initFilterFromUrl(id,value,allowed){if(allowed.includes(value))$(id).value=value;return $(id).value}
organization=params.get("org")||"all";
classification=initFilterFromUrl("status-filter",classification,["all","un","unesco","campaign","national","other"]);
document.querySelectorAll("[data-language-link]").forEach(a=>{a.addEventListener("click",()=>syncAddress())});
$("contact-copy").addEventListener("click",async()=>{const status=$("contact-status"),email="vinmatforkids@gmail.com";try{await navigator.clipboard.writeText(email);status.textContent=EN?"Email copied":"E-mail zkopírován"}catch{const input=document.createElement("textarea");input.value=email;input.style.position="fixed";input.style.opacity="0";document.body.append(input);input.select();document.execCommand("copy");input.remove();status.textContent=EN?"Email copied":"E-mail zkopírován"}setTimeout(()=>status.textContent="",2200)});
document.addEventListener("keydown",e=>{
 if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
 const active=document.activeElement;if(!active?.matches(".date-btn"))return;
 e.preventDefault();const next=addDays(dateFromKey(active.dataset.date),e.key==="ArrowRight"?1:-1);
 setDateAndRender(next);
 const target=$('[data-date="'+calendarDateKey(next)+'"]');if(target)target.focus();
});
fetch(new URL("../data/events.json?v=20261020-calendar-fixes-v1",import.meta.url))
 .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()})
 .then(data=>{
  events=data.events;
  const select=$("org-filter"),first=select.options[0];select.replaceChildren(first);
  const map=new Map();events.forEach(e=>(e.organizers||[]).forEach(o=>{if(!map.has(o.id))map.set(o.id,EN?o.nameEn:o.name)}));
  [...map].sort((a,b)=>a[1].localeCompare(b[1],LOCALE)).forEach(([id,label])=>{const option=document.createElement("option");option.value=id;option.textContent=label;select.append(option)});
  organization=initFilterFromUrl("org-filter",organization,["all",...[...map.keys()]]);
  render();
 }).catch(()=>{$("cal-grid").replaceChildren(el("p","error",TXT.loadError))});
