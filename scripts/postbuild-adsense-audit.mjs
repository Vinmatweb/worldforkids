import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const legalPages = new Set([
  'privacy.html',
  'terms.html',
  'cs/zasady-ochrany-osobnich-udaju.html',
  'cs/podminky-uziti.html',
  'de/datenschutz.html',
  'de/nutzungsbedingungen.html',
  'es/privacidad.html',
  'es/terminos-de-uso.html'
]);

async function collectHtmlFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'public') continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(absolute, relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push({ absolute, relative });
  }

  return files;
}

function replaceMissingOgImage(html) {
  return html
    .replaceAll('https://vinmat.eu/worldforkids/assets/images/og-image.png', 'https://vinmat.eu/worldforkids/assets/images/banner.png')
    .replaceAll('/worldforkids/assets/images/og-image.png', '/worldforkids/assets/images/banner.png')
    .replaceAll('assets/images/og-image.png', 'assets/images/banner.png');
}

function normalizeDoubleEscapedEntities(html) {
  return html
    .replaceAll('&amp;#039;', '&#039;')
    .replaceAll('&amp;quot;', '&quot;')
    .replaceAll('&amp;lt;', '&lt;')
    .replaceAll('&amp;gt;', '&gt;');
}

function normalizeSharedScriptPaths(html, relative) {
  // EN activity pages live directly under /activities/, so one ".." reaches
  // the World for Kids root. Localized activity pages are one level deeper
  // (e.g. /cs/aktivity/) and correctly need two ".." segments.
  if (!relative.startsWith('activities/')) return html;
  return html
    .replaceAll('../../assets/js/site-config.js', '../assets/js/site-config.js')
    .replaceAll('../../assets/js/site-navigation.js', '../assets/js/site-navigation.js');
}

function stripConsentSensitiveTracking(html) {
  return html
    .replace(/\s*<!--\s*Google AdSense\s*-->\s*/gi, '\n')
    .replace(/\s*<!--\s*Google tag \(gtag\.js\)\s*-->\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"']*["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\(['"]config['"],\s*['"]G-[^'"]+['"]\);\s*<\/script>\s*/gi, '\n');
}

function ensurePlannerNoindex(html, relative) {
  if (relative !== 'vinmat-planner/index.html') return html;
  if (/<meta\s+name=["']robots["']/i.test(html)) {
    return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, nofollow">');
  }
  return html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, '$1\n  <meta name="robots" content="noindex, nofollow">');
}

const files = await collectHtmlFiles(root);
let changed = 0;

for (const file of files) {
  let html = await readFile(file.absolute, 'utf8');
  const original = html;

  html = replaceMissingOgImage(html);
  html = normalizeDoubleEscapedEntities(html);
  html = normalizeSharedScriptPaths(html, file.relative);
  html = ensurePlannerNoindex(html, file.relative);
  if (legalPages.has(file.relative)) html = stripConsentSensitiveTracking(html);

  if (html !== original) {
    await writeFile(file.absolute, html);
    changed += 1;
    console.log(`AdSense audit safeguard updated: ${file.relative}`);
  }
}

console.log(`AdSense audit safeguards complete. Updated ${changed} HTML file(s).`);
