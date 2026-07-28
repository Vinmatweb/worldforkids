import { readFile, writeFile } from 'node:fs/promises';

const buildPath = new URL('./build-static-site.mjs', import.meta.url);
const indexPath = new URL('../index.html', import.meta.url);
let source = await readFile(buildPath, 'utf8');
let buildChanged = false;

const oldCardHeading = '<h2 class="font-bold text-sm text-slate-900 leading-tight uppercase"><a href="${escapeHtml(href)}" class="hover:text-indigo-600">${escapeHtml(activity.names[locale])}</a></h2>';
const newCardHeading = '<h3 class="font-bold text-sm text-slate-900 leading-tight uppercase"><a href="${escapeHtml(href)}" class="hover:text-indigo-600">${escapeHtml(activity.names[locale])}</a></h3>';

if (source.includes(oldCardHeading)) {
    source = source.replace(oldCardHeading, newCardHeading);
    buildChanged = true;
} else if (!source.includes(newCardHeading)) {
    throw new Error('Static activity-card heading template was not found.');
}

const oldTranslatedGuideFlow = [
    "        html = setBodyData(html, locale, page.key);",
    "        html = ensureContactHelper(html);"
].join('\n');
const newTranslatedGuideFlow = [
    "        html = setBodyData(html, locale, page.key);",
    "        html = injectNavigation(html, '../');",
    "        html = ensureContactHelper(html);"
].join('\n');

if (source.includes(oldTranslatedGuideFlow)) {
    source = source.replace(oldTranslatedGuideFlow, newTranslatedGuideFlow);
    buildChanged = true;
} else if (!source.includes(newTranslatedGuideFlow)) {
    throw new Error('Translated-guide navigation build step was not found.');
}

const seoMarker = '// LOCALIZED_INDEX_SEO';
if (!source.includes(seoMarker)) {
    const oldSeoTail = [
        '    html = html.replace(/(<meta\\s+property="og:locale"\\s+content=")[^"]*(">)/i, `$1${config.ogLocale}$2`);',
        '    return html;',
        '}'
    ].join('\n');

    const newSeoTail = [
        '    html = html.replace(/(<meta\\s+property="og:locale"\\s+content=")[^"]*(">)/i, `$1${config.ogLocale}$2`);',
        `    ${seoMarker}`,
        '    html = html.replace(/<meta id="og-title"[^>]*>/i, \'<meta id="og-title" property="og:title" content="\' + escapeHtml(config.indexTitle) + \'">\');',
        '    html = html.replace(/<meta id="og-desc"[^>]*>/i, \'<meta id="og-desc" property="og:description" content="\' + escapeHtml(config.indexDescription) + \'">\');',
        '    html = html.replace(/<meta id="tw-title"[^>]*>/i, \'<meta id="tw-title" name="twitter:title" content="\' + escapeHtml(config.indexTitle) + \'">\');',
        '    html = html.replace(/<meta id="tw-desc"[^>]*>/i, \'<meta id="tw-desc" name="twitter:description" content="\' + escapeHtml(config.indexDescription) + \'">\');',
        '    html = html.replace(/<meta\\s+property="og:site_name"[^>]*>/i, \'<meta property="og:site_name" content="\' + escapeHtml(config.siteName) + \'">\');',
        '    html = html.replace(/\\s*<meta\\s+name="keywords"[^>]*>/i, \'\');',
        '    html = html.replace(/<h1 class="sr-only">[\\s\\S]*?<\\/h1>/i, \'<h1 class="sr-only">\' + escapeHtml(config.indexHeading) + \'</h1>\');',
        '    html = html.replace(/\\s*<meta\\s+property="og:locale:alternate"[^>]*>/gi, \'\');',
        '    const alternateLocales = Object.values(languages)',
        '        .filter((language) => language.ogLocale !== config.ogLocale)',
        '        .map((language) => `    <meta property="og:locale:alternate" content="${language.ogLocale}">`)',
        '        .join(\'\\n\');',
        '    html = html.replace(/(<meta\\s+property="og:locale"[^>]*>)/i, `$1\\n${alternateLocales}`);',
        '    const websiteSchema = {',
        "        '@context': 'https://schema.org',",
        "        '@type': 'WebSite',",
        '        name: config.siteName,',
        '        url: canonical,',
        '        description: config.indexDescription,',
        '        inLanguage: config.htmlLang',
        '    };',
        '    html = html.replace(/<script type="application\\/ld\\+json">[\\s\\S]*?<\\/script>/i, \'<script type="application/ld+json">\\n\' + JSON.stringify(websiteSchema, null, 4) + \'\\n    </script>\');',
        '    return html;',
        '}'
    ].join('\n');

    if (!source.includes(oldSeoTail)) {
        throw new Error('Index SEO generator insertion point was not found.');
    }
    source = source.replace(oldSeoTail, newSeoTail);
    buildChanged = true;
}

if (buildChanged) {
    await writeFile(buildPath, source);
    console.log('Updated build-static-site.mjs for localized static generation.');
} else {
    console.log('build-static-site.mjs already contains the localization fixes.');
}

