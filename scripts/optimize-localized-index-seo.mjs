import { readFile, writeFile } from 'node:fs/promises';

async function replaceInFile(file, replacements) {
    let content = await readFile(file, 'utf8');
    let changed = false;

    for (const [from, to] of replacements) {
        if (content.includes(from)) {
            content = content.replaceAll(from, to);
            changed = true;
        } else if (!content.includes(to)) {
            throw new Error(`Expected text was not found in ${file.pathname}: ${from}`);
        }
    }

    if (changed) await writeFile(file, content);
}

await replaceInFile(new URL('./build-static-site.mjs', import.meta.url), [
    [
        "indexTitle: 'Kostenlose Labyrinthe, Ausmalbilder & Punkt-zu-Punkt-Bilder für Kinder | VinMat'",
        "indexTitle: 'Kostenlose Ausmalbilder & Labyrinthe für Kinder | VinMat'"
    ],
    [
        "indexTitle: 'Laberintos, dibujos para colorear y fichas de unir puntos gratis | VinMat'",
        "indexTitle: 'Dibujos para colorear y laberintos gratis | VinMat'"
    ]
]);

await replaceInFile(new URL('../index.html', import.meta.url), [
    [
        "vse:'Kostenlose Labyrinthe, Ausmalbilder & Aktivitäten für Kinder | VinMat'",
        "vse:'Kostenlose Ausmalbilder & Labyrinthe für Kinder | VinMat'"
    ],
    [
        "vse:'Laberintos, dibujos para colorear y actividades gratis | VinMat'",
        "vse:'Dibujos para colorear y laberintos gratis | VinMat'"
    ]
]);

console.log('Optimized localized index titles.');
