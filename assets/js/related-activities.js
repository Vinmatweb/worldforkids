(function(root){
    'use strict';
    const icons={omalovanky:'🎨',obtahovacky:'✏️',spojovacky:'🔢',bludiste:'🧩'};
    const copy={
        en:{title:'Also available as',level:'Level',variant:'Variant',omalovanky:'Coloring',obtahovacky:'Tracing',spojovacky:'Dot-to-Dot',bludiste:'Maze'},
        cz:{title:'Také dostupné jako',level:'Úroveň',variant:'Varianta',omalovanky:'Omalovánka',obtahovacky:'Obtahovačka',spojovacky:'Spojovačka',bludiste:'Bludiště'},
        de:{title:'Auch verfügbar als',level:'Stufe',variant:'Variante',omalovanky:'Ausmalbild',obtahovacky:'Nachspuren',spojovacky:'Punkt zu Punkt',bludiste:'Labyrinth'},
        es:{title:'También disponible como',level:'Nivel',variant:'Variante',omalovanky:'Colorear',obtahovacky:'Trazado',spojovacky:'Une los puntos',bludiste:'Laberinto'}
    };
    // A suffix identifies a distinct drawing, independently of activity type or level.
    function identity(item){
        const raw=String(item.motifId||'').trim();
        if(!raw)return '';
        const idVariant=raw.match(/^(\d+)_(\d+)$/);
        const fileVariant=String(item.souborZaklad||'').match(/^lv\d+_[^_]+_\d+_(\d+)(?:_|-)/i);
        const motif=idVariant?idVariant[1]:raw;
        const variant=fileVariant?fileVariant[1]:(idVariant?idVariant[2]:'');
        return motif+'|'+variant;
    }
    function related(items,current){
        const motif=identity(current),seen=new Set();
        if(!motif)return [];
        return items.filter(item=>{
            if(identity(item)!==motif||item.id===current.id||seen.has(item.id))return false;
            seen.add(item.id);return true;
        });
    }
    function label(item,family,language){
        const text=copy[language]||copy.en;
        let result=(icons[item.typ]||'📄')+' '+(text[item.typ]||item.typ)+' – '+text.level+' '+String(item.vek||'').replace(/^LV/i,'');
        const peers=family.filter(other=>other.typ===item.typ&&other.vek===item.vek);
        if(peers.length>1){
            const version=(item.souborZaklad||'').match(/^lv\d+_[^_]+_\d+_(\d+)_/i);
            result+=' · '+text.variant+' '+(version?version[1]:peers.indexOf(item)+1);
        }
        return result;
    }
    root.VinMatRelatedActivities={related,label,copy,identity};
    if(typeof module!=='undefined'&&module.exports)module.exports=root.VinMatRelatedActivities;
})(typeof window==='undefined'?globalThis:window);
