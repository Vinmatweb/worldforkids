import { readFile } from 'node:fs/promises';

const pages = [
    {
        file: new URL('../de/schwierigkeitsstufen.html', import.meta.url),
        locale: 'de',
        canonical: 'https://vinmat.eu/worldforkids/de/schwierigkeitsstufen.html',
        title: '<title>Schwierigkeitsstufen für Kinderaktivitäten | VinMat</title>',
        ages: ['3–4 Jahre', '5–6 Jahre', '7–9 Jahre', '10+ Jahre', '12+ und Erwachsene'],
        levels: ['Stufe 1: Erste Schritte', 'Stufe 2: Vorschule', 'Stufe 3: Mehr Ausdauer', 'Stufe 4: Fortgeschritten', 'Stufe 5: Experte'],
        pending: 'Nachspuren – bald',
        legal: ['Datenschutz (Englisch)', 'Nutzungsbedingungen (Englisch)'],
        forbidden: ['Punkte-verbinden-Vorlage', '>Nachzeichnen<', "'obtahovacky'", '${']
    },
    {
        file: new URL('../es/niveles-dificultad.html', import.meta.url),
        locale: 'es',
        canonical: 'https://vinmat.eu/worldforkids/es/niveles-dificultad.html',
        title: '<title>Niveles de dificultad para actividades infantiles | VinMat</title>',
        ages: ['3–4 años', '5–6 años', '7–9 años', '10+ años', '12+ y adultos'],
        levels: ['Nivel 1: Primeros pasos', 'Nivel 2: Educación infantil', 'Nivel 3: Más autonomía', 'Nivel 4: Avanzado', 'Nivel 5: Experto'],
        pending: 'Trazado – próximamente',
        legal: ['Privacidad (en inglés)', 'Términos de uso (en inglés)'],
        forbidden: ['Escolar joven', 'resolutores', "'obtahovacky'", '${']
    }
];

const errors = [];
const count = (text, value) => text.split(value).length - 1;

function validateScripts(html, file) {
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
        try { new Function(match[1]); }
        catch (error) { errors.push(`${file}: inline script ${index + 1}: ${error.message}`); }
    });

    const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    jsonLd.forEach((match, index) => {
        try { JSON.parse(match[1]); }
        catch (error) { errors.push(`${file}: JSON-LD ${index + 1}: ${error.message}`); }
    });
}

for (const page of pages) {
    const html = await readFile(page.file, 'utf8');
    const name = page.file.pathname;

    if (!html.includes(`<html lang="${page.locale}">`)) errors.push(`${name}: wrong html lang`);
    if (!html.includes(`data-locale="${page.locale}"`)) errors.push(`${name}: wrong data-locale`);
    if (!html.includes(page.title)) errors.push(`${name}: wrong title`);
    if (!html.includes(`rel="canonical" href="${page.canonical}"`)) errors.push(`${name}: wrong canonical`);
    if (!html.includes('name="robots" content="index, follow"')) errors.push(`${name}: missing robots meta`);

    for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) {
        if (!html.includes(`hreflang="${lang}"`)) errors.push(`${name}: missing hreflang ${lang}`);
    }

    for (const age of page.ages) if (!html.includes(age)) errors.push(`${name}: missing age ${age}`);
    for (const level of page.levels) if (!html.includes(level)) errors.push(`${name}: missing level ${level}`);
    for (const label of page.legal) if (!html.includes(label)) errors.push(`${name}: missing legal label ${label}`);
    for (const value of page.forbidden) if (html.includes(value)) errors.push(`${name}: forbidden value remains: ${value}`);

    if (count(html, 'class="level-card"') !== 5) errors.push(`${name}: expected five level cards`);
    if (count(html, page.pending) !== 5) errors.push(`${name}: expected five pending tracing labels`);
    if (count(html, "navratSFiltry('LV") !== 15) errors.push(`${name}: expected 15 active filter buttons`);
    if (!html.includes("window.location.assign('index.html?type='")) errors.push(`${name}: filter navigation is missing`);
    if (html.includes('whitespace-nowrap text-center')) errors.push(`${name}: footer still prevents wrapping`);

    validateScripts(html, name);
}

if (errors.length) {
    console.error(`Difficulty localization validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log('Difficulty localization validation passed.');
