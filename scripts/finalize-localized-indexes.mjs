import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const indexes = [
    { locale: 'en', file: 'index.html', noScript: 'JavaScript is disabled. The printable activity links below are still available.' },
    { locale: 'cs', file: 'cs/index.html', noScript: 'JavaScript je vypnutý. Odkazy na pracovní listy níže jsou stále dostupné.' },
    { locale: 'de', file: 'de/index.html', noScript: 'JavaScript ist deaktiviert. Die Links zu den Druckvorlagen sind unten weiterhin verfügbar.' },
    { locale: 'es', file: 'es/index.html', noScript: 'JavaScript está desactivado. Los enlaces a las actividades imprimibles siguen disponibles abajo.' }
];

function deduplicateHeadLinks(html) {
    const seen = new Set();
    return html.replace(/\s*<link\b[^>]*\b(?:rel="(?:icon|apple-touch-icon|manifest)")[^>]*>/gi, (tag) => {
        const href = tag.match(/href="([^"]+)"/i)?.[1];
        const rel = tag.match(/rel="([^"]+)"/i)?.[1] || '';
        if (!href) return tag;
        const key = `${rel}:${href}`;
        if (seen.has(key)) return '';
        seen.add(key);
        return `\n${tag.trim()}`;
    });
}

function improveInitialization(html) {
    const initialLoad = "        var b=await nactiCsvData('bludiste'), o=await nactiCsvData('omalovanky'), s=await nactiCsvData('spojovacky'), t=await nactiCsvData('obtahovacky');\n        zparsovanaData=b.concat(o).concat(s).concat(t);\n";
    if (html.includes(initialLoad)) html = html.replace(initialLoad, '');

    const duplicateLanguageInit = "setJazyk(jaz);\nsetJazyk(jaz);\nnaplnDropdownyZDat();";
    const improvedLanguageInit = "setJazyk(jaz);\n\nvar b=await nactiCsvData('bludiste'), o=await nactiCsvData('omalovanky'), s=await nactiCsvData('spojovacky'), t=await nactiCsvData('obtahovacky');\nzparsovanaData=b.concat(o).concat(s).concat(t);\nsetJazyk(jaz);";

    if (html.includes(duplicateLanguageInit)) {
        html = html.replace(duplicateLanguageInit, improvedLanguageInit);
    } else if (!html.includes(improvedLanguageInit)) {
        throw new Error('Index initialization block was not found.');
    }
    return html;
}

function addNoScriptFallback(html, message) {
    if (html.includes('data-vinmat-noscript')) return html;
    const block = `<noscript data-vinmat-noscript><style>body{opacity:1!important}</style><div style="margin:0;padding:.65rem 1rem;background:#fff7ed;color:#7c2d12;text-align:center;font:600 13px/1.4 system-ui,sans-serif">${message}</div></noscript>`;
    return html.replace(/(<body\b[^>]*>)/i, `$1\n${block}`);
}

for (const entry of indexes) {
    const file = path.join(root, entry.file);
    let html = await readFile(file, 'utf8');
    const original = html;
    html = deduplicateHeadLinks(html);
    html = improveInitialization(html);
    html = addNoScriptFallback(html, entry.noScript);
    if (html !== original) await writeFile(file, html);
}

console.log('Finalized localized indexes.');
