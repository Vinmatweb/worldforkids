import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const base = 'https://vinmat.eu/worldforkids';

// These temporary category collection pages were introduced as an SEO experiment.
// They duplicate the functionality of the main W4K catalogue, but without the
// catalogue filters and full site experience. Keep the main filtered catalogue as
// the single user-facing place for browsing worksheets and remove these pages.
const obsoleteCategoryPages = [
  'coloring-pages.html',
  'mazes.html',
  'dot-to-dot.html',
  'cs/omalovanky.html',
  'cs/bludiste.html',
  'cs/spojovacky.html',
  'de/ausmalbilder.html',
  'de/labyrinthe.html',
  'de/punkte-verbinden.html',
  'es/dibujos-para-colorear.html',
  'es/laberintos.html',
  'es/unir-puntos.html'
];

const homepages = ['index.html', 'cs/index.html', 'de/index.html', 'es/index.html'];
const categoryNavPattern = /\s*<!-- CATEGORY_NAV_START -->[\s\S]*?<!-- CATEGORY_NAV_END -->\s*/g;

for (const relative of homepages) {
  const file = path.join(root, relative);
  const html = await readFile(file, 'utf8');
  const cleaned = html.replace(categoryNavPattern, '\n');
  if (cleaned !== html) {
    await writeFile(file, cleaned);
    console.log(`Removed obsolete category navigation from ${relative}`);
  }
}

for (const relative of obsoleteCategoryPages) {
  await rm(path.join(root, relative), { force: true });
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = await readFile(sitemapPath, 'utf8');
for (const relative of obsoleteCategoryPages) {
  const url = `${base}/${relative}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${url}<\\/loc>\\s*<\\/url>`, 'g'), '');
}
await writeFile(sitemapPath, sitemap);

console.log('Removed obsolete category collection pages and homepage category navigation.');
