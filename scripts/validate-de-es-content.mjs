import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const assert = (value, message) => { if (!value) errors.push(message); };
const count = (text, value) => text.split(value).length - 1;

async function read(relative) {
    try {
        const file = path.join(root, relative);
        const info = await stat(file);
        assert(info.size > 100, `${relative}: unexpectedly small file`);
        return await readFile(file, 'utf8');
    } catch (error) {
        errors.push(`${relative}: ${error.message}`);
        return '';
    }
}

function validateScripts(html, file) {
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
        try { new Function(match[1]); }
        catch (error) { errors.push(`${file}: inline script ${index + 1}: ${error.message}`); }
    });
    const jsonBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    assert(jsonBlocks.length > 0, `${file}: missing JSON-LD`);
    jsonBlocks.forEach((match, index) => {
        try { JSON.parse(match[1]); }
        catch (error) { errors.push(`${file}: JSON-LD ${index + 1}: ${error.message}`); }
    });
}

function validateCommonPage(html, file, locale, canonical) {
    assert(html.includes(`<html lang="${locale}">`), `${file}: wrong html lang`);
    assert(html.includes(`data-locale="${locale}"`), `${file}: wrong data-locale`);
    assert(html.includes(`rel="canonical" href="${canonical}"`), `${file}: wrong canonical`);
    assert(html.includes('name="robots" content="index, follow"'), `${file}: missing robots meta`);
    assert(count(html, '<h1') === 1, `${file}: expected exactly one h1`);
    for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) assert(html.includes(`hreflang="${lang}"`), `${file}: missing hreflang ${lang}`);
    assert(html.includes('assets/js/site-config.js'), `${file}: missing site-config.js`);
    assert(html.includes('assets/js/site-navigation.js'), `${file}: missing site-navigation.js`);
    validateScripts(html, file);
}

const staticPages = {
    de: [
        ['anleitung-aktivitaeten.html', 'activityGuide'], ['schwierigkeitsstufen.html', 'difficultyLevels'], ['unsere-geschichte.html', 'ourStory'],
        ['anleitung-labyrinthe.html', 'mazeGuide'], ['anleitung-ausmalbilder.html', 'coloringGuide'], ['anleitung-punkte-verbinden.html', 'dotToDotGuide'],
        ['anleitung-nachzeichnen.html', 'tracingGuide'], ['geschichte-nachzeichnen.html', 'tracingHistory'],
        ['datenschutz.html', 'privacy'], ['nutzungsbedingungen.html', 'terms']
    ],
    es: [
        ['guia-actividades.html', 'activityGuide'], ['niveles-dificultad.html', 'difficultyLevels'], ['nuestra-historia.html', 'ourStory'],
        ['guia-laberintos.html', 'mazeGuide'], ['guia-dibujos.html', 'coloringGuide'], ['guia-unir-puntos.html', 'dotToDotGuide'],
        ['guia-trazado.html', 'tracingGuide'], ['historia-trazado.html', 'tracingHistory'],
        ['privacidad.html', 'privacy'], ['terminos-de-uso.html', 'terms']
    ]
};

for (const [locale, pages] of Object.entries(staticPages)) {
    for (const [name, routeKey] of pages) {
        const file = `${locale}/${name}`;
        const html = await read(file);
        validateCommonPage(html, file, locale, `https://vinmat.eu/worldforkids/${locale}/${name}`);
        assert(html.includes(`data-route-key="${routeKey}"`), `${file}: wrong route key`);
        const legal = locale === 'de' ? ['Datenschutz', 'Nutzungsbedingungen'] : ['Privacidad', 'Términos de uso'];
        for (const label of legal) assert(html.includes(label), `${file}: missing legal-language label ${label}`);
        assert(!html.includes("VinMat's World for Kids"), `${file}: English site name remains`);
        assert(!html.includes('whitespace-nowrap text-center'), `${file}: footer cannot wrap on mobile`);
    }
}

const deColoring = await read('de/anleitung-ausmalbilder.html');
assert(!deColoring.includes('motivy'), 'de/anleitung-ausmalbilder.html: Czech word remains');
assert(deColoring.includes('Detailreichere Motive und kleinere Flächen'), 'de/anleitung-ausmalbilder.html: corrected LV4 copy is missing');

