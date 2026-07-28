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
        "indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen für Kinder von 3 bis 10 Jahren. Direkt als A4-Arbeitsblätter ausdrucken.'",
        "indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder für Kinder von 3 bis 10 Jahren. Direkt als A4-Arbeitsblätter ausdrucken.'"
    ],
    [
        "indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen. Öffne eine Aktivität, lade sie herunter oder drucke sie direkt aus.'",
        "indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder. Öffne eine Aktivität, lade sie herunter oder drucke sie direkt aus.'"
    ],
    [
        "indexTitle: 'Laberintos, dibujos para colorear y fichas de unir puntos gratis | VinMat'",
        "indexTitle: 'Dibujos para colorear y laberintos gratis | VinMat'"
    ],
    [
        "indexDescription: 'Descarga gratis laberintos, dibujos para colorear, fichas de unir puntos y trazado para niños de 3 a 10 años. Actividades A4 listas para imprimir.'",
        "indexDescription: 'Descarga gratis laberintos, dibujos para colorear y fichas de unir puntos para niños de 3 a 10 años. Actividades A4 listas para imprimir.'"
    ],
    [
        "indexIntro: 'Explora laberintos, dibujos para colorear, fichas de unir puntos y trazado. Abre una actividad, descárgala o imprímela directamente.'",
        "indexIntro: 'Explora laberintos, dibujos para colorear y fichas de unir puntos. Abre una actividad, descárgala o imprímela directamente.'"
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
    ],
    [
        "vse:'Kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen für Kinder.'",
        "vse:'Kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder für Kinder.'"
    ],
    [
        "vse:'Laberintos, dibujos para colorear, fichas de unir puntos y trazado gratis para niños.'",
        "vse:'Laberintos, dibujos para colorear y fichas de unir puntos gratis para niños.'"
    ],
    [
        "filtrSezona:\"Jahreszeit & Feiertage\"",
        "filtrSezona:\"Jahreszeiten und Feiertage\""
    ],
    [
        "aboutMazesText:\"Ideal zum Üben von Problemlösung, Ausdauer und logischem Denken. Erhältlich in bunten und druckerfreundlichen Varianten.\"",
        "aboutMazesText:\"Ideal zum Üben von Problemlösung, Ausdauer und logischem Denken. Erhältlich in Farbe und Schwarz-Weiß.\""
    ],
    [
        "aboutColoringText:\"Perfekt für künstlerischen Ausdruck, Farberkennung und die Stärkung der Handmuskulatur, die für erste Schreibversuche wichtig ist.\"",
        "aboutColoringText:\"Sie fördern Kreativität, Farberkennung und Feinmotorik.\""
    ],
    [
        "Parcialmente coloreado",
        "Parcialmente coloreada"
    ],
    [
        "aboutMazesText:\"Ideales para practicar la resolución de problemas, la constancia y el pensamiento lógico. Disponibles en versiones a color y aptas para imprimir.\"",
        "aboutMazesText:\"Ideales para practicar la resolución de problemas, la constancia y el pensamiento lógico. Disponibles en color y en blanco y negro.\""
    ],
    [
        "aboutColoringText:\"Perfectos para la expresión artística, el reconocimiento de colores y el fortalecimiento de los músculos de la mano, esenciales para la escritura.\"",
        "aboutColoringText:\"Ayudan a desarrollar la creatividad, reconocer los colores y practicar la motricidad fina.\""
    ]
]);

console.log('Optimized localized index SEO and copy.');
