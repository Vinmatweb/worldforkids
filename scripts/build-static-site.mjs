import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const basePath = '/worldforkids/';
const siteUrl = 'https://vinmat.eu/worldforkids/';

const languages = {
    en: {
        htmlLang: 'en',
        ogLocale: 'en_US',
        output: '',
        assetDirectory: 'en',
        csvColumn: 'En',
        activityDirectory: 'activities',
        activityType: { bludiste: 'maze', omalovanky: 'coloring', spojovacky: 'dot-to-dot', obtahovacky: 'tracing' },
        cardType: { bludiste: 'Maze', omalovanky: 'Coloring', spojovacky: 'Dot-to-Dot', obtahovacky: 'Tracing' },
        indexTitle: 'Free Printable Mazes, Coloring Pages & Dot-to-Dots for Kids | VinMat',
        indexDescription: 'Download free printable mazes, coloring pages and dot-to-dot worksheets for kids aged 3–10. Color and B&W versions, sorted by age and difficulty.',
        indexHeading: 'Free Printable Activities for Kids',
        indexIntro: 'Browse free printable mazes, coloring pages and dot-to-dot worksheets. Choose an activity to view, download or print it.',
        siteName: "VinMat's World for Kids",
        levelLabel: 'Level',
        detailPrefix: 'Free Printable',
        detailCta: 'Download printable',
        detailPrint: 'Print worksheet',
        detailBack: '← All activities',
        activitySchemaLanguage: 'en'
    },
    cs: {
        htmlLang: 'cs',
        ogLocale: 'cs_CZ',
        output: 'cs',
        assetDirectory: 'cs',
        csvColumn: 'Cz',
        activityDirectory: 'aktivity',
        activityType: { bludiste: 'bludiste', omalovanky: 'omalovanka', spojovacky: 'spojovacka', obtahovacky: 'obtahovacka' },
        cardType: { bludiste: 'Bludiště', omalovanky: 'Omalovánka', spojovacky: 'Spojovačka', obtahovacky: 'Obtahovačka' },
        indexTitle: 'Bludiště, omalovánky a spojovačky zdarma | VinMat',
        indexDescription: 'Stáhněte zdarma dětská bludiště, omalovánky a spojovačky k vytisknutí pro děti ve věku 3–10 let.',
        indexHeading: 'Pracovní listy pro děti zdarma',
        indexIntro: 'Prohlédněte si bludiště, omalovánky a spojovačky zdarma. Vyberte aktivitu, kterou si můžete otevřít, stáhnout nebo vytisknout.',
        siteName: 'Vinmatův svět pro děti',
        levelLabel: 'Úroveň',
        detailPrefix: 'Pracovní list zdarma',
        detailCta: 'Stáhnout pracovní list',
        detailPrint: 'Vytisknout pracovní list',
        detailBack: '← Všechny aktivity',
        activitySchemaLanguage: 'cs'
    },
    de: {
        htmlLang: 'de',
        ogLocale: 'de_DE',
        output: 'de',
        assetDirectory: 'de',
        csvColumn: 'De',
        activityDirectory: 'aktivitaeten',
        activityType: { bludiste: 'labyrinth', omalovanky: 'ausmalbild', spojovacky: 'punkte-verbinden', obtahovacky: 'nachzeichnen' },
        cardType: { bludiste: 'Labyrinth', omalovanky: 'Ausmalbild', spojovacky: 'Punkt zu Punkt', obtahovacky: 'Nachspuren' },
        indexTitle: 'Kostenlose Ausmalbilder & Labyrinthe für Kinder | VinMat',
        indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen für Kinder von 3 bis 10 Jahren. Direkt als A4-Arbeitsblätter ausdrucken.',
        indexHeading: 'Kostenlose Aktivitäten für Kinder zum Ausdrucken',
        indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen. Öffne eine Aktivität, lade sie herunter oder drucke sie direkt aus.',
        siteName: "VinMats Welt für Kinder",
        levelLabel: 'Stufe',
        detailPrefix: 'Kostenlose Druckvorlage',
        detailCta: 'Vorlage herunterladen',
        detailPrint: 'Arbeitsblatt drucken',
        detailBack: '← Alle Aktivitäten',
        activitySchemaLanguage: 'de'
    },
    es: {
        htmlLang: 'es',
        ogLocale: 'es_ES',
        output: 'es',
        assetDirectory: 'es',
        csvColumn: 'Es',
        activityDirectory: 'actividades',
        activityType: { bludiste: 'laberinto', omalovanky: 'dibujo', spojovacky: 'une-puntos', obtahovacky: 'trazado' },
        cardType: { bludiste: 'Laberinto', omalovanky: 'Dibujo para colorear', spojovacky: 'Une los puntos', obtahovacky: 'Trazado' },
        indexTitle: 'Dibujos para colorear y laberintos gratis | VinMat',
        indexDescription: 'Descarga gratis laberintos, dibujos para colorear, fichas de unir puntos y trazado para niños de 3 a 10 años. Actividades A4 listas para imprimir.',
        indexHeading: 'Actividades gratis para imprimir',
        indexIntro: 'Explora laberintos, dibujos para colorear, fichas de unir puntos y trazado. Abre una actividad, descárgala o imprímela directamente.',
        siteName: 'El mundo de VinMat para niños',
        levelLabel: 'Nivel',
        detailPrefix: 'Ficha gratuita para imprimir',
        detailCta: 'Descargar ficha',
        detailPrint: 'Imprimir ficha',
        detailBack: '← Todas las actividades',
        activitySchemaLanguage: 'es'
    }
};

