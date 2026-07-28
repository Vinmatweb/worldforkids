import { readFile, writeFile } from 'node:fs/promises';

const pages = {
    de: {
        file: new URL('../de/anleitung-aktivitaeten.html', import.meta.url),
        title: 'Aktivitäten für Kinder auswählen | VinMat',
        description: 'Welche Aktivität passt zu welchem Alter? Vergleiche Labyrinthe, Ausmalbilder, Punkt-zu-Punkt-Bilder und Nachspurübungen mit Tipps für Eltern und Lehrkräfte.',
        url: 'https://vinmat.eu/worldforkids/de/anleitung-aktivitaeten.html',
        siteName: 'VinMats Welt für Kinder',
        ogLocale: 'de_DE',
        alternateLocales: ['en_US', 'cs_CZ', 'es_ES'],
        replacements: [
            ['href="https://www.vinmat.eu/worldforkids"', 'href="/worldforkids/de/"'],
            ['🚀 Wähle die richtige Aktivität für Kinder oder für dich selbst ✨', '🚀 Finde die passende Aktivität ✨'],
            ['<h1 class="text-4xl font-extrabold text-slate-900 uppercase tracking-tight pt-1">Aktivitäten-Guide</h1>', '<h1 class="text-4xl font-extrabold text-slate-900 uppercase tracking-tight pt-1">Aktivitäten für Kinder auswählen</h1>'],
            ['Jede Aktivität fördert andere Fähigkeiten. Wähle nach dem Alter der Kinder, ihren Interessen oder dem, was ihr spielerisch gemeinsam üben möchtet. Löst euch mit euren Kindern oder auch allein von Bildschirmen und taucht ein in eine verspielte Welt auf Papier. MALEN, VERBINDEN, NACHZEICHNEN, DURCH LABYRINTHE FINDEN! Alle unsere Schwarz-Weiß-Vorlagen funktionieren zugleich auch als tolle Ausmalbilder – der Spaß endet also nicht, sobald das Labyrinth, die Punkte-verbinden-Vorlage oder die Nachzeichenübung gelöst ist.', 'Jede Aktivität trainiert andere Fähigkeiten. Wähle passend zum Alter, zu den Interessen und dazu, was das Kind gerade üben möchte. Labyrinthe fördern Planung, Ausmalbilder Kreativität, Punkt-zu-Punkt-Bilder Zahlenfolgen und Nachspurübungen die Stiftführung. Alle Schwarz-Weiß-Vorlagen können anschließend auch ausgemalt werden.'],
            ['Übersicht unserer Aktivitäten', 'Unsere Aktivitäten'],
            ['href="pruvodce-bludiste.html"', 'href="anleitung-labyrinthe.html"'],
            ['href="pruvodce-omalovanky.html"', 'href="anleitung-ausmalbilder.html"'],
            ['href="pruvodce-spojovacky.html"', 'href="anleitung-punkte-verbinden.html"'],
            ['href="pruvodce-obtahovacky.html"', 'href="anleitung-nachzeichnen.html"'],
            ['href="urovne-obtiznosti.html"', 'href="schwierigkeitsstufen.html"'],
            ['➡️ Mehr erfahren', '➡️ Zum Ratgeber'],
            ['Feinmotorik der Hand', 'Feinmotorik und Stiftkontrolle'],
            ['Natürliches Erlernen von Farben', 'Farben spielerisch kennenlernen'],
            ['<span>🔗</span>Punkte verbinden', '<span>🔗</span>Punkt zu Punkt'],
            ['Zahlen und Zahlenreihen', 'Zahlenfolgen und Reihenfolgen'],
            ['Buchstaben des Alphabets', 'Genaues Verbinden der Punkte'],
            ['Hohe Konzentration', 'Konzentration und Ausdauer'],
            ['<span>✏️</span>Nachzeichnen', '<span>✏️</span>Nachspuren'],
            ['<span>✏️</span> Nachzeichnen', '<span>✏️</span> Nachspuren'],
            ['Nach Entwicklung', 'Nach Lernziel'],
            ['Logisches Denken, Feinmotorik, Konzentration, Zählen, Buchstaben, Kreativität oder Geduld.', 'Logisches Denken, Feinmotorik, Konzentration, Zahlenfolgen, Kreativität oder Geduld.'],
            ['Tiere, Dinosaurier, Autos, Prinzessinnen, Weltraum, Märchen oder Leben auf dem Bauernhof.', 'Tiere, Wald, Insekten, Fahrzeuge, Weltraum, Familie oder Leben auf dem Bauernhof.'],
            ['• Stufe 1 (Alter 3–4): <span class="text-slate-700 font-bold">5–10 Min.</span> (Aufmerksamkeitsspanne)', '• Stufe 1 (3–4 Jahre): <span class="text-slate-700 font-bold">5–10 Min.</span> (kurze Aufgabe)'],
            ['• Stufe 2–3 (Alter 5–9): <span class="text-slate-700 font-bold">10–20 Min.</span> (mittlere Konzentration)', '• Stufen 2–3 (5–9 Jahre): <span class="text-slate-700 font-bold">10–20 Min.</span>'],
            ['• Stufe 4–5 (Alter 10+ / Experte): <span class="text-slate-700 font-bold">20+ Min.</span> (längere kreative Beschäftigung)', '• Stufe 4 (10+) und Stufe 5 (12+): <span class="text-slate-700 font-bold">20+ Min.</span>'],
            ['<td class="p-3">3+ *</td>', '<td class="p-3">3+</td>'],
            ['* Unsere einfachsten Ausmalbilder der Altersgruppe 3–4 Jahre lassen sich dank breiter, klarer Konturen erfolgreich zur Feinmotorikförderung bereits ab 2 Jahren nutzen.', 'Die Sterne dienen als grobe Orientierung. Der tatsächliche Nutzen hängt vom Motiv, von der Schwierigkeitsstufe und vom Kind ab.'],
            ['✍️ Ergonomie, Griff und bequemes Gestalten', '✍️ Ergonomie, Stifthaltung und entspanntes Arbeiten'],
            ['🤏 Lockerer Dreipunktgriff', '🤏 Entspannter Dreifingergriff'],
            ['Rechtshänder drehen das Papier meist leicht nach links, Linkshänder nach rechts.', 'Das Papier darf leicht gedreht werden, wenn das Kind so entspannter zeichnet.'],
            ['Völlig ohne Anmeldung', 'Ohne Anmeldung'],
            ['Geeignet zum Ausdrucken auf A4', 'Für A4-Druck vorbereitet'],
            ['Für Kinder und Erwachsene', 'Für Kinder, Jugendliche und Erwachsene'],
            ['Farbige und Schwarz-Weiß-Vorlagen', 'Vorlagen in Farbe und Schwarz-Weiß'],
            ['Ständig kommen neue dazu', 'Regelmäßig neue Aktivitäten'],
            ['🔎 Fehler finden', '🔎 Unterschiede finden'],
            ['➕ Weiterzeichnen', '➕ Bild vervollständigen'],
            ['Warum sind Arbeitsblätter wichtig?', 'Was können Arbeitsblätter fördern?'],
            ['Arbeitsblätter fördern logisches Denken, Feinmotorik, Konzentration und Selbstständigkeit. Kinder lernen spielerisch und bauen ganz natürlich wichtige Fähigkeiten auf, die sie später zu Hause, im Kindergarten und in der Grundschule voll nutzen können.', 'Arbeitsblätter können logisches Denken, Feinmotorik, Konzentration und selbstständiges Arbeiten fördern. Entscheidend sind eine passende Schwierigkeitsstufe, ausreichend Zeit und eine entspannte Begleitung.'],
            ['>Datenschutzerklärung</a>', '>Datenschutz (Englisch)</a>'],
            ['>Nutzungsbedingungen</a>', '>Nutzungsbedingungen (Englisch)</a>'],
            ['gap-1 md:gap-2 whitespace-nowrap text-center', 'gap-1 md:gap-2 flex-wrap text-center']
        ]
    },
    es: {
        file: new URL('../es/guia-actividades.html', import.meta.url),
        title: 'Guía de actividades para niños | VinMat',
        description: '¿Qué actividad es adecuada para cada edad? Compara laberintos, dibujos para colorear, fichas de unir puntos y trazado con consejos para familias y docentes.',
        url: 'https://vinmat.eu/worldforkids/es/guia-actividades.html',
        siteName: 'El mundo de VinMat para niños',
        ogLocale: 'es_ES',
        alternateLocales: ['en_US', 'cs_CZ', 'de_DE'],
        replacements: [
            ['href="https://www.vinmat.eu/worldforkids"', 'href="/worldforkids/es/"'],
            ['🚀 Elige la actividad adecuada para tus hijos o para ti ✨', '🚀 Encuentra la actividad adecuada ✨'],
            ['Cada actividad desarrolla habilidades distintas. Elige según la edad de los niños, sus intereses o lo que queráis practicar juntos de forma divertida. Aparta a tus hijos —o a ti mismo— de las pantallas y sumérgete en un mundo de juego en papel. ¡PINTA, UNE, REPASA, RECORRE LABERINTOS! Además, todas nuestras fichas en blanco y negro funcionan también como estupendos dibujos para colorear, así que la diversión no termina al resolver el laberinto, la ficha de unir puntos o el trazado.', 'Cada actividad ayuda a practicar habilidades distintas. Elige según la edad, los intereses y lo que el niño quiera trabajar en ese momento. Los laberintos favorecen la planificación, los dibujos para colorear la creatividad, las fichas de unir puntos las secuencias y el trazado el control del lápiz. Todas las fichas en blanco y negro también se pueden colorear.'],
            ['Resumen de nuestras actividades', 'Tipos de actividades'],
            ['href="pruvodce-bludiste.html"', 'href="guia-laberintos.html"'],
            ['href="pruvodce-omalovanky.html"', 'href="guia-dibujos.html"'],
            ['href="pruvodce-spojovacky.html"', 'href="guia-unir-puntos.html"'],
            ['href="pruvodce-obtahovacky.html"', 'href="guia-trazado.html"'],
            ['href="urovne-obtiznosti.html"', 'href="niveles-dificultad.html"'],
            ['➡️ Saber más', '➡️ Ver guía'],
            ['Motricidad fina de la mano', 'Motricidad fina y control del lápiz'],
            ['Aprendizaje natural de los colores', 'Aprender los colores jugando'],
            ['Números y series numéricas', 'Secuencias y orden numérico'],
            ['Letras del abecedario', 'Unir los puntos con precisión'],
            ['Alto nivel de concentración', 'Concentración y paciencia'],
            ['Por desarrollo', 'Por habilidad'],
            ['Pensamiento lógico, motricidad fina, concentración, cálculo, letras, creatividad o paciencia.', 'Pensamiento lógico, motricidad fina, concentración, secuencias numéricas, creatividad o paciencia.'],
            ['Animales, dinosaurios, coches, princesas, el espacio, cuentos o la vida en la granja.', 'Animales, bosque, insectos, vehículos, espacio, familia o vida en la granja.'],
            ['• Nivel 1 (Edad 3–4): <span class="text-slate-700 font-bold">5–10 min</span> (mantenimiento de la atención)', '• Nivel 1 (3–4 años): <span class="text-slate-700 font-bold">5–10 min</span> (actividad breve)'],
            ['• Nivel 2–3 (Edad 5–9): <span class="text-slate-700 font-bold">10–20 min</span> (concentración media)', '• Niveles 2–3 (5–9 años): <span class="text-slate-700 font-bold">10–20 min</span>'],
            ['• Nivel 4–5 (Edad 10+ / Experto): <span class="text-slate-700 font-bold">20+ min</span> (entretenimiento creativo más largo)', '• Nivel 4 (10+) y nivel 5 (12+): <span class="text-slate-700 font-bold">20+ min</span>'],
            ['<td class="p-3">3+ *</td>', '<td class="p-3">3+</td>'],
            ['* Nuestros dibujos para colorear más sencillos, de la franja de 3–4 años, gracias a sus contornos anchos y claros, también se pueden usar con éxito para el desarrollo de la motricidad fina desde los 2 años.', 'Las estrellas son solo una orientación general. El beneficio real depende del dibujo, del nivel de dificultad y de cada niño.'],
            ['✍️ Ergonomía, agarre y comodidad al crear', '✍️ Ergonomía, agarre y comodidad'],
            ['🤏 Agarre de pinza relajado', '🤏 Agarre de trípode relajado'],
            ['El lápiz o pinturita debe apoyarse con soltura entre el pulgar, el índice y el corazón.', 'El lápiz o el lápiz de color debe apoyarse con soltura entre el pulgar, el índice y el corazón.'],
            ['las pinturas blandas', 'los lápices de colores blandos'],
            ['pinturas más finas', 'lápices de colores más finos'],
            ['Solo después coged el lápiz o la pintura.', 'Después puede usar el lápiz o el lápiz de color.'],
            ['en la guardería y en el colegio', 'en educación infantil y primaria'],
            ['Totalmente sin registro', 'Sin registro'],
            ['Aptas para imprimir en A4', 'Preparadas para imprimir en A4'],
            ['Para niños y adultos', 'Para niños, jóvenes y adultos'],
            ['Añadimos nuevas constantemente', 'Añadimos nuevas actividades con frecuencia'],
            ['¿Cómo proceder correctamente?', '¿Cómo empezar?'],
            ['¿Por qué son importantes las fichas?', '¿Qué pueden aportar las fichas?'],
            ['Las fichas desarrollan el pensamiento lógico, la motricidad fina, la concentración y la autonomía. Los niños aprenden jugando y adquieren de forma natural habilidades clave que más tarde aprovecharán en casa, en la guardería y en la escuela primaria.', 'Las fichas pueden ayudar a desarrollar el pensamiento lógico, la motricidad fina, la concentración y la autonomía. Lo importante es elegir un nivel adecuado, dejar tiempo suficiente y acompañar la actividad sin presión.'],
            ['© 2026 Hecho con ❤️ para una gran creatividad', '© 2026 Hecho con ❤️ para aprender y crear'],
            ['>Política de privacidad</a>', '>Privacidad (en inglés)</a>'],
            ['>Términos de uso</a>', '>Términos de uso (en inglés)</a>'],
            ['gap-1 md:gap-2 whitespace-nowrap text-center', 'gap-1 md:gap-2 flex-wrap text-center']
        ]
    }
};

