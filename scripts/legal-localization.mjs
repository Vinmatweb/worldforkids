import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const siteUrl = 'https://vinmat.eu/worldforkids/';

const legal = {
    de: {
        privacyUrl: '/worldforkids/de/datenschutz.html',
        termsUrl: '/worldforkids/de/nutzungsbedingungen.html',
        privacyLabel: 'Datenschutz',
        termsLabel: 'Nutzungsbedingungen'
    },
    es: {
        privacyUrl: '/worldforkids/es/privacidad.html',
        termsUrl: '/worldforkids/es/terminos-de-uso.html',
        privacyLabel: 'Privacidad',
        termsLabel: 'Términos de uso'
    }
};

const legalPages = [
    { file: 'de/datenschutz.html', locale: 'de', route: 'privacy', canonical: `${siteUrl}de/datenschutz.html`, title: 'Datenschutz | VinMats Welt für Kinder', h1: 'Datenschutz', h2: 7, ogLocale: 'de_DE', siteName: 'VinMats Welt für Kinder' },
    { file: 'de/nutzungsbedingungen.html', locale: 'de', route: 'terms', canonical: `${siteUrl}de/nutzungsbedingungen.html`, title: 'Nutzungsbedingungen | VinMats Welt für Kinder', h1: 'Nutzungsbedingungen', h2: 9, ogLocale: 'de_DE', siteName: 'VinMats Welt für Kinder' },
    { file: 'es/privacidad.html', locale: 'es', route: 'privacy', canonical: `${siteUrl}es/privacidad.html`, title: 'Privacidad | El mundo de VinMat para niños', h1: 'Privacidad', h2: 7, ogLocale: 'es_ES', siteName: 'El mundo de VinMat para niños' },
    { file: 'es/terminos-de-uso.html', locale: 'es', route: 'terms', canonical: `${siteUrl}es/terminos-de-uso.html`, title: 'Términos de uso | El mundo de VinMat para niños', h1: 'Términos de uso', h2: 9, ogLocale: 'es_ES', siteName: 'El mundo de VinMat para niños' }
];

const hreflang = {
    privacy: {
        en: `${siteUrl}privacy.html`,
        cs: `${siteUrl}cs/zasady-ochrany-osobnich-udaju.html`,
        de: `${siteUrl}de/datenschutz.html`,
        es: `${siteUrl}es/privacidad.html`,
        'x-default': `${siteUrl}privacy.html`
    },
    terms: {
        en: `${siteUrl}terms.html`,
        cs: `${siteUrl}cs/podminky-uziti.html`,
        de: `${siteUrl}de/nutzungsbedingungen.html`,
        es: `${siteUrl}es/terminos-de-uso.html`,
        'x-default': `${siteUrl}terms.html`
    }
};

async function exists(relative) {
    try { await stat(path.join(root, relative)); return true; }
    catch { return false; }
}

async function update(relative, transform) {
    const file = path.join(root, relative);
    if (!await exists(relative)) throw new Error(`${relative} was not found.`);
    const original = await readFile(file, 'utf8');
    const updated = transform(original);
    if (updated === original) return false;
    await writeFile(file, updated);
    console.log(`Updated: ${relative}`);
    return true;
}

function replaceRequired(text, pattern, replacement, label) {
    if (typeof pattern === 'string') {
        if (!text.includes(pattern)) {
            if (text.includes(replacement)) return text;
            throw new Error(`Could not find ${label}.`);
        }
        return text.replace(pattern, replacement);
    }
    if (!pattern.test(text)) {
        if (typeof replacement === 'string' && text.includes(replacement)) return text;
        throw new Error(`Could not find ${label}.`);
    }
    return text.replace(pattern, replacement);
}