const deDot = await read('de/anleitung-punkte-verbinden.html');
const esDot = await read('es/guia-unir-puntos.html');
for (const value of ['10–20', '30', '90–120', '150']) assert(deDot.includes(value), `German dot-to-dot guide missing production value ${value}`);
for (const value of ['10–20', '30', '90–120', '150']) assert(esDot.includes(value), `Spanish dot-to-dot guide missing production value ${value}`);

const deTracing = await read('de/anleitung-nachzeichnen.html');
const esTracing = await read('es/guia-trazado.html');
for (const html of [deTracing, esTracing]) {
    assert(!html.includes('index.html?type=obtahovacky'), 'Tracing guide links to an empty catalog');
    for (const value of ['0,1 mm', 'RGB 195, 195, 195', '40–60 %', '30 %', '20 %', '10 %', '0–5 %']) assert(html.includes(value), `Tracing guide missing production value ${value}`);
}
assert(deTracing.includes('In Vorbereitung'), 'German tracing guide is not marked as upcoming');
assert(esTracing.includes('En preparación'), 'Spanish tracing guide is not marked as upcoming');

const deStory = await read('de/unsere-geschichte.html');
const esStory = await read('es/nuestra-historia.html');
for (const html of [deStory, esStory]) {
    assert(!html.includes('api.coingecko.com'), 'Story page still loads a live cryptocurrency rate');
    assert(html.includes('ko-fi.com/vinmat'), 'Story page missing Ko-fi');
    assert(html.includes('paypal.me/VinmatForKids'), 'Story page missing PayPal');
    assert(html.includes('vinmatforkids@anycoin.cz'), 'Story page missing Lightning address');
    assert(html.includes('published-stats-body'), 'Story page missing activity statistics');
}

const deHistory = await read('de/geschichte-nachzeichnen.html');
const esHistory = await read('es/historia-trazado.html');
for (const html of [deHistory, esHistory]) {
    assert(!/Michelangelo|Miguel Ángel|Ägypt|egipci/i.test(html), 'Tracing history still contains unnecessary unsupported named claims');
}

function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === '"') {
            if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
            else quoted = !quoted;
        } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
        else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && text[i + 1] === '\n') i += 1;
            row.push(cell); cell = '';
            if (row.some((value) => value !== '')) rows.push(row);
            row = [];
        } else cell += char;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const headers = rows.shift() || [];
    return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

const csvConfig = [
    ['bludiste', 6], ['omalovanky', 14], ['spojovacky', 8], ['obtahovacky', 0]
];
const allRows = [];
for (const [type, expected] of csvConfig) {
    const text = await read(`assets/data/${type}.csv`);
    const rows = parseCsv(text);
    assert(rows.length === expected, `assets/data/${type}.csv: expected ${expected} rows, found ${rows.length}`);
    for (const row of rows) allRows.push({ type, ...row });
}

const coloringCsv = await read('assets/data/omalovanky.csv');
assert(!/Anti-Stress|antiestrés/i.test(coloringCsv), 'omalovanky.csv: stress-related marketing wording remains');
assert(coloringCsv.includes('ab 12 Jahren und Erwachsene'), 'omalovanky.csv: German LV5 age is missing');
assert(coloringCsv.includes('a partir de 12 años y adultos'), 'omalovanky.csv: Spanish LV5 age is missing');

const dotCsv = await read('assets/data/spojovacky.csv');
assert(!dotCsv.includes('Punkte-verbinden-Vorlage'), 'spojovacky.csv: machine-like German terminology remains');
assert(dotCsv.includes('Punkt-zu-Punkt-Bild'), 'spojovacky.csv: natural German terminology is missing');

const duplicateMap = new Map();
for (const row of allRows) {
    const level = row.soubor.split('_')[0].toUpperCase();
    for (const locale of ['De', 'Es']) {
        const key = `${row.type}:${level}:${locale}:${row[`nazev${locale}`]}`;
        const list = duplicateMap.get(key) || [];
        list.push(row.soubor);
        duplicateMap.set(key, list);
    }
}
for (const [key, files] of duplicateMap) if (files.length > 1) warnings.push(`Duplicate visible activity name ${key}: ${files.join(', ')}`);

async function exists(relative) {
    try { await stat(path.join(root, relative)); return true; }
    catch { return false; }
}

