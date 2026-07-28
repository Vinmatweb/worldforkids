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

await replace(new URL('../es/guia-actividades.html', import.meta.url), [
    ['• Nivel 4 (10+) y nivel 5 (12+):', '• Nivel 4 (10+) y Nivel 5 (12+):']
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

await replace(new URL('../index.html', import.meta.url), [
    [
        '// Poznámka: pro DE/ES zatím odkazujeme na absolutní cesty k EN verzím podstránek\n// (guide-activities.html, privacy.html…), dokud nevytvoříme jejich DE/ES překlady.',
        '// DE a ES mají vlastní hlavní průvodce. Na EN verzi zatím odkazují pouze právní stránky.'
    ],
    ['footerProjects:"Zuhause von VinMat.eu"', 'footerProjects:"Startseite von VinMat.eu"'],
    ['footerPrivacy:"Datenschutzerklärung", footerTerms:"Nutzungsbedingungen"', 'footerPrivacy:"Datenschutz (Englisch)", footerTerms:"Nutzungsbedingungen (Englisch)"'],
    ['filtrRazeni:"Sortieren"', 'filtrRazeni:"Sortieren nach"'],
    ['aboutTracing:"✏️ Arbeitsblätter zum Nachspuren", aboutTracingText:"Sie fördern Stiftführung, Hand-Augen-Koordination, Feinmotorik und die Vorbereitung auf das Schreiben."', 'aboutTracing:"✏️ Nachspuren (in Vorbereitung)", aboutTracingText:"Die Kategorie wird derzeit für zuverlässige Linienstärke und Druckqualität getestet."'],
    ['footerPrivacy:"Política de privacidad", footerTerms:"Términos de uso"', 'footerPrivacy:"Privacidad (en inglés)", footerTerms:"Términos de uso (en inglés)"'],
    ['aboutTracing:"✏️ Fichas de trazado", aboutTracingText:"Útiles para el control del lápiz, la coordinación mano-ojo, la motricidad fina y la práctica temprana de la escritura."', 'aboutTracing:"✏️ Trazado (en preparación)", aboutTracingText:"La categoría se está probando para asegurar el grosor de línea y la calidad de impresión."']
]);

console.log('Polished final German and Spanish copy.');
