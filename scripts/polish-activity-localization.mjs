import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '"') {
            if (quoted && text[index + 1] === '"') {
                value += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (char === ',' && !quoted) {
            row.push(value);
            value = '';
        } else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && text[index + 1] === '\n') index += 1;
            row.push(value);
            value = '';
            if (row.some((cell) => cell !== '')) rows.push(row);
            row = [];
        } else {
            value += char;
        }
    }

    if (value !== '' || row.length) {
        row.push(value);
        rows.push(row);
    }
    return rows;
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function serializeCsv(rows) {
    return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function replaceNaturalPhrases(value, replacements) {
    let result = value;
    for (const [from, to] of replacements) result = result.replaceAll(from, to);
    return result;
}

async function updateFile(relativePath, updateRow) {
    const file = path.join(root, relativePath);
    const original = await readFile(file, 'utf8');
    const rows = parseCsv(original);
    const headers = rows[0];
    const index = Object.fromEntries(headers.map((header, position) => [header, position]));

    for (const row of rows.slice(1)) updateRow(row, index);

    const updated = serializeCsv(rows);
    if (updated !== original) await writeFile(file, updated);
}

await updateFile('assets/data/omalovanky.csv', (row, index) => {
    for (const column of ['altDe_coloring', 'altDe_colored', 'altDe_partly_colored']) {
        if (index[column] === undefined) continue;
        row[index[column]] = replaceNaturalPhrases(row[index[column]], [
            ['für Kinder (Kleinkinder und Vorschulkinder) im Alter von 3–4 Jahren', 'für Kinder im Alter von 3–4 Jahren'],
            ['für Kinder (Vorschulkinder) im Alter von 5–6 Jahren', 'für Kinder im Alter von 5–6 Jahren'],
            ['für Kinder (jüngere Schulkinder) im Alter von 7–9 Jahren', 'für Kinder im Alter von 7–9 Jahren'],
            ['für Kinder (Schulkinder) ab 10 Jahren', 'für Kinder ab 10 Jahren']
        ]);
    }

    for (const column of ['altEs_coloring', 'altEs_colored', 'altEs_partly_colored']) {
        if (index[column] === undefined) continue;
        row[index[column]] = replaceNaturalPhrases(row[index[column]], [
            ['para niños (pequeños y preescolares) de 3–4 años', 'para niños de 3–4 años'],
            ['para niños (preescolares) de 5–6 años', 'para niños de 5–6 años'],
            ['para niños (escolares pequeños) de 7–9 años', 'para niños de 7–9 años'],
            ['para niños (escolares) a partir de 10 años', 'para niños a partir de 10 años']
        ]);
    }
});

await updateFile('assets/data/spojovacky.csv', (row, index) => {
    for (const column of ['altDe_coloring', 'altDe_colored', 'altDe_partly_colored']) {
        if (index[column] === undefined) continue;
        row[index[column]] = replaceNaturalPhrases(row[index[column]], [
            ['Einfache Punkte-verbinden-Vorlage und Ausmalbild', 'Einfaches Punkt-zu-Punkt-Bild zum Ausmalen'],
            ['für Kleinkinder und Kinder im Alter von 3–4 Jahren', 'für Kinder im Alter von 3–4 Jahren']
        ]);
    }

    for (const column of ['altEs_coloring', 'altEs_colored', 'altEs_partly_colored']) {
        if (index[column] === undefined) continue;
        row[index[column]] = row[index[column]].replaceAll('para niños en edad preescolar de 5–6 años', 'para niños de 5–6 años');
    }

    if (row[index.soubor] === 'lv2_gem_1004-bear-dot-to-dot') {
        row[index.altCz_coloring] = 'Jednoduchá černobílá spojovačka a omalovánka s medvídkem pro předškoláky 5–6 let k vytisknutí zdarma';
        row[index.altEn_coloring] = 'Simple black and white teddy bear dot-to-dot and coloring page for preschoolers aged 5–6, free to print';
        row[index.altDe_coloring] = 'Einfaches schwarz-weißes Punkt-zu-Punkt-Bild mit einem Teddybären zum Ausmalen für Kinder im Alter von 5–6 Jahren, kostenlos zum Ausdrucken';
        row[index.altEs_coloring] = 'Ficha sencilla de unir puntos y dibujo para colorear en blanco y negro con un osito de peluche para niños de 5–6 años, gratis para imprimir';
    }
});

console.log('Polished localized activity metadata.');
