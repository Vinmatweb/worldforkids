import { getOccurrence, eventOccursOn, calendarDateKey } from "./calendar-dates.mjs";
const $ = id => document.getElementById(id);
const EN = document.documentElement.lang === "en";
const TXT = EN ? {
  month:"long", empty:"No verified event is listed for this day yet.",
  loadError:"Calendar data could not be loaded.",
  count:(n,y)=>n+(n===1?" event":" events")+" listed for "+y,
  dayTypes:{un:"UN observance",unesco:"UNESCO day",campaign:"Campaign / conservation initiative",national:"National day",other:"Other awareness day"},
  organizerMissing:"Organizer not identified in the source record",
  source:"Verification source", detail:"Open detail →",verify:"Verify source ↗",
  more:n=>"+"+n+" more",agenda:"Selected day"
} : {
  month:"long", empty:"Na tento den zatím nemáme zařazenou ověřenou událost.",
  loadError:"Data kalendáře se nepodařilo načíst.",
  count:(n,y)=>n+(n===1?" událost":" událostí")+" v roce "+y,
  dayTypes:{un:"Den OSN",unesco:"Den UNESCO",campaign:"Kampaň / ochranářská iniciativa",national:"Národní den",other:"Ostatní připomínkový den"},
  organizerMissing:"Pořadatel není v ověřovacím zdroji uveden",
  source:"Ověřovací zdroj", detail:"Otevřít stránku →",verify:"Ověřit zdroj ↗",
  more:n=>"+"+n+" dalších",agenda:"Vybraný den"
};
const LOCALE = EN ? "en-GB" : "cs-CZ";
let now = new Date(), cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let selected = new Date(cursor), view = window.innerWidth < 620 ? "week" : "month";
let events = [], organization = "all", classification = "all";
const dateLabel = (d, options) => new Intl.DateTimeFormat(LOCALE, options).format(d);
const dateFromKey = key => { const p=key.split("-").map(Number); return new Date(p[0],p[1]-1,p[2]); };
const monday = d => { const x=new Date(d); x.setDate(x.getDate()-(x.getDay()+6)%7); return x; };
const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const el = (tag,cls,value) => { const n=document.createElement(tag); if(cls)n.className=cls; if(value!==undefined)n.textContent=value; return n; };
const eventName = e => EN ? (e.nameEn || e.name) : e.name;
const organizerNames = e => (e.organizers || []).map(o => EN ? o.nameEn : o.name).filter(Boolean);
const detailPath = e => EN ? (e.detailUrlEn || e.detailUrl) : e.detailUrl;
const detailHref = e => detailPath(e) ? new URL("./"+detailPath(e), location.href).href : null;
const typeName = e => EN ? e.typeLabelEn : e.typeLabel;
const categoryName = e => TXT.dayTypes[e.classification] || TXT.dayTypes.other;
function eventMatchesFilters(e) {
  const orgs = (e.organizers || []).map(o => o.id);
  return (organization === "all" || orgs.includes(organization)) &&
    (classification === "all" || e.classification === classification);
}
function visible(date) { return events.filter(e => eventMatchesFilters(e) && eventOccursOn(e,date)); }
function formatOccurrence(e, year) {
  const o=getOccurrence(e,year);
  if(!o)return "";
  const s=dateFromKey(o.start), end=dateFromKey(o.end);
  const options={day:"numeric",month:"long",year:"numeric"};
  return dateLabel(s,options)+(o.start===o.end?"":" – "+dateLabel(end,options));
}
function eventLink(parent,e,kind,label) {
  const href=kind==="detail"?detailHref(e):e.sourceUrl;
  if(!href)return;
  const a=el("a","",label); a.href=href;
  if(kind==="source"){a.target="_blank";a.rel="noopener noreferrer"}
  parent.append(a);
}
function renderAgenda() {
  const dateKey=calendarDateKey(selected);
  $("agenda-title").textContent=dateLabel(selected,{day:"numeric",month:TXT.month,year:"numeric"});
  const root=$("agenda-list"); root.replaceChildren();
  const arr=visible(selected);
  if(!arr.length){root.append(el("p","note",TXT.empty));return}
  for(const item of arr){
    const card=el("article","agenda-item"), info=el("div","agenda-info");
    info.append(el("strong","",eventName(item)));
    info.append(el("span","agenda-date",formatOccurrence(item,selected.getFullYear())));
    info.append(el("span","agenda-type",categoryName(item)+" · "+typeName(item)));
    const names=organizerNames(item);
    if(names.length) info.append(el("span","agenda-organizer",(EN?"Organizer: ":"Pořadatel: ")+names.join(", ")));
    else info.append(el("span","agenda-organizer",TXT.organizerMissing));
    if(item.origin) info.append(el("span","agenda-origin",(EN?"Origin: ":"Původ: ")+(EN?item.origin.en:item.origin.cs)));
    const links=el("div","agenda-links");
    if(detailHref(item))eventLink(links,item,"detail",TXT.detail);
    eventLink(links,item,"source",TXT.source+" ↗");
    card.append(info,links); root.append(card);
  }
}
function renderCount() {
  const year=cursor.getFullYear();
  const n=events.filter(e=>eventMatchesFilters(e)&&getOccurrence(e,year)).length;
  $("total-count").textContent=TXT.count(n,year);
}
function render() {
  document.querySelectorAll("[data-view]").forEach(b=>{
    const on=b.dataset.view===view;
    b.classList.toggle("selected-view",on); b.setAttribute("aria-pressed",String(on));
  });
  const root=$("cal-grid"); root.replaceChildren();
  let start,end;
  if(view==="month"){
    const first=new Date(cursor.getFullYear(),cursor.getMonth(),1), last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);
    start=monday(first); end=addDays(monday(last),6);
    $("period-label").textContent=dateLabel(first,{month:TXT.month,year:"numeric"});
  } else if(view==="week"){
    start=monday(cursor); end=addDays(start,6);
    $("period-label").textContent=dateLabel(start,{day:"numeric",month:"short"})+" – "+dateLabel(end,{day:"numeric",month:"short",year:"numeric"});
  } else {
    start=new Date(cursor); end=new Date(cursor);
    $("period-label").textContent=dateLabel(start,{weekday:"long",day:"numeric",month:TXT.month,year:"numeric"});
  }
  root.style.gridTemplateColumns=view==="day"?"1fr":"repeat(7,minmax(0,1fr))";
  $("weekdays").hidden=view==="day";
  for(let d=new Date(start);d<=end;d=addDays(d,1)){
    const cell=el("div","day-cell"+(view==="month"&&d.getMonth()!==cursor.getMonth()?" muted":"")+
      (calendarDateKey(d)===calendarDateKey(now)?" today":"")+
      (calendarDateKey(d)===calendarDateKey(selected)?" is-active":""));
    const day=el("button","date-btn",view==="day"?dateLabel(d,{weekday:"long",day:"numeric",month:TXT.month}):String(d.getDate()));
    day.type="button"; day.setAttribute("aria-label",(EN?"Events ":"Události ")+dateLabel(d,{day:"numeric",month:TXT.month}));
    day.addEventListener("click",()=>{selected=new Date(d);render()}); cell.append(day);
    const arr=visible(d), max=view==="day"?999:2;
    for(const item of arr.slice(0,max)){
      const link=el("a","event-chip is-"+item.classification);
      link.href=detailHref(item)||item.sourceUrl;
      if(!detailHref(item)){link.target="_blank";link.rel="noopener noreferrer"}
      link.style.setProperty("--accent",item.accent||"#6f8ca1");
      link.title=eventName(item)+" · "+(organizerNames(item).join(", ")||typeName(item));
      link.append(el("span","event-title",eventName(item)));
      const meta=organizerNames(item).join(", ")||typeName(item);
      link.append(el("small","event-meta",meta));
      cell.append(link);
    }
    if(arr.length>max){
      const b=el("button","more-btn",TXT.more(arr.length-max)); b.type="button";
      b.setAttribute("aria-label",(EN?"Show all events for ":"Zobrazit všechny události pro ")+dateLabel(d,{day:"numeric",month:TXT.month}));
      b.addEventListener("click",()=>{selected=new Date(d);render();$("agenda").scrollIntoView({block:"nearest"})}); cell.append(b);
    }
    root.append(cell);
  }
  renderAgenda(); renderCount();
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;render()}));
$("prev").addEventListener("click",()=>{cursor=view==="month"?new Date(cursor.getFullYear(),cursor.getMonth()-1,1):addDays(cursor,view==="week"?-7:-1);selected=new Date(cursor);render()});
$("next").addEventListener("click",()=>{cursor=view==="month"?new Date(cursor.getFullYear(),cursor.getMonth()+1,1):addDays(cursor,view==="week"?7:1);selected=new Date(cursor);render()});
$("today").addEventListener("click",()=>{cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate());selected=new Date(cursor);render()});
$("org-filter").addEventListener("change",e=>{organization=e.target.value;render()});
$("status-filter").addEventListener("change",e=>{classification=e.target.value;render()});
fetch(new URL("../data/events.json?v=20261020-events-v3",import.meta.url))
  .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()})
  .then(data=>{
    events=data.events;
    const select=$("org-filter"),first=select.options[0];select.replaceChildren(first);
    const map=new Map();
    events.forEach(e=>(e.organizers||[]).forEach(o=>{if(!map.has(o.id))map.set(o.id,EN?o.nameEn:o.name)}));
    [...map].sort((a,b)=>a[1].localeCompare(b[1],LOCALE)).forEach(([id,label])=>{
      const option=document.createElement("option");option.value=id;option.textContent=label;select.append(option);
    });
    render();
  })
  .catch(()=>{$("cal-grid").replaceChildren(el("p","error",TXT.loadError));});
