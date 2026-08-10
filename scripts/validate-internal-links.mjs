import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteOrigin = 'https://vinmat.eu';
const siteBase = '/worldforkids/';
const errors = [];
const skipDirs = new Set(['.git', 'node_modules', 'public']);
const localeHomes = {
    en: '/worldforkids/',
    cs: '/worldforkids/cs/',
    de: '/worldforkids/de/',
    es: '/worldforkids/es/'
};
const homepagePaths = new Set(['index.html', 'cs/index.html', 'de/index.html', 'es/index.html']);

async function collectHtml(dir = root) {
    const out = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...await collectHtml(full));
        else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function cleanUrl(value) {
    return value.trim().replace(/&amp;/g, '&').split('#')[0].split('?')[0];
}

function localTarget(sourceFile, rawValue) {
    const value = cleanUrl(rawValue);
    if (!value || value.startsWith('#')) return null;
    if (value.includes('${') || value.includes("'+") || value.includes('+\"')) return null;

    if (/^https?:\/\//i.test(value)) {
        let url;
        try { url = new URL(value); } catch { return null; }
        if (url.origin !== siteOrigin || !url.pathname.startsWith(siteBase)) return null;
        const relative = decodeURIComponent(url.pathname.slice(siteBase.length));
        return path.join(root, relative || 'index.html');
    }

    // mailto:, tel:, lightning:, data:, blob: and any other non-HTTP URI scheme
    // are actions, not local files and therefore must not be treated as broken links.
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
    if (value.startsWith('//')) return null;

    if (value.startsWith('/')) {
        if (!value.startsWith(siteBase)) return null;
        const relative = decodeURIComponent(value.slice(siteBase.length));
        return path.join(root, relative || 'index.html');
    }

    const relative = decodeURIComponent(value);
    return path.resolve(path.dirname(sourceFile), relative.endsWith('/') ? `${relative}index.html` : relative);
}

function pageLocale(html, relative) {
    const fromBody = html.match(/<body\b[^>]*\bdata-locale=["'](en|cs|de|es)["']/i)?.[1];
    if (fromBody) return fromBody;
    if (relative.startsWith('cs/')) return 'cs';
    if (relative.startsWith('de/')) return 'de';
    if (relative.startsWith('es/')) return 'es';
    return 'en';
}

function validateLocalizedHomepageAnchors(html, relative) {
    const locale = pageLocale(html, relative);
    const expected = localeHomes[locale] || localeHomes.en;
    const anchors = [...html.matchAll(/<a\b[^>]*\bhref=(['"])(.*?)\1/gi)];

    for (const match of anchors) {
        const href = cleanUrl(match[2]);
        if (!/^https?:\/\/(?:www\.)?vinmat\.eu\/worldforkids\/?$/i.test(href)) continue;
        if (expected !== localeHomes.en) {
            errors.push(`${relative}: generic English W4K homepage anchor remains on ${locale} page: ${href}`);
        }
    }
}

async function exists(target) {
    try { await access(target); return true; } catch { return false; }
}

const files = await collectHtml();
for (const file of files) {
    const html = await readFile(file, 'utf8');
    const relative = path.relative(root, file).split(path.sep).join('/');
    validateLocalizedHomepageAnchors(html, relative);

    if (homepagePaths.has(relative) && /<option\s+value=["']popular["']/i.test(html)) {
        errors.push(`${relative}: disabled popular-sort placeholder is still visible`);
    }

    const attributes = [
        ...html.matchAll(/\b(?:href|src)=(['\"])(.*?)\1/gi),
        ...html.matchAll(/\bsrcset=(['\"])(.*?)\1/gi)
    ];

    for (const match of attributes) {
        const original = match[2];
        const candidates = match[0].toLowerCase().startsWith('srcset=')
            ? original.split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean)
            : [original];

        for (const candidate of candidates) {
            const target = localTarget(file, candidate);
            if (!target) continue;
            if (!target.startsWith(root)) {
                errors.push(`${relative}: path escapes site root: ${candidate}`);
                continue;
            }
            if (!await exists(target)) {
                errors.push(`${relative}: missing target ${candidate} -> ${path.relative(root, target)}`);
            }
        }
    }
}

if (errors.length) {
    console.error(`Internal link validation failed with ${errors.length} error(s):`);
    errors.slice(0, 100).forEach((error) => console.error(`- ${error}`));
    if (errors.length > 100) console.error(`- ...and ${errors.length - 100} more`);
    process.exit(1);
}

console.log(`Internal link validation passed for ${files.length} HTML files.`);
