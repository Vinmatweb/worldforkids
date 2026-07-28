import { readFile, writeFile } from 'node:fs/promises';

const buildPath = new URL('./build-static-site.mjs', import.meta.url);
const indexPath = new URL('../index.html', import.meta.url);

function applyReplacements(text, replacements, label) {
    let changed = false;
    for (const [from, to] of replacements) {
        if (text.includes(from)) {
            text = text.replaceAll(from, to);
            changed = true;
        } else if (!text.includes(to)) {
            throw new Error(`${label} text was not found: ${from}`);
        }
    }
    return { text, changed };
}

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

const buildPolish = applyReplacements(source, [
    ["cardType: { bludiste: 'Labyrinth', omalovanky: 'Ausmalbild', spojovacky: 'Punkte verbinden', obtahovacky: 'Nachzeichnen' },", "cardType: { bludiste: 'Labyrinth', omalovanky: 'Ausmalbild', spojovacky: 'Punkt zu Punkt', obtahovacky: 'Nachspuren' },"],
    ["indexTitle: 'Kostenlose Labyrinthe, Ausmalbilder & Punkte-verbinden-Vorlagen für Kinder | VinMat'", "indexTitle: 'Kostenlose Labyrinthe, Ausmalbilder & Punkt-zu-Punkt-Bilder für Kinder | VinMat'"],
    ["indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder und Punkte-verbinden-Arbeitsblätter für Kinder von 3–10 Jahren zum Ausdrucken. Farbige und Schwarz-Weiß-Versionen, sortiert nach Alter und Schwierigkeit.'", "indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen für Kinder von 3 bis 10 Jahren. Direkt als A4-Arbeitsblätter ausdrucken.'"],
    ["indexHeading: 'Kostenlose Druckvorlagen für Kinder'", "indexHeading: 'Kostenlose Aktivitäten für Kinder zum Ausdrucken'"],
    ["indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder und Punkte-verbinden-Vorlagen zum Ausdrucken. Wähle eine Aktivität aus, um sie anzusehen, herunterzuladen oder zu drucken.'", "indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen. Öffne eine Aktivität, lade sie herunter oder drucke sie direkt aus.'"],
    ["cardType: { bludiste: 'Laberinto', omalovanky: 'Dibujo', spojovacky: 'Une los puntos', obtahovacky: 'Trazado' },", "cardType: { bludiste: 'Laberinto', omalovanky: 'Dibujo para colorear', spojovacky: 'Une los puntos', obtahovacky: 'Trazado' },"],
    ["indexTitle: 'Laberintos, Dibujos para Colorear y Fichas de Unir Puntos Gratis para Niños | VinMat'", "indexTitle: 'Laberintos, dibujos para colorear y fichas de unir puntos gratis | VinMat'"],
    ["indexDescription: 'Descarga gratis laberintos, dibujos para colorear y fichas de unir puntos para niños de 3 a 10 años. Versiones a color y en blanco y negro, ordenadas por edad y dificultad.'", "indexDescription: 'Descarga gratis laberintos, dibujos para colorear, fichas de unir puntos y trazado para niños de 3 a 10 años. Actividades A4 listas para imprimir.'"],
    ["indexHeading: 'Actividades gratuitas para imprimir para niños'", "indexHeading: 'Actividades gratis para imprimir'"],
    ["indexIntro: 'Explora laberintos, dibujos para colorear y fichas de unir puntos gratis para imprimir. Elige una actividad para verla, descargarla o imprimirla.'", "indexIntro: 'Explora laberintos, dibujos para colorear, fichas de unir puntos y trazado. Abre una actividad, descárgala o imprímela directamente.'"],
    ["siteName: 'El Mundo de VinMat para Niños'", "siteName: 'El mundo de VinMat para niños'"]
], 'Build localization');
source = buildPolish.text;
buildChanged ||= buildPolish.changed;

if (buildChanged) {
    await writeFile(buildPath, source);
    console.log('Updated build-static-site.mjs for localized static generation.');
} else {
    console.log('build-static-site.mjs already contains the localization fixes.');
}

