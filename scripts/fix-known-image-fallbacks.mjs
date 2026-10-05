import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const featuredVersion = createHash('sha256').update(await readFile(path.join(root, 'assets/js/featured-activities.js'))).digest('hex').slice(0,12);
const brokenWebp = '/worldforkids/public/omalovanky/lv5_gem_1004-bear-coloring.webp';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of await walk(root)) {
  let html = await readFile(file, 'utf8');

  const before = html;
  html = html.replace(/(src="[^"]*assets\/js\/featured-activities\.js)(?:\?[^"]*)?"/g, `$1?v=${featuredVersion}"`);
  html = html.replaceAll(
    `<source srcset="${brokenWebp}" type="image/webp">`,
    ''
  );

  if (html !== before) {
    await writeFile(file, html);
    changed += 1;
  }
}

console.log(`Image fallbacks and featured-script version synchronized on ${changed} HTML file(s).`);
