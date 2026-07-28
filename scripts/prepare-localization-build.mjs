import { readFile, writeFile } from 'node:fs/promises';

const buildPath = new URL('./build-static-site.mjs', import.meta.url);
let source = await readFile(buildPath, 'utf8');
let changed = false;

const oldCardHeading = '<h2 class="font-bold text-sm text-slate-900 leading-tight uppercase"><a href="${escapeHtml(href)}" class="hover:text-indigo-600">${escapeHtml(activity.names[locale])}</a></h2>';
const newCardHeading = '<h3 class="font-bold text-sm text-slate-900 leading-tight uppercase"><a href="${escapeHtml(href)}" class="hover:text-indigo-600">${escapeHtml(activity.names[locale])}</a></h3>';

if (source.includes(oldCardHeading)) {
    source = source.replace(oldCardHeading, newCardHeading);
    changed = true;
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
    changed = true;
} else if (!source.includes(newTranslatedGuideFlow)) {
    throw new Error('Translated-guide navigation build step was not found.');
}

if (changed) {
    await writeFile(buildPath, source);
    console.log('Updated build-static-site.mjs for localized static generation.');
} else {
    console.log('build-static-site.mjs already contains the localization fixes.');
}