let indexSource = await readFile(indexPath, 'utf8');
let indexChanged = false;
const dynamicSeoPattern = /    var tituly = \{[\s\S]*?    var tl=tituly\[jaz\]\[aktualniTyp\]\|\|tituly\[jaz\]\.vse, dc=descs\[jaz\]\[aktualniTyp\]\|\|descs\[jaz\]\.vse;/;
const dynamicSeoBlock = `    var tituly = {
        en:{ bludiste:'Free Printable Mazes for Kids | VinMat', omalovanky:'Free Printable Coloring Pages for Kids | VinMat',
             spojovacky:'Free Printable Dot-to-Dot Worksheets | VinMat', obtahovacky:'Free Printable Tracing Worksheets for Kids | VinMat',
             vse:'Free Printable Mazes, Coloring Pages & Activities | VinMat' },
        cz:{ bludiste:'Dětská bludiště k vytisknutí zdarma | VinMat', omalovanky:'Omalovánky pro děti zdarma | VinMat',
             spojovacky:'Spojovačky pro děti zdarma | VinMat', obtahovacky:'Obtahovačky pro děti zdarma | VinMat',
             vse:'Bludiště, omalovánky a aktivity zdarma | VinMat' },
        de:{ bludiste:'Kostenlose Labyrinthe für Kinder zum Ausdrucken | VinMat', omalovanky:'Kostenlose Ausmalbilder für Kinder | VinMat',
             spojovacky:'Kostenlose Punkt-zu-Punkt-Bilder für Kinder | VinMat', obtahovacky:'Kostenlose Nachspurübungen für Kinder | VinMat',
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
        de:{ bludiste:'Kostenlose Labyrinthe für Kinder von 3 bis 10 Jahren zum Ausdrucken.',
             omalovanky:'Kostenlose Ausmalbilder, sortiert nach Alter und Schwierigkeitsstufe.',
             spojovacky:'Kostenlose Punkt-zu-Punkt-Bilder für Kinder zum Ausdrucken.',
             obtahovacky:'Kostenlose Nachspurübungen für Stiftführung und Feinmotorik.',
             vse:'Kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen für Kinder.' },
        es:{ bludiste:'Laberintos gratis para niños de 3 a 10 años, listos para imprimir.',
             omalovanky:'Dibujos para colorear gratis, ordenados por edad y dificultad.',
             spojovacky:'Fichas de unir puntos gratis para niños, listas para imprimir.',
             obtahovacky:'Fichas de trazado gratis para practicar el control del lápiz y la motricidad fina.',
             vse:'Laberintos, dibujos para colorear, fichas de unir puntos y trazado gratis para niños.' }
    };
    var seoJazyk=tituly[jaz]?jaz:'en';
    var tl=tituly[seoJazyk][aktualniTyp]||tituly[seoJazyk].vse, dc=descs[seoJazyk][aktualniTyp]||descs[seoJazyk].vse;`;

if (dynamicSeoPattern.test(indexSource)) {
    indexSource = indexSource.replace(dynamicSeoPattern, dynamicSeoBlock);
    indexChanged = true;
} else if (!indexSource.includes("var seoJazyk=tituly[jaz]?jaz:'en';")) {
    throw new Error('Dynamic index SEO dictionaries were not found.');
}

const indexPolish = applyReplacements(indexSource, [
    ["subTitle:\"Geprüfte Labyrinthe, Ausmalbilder und Punkte-verbinden-Vorlagen für sofortigen Spaß\"", "subTitle:\"Kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder – direkt zum Ausdrucken\""],
    ["spojovacky:\"Punkte verbinden\", obtahovacky:\"Nachzeichnen\", ageTitle:\"Alter:\", ageLv5:\"12+ & Erwachsene\"", "spojovacky:\"Punkt zu Punkt\", obtahovacky:\"Nachspuren\", ageTitle:\"Alter:\", ageLv5:\"12+ und Erwachsene\""],
    ["spojovackyLabel:\"PUNKTE VERBINDEN\", obtahovackyLabel:\"NACHZEICHNEN\"", "spojovackyLabel:\"PUNKT ZU PUNKT\", obtahovackyLabel:\"NACHSPUREN\""],
    ["footerDisclaimer:\"Alle Downloads kostenlos für private & pädagogische Nutzung\"", "footerDisclaimer:\"Alle Downloads sind für die private und pädagogische Nutzung kostenlos\""],
    ["guideMazesLabel:\"Labyrinth-Guide\", guideColoringLabel:\"Ausmal-Guide\", guideDotsLabel:\"Punkte-verbinden-Guide\", guideTracingLabel:\"Nachzeichnen-Guide\"", "guideMazesLabel:\"Labyrinth-Ratgeber\", guideColoringLabel:\"Ausmalbilder-Ratgeber\", guideDotsLabel:\"Punkt-zu-Punkt-Ratgeber\", guideTracingLabel:\"Nachspuren-Ratgeber\""],
    ["aboutText:\"Willkommen in unserer kuratierten Bibliothek hochwertiger Arbeitsblätter für Eltern, Pädagogen und Betreuer. Diese Plattform bietet kostenlosen Zugang zu Lernmaterialien, strukturiert in klare Schwierigkeitsstufen, damit du die passende Aktivität für die kognitive Entwicklung, Feinmotorik und Raumwahrnehmung deines Kindes findest.\"", "aboutText:\"Hier findest du hochwertige, kostenlose Arbeitsblätter für zu Hause, die Kita und die Schule. Klare Schwierigkeitsstufen helfen dir, eine passende Aktivität für das Alter und die Fähigkeiten des Kindes auszuwählen.\""],
    ["aboutDots:\"🔢 Punkte-verbinden-Vorlagen\", aboutDotsText:\"Spannende Rätsel, die nebenbei Zahlenfolgen, Konzentration und präzises Linienziehen trainieren.\"", "aboutDots:\"🔢 Punkt-zu-Punkt-Bilder\", aboutDotsText:\"Spielerische Aufgaben zum Üben von Zahlenfolgen, Konzentration und genauer Linienführung.\""],
    ["aboutTracing:\"✏️ Nachzeichen-Arbeitsblätter\", aboutTracingText:\"Hilfreich für Stifthaltung, Hand-Augen-Koordination, Feinmotorik und erste Schreibübungen.\"", "aboutTracing:\"✏️ Arbeitsblätter zum Nachspuren\", aboutTracingText:\"Sie fördern Stiftführung, Hand-Augen-Koordination, Feinmotorik und die Vorbereitung auf das Schreiben.\""],
    ["subTitle:\"Laberintos, dibujos para colorear y fichas de unir puntos verificados para diversión al instante\"", "subTitle:\"Laberintos, dibujos para colorear y fichas de unir puntos, listos para imprimir\""],
    ["omalovanky:\"Dibujos\"", "omalovanky:\"Colorear\""],
    ["sortRandom:\"Aleatorio\"", "sortRandom:\"Orden aleatorio\""],
    ["filtrSezona:\"Temporada y festividades\"", "filtrSezona:\"Estaciones y festividades\""],
    ["guideColoringLabel:\"Guía de dibujos\"", "guideColoringLabel:\"Guía de dibujos para colorear\""],
    ["aboutTitle:\"Sobre el Mundo de VinMat para Niños\"", "aboutTitle:\"Sobre El mundo de VinMat para niños\""],
    ["aboutText:\"Bienvenido a nuestra biblioteca de fichas educativas de alta calidad, pensada para padres, educadores y cuidadores. Esta plataforma ofrece acceso gratuito a materiales organizados en niveles de dificultad claros, para ayudarte a encontrar la actividad perfecta que apoye el desarrollo cognitivo, la motricidad fina y la percepción espacial de los niños.\"", "aboutText:\"Aquí encontrarás fichas educativas gratuitas para casa, infantil y primaria. Los niveles de dificultad te ayudan a elegir una actividad adecuada para la edad y las habilidades de cada niño.\""],
    ["aboutColoring:\"🎨 Dibujos creativos\"", "aboutColoring:\"🎨 Dibujos para colorear\""],
    ["aboutDots:\"🔢 Fichas de unir puntos\", aboutDotsText:\"Rompecabezas entretenidos que entrenan en secreto la secuencia numérica, la concentración y la precisión al trazar líneas.\"", "aboutDots:\"🔢 Fichas de unir puntos\", aboutDotsText:\"Actividades divertidas para practicar las secuencias numéricas, la concentración y la precisión al trazar líneas.\""],
    ["de:'👩👨 Experte',es:'👩👨 Experto'", "de:'👩👨 12+',es:'👩👨 12+'"]
], 'Index localization');
indexSource = indexPolish.text;
indexChanged ||= indexPolish.changed;

if (indexChanged) {
    await writeFile(indexPath, indexSource);
    console.log('Updated multilingual index localization.');
}
