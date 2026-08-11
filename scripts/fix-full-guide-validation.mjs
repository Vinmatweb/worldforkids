import { readFile, writeFile } from 'node:fs/promises';

const files = [
  ['de/anleitung-ausmalbilder.html', 'de-coloring'],
  ['de/anleitung-nachzeichnen.html', 'tracing'],
  ['es/guia-trazado.html', 'tracing']
];

for (const [file, kind] of files) {
  const url = new URL(`../${file}`, import.meta.url);
  let html = await readFile(url, 'utf8');
  const original = html;

  if (kind === 'de-coloring') {
    html = html.replaceAll(
      'Detailreichere Illustrationen, kleinere Flächen und längere konzentrierte Bearbeitung.',
      'Detailreichere Motive und kleinere Flächen für sorgfältiges Arbeiten und längere konzentrierte Bearbeitung.'
    );
  }

  if (kind === 'tracing') {
    html = html.replace(
      /<a href="index\.html\?type=obtahovacky&age=LV\d" class="font-bold underline ([^"]+)">([\s\S]*?)<\/a>/g,
      '<span class="font-bold $1">$2</span>'
    );
  }

  if (html !== original) {
    await writeFile(url, html);
    console.log(`Guide production rule fixed: ${file}`);
  }
}
