import { readFile, writeFile } from 'node:fs/promises';

async function replace(file, replacements) {
    let content = await readFile(file, 'utf8');
    const original = content;
    for (const [from, to] of replacements) content = content.replaceAll(from, to);
    if (content !== original) await writeFile(file, content);
}

await replace(new URL('../de/anleitung-ausmalbilder.html', import.meta.url), [
    ['Detailreichere motivy a jemnější plochy pro pečlivou práci.', 'Detailreichere Motive und kleinere Flächen für sorgfältiges Arbeiten.']
]);

await replace(new URL('../assets/data/omalovanky.csv', import.meta.url), [
    [
        'Schwieriges Anti-Stress-Ausmalbild in Schwarz-Weiß mit einem Teddybären für Experten und Erwachsene kostenlos zum Ausdrucken',
        'Detailreiches schwarz-weißes Ausmalbild mit einem Teddybären für Jugendliche ab 12 Jahren und Erwachsene, kostenlos zum Ausdrucken'
    ],
    [
        'Dibujo antiestrés difícil en blanco y negro con un osito de peluche para expertos y adultos, gratis para imprimir',
        'Dibujo detallado para colorear en blanco y negro con un osito de peluche para jóvenes a partir de 12 años y adultos, gratis para imprimir'
    ]
]);

console.log('Polished final German and Spanish copy.');