function replaceText(html, from, to, fileName) {
    if (html.includes(from)) return html.replaceAll(from, to);
    if (html.includes(to)) return html;
    throw new Error(`${fileName}: expected text not found: ${from}`);
}

function setTag(html, pattern, tag) {
    if (pattern.test(html)) return html.replace(pattern, tag);
    return html.replace('</head>', `    ${tag}\n</head>`);
}

function updateStructuredData(html, page) {
    return html.replace(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/i, (full, jsonText) => {
        try {
            const data = JSON.parse(jsonText);
            data.headline = page.title;
            data.description = page.description;
            data.url = page.url;
            data.inLanguage = page === pages.de ? 'de' : 'es';
            if (data.publisher && typeof data.publisher === 'object') data.publisher.name = page.siteName;
            return `<script type="application/ld+json">\n${JSON.stringify(data, null, 4)}\n    </script>`;
        } catch {
            return full;
        }
    });
}

for (const [locale, page] of Object.entries(pages)) {
    let html = await readFile(page.file, 'utf8');
    const original = html;

    for (const [from, to] of page.replacements) html = replaceText(html, from, to, page.file.pathname);

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${page.title}</title>`);
    html = setTag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="description" content="${page.description}">`);
    html = setTag(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?\s*>/i, '<meta name="robots" content="index, follow">');
    html = setTag(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:title" content="${page.title}">`);
    html = setTag(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:description" content="${page.description}">`);
    html = setTag(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:url" content="${page.url}">`);
    html = setTag(html, /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:site_name" content="${page.siteName}">`);
    html = setTag(html, /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?\s*>/i, `<meta property="og:locale" content="${page.ogLocale}">`);
    html = html.replace(/\s*<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?\s*>/gi, '');
    const alternates = page.alternateLocales.map((value) => `    <meta property="og:locale:alternate" content="${value}">`).join('\n');
    html = html.replace(/(<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?\s*>)/i, `$1\n${alternates}`);
    html = setTag(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:title" content="${page.title}">`);
    html = setTag(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:description" content="${page.description}">`);
    html = updateStructuredData(html, page);

    if (html !== original) {
        await writeFile(page.file, html);
        console.log(`Polished ${locale} activity guide.`);
    } else {
        console.log(`${locale} activity guide already polished.`);
    }
}
