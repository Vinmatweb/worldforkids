import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const indexes = [
    { locale: 'en', file: 'index.html', noScript: 'JavaScript is disabled. The printable activity links below are still available.' },
    { locale: 'cs', file: 'cs/index.html', noScript: 'JavaScript je vypnutý. Odkazy na pracovní listy níže jsou stále dostupné.' },
    { locale: 'de', file: 'de/index.html', noScript: 'JavaScript ist deaktiviert. Die Links zu den Druckvorlagen sind unten weiterhin verfügbar.' },
    { locale: 'es', file: 'es/index.html', noScript: 'JavaScript está desactivado. Los enlaces a las actividades imprimibles siguen disponibles abajo.' }
];

const chrome = {
    en: {
        home: ['Home', '/worldforkids/'],
        guide: ['Activity Guide', '/worldforkids/guide-activities.html'],
        levels: ['Difficulty Levels', '/worldforkids/difficulty-levels.html'],
        story: ['Our Story', '/worldforkids/our-story.html'],
        copyright: '© 2026 Made with ❤️ for great crafting',
        disclaimer: 'All downloads free for personal & educational use',
        privacy: ['Privacy Policy', '/worldforkids/privacy.html'],
        terms: ['Terms of Service', '/worldforkids/terms.html'],
        contact: 'Contact'
    },
    cs: {
        home: ['Domů', '/worldforkids/cs/'],
        guide: ['Průvodce aktivitami', '/worldforkids/cs/pruvodce-aktivitami.html'],
        levels: ['Úrovně obtížnosti', '/worldforkids/cs/urovne-obtiznosti.html'],
        story: ['Náš příběh', '/worldforkids/cs/nas-pribeh.html'],
        copyright: '© 2026 Vyrobeno s ❤️ pro skvělé tvoření',
        disclaimer: 'Všechna stahování jsou zdarma pro osobní a vzdělávací účely',
        privacy: ['Zásady ochrany osobních údajů', '/worldforkids/cs/zasady-ochrany-osobnich-udaju.html'],
        terms: ['Podmínky užití', '/worldforkids/cs/podminky-uziti.html'],
        contact: 'Kontakt'
    },
    de: {
        home: ['Startseite', '/worldforkids/de/'],
        guide: ['Aktivitäten-Guide', '/worldforkids/de/anleitung-aktivitaeten.html'],
        levels: ['Schwierigkeitsstufen', '/worldforkids/de/schwierigkeitsstufen.html'],
        story: ['Unsere Geschichte', '/worldforkids/de/unsere-geschichte.html'],
        copyright: '© 2026 Mit ❤️ gemacht für kreative Kinder',
        disclaimer: 'Alle Downloads sind für die private und pädagogische Nutzung kostenlos',
        privacy: ['Datenschutz', '/worldforkids/de/datenschutz.html'],
        terms: ['Nutzungsbedingungen', '/worldforkids/de/nutzungsbedingungen.html'],
        contact: 'Kontakt'
    },
    es: {
        home: ['Inicio', '/worldforkids/es/'],
        guide: ['Guía de actividades', '/worldforkids/es/guia-actividades.html'],
        levels: ['Niveles de dificultad', '/worldforkids/es/niveles-dificultad.html'],
        story: ['Nuestra historia', '/worldforkids/es/nuestra-historia.html'],
        copyright: '© 2026 Hecho con ❤️ para niños creativos',
        disclaimer: 'Todas las descargas son gratuitas para uso personal y educativo',
        privacy: ['Privacidad', '/worldforkids/es/privacidad.html'],
        terms: ['Términos de uso', '/worldforkids/es/terminos-de-uso.html'],
        contact: 'Contacto'
    }
};

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

function noScriptBlock(message) {
    const styles = [
        'body{opacity:1!important;padding-top:0!important}',
        'body>div{display:none!important}',
        'body>footer{display:none!important}',
        'main>section:not(:nth-of-type(2)){display:none!important}',
        '#no-results{display:none!important}'
    ].join('');
    return `<noscript data-vinmat-noscript><style>${styles}</style><div style="margin:0;padding:.65rem 1rem;background:#fff7ed;color:#7c2d12;text-align:center;font:600 13px/1.4 system-ui,sans-serif">${message}</div></noscript>`;
}

function setNoScriptFallback(html, message) {
    const block = noScriptBlock(message);
    if (html.includes('data-vinmat-noscript')) {
        return html.replace(/<noscript data-vinmat-noscript>[\s\S]*?<\/noscript>/i, block);
    }
    return html.replace(/(<body\b[^>]*>)/i, `$1\n${block}`);
}

