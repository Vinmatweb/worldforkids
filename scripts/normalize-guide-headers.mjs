import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const basePath = '/worldforkids/';
const languageOrder = ['cs', 'en', 'de', 'es'];

const locales = {
    en: {
        directory: '', label: 'EN',
        nav: { home: 'Home', activityGuide: 'Activity Guide', difficultyLevels: 'Difficulty Levels', ourStory: 'Our Story' }
    },
    cs: {
        directory: 'cs', label: 'CZ',
        nav: { home: 'Domů', activityGuide: 'Průvodce aktivitami', difficultyLevels: 'Úrovně obtížnosti', ourStory: 'Náš příběh' }
    },
    de: {
        directory: 'de', label: 'DE',
        nav: { home: 'Startseite', activityGuide: 'Aktivitäten-Guide', difficultyLevels: 'Schwierigkeitsstufen', ourStory: 'Unsere Geschichte' }
    },
    es: {
        directory: 'es', label: 'ES',
        nav: { home: 'Inicio', activityGuide: 'Guía de actividades', difficultyLevels: 'Niveles de dificultad', ourStory: 'Nuestra historia' }
    }
};

const pages = [
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

function relativeFile(locale, page) {
    return locales[locale].directory ? path.join(locales[locale].directory, page[locale]) : page[locale];
}

function publicUrl(locale, page) {
    const prefix = locales[locale].directory ? `${locales[locale].directory}/` : '';
    return `${basePath}${prefix}${page[locale]}`;
}

function homeUrl(locale) {
    const prefix = locales[locale].directory ? `${locales[locale].directory}/` : '';
    return `${basePath}${prefix}`;
}

async function exists(file) {
    try {
        await access(file);
        return true;
    } catch {
        return false;
    }
}

const availability = new Map();
for (const page of pages) {
    for (const locale of languageOrder) {
        availability.set(`${page.key}:${locale}`, await exists(path.join(root, relativeFile(locale, page))));
    }
}

const youtubeIcon = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
const instagramIcon = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;

function socialLinks(compact = false) {
    const gap = compact ? 'gap-2' : 'gap-2.5';
    const padding = compact ? 'pr-2' : 'pr-4';
    return `<div class="flex items-center ${gap} border-r border-slate-700 ${padding}">
        <a href="https://www.youtube.com/@vinmat_worldforkids" target="_blank" rel="noopener noreferrer" class="text-white hover:text-amber-400 transition-colors" aria-label="YouTube">${youtubeIcon}</a>
        <a href="https://www.instagram.com/vinmat_worldforkids/" target="_blank" rel="noopener noreferrer" class="text-white hover:text-amber-400 transition-colors" aria-label="Instagram">${instagramIcon}</a>
    </div>`;
}

function languageLinks(locale, page, gapClass) {
    const links = languageOrder
        .filter((target) => target !== locale && availability.get(`${page.key}:${target}`))
        .map((target) => `<a href="${publicUrl(target, page)}" data-language-target="${target}" class="hover:text-amber-400 transition-colors font-bold">${locales[target].label}</a>`)
        .join('\n');
    return `<div class="flex ${gapClass}">${links}</div>`;
}

function header(locale, page) {
    const labels = locales[locale].nav;
    const activityPage = pages.find((item) => item.key === 'activityGuide');
    const difficultyPage = pages.find((item) => item.key === 'difficultyLevels');
    const storyPage = pages.find((item) => item.key === 'ourStory');

    return `<!-- HEADER START -->
<!-- TOP BAR -->
<div class="bg-slate-900 text-white text-xs py-2 px-3 fixed top-0 left-0 w-full z-50 shadow-md font-bold">
    <div class="max-w-7xl mx-auto w-full md:flex md:items-center md:justify-between md:px-8">
        <div class="grid grid-cols-1 gap-1 md:flex md:items-center md:gap-4">
            <div class="flex items-center gap-2">
                <a href="${homeUrl(locale)}" class="hover:text-amber-400 transition-colors uppercase flex items-center gap-1 whitespace-nowrap">🏠 <span>${labels.home}</span></a>
                <span class="text-slate-700 font-normal">|</span>
                <a href="${publicUrl(locale, activityPage)}" class="hover:text-amber-400 transition-colors tracking-wide whitespace-nowrap">${labels.activityGuide}</a>
            </div>
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                    <span class="hidden md:inline text-slate-700 font-normal">|</span>
                    <a href="${publicUrl(locale, difficultyPage)}" class="hover:text-amber-400 transition-colors tracking-wide whitespace-nowrap">${labels.difficultyLevels}</a>
                    <span class="text-slate-700 font-normal">|</span>
                    <a href="${publicUrl(locale, storyPage)}" class="hover:text-amber-400 transition-colors tracking-wide whitespace-nowrap">${labels.ourStory}</a>
                </div>
                <div class="flex items-center gap-2 md:hidden ml-auto">
                    ${socialLinks(true)}
                    ${languageLinks(locale, page, 'gap-2')}
                </div>
            </div>
        </div>
        <div class="hidden md:flex items-center gap-4 ml-auto">
            ${socialLinks(false)}
            ${languageLinks(locale, page, 'gap-3')}
        </div>
    </div>
</div>
<!-- HEADER END -->`;
}

let changedFiles = 0;
for (const page of pages) {
    for (const locale of languageOrder) {
        if (!availability.get(`${page.key}:${locale}`)) continue;
        const file = path.join(root, relativeFile(locale, page));
        const original = await readFile(file, 'utf8');
        const replacement = header(locale, page);
        const updated = original.replace(/<!-- HEADER START -->[\s\S]*?<!-- HEADER END -->/, replacement);
        if (updated === original) {
            if (!original.includes('<!-- HEADER START -->')) {
                console.warn(`Header markers not found: ${relativeFile(locale, page)}`);
            }
            continue;
        }
        await writeFile(file, updated);
        changedFiles += 1;
    }
}

console.log(`Normalized ${changedFiles} localized guide headers.`);
