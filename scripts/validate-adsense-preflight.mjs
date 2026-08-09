import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const homepages = new Set(['index.html', 'cs/index.html', 'de/index.html', 'es/index.html']);
const legalPages = new Set([
  'privacy.html', 'terms.html',
  'cs/zasady-ochrany-osobnich-udaju.html', 'cs/podminky-uziti.html',
  'de/datenschutz.html', 'de/nutzungsbedingungen.html',
  'es/privacidad.html', 'es/terminos-de-uso.html'
]);
const internalNoindex = new Set(['content-check.html', 'vinmat-planner/index.html']);
const activityPrefixes = ['activities/', 'cs/aktivity/', 'de/aktivitaeten/', 'es/actividades/'];

async function collectHtml(directory, prefix = '') {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'public'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) out.push(...await collectHtml(absolute, relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push({ absolute, relative });
  }
  return out;
}

function count(html, needle) {
  return html.split(needle).length - 1;
}

function isActivity(relative) {
  return activityPrefixes.some((prefix) => relative.startsWith(prefix));
}

function hasNoindex(html) {
  return /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

function requireMatch(html, regex, message) {
  if (!regex.test(html)) errors.push(message);
}

const files = await collectHtml(root);
for (const file of files) {
  const html = await readFile(file.absolute, 'utf8');
  const adsenseCount = count(html, 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  const analyticsCount = count(html, 'www.googletagmanager.com/gtag/js');

  if (homepages.has(file.relative)) {
    if (adsenseCount !== 1) errors.push(`${file.relative}: expected exactly one AdSense loader, found ${adsenseCount}`);
    if (hasNoindex(html)) errors.push(`${file.relative}: homepage must be indexable`);
    requireMatch(html, /<link\s+[^>]*rel=["']canonical["'][^>]*>/i, `${file.relative}: missing canonical`);
    for (const lang of ['en', 'cs', 'de', 'es', 'x-default']) {
      if (!new RegExp(`hreflang=["']${lang}["']`, 'i').test(html)) errors.push(`${file.relative}: missing hreflang ${lang}`);
    }
  }

  if (isActivity(file.relative)) {
    if (adsenseCount !== 0) errors.push(`${file.relative}: AdSense loader must not be present on activity detail pages`);
    if (hasNoindex(html)) errors.push(`${file.relative}: activity detail must be indexable`);
    requireMatch(html, /<title>[^<]+<\/title>/i, `${file.relative}: missing title`);
    requireMatch(html, /<meta\s+name=["']description["'][^>]*content=["'][^"']+/i, `${file.relative}: missing meta description`);
    requireMatch(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/vinmat\.eu\/worldforkids\//i, `${file.relative}: missing/invalid canonical`);
    requireMatch(html, /<h1\b[^>]*>[^<]+<\/h1>/i, `${file.relative}: missing visible H1`);
    if (file.relative.startsWith('activities/') && /\.\.\/\.\.\/assets\/js\/(?:site-config|site-navigation)\.js/.test(html)) {
      errors.push(`${file.relative}: EN activity contains obsolete two-level shared-script path`);
    }
  }

  if (legalPages.has(file.relative)) {
    if (adsenseCount !== 0) errors.push(`${file.relative}: AdSense must not load on legal page`);
    if (analyticsCount !== 0) errors.push(`${file.relative}: Analytics must not load on legal page`);
  }

  if (internalNoindex.has(file.relative) && !hasNoindex(html)) {
    errors.push(`${file.relative}: internal utility page must be noindex`);
  }

  if (html.includes('assets/images/og-image.png')) errors.push(`${file.relative}: stale missing og-image.png reference`);
  if (/href=["']\s*["']/i.test(html)) warnings.push(`${file.relative}: contains an empty href`);
}

if (warnings.length) {
  console.warn(`AdSense preflight warnings: ${warnings.length}`);
  warnings.slice(0, 25).forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error(`AdSense preflight failed with ${errors.length} error(s):`);
  errors.slice(0, 100).forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`AdSense preflight passed for ${files.length} HTML files.`);
console.log('Checked homepage ad placement, activity ad exclusion, legal tracking exclusion, indexability, canonical/hreflang basics and stale asset references.');