// Jazyky, pro které už existuje přeložený zdrojový obsah guide stránek
// (ve složce podle `output`). Dokud pro de/es nejsou tyto stránky přeložené,
// generátor je pro ně přeskočí (viz copyGuidePages) a nebude litovat 404.
// Jestli je pro konkrétní guide stránku a jazyk už hotový přeložený zdroj,
// zjišťujeme přímo podle existence souboru na disku – ne podle pevného
// seznamu. Díky tomu funguje postupné dopřekládání stránka po stránce:
// jakmile přidáš např. de/unsere-geschichte.html, další build ji rovnou
// propojí (hreflang, patička, jazykový přepínač) bez úpravy kódu.
function guidePageExists(locale, page) {
    if (locale === 'en') return true;
    return existsSync(path.join(root, languages[locale].output, page[locale]));
}

const guidePages = [
    { key: 'activityGuide', en: 'guide-activities.html', cs: 'pruvodce-aktivitami.html', de: 'anleitung-aktivitaeten.html', es: 'guia-actividades.html' },
    { key: 'difficultyLevels', en: 'difficulty-levels.html', cs: 'urovne-obtiznosti.html', de: 'schwierigkeitsstufen.html', es: 'niveles-dificultad.html' },
    { key: 'ourStory', en: 'our-story.html', cs: 'nas-pribeh.html', de: 'unsere-geschichte.html', es: 'nuestra-historia.html' },
    { key: 'mazeGuide', en: 'guide-mazes.html', cs: 'pruvodce-bludiste.html', de: 'anleitung-labyrinthe.html', es: 'guia-laberintos.html' },
    { key: 'coloringGuide', en: 'guide-coloring.html', cs: 'pruvodce-omalovanky.html', de: 'anleitung-ausmalbilder.html', es: 'guia-dibujos.html' },
    { key: 'dotToDotGuide', en: 'guide-dot-to-dot.html', cs: 'pruvodce-spojovacky.html', de: 'anleitung-punkte-verbinden.html', es: 'guia-unir-puntos.html' },
    { key: 'tracingGuide', en: 'guide-tracing.html', cs: 'pruvodce-obtahovacky.html', de: 'anleitung-nachzeichnen.html', es: 'guia-trazado.html' },
    { key: 'tracingHistory', en: 'history-tracing.html', cs: 'historie-obkreslovani.html', de: 'geschichte-nachzeichnen.html', es: 'historia-trazado.html' },
    { key: 'privacy', en: 'privacy.html', cs: 'zasady-ochrany-osobnich-udaju.html', de: 'datenschutz.html', es: 'privacidad.html' },
    { key: 'terms', en: 'terms.html', cs: 'podminky-uziti.html', de: 'nutzungsbedingungen.html', es: 'terminos.html' }
];

const csvTypes = ['bludiste', 'omalovanky', 'spojovacky', 'obtahovacky'];

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function slugify(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'aktivita';
}

function parseCsvRow(text) {
    const values = [];
    let current = '';
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === '"') {
            if (quoted && text[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                quoted = !quoted;
            }
        } else if (char === ',' && !quoted) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values;
}

