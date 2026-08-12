import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const files = ['de/unsere-geschichte.html', 'es/nuestra-historia.html'];

for (const file of files) {
  const url = new URL(file, root);
  let html = await readFile(url, 'utf8');
  const original = html;

  html = html.replace(
    '<main class="max-w-5xl w-full mx-auto px-4 py-12 flex-grow space-y-10">',
    '<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-8">'
  );

  html = html.replace(
    '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">',
    '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">'
  );

  html = html.replace(
    '<aside class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">',
    '<aside class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 h-full">'
  );

  if (html !== original) {
    await writeFile(url, html, 'utf8');
    console.log(`Story layout synchronized: ${file}`);
  } else {
    console.log(`Story layout already synchronized: ${file}`);
  }
}
