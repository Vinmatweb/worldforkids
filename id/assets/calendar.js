const $=id=>document.getElementById(id);
let now=new Date(),cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate()),selected=new Date(cursor);
let view=window.innerWidth<620?'week':'month',events=[],organization='all',status='all';
const dateKey=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
const dateLabel=(d,o)=>new Intl.DateTimeFormat('cs-CZ',o).format(d);
const monday=d=>{const x=new Date(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return x};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const visible=d=>events.filter(e=>e.day===d.getDate()&&e.month===d.getMonth()+1&&(organization==='all'||e.organizationId===organization)&&(status==='all'||e.status===status));
function renderAgenda(){
 $('agenda-title').textContent=dateLabel(selected,{day:'numeric',month:'long',year:'numeric'});
 const root=$('agenda-list');root.replaceChildren();
 const arr=visible(selected);
 if(!arr.length){root.append(el('p','note','Na tento den zatím nemáme zařazenou ověřenou událost.'));return}
 for(const item of arr){
  const card=el('div','agenda-item'),info=el('div');
  info.append(el('strong','',item.name),el('span','',item.organization+' · '+(item.status==='official'?'Ověřený oficiální den':'Ověřený připomínkový den')));
  const link=el('a','',item.detailUrl?'Otevřít stránku →':'Ověřit zdroj ↗');
  link.href=item.detailUrl?'./'+item.detailUrl:item.sourceUrl;
  if(!item.detailUrl){link.target='_blank';link.rel='noopener noreferrer'}
  card.append(info,link);root.append(card)
 }
}
function render(){
 for(const b of document.querySelectorAll('[data-view]')){const on=b.dataset.view===view;b.classList.toggle('selected-view',on);b.setAttribute('aria-pressed',String(on))}
 const root=$('cal-grid');root.replaceChildren();
 let start,end;
 if(view==='month'){const first=new Date(cursor.getFullYear(),cursor.getMonth(),1),last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);start=monday(first);end=addDays(monday(last),6);$('period-label').textContent=dateLabel(first,{month:'long',year:'numeric'})}
 else if(view==='week'){start=monday(cursor);end=addDays(start,6);$('period-label').textContent=dateLabel(start,{day:'numeric',month:'short'})+' – '+dateLabel(end,{day:'numeric',month:'short',year:'numeric'})}
 else{start=new Date(cursor);end=new Date(cursor);$('period-label').textContent=dateLabel(start,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
 root.style.gridTemplateColumns=view==='day'?'1fr':'repeat(7,minmax(0,1fr))';
 $('weekdays').hidden=view==='day';
 for(let d=new Date(start);d<=end;d=addDays(d,1)){
  const cell=el('div','day-cell'+(view==='month'&&d.getMonth()!==cursor.getMonth()?' muted':'')+(dateKey(d)===dateKey(now)?' today':'')+(dateKey(d)===dateKey(selected)?' is-active':''));
  const day=el('button','date-btn',view==='day'?dateLabel(d,{weekday:'long',day:'numeric',month:'long'}):String(d.getDate()));
  day.type='button';day.setAttribute('aria-label','Události '+dateLabel(d,{day:'numeric',month:'long'}));
  day.addEventListener('click',()=>{selected=new Date(d);render()});cell.append(day);
  const arr=visible(d),max=view==='day'?999:2;
  for(const item of arr.slice(0,max)){
   const link=el(item.detailUrl?'a':'div','event-chip '+(item.status==='official'?'is-official':'is-other'),item.name);
   link.style.setProperty('--accent',item.accent||'#689dbb');
   link.title=item.name+' – '+item.organization;
   if(item.detailUrl)link.href='./'+item.detailUrl;
   link.append(el('small','',item.organization));
   cell.append(link)
  }
  if(arr.length>max){const b=el('button','more-btn','+'+(arr.length-max)+' dalších');b.type='button';b.addEventListener('click',()=>{selected=new Date(d);render();$('agenda').scrollIntoView({block:'nearest'})});cell.append(b)}
  root.append(cell)
 }
 renderAgenda();
 $('total-count').textContent=events.filter(e=>(organization==='all'||e.organizationId===organization)&&(status==='all'||e.status===status)).length+' ověřených dnů v katalogu';
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;render()}));
$('prev').addEventListener('click',()=>{cursor=view==='month'?new Date(cursor.getFullYear(),cursor.getMonth()-1,1):addDays(cursor,view==='week'?-7:-1);selected=new Date(cursor);render()});
$('next').addEventListener('click',()=>{cursor=view==='month'?new Date(cursor.getFullYear(),cursor.getMonth()+1,1):addDays(cursor,view==='week'?7:1);selected=new Date(cursor);render()});
$('today').addEventListener('click',()=>{cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate());selected=new Date(cursor);render()});
$('org-filter').addEventListener('change',e=>{organization=e.target.value;render()});
$('status-filter').addEventListener('change',e=>{status=e.target.value;render()});
fetch(new URL('../data/events.json',import.meta.url)).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{events=data.events;render()}).catch(()=>{$('cal-grid').replaceChildren(el('p','error','Data kalendáře se nepodařilo načíst.'))});