export async function installLegalLocalization() {
    for (const page of legalPages) {
        if (!await exists(page.file)) throw new Error(`${page.file} is missing.`);
    }

    await update('assets/js/site-config.js', (html) => {
        html = html.replace(
            /privacy:\s*\{\s*en:\s*'privacy\.html',\s*cs:\s*'zasady-ochrany-osobnich-udaju\.html',\s*de:\s*(?:null|'datenschutz\.html'),\s*es:\s*(?:null|'privacidad\.html')\s*\}/,
            "privacy: { en: 'privacy.html', cs: 'zasady-ochrany-osobnich-udaju.html', de: 'datenschutz.html', es: 'privacidad.html' }"
        );
        html = html.replace(
            /terms:\s*\{\s*en:\s*'terms\.html',\s*cs:\s*'podminky-uziti\.html',\s*de:\s*(?:null|'nutzungsbedingungen\.html'),\s*es:\s*(?:null|'terminos(?:-de-uso)?\.html')\s*\}/,
            "terms: { en: 'terms.html', cs: 'podminky-uziti.html', de: 'nutzungsbedingungen.html', es: 'terminos-de-uso.html' }"
        );
        if (!html.includes("de: 'datenschutz.html', es: 'privacidad.html'")) throw new Error('Privacy routes were not updated.');
        if (!html.includes("de: 'nutzungsbedingungen.html', es: 'terminos-de-uso.html'")) throw new Error('Terms routes were not updated.');
        return html;
    });

    await update('scripts/build-static-site.mjs', (html) => {
        html = html.replace("de: 'nutzungsbedingungen.html', es: 'terminos.html'", "de: 'nutzungsbedingungen.html', es: 'terminos-de-uso.html'");
        if (!html.includes('finalizeLegalLocalization')) {
            const marker = "    await writeFile(path.join(root, 'sitemap.xml'), sitemap(sitemapUrls));";
            html = replaceRequired(
                html,
                marker,
                `${marker}\n    const { finalizeLegalLocalization } = await import('./legal-localization.mjs');\n    await finalizeLegalLocalization();`,
                'the sitemap write in build-static-site.mjs'
            );
        }
        return html;
    });

    await update('scripts/finalize-activity-pages.mjs', (html) => {
        html = html
            .replaceAll('Datenschutz (Englisch)', 'Datenschutz')
            .replaceAll('Nutzungsbedingungen (Englisch)', 'Nutzungsbedingungen')
            .replaceAll('Privacidad (en inglés)', 'Privacidad')
            .replaceAll('Términos de uso (en inglés)', 'Términos de uso')
            .replace("de: { privacy: '/worldforkids/privacy.html', terms: '/worldforkids/terms.html' }", "de: { privacy: '/worldforkids/de/datenschutz.html', terms: '/worldforkids/de/nutzungsbedingungen.html' }")
            .replace("es: { privacy: '/worldforkids/privacy.html', terms: '/worldforkids/terms.html' }", "es: { privacy: '/worldforkids/es/privacidad.html', terms: '/worldforkids/es/terminos-de-uso.html' }");
        return html;
    });

    await update('scripts/validate-localized-site.mjs', (html) => {
        html = html
            .replaceAll('Datenschutz (Englisch)', 'Datenschutz')
            .replaceAll('Nutzungsbedingungen (Englisch)', 'Nutzungsbedingungen')
            .replaceAll('Privacidad (en inglés)', 'Privacidad')
            .replaceAll('Términos de uso (en inglés)', 'Términos de uso');
        const marker = "    'https://vinmat.eu/worldforkids/es/historia-trazado.html'";
        if (!html.includes("'https://vinmat.eu/worldforkids/de/datenschutz.html'")) {
            html = replaceRequired(
                html,
                marker,
                `${marker},\n    'https://vinmat.eu/worldforkids/de/datenschutz.html',\n    'https://vinmat.eu/worldforkids/de/nutzungsbedingungen.html',\n    'https://vinmat.eu/worldforkids/es/privacidad.html',\n    'https://vinmat.eu/worldforkids/es/terminos-de-uso.html'`,
                'the sitemap validation URL list'
            );
        }
        return html;
    });

    await update('scripts/validate-de-es-content.mjs', (html) => {
        html = html.replace(/^\s*assert\(!html\.includes\('href="(?:datenschutz|privacidad|nutzungsbedingungen|terminos)\.html"'\)[^\n]*\n/gm, '');
        html = html
            .replaceAll('Datenschutz (Englisch)', 'Datenschutz')
            .replaceAll('Nutzungsbedingungen (Englisch)', 'Nutzungsbedingungen')
            .replaceAll('Privacidad (en inglés)', 'Privacidad')
            .replaceAll('Términos de uso (en inglés)', 'Términos de uso');
        if (!html.includes("['datenschutz.html', 'privacy']")) {
            html = replaceRequired(
                html,
                "        ['anleitung-nachzeichnen.html', 'tracingGuide'], ['geschichte-nachzeichnen.html', 'tracingHistory']",
                "        ['anleitung-nachzeichnen.html', 'tracingGuide'], ['geschichte-nachzeichnen.html', 'tracingHistory'],\n        ['datenschutz.html', 'privacy'], ['nutzungsbedingungen.html', 'terms']",
                'the German static page list'
            );
        }
        if (!html.includes("['privacidad.html', 'privacy']")) {
            html = replaceRequired(
                html,
                "        ['guia-trazado.html', 'tracingGuide'], ['historia-trazado.html', 'tracingHistory']",
                "        ['guia-trazado.html', 'tracingGuide'], ['historia-trazado.html', 'tracingHistory'],\n        ['privacidad.html', 'privacy'], ['terminos-de-uso.html', 'terms']",
                'the Spanish static page list'
            );
        }
        if (!html.includes('sitemap.xml: missing German privacy page')) {
            const marker = "assert(count(sitemap, '<loc>https://vinmat.eu/worldforkids/es/actividades/') === 28, 'sitemap.xml: expected 28 Spanish activity URLs');";
            html = replaceRequired(
                html,
                marker,
                `${marker}\nassert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/de/datenschutz.html</loc>'), 'sitemap.xml: missing German privacy page');\nassert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/de/nutzungsbedingungen.html</loc>'), 'sitemap.xml: missing German terms page');\nassert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/es/privacidad.html</loc>'), 'sitemap.xml: missing Spanish privacy page');\nassert(sitemap.includes('<loc>https://vinmat.eu/worldforkids/es/terminos-de-uso.html</loc>'), 'sitemap.xml: missing Spanish terms page');`,
                'the DE/ES sitemap checks'
            );
        }
        return html;
    });

    console.log('Legal localization source integration installed.');
}

const privacyNames = '(?:privacy|privacy-cz|zasady-ochrany-osobnich-udaju|datenschutz|privacidad)';
const termsNames = '(?:terms|terms-cz|podminky-uziti|nutzungsbedingungen|terminos|terminos-de-uso)';

async function htmlFiles(directory) {
    const found = [];
    if (!await exists(directory)) return found;
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
        const relative = path.join(directory, entry.name).replaceAll('\\', '/');
        if (entry.isDirectory()) found.push(...await htmlFiles(relative));
        else if (entry.isFile() && entry.name.endsWith('.html')) found.push(relative);
    }
    return found;
}

