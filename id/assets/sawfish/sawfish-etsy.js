(function(){
"use strict";
const raw=String(window.SAWFISH_ETSY_PRODUCT_URL||"").trim();
if(!raw)return;
let url;
try{url=new URL(raw)}catch(_){return}
if(!/^https?:$/.test(url.protocol)||!/(^|\.)etsy\.com$/i.test(url.hostname)||!/^\/listing\/\d+/.test(url.pathname))return;
document.querySelectorAll("[data-etsy-placement]").forEach(node=>{
 const en=document.documentElement.lang==="en";
 const placement=node.dataset.etsyPlacement;
 const link=document.createElement("a");link.href=url.href;link.target="_blank";link.rel="noopener noreferrer";
 if(placement==="intro"){link.className="saw-etsy-link";link.textContent=en?"Complete collection PDF on Etsy":"Celá kolekce v PDF na Etsy";node.append(link);return}
 if(placement==="after-article"){
  node.className="saw-etsy-package";
  const p=document.createElement("p");
  p.textContent=en?"Want the complete collection together? Etsy offers two organized PDFs: black-and-white activities and activities with color samples. Individual activities on this page remain free.":"Chcete mít celou kolekci připravenou pohromadě? Na Etsy získáte dvě přehledná PDF: černobílé aktivity a verzi s barevnými vzory. Jednotlivé aktivity na této stránce zůstávají zdarma.";
  link.textContent=en?"View the complete PDF collection":"Zobrazit kompletní kolekci PDF";node.append(p,link);
 }
});
})();