function ensureVisibleBody(html) {
    return html.replace(/<body\b[^>]*>/i, (tag) => tag.replace(/\s+opacity-0\b/g, ''));
}

function ensureResponsiveNavigation(html) {
    if (/site-navigation\.js/i.test(html)) return html;
    const script = '<script src="/worldforkids/assets/js/site-navigation.js"></script>';
    return html.replace(/<\/body>/i, `${script}\n</body>`);
}

function makeOptionalTracingSafe(html) {
    html = html.replace(
        /document\.getElementById\('lbl-nav-obtahovacky'\)\.innerText\s*=\s*s\.obtahovacky;/g,
        "var tracingLabel=document.getElementById('lbl-nav-obtahovacky'); if(tracingLabel) tracingLabel.innerText=s.obtahovacky;"
    );

    html = html.replaceAll(
        "document.getElementById('btn-'+t).className = t===typ",
        "var typeButton=document.getElementById('btn-'+t); if(!typeButton)return;\n        typeButton.className = t===typ"
    );

    return html;
}

function replaceAnchor(html, id, href, label, home = false) {
    const expression = new RegExp(`<a\\b([^>]*\\bid="${id}"[^>]*)>[\\s\\S]*?<\\/a>`, 'i');
    return html.replace(expression, (_match, attributes) => {
        let attrs = attributes;
        if (/\bhref="[^"]*"/i.test(attrs)) attrs = attrs.replace(/\bhref="[^"]*"/i, `href="${href}"`);
        else attrs = ` href="${href}"${attrs}`;
        const content = home ? `\n                    🏠 <span id="nav-home-label">${label}</span>\n                ` : `\n                    ${label}\n                `;
        return `<a${attrs}>${content}</a>`;
    });
}

function replaceTextById(html, tag, id, text) {
    const expression = new RegExp(`<${tag}\\b([^>]*\\bid="${id}"[^>]*)>[\\s\\S]*?<\\/${tag}>`, 'i');
    return html.replace(expression, `<${tag}$1>${text}</${tag}>`);
}

function localizeStaticChrome(html, locale) {
    const copy = chrome[locale] || chrome.en;
    html = replaceAnchor(html, 'nav-home', copy.home[1], copy.home[0], true);
    html = replaceAnchor(html, 'nav-pruvodce', copy.guide[1], copy.guide[0]);
    html = replaceAnchor(html, 'nav-urovne', copy.levels[1], copy.levels[0]);
    html = replaceAnchor(html, 'nav-pribeh', copy.story[1], copy.story[0]);
    html = replaceTextById(html, 'span', 'txt-footer-copyright', copy.copyright);
    html = replaceTextById(html, 'span', 'txt-footer-disclaimer', copy.disclaimer);
    html = replaceAnchor(html, 'txt-footer-privacy', copy.privacy[1], copy.privacy[0]);
    html = replaceAnchor(html, 'txt-footer-terms', copy.terms[1], copy.terms[0]);
    html = replaceTextById(html, 'span', 'txt-footer-contact', copy.contact);
    return html;
}

function countCsvRows(csv) {
    return csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length - 1;
}

function setEmptyTracingState(html, isEmpty) {
    html = html.replace(/\s*<style data-empty-tracing-category>[\s\S]*?<\/style>/i, '');
    if (!isEmpty) return html;

    const style = `<style data-empty-tracing-category>
#btn-obtahovacky{display:none!important}
#about-section .grid>div:nth-child(4){display:none!important}
@media(min-width:768px){#about-section .grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
</style>`;
    return html.replace(/<\/head>/i, `${style}\n</head>`);
}

const tracingCsv = await readFile(path.join(root, 'assets/data/obtahovacky.csv'), 'utf8');
const tracingIsEmpty = countCsvRows(tracingCsv) <= 0;

for (const entry of indexes) {
    const file = path.join(root, entry.file);
    let html = await readFile(file, 'utf8');
    const original = html;
    html = deduplicateHeadLinks(html);
    html = improveInitialization(html);
    html = setNoScriptFallback(html, entry.noScript);
    html = ensureVisibleBody(html);
    html = ensureResponsiveNavigation(html);
    html = makeOptionalTracingSafe(html);
    html = localizeStaticChrome(html, entry.locale);
    html = setEmptyTracingState(html, tracingIsEmpty);
    if (html !== original) await writeFile(file, html);
}

console.log(`Finalized localized indexes. Header/footer localization, mobile visibility and optional tracing safety ensured. Tracing category ${tracingIsEmpty ? 'hidden (no worksheets)' : 'visible'}.`);