let indexSource = await readFile(indexPath, 'utf8');
const dynamicSeoPattern = /    var tituly = \{[\s\S]*?    var tl=tituly\[jaz\]\[aktualniTyp\]\|\|tituly\[jaz\]\.vse, dc=descs\[jaz\]\[aktualniTyp\]\|\|descs\[jaz\]\.vse;/;
const dynamicSeoBlock = `    var tituly = {
        en:{ bludiste:'Free Printable Mazes for Kids | VinMat', omalovanky:'Free Printable Coloring Pages for Kids | VinMat',
             spojovacky:'Free Printable Dot-to-Dot Worksheets | VinMat', obtahovacky:'Free Printable Tracing Worksheets for Kids | VinMat',
             vse:'Free Printable Mazes, Coloring Pages & Activities | VinMat' },
        cz:{ bludiste:'Dětská bludiště k vytisknutí zdarma | VinMat', omalovanky:'Omalovánky pro děti zdarma | VinMat',
             spojovacky:'Spojovačky pro děti zdarma | VinMat', obtahovacky:'Obtahovačky pro děti zdarma | VinMat',
             vse:'Bludiště, omalovánky a aktivity zdarma | VinMat' },
        de:{ bludiste:'Kostenlose Labyrinthe für Kinder zum Ausdrucken | VinMat', omalovanky:'Kostenlose Ausmalbilder für Kinder | VinMat',
             spojovacky:'Kostenlose Punkte-verbinden-Vorlagen für Kinder | VinMat', obtahovacky:'Kostenlose Nachspurübungen für Kinder | VinMat',
             vse:'Kostenlose Labyrinthe, Ausmalbilder & Aktivitäten für Kinder | VinMat' },
        es:{ bludiste:'Laberintos para niños gratis para imprimir | VinMat', omalovanky:'Dibujos para colorear gratis para niños | VinMat',
             spojovacky:'Fichas de unir puntos gratis para niños | VinMat', obtahovacky:'Fichas de trazado gratis para niños | VinMat',
             vse:'Laberintos, dibujos para colorear y actividades gratis | VinMat' }
    };
    var descs = {
        en:{ bludiste:'Free printable mazes for kids aged 3–10. Color and B&W versions.',
             omalovanky:'Free printable coloring pages, sorted by age and difficulty.',
             spojovacky:'Free printable dot-to-dot worksheets for kids.',
             obtahovacky:'Free printable tracing worksheets for pencil control and fine motor practice.',
             vse:'Download free mazes, coloring pages, dot-to-dot and tracing sheets for kids aged 3–10.' },
        cz:{ bludiste:'Stáhněte zdarma dětská bludiště pro věk 3–10 let.',
             omalovanky:'Omalovánky pro děti zdarma, rozdělené podle věku a obtížnosti.',
             spojovacky:'Spojovačky pro děti zdarma k vytisknutí.',
             obtahovacky:'Obtahovačky zdarma pro vedení tužky a procvičování jemné motoriky.',
             vse:'Stáhněte zdarma bludiště, omalovánky, spojovačky a obtahovačky pro děti.' },
        de:{ bludiste:'Kostenlose Labyrinthe für Kinder von 3–10 Jahren zum Ausdrucken.',
             omalovanky:'Kostenlose Ausmalbilder, sortiert nach Alter und Schwierigkeitsstufe.',
             spojovacky:'Kostenlose Punkte-verbinden-Vorlagen für Kinder zum Ausdrucken.',
             obtahovacky:'Kostenlose Nachspurübungen für Stiftführung und Feinmotorik.',
             vse:'Kostenlose Labyrinthe, Ausmalbilder, Punkte-verbinden- und Nachspurübungen für Kinder.' },
        es:{ bludiste:'Laberintos gratis para niños de 3 a 10 años, listos para imprimir.',
             omalovanky:'Dibujos para colorear gratis, ordenados por edad y dificultad.',
             spojovacky:'Fichas de unir puntos gratis para niños, listas para imprimir.',
             obtahovacky:'Fichas de trazado gratis para practicar el control del lápiz y la motricidad fina.',
             vse:'Laberintos, dibujos para colorear, fichas de unir puntos y trazado gratis para niños.' }
    };
    var seoJazyk=tituly[jaz]?jaz:'en';
    var tl=tituly[seoJazyk][aktualniTyp]||tituly[seoJazyk].vse, dc=descs[seoJazyk][aktualniTyp]||descs[seoJazyk].vse;`;

if (!dynamicSeoPattern.test(indexSource)) {
    if (!indexSource.includes("var seoJazyk=tituly[jaz]?jaz:'en';")) {
        throw new Error('Dynamic index SEO dictionaries were not found.');
    }
} else {
    indexSource = indexSource.replace(dynamicSeoPattern, dynamicSeoBlock);
    await writeFile(indexPath, indexSource);
    console.log('Updated multilingual dynamic SEO dictionaries in index.html.');
}
