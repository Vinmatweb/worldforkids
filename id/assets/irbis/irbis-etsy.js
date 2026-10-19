(function(){
  "use strict";
  const url=window.IRBIS_ETSY_PRODUCT_URL||"";
  if(!/^https:\/\/www\.etsy\.com\/listing\/\d+(?:\/|$)/.test(url))return;
  document.querySelectorAll('[data-etsy-placement="intro"]').forEach(slot=>{
    const a=document.createElement("a");a.className="saw-etsy-link";a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=document.documentElement.lang==="en"?"Complete PDF collection on Etsy":"Celá kolekce v PDF na Etsy";slot.append(a);
  });
  document.querySelectorAll('[data-etsy-placement="after-article"]').forEach(slot=>{
    const box=document.createElement("aside");box.className="saw-etsy-package";
    const p=document.createElement("p");p.textContent=document.documentElement.lang==="en"?"Want the whole collection together? Etsy offers two organized PDFs: black-and-white activities and activities with color samples. Individual activities on this page remain free.":"Chceš mít celou kolekci připravenou pohromadě? Na Etsy získáš dvě přehledná PDF: černobílé aktivity a verzi s barevnými vzory. Jednotlivé aktivity na této stránce zůstávají zdarma.";
    const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=document.documentElement.lang==="en"?"View the collection on Etsy":"Prohlédnout kolekci na Etsy";box.append(p,a);slot.append(box);
  });
})();
