import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
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
  if (!html.includes(brokenWebp)) continue;

  const before = html;
  html = html.replaceAll(
    `<source srcset="${brokenWebp}" type="image/webp">`,
    ''
  );

  if (html !== before) {
    await writeFile(file, html);
    changed += 1;
  }
}

console.log(`Bear LV5 PNG fallback enforced on ${changed} HTML file(s).`);
