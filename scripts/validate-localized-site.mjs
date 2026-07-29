import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

async function text(file) {
    const full = path.join(root, file);
    try {
        const info = await stat(full);
        assert(info.size > 100, `${file}: file is empty or unexpectedly small`);
        return await readFile(full, 'utf8');
    } catch (error) {
        errors.push(`${file}: ${error.message}`);
        return '';
    }
}

function count(haystack, needle) {
    return haystack.split(needle).length - 1;
}

function validateInlineScripts(html, file) {
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
        try {
            new Function(match[1]);
        } catch (error) {
            errors.push(`${file}: inline script ${index + 1} has invalid JavaScript: ${error.message}`);
        }
    });
}

function validateJsonLd(html, file) {
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    blocks.forEach((match, index) => {
        try {
            JSON.parse(match[1]);
        } catch (error) {
            errors.push(`${file}: JSON-LD block ${index + 1} is invalid: ${error.message}`);
        }
    });
}

const indexExpectations = {
    'index.html': {
        locale: 'en', canonical: 'https://vinmat.eu/worldforkids/', title: 'Free Printable', cardLabel: 'Coloring',
        noScript: 'JavaScript is disabled.'
    },
    'cs/index.html': {
        locale: 'cs', canonical: 'https://vinmat.eu/worldforkids/cs/', title: 'Bludiště', cardLabel: 'Omalovánka',
        noScript: 'JavaScript je vypnutý.'
    },
    'de/index.html': {
        locale: 'de', canonical: 'https://vinmat.eu/worldforkids/de/', title: 'Punkt-zu-Punkt-Bilder', cardLabel: 'Punkt zu Punkt',
        noScript: 'JavaScript ist deaktiviert.'
    },
    'es/index.html': {
        locale: 'es', canonical: 'https://vinmat.eu/worldforkids/es/', title: 'dibujos para colorear', cardLabel: 'Dibujo para colorear',
        noScript: 'JavaScript está desactivado.'
    }
};

for (const [file, expected] of Object.entries(indexExpectations)) {
    const html = await text(file);
    assert(html.includes(`<html lang="${expected.locale}">`), `${file}: wrong html lang`);
    assert(html.includes(`data-locale="${expected.locale}"`), `${file}: wrong data-locale`);
    assert(html.includes(`rel="canonical" href="${expected.canonical}"`), `${file}: wrong canonical`);
    for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) {
        assert(html.includes(`hreflang="${lang}"`), `${file}: missing hreflang ${lang}`);
    }
    assert(html.includes(expected.title), `${file}: expected localized title text is missing`);
    assert(html.includes(expected.cardLabel), `${file}: expected localized static card label is missing`);
    assert(!html.includes('SearchAction'), `${file}: invalid SearchAction schema is still present`);
    assert(!html.includes('ddog'), `${file}: known alt-text typo is still present`);
    assert(count(html, '<!-- STATIC_CATALOG_START -->') === 1, `${file}: static catalog start marker count is not 1`);
    assert(count(html, '<!-- STATIC_CATALOG_END -->') === 1, `${file}: static catalog end marker count is not 1`);
    const catalog = html.match(/<!-- STATIC_CATALOG_START -->([\s\S]*?)<!-- STATIC_CATALOG_END -->/)?.[1] || '';
    const articleCount = count(catalog, '<article ');
    assert(articleCount >= 20, `${file}: static catalog contains only ${articleCount} cards`);
    assert(count(catalog, '<h3 ') === articleCount, `${file}: each static card must use one h3 heading`);
    assert(!/<article[\s\S]*?<h2\b/.test(catalog), `${file}: a static card still uses h2`);
    assert(count(html, 'setJazyk(jaz);\nsetJazyk(jaz);') === 0, `${file}: duplicate setJazyk call remains`);
    assert(html.includes('data-vinmat-noscript'), `${file}: no-JavaScript fallback is missing`);
    assert(html.includes(expected.noScript), `${file}: no-JavaScript fallback is not localized`);
    for (const href of [
        '/worldforkids/assets/favicon/favicon.svg',
        '/worldforkids/assets/favicon/favicon-96x96.png',
        '/worldforkids/assets/favicon/apple-touch-icon.png',
        '/worldforkids/assets/favicon/site.webmanifest'
    ]) {
        assert(count(html, `href="${href}"`) === 1, `${file}: duplicate or missing head link ${href}`);
    }
    validateInlineScripts(html, file);
    validateJsonLd(html, file);
}

const historyChecks = [
    {
        file: 'de/geschichte-nachzeichnen.html', locale: 'de',
        required: ['Startseite', 'Aktivitäten-Guide', 'Schwierigkeitsstufen', 'Unsere Geschichte', 'data-language-target="cs"', 'data-language-target="en"', 'data-language-target="es"'],
        forbidden: ['<span>Domů</span>', '>Průvodce aktivitami<', '>Úrovně obtížnosti<', '>Náš příběh<']
    },
    {
        file: 'es/historia-trazado.html', locale: 'es',
        required: ['Inicio', 'Guía de actividades', 'Niveles de dificultad', 'Nuestra historia', 'data-language-target="cs"', 'data-language-target="en"', 'data-language-target="de"'],
        forbidden: ['<span>Domů</span>', '>Průvodce aktivitami<', '>Úrovně obtížnosti<', '>Náš příběh<']
    }
];

for (const check of historyChecks) {
    const html = await text(check.file);
    assert(html.includes(`data-locale="${check.locale}"`), `${check.file}: wrong data-locale`);
    for (const value of check.required) assert(html.includes(value), `${check.file}: missing ${value}`);
    for (const value of check.forbidden) assert(!html.includes(value), `${check.file}: old Czech header text remains`);
    for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) {
        assert(html.includes(`hreflang="${lang}"`), `${check.file}: missing hreflang ${lang}`);
    }
    validateInlineScripts(html, check.file);
    validateJsonLd(html, check.file);
}