for (const row of allRows) {
    const variants = ['colored', 'partly_colored', 'coloring'].filter((variant) => row[`altEn_${variant}`] && row[`altEn_${variant}`] !== '0');
    const active = variants.length ? variants : ['coloring'];
    for (const variant of active) {
        const base = active.length === 1 ? `public/${row.type}/${row.soubor}` : `public/${row.type}/${row.soubor}-${variant}`;
        assert(await exists(`${base}.png`), `${base}.png: missing image`);
        assert(await exists(`${base}.webp`), `${base}.webp: missing image`);
    }
}

const activityLocales = {
    de: { directory: 'de/aktivitaeten', siteName: 'VinMats Welt für Kinder', nav: ['Startseite', 'Aktivitäten-Guide', 'Schwierigkeitsstufen', 'Unsere Geschichte'], legal: ['Datenschutz', 'Nutzungsbedingungen'] },
    es: { directory: 'es/actividades', siteName: 'El mundo de VinMat para niños', nav: ['Inicio', 'Guía de actividades', 'Niveles de dificultad', 'Nuestra historia'], legal: ['Privacidad', 'Términos de uso'] }
};

for (const [locale, config] of Object.entries(activityLocales)) {
    const names = (await readdir(path.join(root, config.directory))).filter((name) => name.endsWith('.html'));
    assert(names.length === 28, `${config.directory}: expected 28 activity pages, found ${names.length}`);
    for (const name of names) {
        const file = `${config.directory}/${name}`;
        const html = await read(file);
        assert(html.includes(`<html lang="${locale}">`), `${file}: wrong html lang`);
        assert(html.includes(`data-locale="${locale}" data-route-key="activity"`), `${file}: wrong body localization`);
        assert(count(html, '<h1') === 1, `${file}: expected one h1`);
        for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) assert(html.includes(`hreflang="${lang}"`), `${file}: missing hreflang ${lang}`);
        assert(html.includes('<meta property="og:type" content="article">'), `${file}: wrong OG type`);
        assert(html.includes(`<meta property="og:site_name" content="${config.siteName}">`), `${file}: missing localized OG site name`);
        assert(html.includes('name="twitter:card" content="summary_large_image"'), `${file}: missing Twitter metadata`);
        assert(html.includes('"@type":"LearningResource"'), `${file}: missing LearningResource schema`);
        assert(html.includes('"mainEntityOfPage"'), `${file}: missing schema mainEntityOfPage`);
        assert(html.includes('"provider"'), `${file}: missing schema provider`);
        assert(html.includes('pagead2.googlesyndication.com'), `${file}: missing AdSense script`);
        assert(html.includes('googletagmanager.com/gtag/js'), `${file}: missing Analytics script`);
        assert(html.includes('data-activity-footer'), `${file}: missing localized footer`);
        for (const value of [...config.nav, ...config.legal]) assert(html.includes(value), `${file}: missing ${value}`);
        assert(html.includes('<span>CZ</span>'), `${file}: missing CZ language label`);
        assert(!html.includes('>CS<'), `${file}: CS language label remains`);
        assert(count(html, ' download>') === 1, `${file}: expected one download link`);
        assert(html.includes('onclick="window.print()"'), `${file}: missing print button`);
        validateScripts(html, file);
    }
}

const sitemap = await read('sitemap.xml');
assert(count(sitemap, '<loc>https://vinmat.eu/worldforkids/de/aktivitaeten/') === 28, 'sitemap.xml: expected 28 German activity URLs');
assert(count(sitemap, '<loc>https://vinmat.eu/worldforkids/es/actividades/') === 28, 'sitemap.xml: expected 28 Spanish activity URLs');
assert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/de/datenschutz.html</loc>'), 'sitemap.xml: missing German privacy page');
assert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/de/nutzungsbedingungen.html</loc>'), 'sitemap.xml: missing German terms page');
assert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/es/privacidad.html</loc>'), 'sitemap.xml: missing Spanish privacy page');
assert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/es/terminos-de-uso.html</loc>'), 'sitemap.xml: missing Spanish terms page');

if (warnings.length) {
    console.warn(`DE/ES validation warnings (${warnings.length}):`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
    console.error(`DE/ES validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log('Complete German and Spanish localization validation passed.');