async function readActivities() {
    const activities = [];

    for (const type of csvTypes) {
        const csv = await readFile(path.join(root, 'assets', 'data', `${type}.csv`), 'utf8');
        const rows = csv.split(/\r?\n/).filter(Boolean);
        const headers = parseCsvRow(rows.shift());

        for (const rowText of rows) {
            const cells = parseCsvRow(rowText);
            const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
            if (!row.soubor) continue;

            const variants = ['colored', 'partly_colored', 'coloring']
                .filter((variant) => row[`altEn_${variant}`] && row[`altEn_${variant}`] !== '0');

            const names = {};
            const alt = {};
            for (const [locale, config] of Object.entries(languages)) {
                const col = config.csvColumn;
                names[locale] = row[`nazev${col}`] || row.nazevEn || row.soubor;
                alt[locale] = Object.fromEntries(['colored', 'partly_colored', 'coloring'].map((variant) => [
                    variant,
                    row[`alt${col}_${variant}`] || row[`altEn_${variant}`] || ''
                ]));
            }

            activities.push({
                id: `${type}-${row.soubor}`,
                type,
                fileBase: row.soubor,
                level: row.soubor.split('_')[0].toUpperCase(),
                date: row.datumPridani || '',
                names,
                alt,
                variants: variants.length ? variants : ['coloring']
            });
        }
    }

    return activities.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function imageBase(activity, variant) {
    const base = `${basePath}public/${activity.type}/${activity.fileBase}`;
    return activity.variants.length === 1 ? base : `${base}-${variant}`;
}

function primaryVariant(activity) {
    return activity.variants.includes('colored') ? 'colored' : activity.variants[0];
}

function assignSlugs(activities, locale) {
    const used = new Set();
    const config = languages[locale];

    for (const activity of activities) {
        const stem = `${config.activityType[activity.type]}-${slugify(activity.names[locale])}`;
        let slug = stem;
        // Stejný motiv může existovat ve více levelech. Zachováme proto
        // čitelný formát „aktivita-motiv“ a level doplníme jen při kolizi.
        if (used.has(slug)) slug = `${stem}-${slugify(activity.level)}`;
        if (used.has(slug)) slug = `${slug}-${slugify(activity.id)}`;
        used.add(slug);
        activity.slugs ??= {};
        activity.slugs[locale] = slug;
    }
}

function activityRelativeUrl(activity, locale) {
    return `${languages[locale].output ? `${languages[locale].output}/` : ''}${languages[locale].activityDirectory}/${activity.slugs[locale]}.html`;
}

function absoluteUrl(relativeUrl) {
    return new URL(relativeUrl, siteUrl).href;
}

function activityUrl(activity, locale) {
    return absoluteUrl(activityRelativeUrl(activity, locale));
}

function picture(activity, locale, variant, className = '') {
    const base = imageBase(activity, variant);
    const alt = activity.alt[locale][variant] || activity.names[locale];
    return `<picture><source srcset="${escapeHtml(base)}.webp" type="image/webp"><img src="${escapeHtml(base)}.png" alt="${escapeHtml(alt)}" loading="lazy" class="${className}"></picture>`;
}

function activityCard(activity, locale) {
    const config = languages[locale];
    const variant = primaryVariant(activity);
    const href = `${basePath}${activityRelativeUrl(activity, locale)}`;
    return `
        <article class="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all border border-slate-100 flex flex-col">
            <a href="${escapeHtml(href)}" class="bg-slate-50 p-4 flex items-center justify-center group" aria-label="${escapeHtml(activity.names[locale])}">
                ${picture(activity, locale, variant, 'max-w-full max-h-72 object-contain transition-transform duration-300 group-hover:scale-[1.02]')}
            </a>
            <div class="p-4 flex-grow">
                <div class="flex justify-between items-center mb-1"><span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">${escapeHtml(config.cardType[activity.type])}</span><span class="text-xs text-slate-400 font-bold">${escapeHtml(activity.level)}</span></div>
                <h3 class="font-bold text-sm text-slate-900 leading-tight uppercase"><a href="${escapeHtml(href)}" class="hover:text-indigo-600">${escapeHtml(activity.names[locale])}</a></h3>
            </div>
        </article>`;
}

function staticCatalog(activities, locale) {
    const config = languages[locale];
    return `<!-- STATIC_CATALOG_START -->
        <div class="col-span-full bg-white rounded-2xl border border-slate-100 p-5 text-center text-sm text-slate-600">
            <h2 class="font-extrabold text-slate-900 uppercase tracking-wide mb-2">${escapeHtml(config.indexHeading)}</h2>
            <p>${escapeHtml(config.indexIntro)}</p>
        </div>
        ${activities.map((activity) => activityCard(activity, locale)).join('\n')}
        <!-- STATIC_CATALOG_END -->`;
}

function setCatalog(html, catalog) {
    const start = '<!-- STATIC_CATALOG_START -->';
    const end = '<!-- STATIC_CATALOG_END -->';
    const existingStart = html.indexOf(start);
    const existingEnd = html.indexOf(end);
    if (existingStart !== -1 && existingEnd !== -1) {
        return html.slice(0, existingStart) + catalog + html.slice(existingEnd + end.length);
    }

    const emptyGrid = '<div id="knihovna-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"></div>';
    if (!html.includes(emptyGrid)) throw new Error('Static catalog insertion point was not found in index.html.');
    return html.replace(emptyGrid, emptyGrid.replace('</div>', `\n${catalog}\n        </div>`));
}

function setBodyData(html, locale, routeKey) {
    return html.replace(/<body\b([^>]*)>/i, (match, attributes) => {
        const withoutLocale = attributes.replace(/\sdata-(?:locale|route-key)="[^"]*"/g, '');
        return `<body${withoutLocale} data-locale="${locale}" data-route-key="${routeKey}">`;
    });
}

function insertBeforeFinalBodyClose(html, content) {
    const position = html.toLowerCase().lastIndexOf('</body>');
    if (position === -1) throw new Error('Closing body tag was not found.');
    return `${html.slice(0, position)}${content}${html.slice(position)}`;
}

function injectNavigation(html, assetPrefix) {
    const configScript = `<script src="${assetPrefix}assets/js/site-config.js"></script>`;
    const navigationScript = `<script src="${assetPrefix}assets/js/site-navigation.js"></script>`;
    // Při výrobě lokalizované kopie se nesmí převzít relativní cesta EN verze.
    html = html
        .replace(/\s*<script src="(?:\.\.\/)?assets\/js\/site-config\.js"><\/script>/g, '')
        .replace(/\s*<script src="(?:\.\.\/)?assets\/js\/site-navigation\.js"><\/script>/g, '');
    html = html.replace('</head>', `    ${configScript}\n</head>`);
    return insertBeforeFinalBodyClose(html, `    ${navigationScript}\n`);
}

function setIndexSeo(html, locale) {
    const config = languages[locale];
    const canonical = locale === 'en' ? siteUrl : `${siteUrl}${config.output}/`;
    html = html.replace(/<html lang="[^"]*">/i, `<html lang="${config.htmlLang}">`);
    html = html.replace(/<title id="page-title">[\s\S]*?<\/title>/i, `<title id="page-title">${escapeHtml(config.indexTitle)}</title>`);
    html = html.replace(/(<meta id="meta-desc" name="description" content=")[^"]*(">)/i, `$1${escapeHtml(config.indexDescription)}$2`);
    html = html.replace(/(<link id="link-canonical" rel="canonical" href=")[^"]*(">)/i, `$1${canonical}$2`);
    // Odstraníme všechny existující hreflang tagy a znovu je zapíšeme pro
    // všechny aktivní jazyky najednou (aby DE/ES přibyly automaticky
    // i do EN/CS hlavičky, ne jen do svých vlastních souborů).
    html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
    const hreflangTags = Object.entries(languages)
        .map(([code, cfg]) => `    <link rel="alternate" hreflang="${cfg.htmlLang}" href="${siteUrl}${cfg.output ? `${cfg.output}/` : ''}">`)
        .concat(`    <link rel="alternate" hreflang="x-default" href="${siteUrl}">`)
        .join('\n');
    html = html.replace('</head>', `${hreflangTags}\n</head>`);
    html = html.replace(/(<meta id="og-url"\s+property="og:url"\s+content=")[^"]*(">)/i, `$1${canonical}$2`);
    html = html.replace(/(<meta\s+property="og:locale"\s+content=")[^"]*(">)/i, `$1${config.ogLocale}$2`);
    // LOCALIZED_INDEX_SEO
    html = html.replace(/<meta id="og-title"[^>]*>/i, '<meta id="og-title" property="og:title" content="' + escapeHtml(config.indexTitle) + '">');
    html = html.replace(/<meta id="og-desc"[^>]*>/i, '<meta id="og-desc" property="og:description" content="' + escapeHtml(config.indexDescription) + '">');
    html = html.replace(/<meta id="tw-title"[^>]*>/i, '<meta id="tw-title" name="twitter:title" content="' + escapeHtml(config.indexTitle) + '">');
    html = html.replace(/<meta id="tw-desc"[^>]*>/i, '<meta id="tw-desc" name="twitter:description" content="' + escapeHtml(config.indexDescription) + '">');
    html = html.replace(/<meta\s+property="og:site_name"[^>]*>/i, '<meta property="og:site_name" content="' + escapeHtml(config.siteName) + '">');
    html = html.replace(/\s*<meta\s+name="keywords"[^>]*>/i, '');
    html = html.replace(/<h1 class="sr-only">[\s\S]*?<\/h1>/i, '<h1 class="sr-only">' + escapeHtml(config.indexHeading) + '</h1>');
    html = html.replace(/\s*<meta\s+property="og:locale:alternate"[^>]*>/gi, '');
    const alternateLocales = Object.values(languages)
        .filter((language) => language.ogLocale !== config.ogLocale)
        .map((language) => `    <meta property="og:locale:alternate" content="${language.ogLocale}">`)
        .join('\n');
    html = html.replace(/(<meta\s+property="og:locale"[^>]*>)/i, `$1\n${alternateLocales}`);
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: config.siteName,
        url: canonical,
        description: config.indexDescription,
        inLanguage: config.htmlLang
    };
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '<script type="application/ld+json">\n' + JSON.stringify(websiteSchema, null, 4) + '\n    </script>');
    return html;
}

function localizeIndexPaths(html, locale) {
    html = html
        .replace('src="translations.js"', 'src="../translations.js"')
        .replaceAll("fetch('assets/", "fetch('../assets/")
        .replaceAll("'public/", "'../public/")
        .replaceAll("url('assets/", "url('../assets/")
        .replaceAll('url("assets/', 'url("../assets/');
    // Odkazy na "guide" podstránky v patičce/navigaci: pokud pro daný jazyk
    // už existuje přeložená stránka, odkaž na ni. Pokud ještě ne, odkaž
    // absolutní cestou na EN verzi, ať web nikdy neukazuje na 404.
    const guideRouteToKey = {
        'privacy.html': 'privacy',
        'terms.html': 'terms',
        'guide-activities.html': 'activityGuide',
        'difficulty-levels.html': 'difficultyLevels',
        'our-story.html': 'ourStory'
    };
    for (const [enRoute, key] of Object.entries(guideRouteToKey)) {
        const page = guidePages.find((p) => p.key === key);
        const target = guidePageExists(locale, page) ? page[locale] : `${siteUrl}${page.en}`;
        html = html.replaceAll(`href="${enRoute}"`, `href="${target}"`);
    }
    return html;
}

function updateCzechInternalLinks(html) {
    return html
        .replaceAll('href="privacy-cz.html"', 'href="zasady-ochrany-osobnich-udaju.html"')
        .replaceAll('href="terms-cz.html"', 'href="podminky-uziti.html"')
        .replaceAll("jaz==='cz' ? 'privacy-cz.html'", "jaz==='cz' ? 'zasady-ochrany-osobnich-udaju.html'")
        .replaceAll("jaz==='cz' ? 'terms-cz.html'", "jaz==='cz' ? 'podminky-uziti.html'");
}

function setIndexLocale(html, locale) {
    return html
        // Jazyk určuje URL, ne dřívější volba uložená v prohlížeči.
        .replace(
            /jaz=(?:urlP\.get\('lang'\)\|\|localStorage\.getItem\('vinmat_lang'\)\|\|'en'|'(?:en|cz)');/,
            `jaz='${locale}';`
        )
        // Lokalizovaná adresa už nepotřebuje ani nesmí znovu vytvářet ?lang=cz.
        .replace("    if (jaz!=='en') params.set('lang', jaz);\n", '');
}

function activityPage(activity, locale) {
    const config = languages[locale];
    const variant = primaryVariant(activity);
    const title = `${config.detailPrefix}: ${activity.names[locale]} | VinMat`;
    const description = activity.alt[locale][variant] || activity.names[locale];
    const canonical = activityUrl(activity, locale);
    // Open Graph a schema vyžadují plnou veřejnou URL, ne relativní cestu.
    const image = absoluteUrl(`${imageBase(activity, variant)}.webp`);
    const home = `${basePath}${languages[locale].output ? `${languages[locale].output}/` : ''}`;
    const levelNumber = activity.level.replace(/^LV/, '');
    const otherLocales = Object.keys(languages).filter((code) => code !== locale);
    const languageNav = otherLocales
        .map((code) => `<a href="${activityUrl(activity, code)}">${languages[code].htmlLang.toUpperCase()}</a>`)
        .join('');
    const hreflangTags = Object.keys(languages)
        .map((code) => `    <link rel="alternate" hreflang="${languages[code].htmlLang}" href="${activityUrl(activity, code)}">`)
        .concat(`    <link rel="alternate" hreflang="x-default" href="${activityUrl(activity, 'en')}">`)
        .join('\n');
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: activity.names[locale],
        description,
        url: canonical,
        image,
        inLanguage: config.activitySchemaLanguage,
        isAccessibleForFree: true,
        learningResourceType: config.cardType[activity.type],
        educationalLevel: activity.level
    };

    return `<!doctype html>
<html lang="${config.htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">
${hreflangTags}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:locale" content="${config.ogLocale}">
    <link rel="icon" type="image/svg+xml" href="${basePath}assets/favicon/favicon.svg">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            @page { margin: 0; }
            body { background: #fff !important; }
            body > * { display: none !important; }
            body > main { display: block !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
            body > main > :not(.activity-print-card) { display: none !important; }
            .activity-print-card { display: block !important; margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; }
            .activity-print-card > :not(.activity-print-image) { display: none !important; }
            .activity-print-image { display: flex !important; padding: 0 !important; background: transparent !important; }
            .activity-print-image picture, .activity-print-image img { display: block !important; max-width: 100% !important; max-height: none !important; margin: 0 auto !important; }
        }
    </style>
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen" data-locale="${locale}" data-route-key="activity">
    <header class="bg-slate-900 text-white text-sm py-3 px-4"><div class="max-w-5xl mx-auto flex items-center justify-between gap-3"><a class="font-bold hover:text-amber-300" href="${home}">${escapeHtml(config.siteName)}</a><nav class="flex gap-3">${languageNav}</nav></div></header>
    <main class="max-w-5xl mx-auto px-4 py-8">
        <a class="text-sm font-bold text-indigo-700 hover:underline" href="${home}">${escapeHtml(config.detailBack)}</a>
        <article class="activity-print-card mt-5 grid gap-7 md:grid-cols-[minmax(0,3fr)_minmax(240px,2fr)] bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-8">
            <div class="activity-print-image bg-slate-50 rounded-2xl p-4 flex items-center justify-center">${picture(activity, locale, variant, 'max-w-full max-h-[70vh] object-contain')}</div>
            <div class="flex flex-col justify-between gap-6"><div><p class="text-xs font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(config.cardType[activity.type])} · ${escapeHtml(config.levelLabel)} ${escapeHtml(levelNumber)}</p><h1 class="mt-2 text-3xl font-extrabold text-slate-900">${escapeHtml(activity.names[locale])}</h1><p class="mt-4 text-slate-600 leading-relaxed">${escapeHtml(description)}</p></div><div class="space-y-3"><a class="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl" href="${escapeHtml(imageBase(activity, variant))}.png" download>${escapeHtml(config.detailCta)}</a><button class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl" onclick="window.print()">${escapeHtml(config.detailPrint)}</button></div></div>
        </article>
    </main>
    <script src="../../assets/js/site-navigation.js"></script>
</body>
</html>`;
}

function updateGuideSeo(html, page, locale) {
    const ownRelative = locale === 'en' ? page.en : `${languages[locale].output}/${page[locale]}`;
    const ownUrl = `${siteUrl}${ownRelative}`;
    const enUrl = `${siteUrl}${page.en}`;
    html = html.replace(/<html lang="[^"]*">/i, `<html lang="${languages[locale].htmlLang}">`);
    const setHeadTag = (pattern, tag) => pattern.test(html)
        ? html.replace(pattern, tag)
        : html.replace('</head>', `    ${tag}\n</head>`);
    html = setHeadTag(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/i, `<link rel="canonical" href="${ownUrl}">`);
    // Odstraníme staré hreflang tagy a zapíšeme je znovu pro všechny jazyky,
    // které pro tuto guide stránku už mají přeložený zdroj (viz guidePageExists).
    html = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?\s*>/gi, '');
    const hreflangTags = Object.keys(languages)
        .filter((code) => guidePageExists(code, page))
        .map((code) => {
            const relative = code === 'en' ? page.en : `${languages[code].output}/${page[code]}`;
            return `    <link rel="alternate" hreflang="${languages[code].htmlLang}" href="${siteUrl}${relative}">`;
        })
        .concat(`    <link rel="alternate" hreflang="x-default" href="${enUrl}">`)
        .join('\n');
    html = html.replace('</head>', `${hreflangTags}\n</head>`);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "VinMat's World for Kids";
    const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/i)?.[1] || '';
    const ogType = ['privacy', 'terms'].includes(page.key) ? 'website' : 'article';
    html = setHeadTag(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:title" content="${title}">`);
    html = setHeadTag(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:description" content="${description}">`);
    html = setHeadTag(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:type" content="${ogType}">`);
    html = setHeadTag(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:url" content="${ownUrl}">`);
    html = setHeadTag(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:locale" content="${languages[locale].ogLocale}">`);
    if (!html.includes('assets/favicon/favicon.svg')) {
        html = html.replace('</head>', `    <link rel="icon" type="image/svg+xml" href="${basePath}assets/favicon/favicon.svg">\n    <link rel="icon" type="image/png" sizes="96x96" href="${basePath}assets/favicon/favicon-96x96.png">\n    <link rel="apple-touch-icon" href="${basePath}assets/favicon/apple-touch-icon.png">\n    <link rel="manifest" href="${basePath}assets/favicon/site.webmanifest">\n</head>`);
    }
    html = html.replace(/("url":\s*")[^"]*(")/i, `$1${ownUrl}$2`);
    return html;
}

function deduplicateTrackingScripts(html) {
    const keepFirst = (pattern) => {
        let found = false;
        return html.replace(pattern, (match) => {
            if (found) return '';
            found = true;
            return match;
        });
    };
    html = keepFirst(/<script\b[^>]*\bsrc="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^\"]*"[^>]*>\s*<\/script>/gi);
    html = keepFirst(/<script\b[^>]*\bsrc="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^\"]+"[^>]*>\s*<\/script>/gi);
    return keepFirst(/<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\('js', new Date\(\)\);\s*gtag\('config', '[^']+'\);\s*<\/script>/gi);
}

function setGuideRouteLinks(html) {
    const renamedEnglishGuides = {
        'activity-guide.html': 'guide-activities.html',
        'maze-guide.html': 'guide-mazes.html',
        'coloring-guide.html': 'guide-coloring.html',
        'dot-to-dot-guide.html': 'guide-dot-to-dot.html',
        'tracing-guide.html': 'guide-tracing.html'
    };
    for (const [oldRoute, newRoute] of Object.entries(renamedEnglishGuides)) {
        html = html.replaceAll(oldRoute, newRoute);
    }
    return html;
}

function setGuideLanguageLink(html, page, locale) {
    const current = locale === 'en' ? page.cs : page.en;
    const legacyCzechPath = {
        'zasady-ochrany-osobnich-udaju.html': 'privacy-cz.html',
        'podminky-uziti.html': 'terms-cz.html'
    }[page.cs];
    const target = locale === 'en'
        ? `${basePath}cs/${page.cs}`
        : `${basePath}${page.en}`;
    html = html
        .replaceAll(`href="${current}"`, `href="${target}"`)
        .replaceAll(`href="${basePath}cs/${current}"`, `href="${target}"`)
        .replaceAll(`href="${basePath}cs/${legacyCzechPath}"`, `href="${target}"`);
    return html.replace(/(<a\b[^>]*\bhref=")[^"]*("[^>]*>\s*(?:CZ|EN)\s*<\/a>)/gi, `$1${target}$2`);
}

function ensureContactHelper(html) {
    if (!html.includes('onclick="kopirujProjektovyEmail()"') || /function\s+kopirujProjektovyEmail\s*\(/.test(html)) return html;
    const helper = `<script>function kopirujProjektovyEmail(){const emailAdresa='vinmatforkids@gmail.com';const statusLabel=document.getElementById('kopirovan-status');navigator.clipboard.writeText(emailAdresa).then(()=>{if(!statusLabel)return;statusLabel.textContent='(e-mail zkopírován)';statusLabel.classList.remove('opacity-0');setTimeout(()=>statusLabel.classList.add('opacity-0'),1800);});}</script>`;
    return insertBeforeFinalBodyClose(html, `    ${helper}\n`);
}

async function syncTranslatedGuides(locale, sitemapUrls) {
    const config = languages[locale];
    for (const page of guidePages) {
        const relativePath = path.join(config.output, page[locale]);
        const source = path.join(root, relativePath);
        if (!existsSync(source)) continue;
        let html = await readFile(source, 'utf8');
        html = deduplicateTrackingScripts(html);
        html = updateGuideSeo(html, page, locale);
        html = setBodyData(html, locale, page.key);
        html = injectNavigation(html, '../');
        html = ensureContactHelper(html);
        await writeFile(source, html);
        sitemapUrls.add(`${siteUrl}${config.output}/${page[locale]}`);
    }
}

async function copyCzechGuides(sitemapUrls) {
    for (const page of guidePages) {
        const source = path.join(root, 'cs', page.cs);
        try {
            let html = await readFile(source, 'utf8');
            html = deduplicateTrackingScripts(html);
            html = updateGuideSeo(html, page, 'cs');
            html = setGuideRouteLinks(html);
            html = setGuideLanguageLink(html, page, 'cs');
            html = updateCzechInternalLinks(html);
            html = setBodyData(html, 'cs', page.key);
            html = injectNavigation(html, '../');
            html = ensureContactHelper(html);
            await writeFile(source, html);
            sitemapUrls.add(`${siteUrl}cs/${page.cs}`);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            console.warn(`Czech guide page not found, skipped: cs/${page.cs}`);
        }
    }
}

async function updateEnglishGuides(sitemapUrls) {
    for (const page of guidePages) {
        const source = path.join(root, page.en);
        try {
            let html = await readFile(source, 'utf8');
            html = deduplicateTrackingScripts(html);
            html = updateGuideSeo(html, page, 'en');
            html = setGuideRouteLinks(html);
            html = setGuideLanguageLink(html, page, 'en');
            html = setBodyData(html, 'en', page.key);
            html = injectNavigation(html, '');
            html = ensureContactHelper(html);
            await writeFile(source, html);
            sitemapUrls.add(`${siteUrl}${page.en}`);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            console.warn(`English source page not found, skipped: ${page.en}`);
        }
    }
}

function sitemap(urls) {
    const entries = [...urls].sort().map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function build() {
    const activities = await readActivities();
    for (const locale of Object.keys(languages)) {
        assignSlugs(activities, locale);
    }

    const sitemapUrls = new Set(
        Object.values(languages).map((cfg) => `${siteUrl}${cfg.output ? `${cfg.output}/` : ''}`)
    );
    let englishIndex = await readFile(path.join(root, 'index.html'), 'utf8');
    englishIndex = setCatalog(englishIndex, staticCatalog(activities, 'en'));
    englishIndex = setIndexSeo(englishIndex, 'en');
    englishIndex = setIndexLocale(englishIndex, 'en');
    englishIndex = setGuideRouteLinks(englishIndex);
    englishIndex = updateCzechInternalLinks(englishIndex);
    englishIndex = setBodyData(englishIndex, 'en', 'home');
    englishIndex = injectNavigation(englishIndex, '');
    await writeFile(path.join(root, 'index.html'), englishIndex);

    let czechIndex = setCatalog(englishIndex, staticCatalog(activities, 'cs'));
    czechIndex = setIndexSeo(czechIndex, 'cs');
    czechIndex = setIndexLocale(czechIndex, 'cz');
    czechIndex = setBodyData(czechIndex, 'cs', 'home');
    czechIndex = localizeIndexPaths(czechIndex, 'cs');
    czechIndex = updateCzechInternalLinks(czechIndex);
    czechIndex = injectNavigation(czechIndex, '../');
    await mkdir(path.join(root, 'cs'), { recursive: true });
    await writeFile(path.join(root, 'cs', 'index.html'), czechIndex);

    // Další jazyky (DE, ES, …) se odvozují stejným způsobem jako CS verze,
    // ze stejné anglické šablony. Guide odkazy v patičce automaticky ukazují
    // na EN fallback, dokud pro daný jazyk nejsou přeložené (viz activeGuideLocales).
    for (const locale of Object.keys(languages)) {
        if (locale === 'en' || locale === 'cs') continue;
        const config = languages[locale];
        let localeIndex = setCatalog(englishIndex, staticCatalog(activities, locale));
        localeIndex = setIndexSeo(localeIndex, locale);
        localeIndex = setIndexLocale(localeIndex, locale);
        localeIndex = setBodyData(localeIndex, locale, 'home');
        localeIndex = localizeIndexPaths(localeIndex, locale);
        localeIndex = injectNavigation(localeIndex, '../');
        await mkdir(path.join(root, config.output), { recursive: true });
        await writeFile(path.join(root, config.output, 'index.html'), localeIndex);
    }

    for (const locale of Object.keys(languages)) {
        for (const activity of activities) {
            const relative = activityRelativeUrl(activity, locale);
            await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
            await writeFile(path.join(root, relative), activityPage(activity, locale));
            sitemapUrls.add(activityUrl(activity, locale));
        }
    }

    await updateEnglishGuides(sitemapUrls);
    await copyCzechGuides(sitemapUrls);
    for (const locale of Object.keys(languages)) {
        if (locale === 'en' || locale === 'cs') continue;
        await syncTranslatedGuides(locale, sitemapUrls);
    }
    await writeFile(path.join(root, 'sitemap.xml'), sitemap(sitemapUrls));

    console.log(`Generated ${activities.length * Object.keys(languages).length} activity pages and ${sitemapUrls.size} sitemap URLs.`);
}

build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
