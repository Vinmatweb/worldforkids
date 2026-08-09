import { readFile, writeFile } from 'node:fs/promises';

async function replaceInFile(file, replacements) {
    let content = await readFile(file, 'utf8');
    const original = content;

    for (const replacement of replacements) {
        const candidates = Array.isArray(replacement.from) ? replacement.from : [replacement.from];
        const target = replacement.to;

        if (content.includes(target)) continue;

        const source = candidates.find((candidate) => content.includes(candidate));
        if (source) {
            content = content.replaceAll(source, target);
            continue;
        }

        // This script is deliberately idempotent. Older source variants may no
        // longer exist after a previous successful build; the final validators
        // below the build pipeline verify the required output instead.
        console.warn(`SEO source text already changed or unavailable in ${file.pathname}: ${candidates[0]}`);
    }

    if (content !== original) await writeFile(file, content);
}

await replaceInFile(new URL('./build-static-site.mjs', import.meta.url), [
    {
        from: [
            "indexTitle: 'Kostenlose Labyrinthe, Ausmalbilder & Punkt-zu-Punkt-Bilder für Kinder | VinMat'",
            "indexTitle: 'Kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder für Kinder | VinMat'"
        ],
        to: "indexTitle: 'Kostenlose Ausmalbilder & Labyrinthe für Kinder | VinMat'"
    },
    {
        from: "indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen für Kinder von 3 bis 10 Jahren. Direkt als A4-Arbeitsblätter ausdrucken.'",
        to: "indexDescription: 'Kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder für Kinder von 3 bis 10 Jahren. Direkt als A4-Arbeitsblätter ausdrucken.'"
    },
    {
        from: "indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen. Öffne eine Aktivität, lade sie herunter oder drucke sie direkt aus.'",
        to: "indexIntro: 'Entdecke kostenlose Labyrinthe, Ausmalbilder und Punkt-zu-Punkt-Bilder. Öffne eine Aktivität, lade sie herunter oder drucke sie direkt aus.'"
    },
    {
        from: "indexTitle: 'Laberintos, dibujos para colorear y fichas de unir puntos gratis | VinMat'",
        to: "indexTitle: 'Dibujos para colorear y laberintos gratis | VinMat'"
    },
    {
        from: "indexDescription: 'Descarga gratis laberintos, dibujos para colorear, fichas de unir puntos y trazado para niños de 3 a 10 años. Actividades A4 listas para imprimir.'",
        to: "indexDescription: 'Descarga gratis laberintos, dibujos para colorear y fichas de unir puntos para niños de 3 a 10 años. Actividades A4 listas para imprimir.'"
    },
    {
        from: "indexIntro: 'Explora laberintos, dibujos para colorear, fichas de unir puntos y trazado. Abre una actividad, descárgala o imprímela directamente.'",
        to: "indexIntro: 'Explora laberintos, dibujos para colorear y fichas de unir puntos. Abre una actividad, descárgala o imprímela directamente.'"
    }
]);

await replaceInFile(new URL('../index.html', import.meta.url), [
    {
        from: 'filtrSezona:"Jahreszeit & Feiertage"',
        to: 'filtrSezona:"Jahreszeiten und Feiertage"'
    },
    {
        from: 'aboutMazesText:"Ideal zum Üben von Problemlösung, Ausdauer und logischem Denken. Erhältlich in bunten und druckerfreundlichen Varianten."',
        to: 'aboutMazesText:"Ideal zum Üben von Problemlösung, Ausdauer und logischem Denken. Erhältlich in Farbe und Schwarz-Weiß."'
    },
    {
        from: 'aboutColoringText:"Perfekt für künstlerischen Ausdruck, Farberkennung und die Stärkung der Handmuskulatur, die für erste Schreibversuche wichtig ist."',
        to: 'aboutColoringText:"Sie fördern Kreativität, Farberkennung und Feinmotorik."'
    },
    {
        from: 'Parcialmente coloreado',
        to: 'Parcialmente coloreada'
    },
    {
        from: 'aboutMazesText:"Ideales para practicar la resolución de problemas, la constancia y el pensamiento lógico. Disponibles en versiones a color y aptas para imprimir."',
        to: 'aboutMazesText:"Ideales para practicar la resolución de problemas, la constancia y el pensamiento lógico. Disponibles en color y en blanco y negro."'
    },
    {
        from: 'aboutColoringText:"Perfectos para la expresión artística, el reconocimiento de colores y el fortalecimiento de los músculos de la mano, esenciales para la escritura."',
        to: 'aboutColoringText:"Ayudan a desarrollar la creatividad, reconocer los colores y practicar la motricidad fina."'
    }
]);

console.log('Optimized localized index SEO and copy.');