const activityGuideChecks = [
    {
        file: 'de/anleitung-aktivitaeten.html',
        locale: 'de',
        canonical: 'https://vinmat.eu/worldforkids/de/anleitung-aktivitaeten.html',
        required: [
            '<title>Aktivitäten für Kinder auswählen | VinMat</title>',
            'Welche Aktivität passt zu welchem Alter?',
            '>Aktivitäten für Kinder auswählen</h1>',
            'href="anleitung-labyrinthe.html"',
            'href="anleitung-ausmalbilder.html"',
            'href="anleitung-punkte-verbinden.html"',
            'href="anleitung-nachzeichnen.html"',
            'href="schwierigkeitsstufen.html"',
            'Punkt-zu-Punkt-Bilder',
            'Nachspuren',
            'Stufe 5 (12+)',
            'Datenschutz (Englisch)',
            'Nutzungsbedingungen (Englisch)',
            'content="es_ES"'
        ],
        forbidden: [
            'href="pruvodce-',
            'href="urovne-obtiznosti.html"',
            'Punkte-verbinden-Vorlagen',
            '>Nachzeichnen</',
            'ab 2 Jahren',
            '<td class="p-3">3+ *</td>',
            'whitespace-nowrap text-center',
            'https://www.vinmat.eu/worldforkids"'
        ]
    },
    {
        file: 'es/guia-actividades.html',
        locale: 'es',
        canonical: 'https://vinmat.eu/worldforkids/es/guia-actividades.html',
        required: [
            '<title>Guía de actividades para niños | VinMat</title>',
            '¿Qué actividad es adecuada para cada edad?',
            '>Guía de actividades</h1>',
            'href="guia-laberintos.html"',
            'href="guia-dibujos.html"',
            'href="guia-unir-puntos.html"',
            'href="guia-trazado.html"',
            'href="niveles-dificultad.html"',
            'Nivel 5 (12+)',
            'Privacidad (en inglés)',
            'Términos de uso (en inglés)',
            'content="de_DE"'
        ],
        forbidden: [
            'href="pruvodce-',
            'href="urovne-obtiznosti.html"',
            'Aparta a tus hijos',
            'pinturita',
            'Solo después coged',
            'desde los 2 años',
            '<td class="p-3">3+ *</td>',
            'whitespace-nowrap text-center',
            'https://www.vinmat.eu/worldforkids"'
        ]
    }
];

for (const check of activityGuideChecks) {
    const html = await text(check.file);
    assert(html.includes(`<html lang="${check.locale}">`), `${check.file}: wrong html lang`);
    assert(html.includes(`data-locale="${check.locale}"`), `${check.file}: wrong data-locale`);
    assert(html.includes(`rel="canonical" href="${check.canonical}"`), `${check.file}: wrong canonical`);
    assert(html.includes('name="robots" content="index, follow"'), `${check.file}: robots meta is missing`);
    for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) {
        assert(html.includes(`hreflang="${lang}"`), `${check.file}: missing hreflang ${lang}`);
    }
    for (const value of check.required) assert(html.includes(value), `${check.file}: missing ${value}`);
    for (const value of check.forbidden) assert(!html.includes(value), `${check.file}: forbidden old value remains: ${value}`);
    validateInlineScripts(html, check.file);
    validateJsonLd(html, check.file);
}

const siteNavigation = await text('assets/js/site-navigation.js');
try { new Function(siteNavigation); } catch (error) { errors.push(`assets/js/site-navigation.js: ${error.message}`); }
assert(siteNavigation.includes("de: 'DE'"), 'site-navigation.js: DE language is missing');
assert(siteNavigation.includes("es: 'ES'"), 'site-navigation.js: ES language is missing');
assert(siteNavigation.includes("existingButton.setAttribute('aria-label', labels.backToTop)"), 'site-navigation.js: existing back-to-top labels are not localized');

const dotData = await text('assets/data/spojovacky.csv');
assert(!dotData.includes('Punkte-verbinden-Vorlage'), 'spojovacky.csv: machine-like German terminology remains');
assert(dotData.includes('Punkt-zu-Punkt-Bild'), 'spojovacky.csv: natural German dot-to-dot terminology is missing');
const teddyRow = dotData.split(/\r?\n/).find((line) => line.includes('lv2_gem_1004-bear-dot-to-dot')) || '';
assert(teddyRow.includes('5–6'), 'spojovacky.csv: LV2 teddy bear row does not contain age 5–6');
assert(!teddyRow.includes('3–4'), 'spojovacky.csv: LV2 teddy bear row still contains age 3–4');

const sitemap = await text('sitemap.xml');
for (const url of [
    'https://vinmat.eu/worldforkids/',
    'https://vinmat.eu/worldforkids/cs/',
    'https://vinmat.eu/worldforkids/de/',
    'https://vinmat.eu/worldforkids/es/',
    'https://vinmat.eu/worldforkids/de/anleitung-aktivitaeten.html',
    'https://vinmat.eu/worldforkids/es/guia-actividades.html',
    'https://vinmat.eu/worldforkids/de/geschichte-nachzeichnen.html',
    'https://vinmat.eu/worldforkids/es/historia-trazado.html'
]) {
    assert(sitemap.includes(`<loc>${url}</loc>`), `sitemap.xml: missing ${url}`);
}

if (errors.length) {
    console.error(`Localization validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log('Localization validation passed.');