function replaceLegalAnchor(footer, type, url, label) {
    const names = type === 'privacy' ? privacyNames : termsNames;
    const pattern = new RegExp(`(<a\\b[^>]*\\bhref=")[^"]*\\/?${names}\\.html(?:[?#][^"]*)?("[^>]*>)[\\s\\S]*?<\\/a>`, 'i');
    return footer.replace(pattern, `$1${url}$2${label}</a>`);
}

function localizeFooter(html, locale) {
    const config = legal[locale];
    return html.replace(/<footer\b[\s\S]*?<\/footer>/gi, (footer) => {
        let result = replaceLegalAnchor(footer, 'privacy', config.privacyUrl, config.privacyLabel);
        result = replaceLegalAnchor(result, 'terms', config.termsUrl, config.termsLabel);
        return result
            .replaceAll('Datenschutz (Englisch)', 'Datenschutz')
            .replaceAll('Nutzungsbedingungen (Englisch)', 'Nutzungsbedingungen')
            .replaceAll('Privacidad (en inglés)', 'Privacidad')
            .replaceAll('Términos de uso (en inglés)', 'Términos de uso');
    });
}

function updateIndexConfiguration(html) {
    return html
        .replace(/de:\s*['"]\/worldforkids\/privacy\.html['"]/g, "de:'/worldforkids/de/datenschutz.html'")
        .replace(/es:\s*['"]\/worldforkids\/privacy\.html['"]/g, "es:'/worldforkids/es/privacidad.html'")
        .replace(/de:\s*['"]\/worldforkids\/terms\.html['"]/g, "de:'/worldforkids/de/nutzungsbedingungen.html'")
        .replace(/es:\s*['"]\/worldforkids\/terms\.html['"]/g, "es:'/worldforkids/es/terminos-de-uso.html'")
        .replaceAll('Datenschutz (Englisch)', 'Datenschutz')
        .replaceAll('Nutzungsbedingungen (Englisch)', 'Nutzungsbedingungen')
        .replaceAll('Privacidad (en inglés)', 'Privacidad')
        .replaceAll('Términos de uso (en inglés)', 'Términos de uso');
}

async function updateSitemap() {
    const relative = 'sitemap.xml';
    if (!await exists(relative)) return false;
    const file = path.join(root, relative);
    const original = await readFile(file, 'utf8');
    const urls = new Set([...original.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
    legalPages.forEach((page) => urls.add(page.canonical));
    const entries = [...urls].sort().map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
    const updated = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
    if (updated === original) return false;
    await writeFile(file, updated);
    console.log('Updated: sitemap.xml');
    return true;
}

export async function finalizeLegalLocalization() {
    let changed = 0;
    for (const locale of Object.keys(legal)) {
        for (const file of await htmlFiles(locale)) {
            if (await update(file, (html) => localizeFooter(html, locale))) changed += 1;
        }
    }
    for (const file of ['index.html', 'cs/index.html', 'de/index.html', 'es/index.html']) {
        if (await exists(file) && await update(file, updateIndexConfiguration)) changed += 1;
    }
    if (await updateSitemap()) changed += 1;
    console.log(`Finalized legal localization in ${changed} file(s).`);
}

function count(text, value) { return text.split(value).length - 1; }
function footerOf(html) { return html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] || ''; }

function validateInlineScripts(html, file, errors) {
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
        try { new Function(match[1]); }
        catch (error) { errors.push(`${file}: inline script ${index + 1} is invalid: ${error.message}`); }
    });
}

export async function validateLegalLocalization() {
    const errors = [];
    const assert = (condition, message) => { if (!condition) errors.push(message); };

    for (const page of legalPages) {
        const html = await readFile(path.join(root, page.file), 'utf8');
        assert(html.startsWith('<!DOCTYPE html>'), `${page.file}: missing HTML5 doctype`);
        assert(html.includes(`<html lang="${page.locale}">`), `${page.file}: wrong html lang`);
        assert(html.includes(`data-locale="${page.locale}"`), `${page.file}: wrong data-locale`);
        assert(html.includes(`data-route-key="${page.route}"`), `${page.file}: wrong route key`);
        assert(html.includes(`<title>${page.title}</title>`), `${page.file}: wrong title`);
        assert(html.includes(`rel="canonical" href="${page.canonical}"`), `${page.file}: wrong canonical`);
        for (const [locale, url] of Object.entries(hreflang[page.route])) {
            assert(html.includes(`rel="alternate" hreflang="${locale}" href="${url}"`), `${page.file}: wrong hreflang ${locale}`);
        }
        assert(html.includes(`<meta property="og:url" content="${page.canonical}">`), `${page.file}: wrong OG URL`);
        assert(html.includes(`<meta property="og:locale" content="${page.ogLocale}">`), `${page.file}: wrong OG locale`);
        assert(html.includes(`<meta property="og:site_name" content="${page.siteName}">`), `${page.file}: wrong OG site name`);
        assert(count(html, 'property="og:locale:alternate"') === 3, `${page.file}: wrong alternate OG locale count`);
        assert(count(html, '<h1') === 1 && html.includes(`>${page.h1}</h1>`), `${page.file}: wrong h1`);
        assert(count(html, '<h2') === page.h2, `${page.file}: wrong h2 count`);
        assert(count(html, 'pagead2.googlesyndication.com') === 1, `${page.file}: AdSense count is not one`);
        assert(count(html, 'googletagmanager.com/gtag/js') === 1, `${page.file}: Analytics count is not one`);
        const json = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
        try {
            const data = JSON.parse(json || '');
            assert(data.url === page.canonical, `${page.file}: JSON-LD URL is wrong`);
            assert(data.inLanguage === page.locale, `${page.file}: JSON-LD language is wrong`);
        } catch (error) {
            errors.push(`${page.file}: invalid JSON-LD: ${error.message}`);
        }
        validateInlineScripts(html, page.file, errors);
    }

    for (const locale of Object.keys(legal)) {
        const expected = legal[locale];
        for (const file of await htmlFiles(locale)) {
            const html = await readFile(path.join(root, file), 'utf8');
            const footer = footerOf(html);
            if (!footer) continue;
            assert(!/\(Englisch\)|\(en inglés\)/i.test(footer), `${file}: obsolete English-only label remains`);
            assert(!footer.includes('href="/worldforkids/privacy.html"'), `${file}: English privacy link remains`);
            assert(!footer.includes('href="/worldforkids/terms.html"'), `${file}: English terms link remains`);
            assert(footer.includes(`href="${expected.privacyUrl}"`), `${file}: localized privacy link is missing`);
            assert(footer.includes(`href="${expected.termsUrl}"`), `${file}: localized terms link is missing`);
        }
    }

    const siteConfig = await readFile(path.join(root, 'assets/js/site-config.js'), 'utf8');
    assert(siteConfig.includes("de: 'datenschutz.html', es: 'privacidad.html'"), 'site-config.js: privacy routes are wrong');
    assert(siteConfig.includes("de: 'nutzungsbedingungen.html', es: 'terminos-de-uso.html'"), 'site-config.js: terms routes are wrong');

    const activityFinalizer = await readFile(path.join(root, 'scripts/finalize-activity-pages.mjs'), 'utf8');
    assert(activityFinalizer.includes("privacy: '/worldforkids/de/datenschutz.html'"), 'finalize-activity-pages.mjs: German privacy URL is wrong');
    assert(activityFinalizer.includes("terms: '/worldforkids/es/terminos-de-uso.html'"), 'finalize-activity-pages.mjs: Spanish terms URL is wrong');

    const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
    legalPages.forEach((page) => assert(sitemap.includes(`<loc>${page.canonical}</loc>`), `sitemap.xml: missing ${page.canonical}`));

    if (errors.length) {
        console.error(`Legal localization validation failed with ${errors.length} error(s):`);
        errors.forEach((error) => console.error(`- ${error}`));
        process.exitCode = 1;
        return false;
    }
    console.log('German and Spanish legal localization validation passed.');
    return true;
}

const isDirect = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirect) {
    const command = process.argv[2] || 'all';
    if (command === 'install' || command === 'all') await installLegalLocalization();
    if (command === 'finalize' || command === 'all') await finalizeLegalLocalization();
    if (command === 'validate' || command === 'all') await validateLegalLocalization();
}
