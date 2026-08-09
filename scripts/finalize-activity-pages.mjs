import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const basePath = '/worldforkids/';

const locales = {
    en: {
        directory: 'activities', htmlLang: 'en', ogLocale: 'en_US', siteName: "VinMat's World for Kids",
        home: '/worldforkids/', guide: '/worldforkids/guide-activities.html', levels: '/worldforkids/difficulty-levels.html', story: '/worldforkids/our-story.html',
        labels: { home: 'Home', guide: 'Activity Guide', levels: 'Difficulty Levels', story: 'Our Story', privacy: 'Privacy', terms: 'Terms of Use', contact: 'Contact', made: 'Made with ❤️ for creative learning', use: 'Free for personal and educational use', copied: '(Email copied!)', activities: 'Activities', about: 'About this printable', practice: 'What children can practice', level: 'Why this level?', how: 'How to use this worksheet', print: 'Print & download', related: 'More free activities', age: 'Suggested age', format: 'Format', free: 'Free printable', a4: 'A4 printable' },
        title: (name, type) => `${name} – Free ${type} | VinMat`
    },
    cs: {
        directory: 'cs/aktivity', htmlLang: 'cs', ogLocale: 'cs_CZ', siteName: 'Vinmatův svět pro děti',
        home: '/worldforkids/cs/', guide: '/worldforkids/cs/pruvodce-aktivitami.html', levels: '/worldforkids/cs/urovne-obtiznosti.html', story: '/worldforkids/cs/nas-pribeh.html',
        labels: { home: 'Domů', guide: 'Průvodce aktivitami', levels: 'Úrovně obtížnosti', story: 'Náš příběh', privacy: 'Ochrana soukromí', terms: 'Podmínky užití', contact: 'Kontakt', made: 'Vytvořeno s ❤️ pro kreativní tvoření', use: 'Zdarma pro osobní a vzdělávací použití', copied: '(E-mail zkopírován!)', activities: 'Aktivity', about: 'O tomto pracovním listu', practice: 'Co si dítě může procvičit', level: 'Proč tato úroveň?', how: 'Jak pracovní list použít', print: 'Tisk a stažení', related: 'Další aktivity zdarma', age: 'Doporučený věk', format: 'Formát', free: 'Zdarma', a4: 'A4 k vytisknutí' },
        title: (name, type) => `${name} – ${type} zdarma | VinMat`
    },
    de: {
        directory: 'de/aktivitaeten', htmlLang: 'de', ogLocale: 'de_DE', siteName: 'VinMats Welt für Kinder',
        home: '/worldforkids/de/', guide: '/worldforkids/de/anleitung-aktivitaeten.html', levels: '/worldforkids/de/schwierigkeitsstufen.html', story: '/worldforkids/de/unsere-geschichte.html',
        labels: { home: 'Startseite', guide: 'Aktivitäten-Guide', levels: 'Schwierigkeitsstufen', story: 'Unsere Geschichte', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', contact: 'Kontakt', made: 'Mit ❤️ gemacht für kreatives Gestalten', use: 'Kostenlos für private und pädagogische Nutzung', copied: '(E-Mail kopiert!)', activities: 'Aktivitäten', about: 'Über diese Druckvorlage', practice: 'Was Kinder üben können', level: 'Warum diese Stufe?', how: 'So verwendest du das Arbeitsblatt', print: 'Drucken & herunterladen', related: 'Weitere kostenlose Aktivitäten', age: 'Empfohlenes Alter', format: 'Format', free: 'Kostenlos', a4: 'A4-Druckvorlage' },
        title: (name, type) => `${name} – ${type} kostenlos | VinMat`
    },
    es: {
        directory: 'es/actividades', htmlLang: 'es', ogLocale: 'es_ES', siteName: 'El mundo de VinMat para niños',
        home: '/worldforkids/es/', guide: '/worldforkids/es/guia-actividades.html', levels: '/worldforkids/es/niveles-dificultad.html', story: '/worldforkids/es/nuestra-historia.html',
        labels: { home: 'Inicio', guide: 'Guía de actividades', levels: 'Niveles de dificultad', story: 'Nuestra historia', privacy: 'Privacidad', terms: 'Términos de uso', contact: 'Contacto', made: 'Hecho con ❤️ para aprender y crear', use: 'Gratis para uso personal y educativo', copied: '(¡Correo copiado!)', activities: 'Actividades', about: 'Sobre esta ficha', practice: 'Qué pueden practicar los niños', level: '¿Por qué este nivel?', how: 'Cómo usar esta ficha', print: 'Imprimir y descargar', related: 'Más actividades gratis', age: 'Edad recomendada', format: 'Formato', free: 'Gratis', a4: 'Ficha A4' },
        title: (name, type) => `${name} – ${type} gratis | VinMat`
    }
};

const localeNames = { en: 'English', cs: 'Čeština', de: 'Deutsch', es: 'Español' };
const localeLabels = { en: 'EN', cs: 'CZ', de: 'DE', es: 'ES' };
const legalUrls = {
    en: { privacy: '/worldforkids/privacy.html', terms: '/worldforkids/terms.html' },
    cs: { privacy: '/worldforkids/cs/zasady-ochrany-osobnich-udaju.html', terms: '/worldforkids/cs/podminky-uziti.html' },
    de: { privacy: '/worldforkids/de/datenschutz.html', terms: '/worldforkids/de/nutzungsbedingungen.html' },
    es: { privacy: '/worldforkids/es/privacidad.html', terms: '/worldforkids/es/terminos-de-uso.html' }
};

const copy = {
    en: {
        ages: { 1: '3–4 years', 2: '5–6 years', 3: '7–9 years', 4: '10+ years', 5: '12+ & adults' },
        intro: 'This printable is designed for easy use at home, in the classroom or while travelling. Download the full-size A4 worksheet or print it directly from this page.',
        practice: {
            coloring: 'Coloring gives children a relaxed way to practise hand control, careful movement inside outlines, observation of shapes and creative choices with colours.',
            maze: 'Mazes can be used to practise visual tracking, simple planning, problem solving and controlled pencil movement from start to finish.',
            dot: 'Dot-to-dot activities combine number order and visual tracking with controlled pencil movement. The finished picture also gives children a clear goal and a small sense of discovery.',
            tracing: 'Tracing activities can be used to practise following a path, hand-eye coordination, controlled pencil movement and the basic motions used in early writing.'
        },
        levels: {
            1: 'Level 1 uses very simple shapes, large spaces and only a few decisions. It is intended for young children who are just beginning to use printable activities.',
            2: 'Level 2 adds a little more detail and precision while keeping the task clear and manageable for preschool children.',
            3: 'Level 3 uses more detail and longer sequences, making it suitable for children who can already work through simpler worksheets more independently.',
            4: 'Level 4 introduces finer details and a longer challenge for older children who enjoy careful, patient work.',
            5: 'Level 5 is the most detailed and demanding level, created for older children, teenagers and adults who enjoy longer creative challenges.'
        },
        how: {
            coloring: ['Print the black-and-white worksheet on A4 paper.', 'Choose crayons, pencils or markers that suit the paper.', 'Let the child colour freely; there is no required colour scheme.'],
            maze: ['Print the worksheet on A4 paper.', 'Find the start and finish before drawing the route.', 'Try the path with a finger first, then solve it with a pencil.'],
            dot: ['Print the worksheet on A4 paper.', 'Start at the first number and connect the dots in order.', 'When the picture is complete, it can also be coloured.'],
            tracing: ['Print the worksheet on A4 paper.', 'Follow the guide slowly with a pencil or crayon.', 'Repeat the movement if the child wants extra practice.']
        },
        print: 'The worksheet is provided free for personal and educational use. For the clearest result, print at 100% scale or choose “fit to page” if your printer requires it.'
    },
    cs: {
        ages: { 1: '3–4 roky', 2: '5–6 let', 3: '7–9 let', 4: '10+ let', 5: '12+ a dospělí' },
        intro: 'Pracovní list je připravený pro snadné použití doma, ve škole i na cestách. Můžete si stáhnout plnou A4 verzi nebo ji vytisknout přímo z této stránky.',
        practice: {
            coloring: 'Omalovánka nabízí klidný způsob, jak si procvičit ovládání ruky, vedení pastelky uvnitř obrysů, všímání si tvarů a vlastní práci s barvami.',
            maze: 'Bludiště lze využít k procvičení sledování cesty očima, jednoduchého plánování, řešení problému a přesnějšího vedení tužky od startu k cíli.',
            dot: 'Spojovačka propojuje pořadí čísel, sledování bodů a přesné vedení tužky. Postupné odhalení výsledného obrázku navíc dává dítěti jasný cíl.',
            tracing: 'Obtahování lze využít k procvičení sledování čáry, koordinace oka a ruky, vedení tužky a základních pohybů potřebných při pozdějším psaní.'
        },
        levels: {
            1: 'Úroveň 1 používá velmi jednoduché tvary, velké plochy a minimum rozhodování. Je určená dětem, které s pracovními listy teprve začínají.',
            2: 'Úroveň 2 přidává trochu více detailů a přesnosti, ale úkol zůstává přehledný a zvládnutelný pro předškolní děti.',
            3: 'Úroveň 3 obsahuje více detailů a delší postup, takže se hodí pro děti, které už jednodušší pracovní listy zvládají samostatněji.',
            4: 'Úroveň 4 přináší jemnější detaily a delší výzvu pro starší děti, které baví pečlivější práce.',
            5: 'Úroveň 5 je nejdetailnější a nejnáročnější. Je určená starším dětem, teenagerům i dospělým, kteří mají rádi delší kreativní výzvy.'
        },
        how: {
            coloring: ['Vytiskněte černobílý pracovní list na papír A4.', 'Připravte pastelky, tužky nebo fixy vhodné pro použitý papír.', 'Nechte dítě vybarvovat podle vlastní fantazie; žádné barvy nejsou povinné.'],
            maze: ['Vytiskněte pracovní list na papír A4.', 'Nejdříve společně najděte start a cíl.', 'Cestu lze nejprve zkusit prstem a potom ji projít tužkou.'],
            dot: ['Vytiskněte pracovní list na papír A4.', 'Začněte prvním číslem a spojujte body ve správném pořadí.', 'Hotový obrázek si dítě může také vybarvit.'],
            tracing: ['Vytiskněte pracovní list na papír A4.', 'Pomalu obtahujte předlohu tužkou nebo pastelkou.', 'Pohyb lze podle chuti zopakovat pro další procvičení.']
        },
        print: 'Pracovní list je zdarma pro osobní a vzdělávací použití. Pro nejlepší výsledek tiskněte ve 100% měřítku, případně použijte volbu „přizpůsobit stránce“, pokud ji tiskárna vyžaduje.'
    },
    de: {
        ages: { 1: '3–4 Jahre', 2: '5–6 Jahre', 3: '7–9 Jahre', 4: '10+ Jahre', 5: '12+ & Erwachsene' },
        intro: 'Die Druckvorlage eignet sich für zu Hause, den Unterricht oder unterwegs. Du kannst das vollständige A4-Arbeitsblatt herunterladen oder direkt von dieser Seite ausdrucken.',
        practice: {
            coloring: 'Beim Ausmalen können Kinder ruhige Handbewegungen, das Arbeiten innerhalb von Konturen, die Beobachtung von Formen und eigene kreative Farbentscheidungen üben.',
            maze: 'Labyrinthe können zum Üben von visuellem Verfolgen, einfacher Planung, Problemlösen und kontrollierter Stiftführung vom Start bis zum Ziel genutzt werden.',
            dot: 'Punkt-zu-Punkt-Aufgaben verbinden Zahlenreihenfolge und visuelles Verfolgen mit kontrollierter Stiftführung. Das entstehende Bild bietet dabei ein klares Ziel.',
            tracing: 'Nachspur-Aufgaben können zum Üben von Linienführung, Hand-Auge-Koordination, kontrollierten Stiftbewegungen und grundlegenden Bewegungen für das spätere Schreiben genutzt werden.'
        },
        levels: {
            1: 'Stufe 1 verwendet sehr einfache Formen, große Flächen und nur wenige Entscheidungen. Sie ist für junge Kinder gedacht, die gerade mit Druckvorlagen beginnen.',
            2: 'Stufe 2 enthält etwas mehr Details und verlangt mehr Genauigkeit, bleibt aber für Vorschulkinder übersichtlich und gut machbar.',
            3: 'Stufe 3 bietet mehr Details und längere Abläufe und eignet sich für Kinder, die einfachere Arbeitsblätter bereits selbstständiger bearbeiten können.',
            4: 'Stufe 4 enthält feinere Details und längere Aufgaben für ältere Kinder, die gerne geduldig und sorgfältig arbeiten.',
            5: 'Stufe 5 ist die detaillierteste und anspruchsvollste Stufe. Sie richtet sich an ältere Kinder, Jugendliche und Erwachsene, die längere kreative Herausforderungen mögen.'
        },
        how: {
            coloring: ['Drucke die Schwarz-Weiß-Vorlage auf A4-Papier.', 'Wähle Buntstifte, Wachsmaler oder Filzstifte passend zum Papier.', 'Lass das Kind frei ausmalen; es gibt keine vorgeschriebenen Farben.'],
            maze: ['Drucke das Arbeitsblatt auf A4-Papier.', 'Suche zuerst Start und Ziel.', 'Verfolge den Weg zunächst mit dem Finger und löse ihn danach mit einem Stift.'],
            dot: ['Drucke das Arbeitsblatt auf A4-Papier.', 'Beginne bei der ersten Zahl und verbinde die Punkte der Reihe nach.', 'Das fertige Bild kann anschließend ausgemalt werden.'],
            tracing: ['Drucke das Arbeitsblatt auf A4-Papier.', 'Fahre die Vorlage langsam mit einem Stift oder Wachsmaler nach.', 'Die Bewegung kann für zusätzliche Übung wiederholt werden.']
        },
        print: 'Die Vorlage ist kostenlos für private und pädagogische Nutzung. Für ein klares Ergebnis drucke möglichst in 100 % Größe oder verwende „An Seite anpassen“, wenn dein Drucker dies benötigt.'
    },
    es: {
        ages: { 1: '3–4 años', 2: '5–6 años', 3: '7–9 años', 4: '10+ años', 5: '12+ y adultos' },
        intro: 'Esta ficha está pensada para usarla fácilmente en casa, en clase o durante un viaje. Puedes descargar la hoja A4 completa o imprimirla directamente desde esta página.',
        practice: {
            coloring: 'Colorear ofrece una forma tranquila de practicar el control de la mano, el movimiento dentro de los contornos, la observación de formas y las decisiones creativas con los colores.',
            maze: 'Los laberintos pueden utilizarse para practicar el seguimiento visual, la planificación sencilla, la resolución de problemas y el control del lápiz desde la salida hasta la meta.',
            dot: 'Las actividades de unir puntos combinan el orden de los números y el seguimiento visual con el control del lápiz. La imagen que aparece al final proporciona además un objetivo claro.',
            tracing: 'Las actividades de trazado pueden utilizarse para practicar el seguimiento de líneas, la coordinación ojo-mano, el control del lápiz y movimientos básicos relacionados con la escritura inicial.'
        },
        levels: {
            1: 'El nivel 1 utiliza formas muy sencillas, espacios grandes y pocas decisiones. Está pensado para niños pequeños que empiezan a utilizar actividades imprimibles.',
            2: 'El nivel 2 añade algo más de detalle y precisión, manteniendo la actividad clara y manejable para niños de preescolar.',
            3: 'El nivel 3 incluye más detalles y secuencias más largas, por lo que es adecuado para niños que ya realizan fichas sencillas con mayor autonomía.',
            4: 'El nivel 4 incorpora detalles más finos y un reto más largo para niños mayores que disfrutan trabajando con cuidado y paciencia.',
            5: 'El nivel 5 es el más detallado y exigente. Está pensado para niños mayores, adolescentes y adultos que disfrutan de retos creativos más largos.'
        },
        how: {
            coloring: ['Imprime la ficha en blanco y negro en papel A4.', 'Elige ceras, lápices o rotuladores adecuados para el papel.', 'Deja que el niño coloree libremente; no hay una combinación de colores obligatoria.'],
            maze: ['Imprime la ficha en papel A4.', 'Localiza primero la salida y la meta.', 'Prueba el recorrido con el dedo antes de resolverlo con un lápiz.'],
            dot: ['Imprime la ficha en papel A4.', 'Empieza por el primer número y une los puntos en orden.', 'Cuando aparezca la imagen, también se puede colorear.'],
            tracing: ['Imprime la ficha en papel A4.', 'Sigue la guía despacio con un lápiz o una cera.', 'Repite el movimiento si el niño quiere practicar un poco más.']
        },
        print: 'La ficha es gratuita para uso personal y educativo. Para obtener un resultado claro, imprime al 100 % o utiliza la opción “ajustar a página” si tu impresora lo necesita.'
    }
};

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function setTag(html, pattern, tag) {
    return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n</head>`);
}

function removeHeadTags(html, pattern) {
    return html.replace(pattern, '');
}

function extract(html, pattern, fallback = '') {
    return html.match(pattern)?.[1]?.trim() || fallback;
}

function socialLinks() {
    return `<a href="https://www.youtube.com/@vinmat_worldforkids" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="hover:text-amber-400">▶</a><a href="https://www.instagram.com/vinmat_worldforkids/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="hover:text-amber-400">◎</a>`;
}

function languageLinks(html, locale) {
    const links = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="(en|cs|de|es)" href="([^"]+)">/g)].map((match) => [match[1], match[2]]));
    return Object.keys(locales)
        .filter((code) => code !== locale && links[code])
        .map((code) => `<a href="${links[code]}" aria-label="${localeNames[code]}"><span>${localeLabels[code]}</span><span class="sr-only"> ${localeNames[code]}</span></a>`)
        .join('');
}

function header(html, locale, config) {
    const languageNav = languageLinks(html, locale);
    return `<div class="bg-slate-900 text-white text-xs py-2 px-3 fixed top-0 left-0 w-full z-50 shadow-md font-bold">
    <div class="max-w-7xl mx-auto w-full md:flex md:items-center md:justify-between md:px-8">
        <div class="grid grid-cols-1 gap-1 md:flex md:items-center md:gap-4">
            <div class="flex items-center gap-2"><a href="${config.home}" class="hover:text-amber-400 uppercase flex items-center gap-1 whitespace-nowrap">🏠 <span>${config.labels.home}</span></a><span class="text-slate-700">|</span><a href="${config.guide}" class="hover:text-amber-400 whitespace-nowrap">${config.labels.guide}</a></div>
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2"><span class="hidden md:inline text-slate-700">|</span><a href="${config.levels}" class="hover:text-amber-400 whitespace-nowrap">${config.labels.levels}</a><span class="text-slate-700">|</span><a href="${config.story}" class="hover:text-amber-400 whitespace-nowrap">${config.labels.story}</a></div>
                <div class="flex items-center gap-2 md:hidden ml-auto"><div class="flex items-center gap-2 border-r border-slate-700 pr-2">${socialLinks()}</div><div class="flex gap-2">${languageNav}</div></div>
            </div>
        </div>
        <div class="hidden md:flex items-center gap-4 ml-auto"><div class="flex items-center gap-2.5 border-r border-slate-700 pr-4">${socialLinks()}</div><div class="flex gap-3">${languageNav}</div></div>
    </div>
</div>`;
}

function footer(locale, config) {
    const legal = legalUrls[locale];
    return `<footer data-activity-footer class="bg-slate-900 text-slate-400 text-[11px] py-4 px-6 border-t border-slate-800 font-semibold shadow-inner">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2 flex-wrap text-center">
        <span>© 2026 ${config.labels.made}</span><span class="hidden md:inline">·</span><span>${config.labels.use}</span><span class="hidden md:inline">·</span>
        <a href="${legal.privacy}" class="hover:text-white">${config.labels.privacy}</a><span class="hidden md:inline">·</span><a href="${legal.terms}" class="hover:text-white">${config.labels.terms}</a><span class="hidden md:inline">·</span>
        <button type="button" onclick="copyActivityEmail()" class="text-amber-400 hover:text-amber-300 font-bold uppercase">✉️ ${config.labels.contact} <span id="activity-copy-status" class="text-emerald-400 lowercase font-normal ml-1 opacity-0"></span></button>
    </div>
</footer>
<script data-activity-helper>
function copyActivityEmail(){const value='vinmatforkids@gmail.com';const status=document.getElementById('activity-copy-status');const done=()=>{if(!status)return;status.textContent=${JSON.stringify(config.labels.copied)};status.classList.remove('opacity-0');setTimeout(()=>status.classList.add('opacity-0'),1800)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(value).then(done).catch(()=>activityFallbackCopy(value,done));else activityFallbackCopy(value,done)}
function activityFallbackCopy(value,done){const input=document.createElement('input');input.value=value;document.body.appendChild(input);input.select();document.execCommand('copy');input.remove();done()}
</script>`;
}

function trackingScripts() {
    return `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4310805868565928" crossorigin="anonymous"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-GZFJ4TX5RR"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GZFJ4TX5RR');</script>`;
}

function classifyType(type) {
    const value = type.toLowerCase();
    if (/(maze|bludi|labyrinth|laberinto)/.test(value)) return 'maze';
    if (/(dot|spojova|punkt|une)/.test(value)) return 'dot';
    if (/(trac|obtah|nachspur|traz)/.test(value)) return 'tracing';
    return 'coloring';
}

function levelNumber(html) {
    const text = extract(html, /<p class="text-xs[^>]*>([\s\S]*?)<\/p>/i, '');
    const match = text.replace(/<[^>]+>/g, '').match(/(?:Level|Úroveň|Stufe|Nivel)\s*(\d)/i);
    return Number(match?.[1] || 1);
}

function pageMeta(html, file) {
    const name = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 'Activity').replace(/<[^>]+>/g, '');
    const type = extract(html, /<p class="text-xs[^>]*>([^<·]+)\s*·/i, 'Activity');
    return {
        file,
        name,
        type,
        kind: classifyType(type),
        level: levelNumber(html),
        canonical: extract(html, /<link rel="canonical" href="([^"]*)">/i)
    };
}

function relatedCards(current, pages, locale, config) {
    const candidates = pages
        .filter((item) => item.file !== current.file)
        .map((item) => ({
            ...item,
            score: (item.kind === current.kind ? 4 : 0) + (item.level === current.level ? 2 : 0)
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, locale))
        .slice(0, 3);

    if (!candidates.length) return '';
    return `<section class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h2 class="text-xl font-extrabold text-slate-900 mb-4">${escapeHtml(config.labels.related)}</h2>
        <div class="grid gap-3 md:grid-cols-3">${candidates.map((item) => `<a href="${escapeHtml(item.canonical)}" class="block rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"><span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">${escapeHtml(item.type)} · ${escapeHtml(config.labels.age)} ${escapeHtml(copy[locale].ages[item.level] || '')}</span><strong class="block mt-1 text-sm text-slate-900">${escapeHtml(item.name)}</strong></a>`).join('')}</div>
    </section>`;
}

function strongDetail(current, pages, locale, config, description) {
    const text = copy[locale];
    const age = text.ages[current.level] || '';
    const practice = text.practice[current.kind];
    const whyLevel = text.levels[current.level] || text.levels[1];
    const steps = text.how[current.kind];
    const related = relatedCards(current, pages, locale, config);

    return `<!-- STRONG_DETAIL_START -->
    <div class="mt-7 space-y-5">
        <div class="flex flex-wrap gap-2 text-xs font-bold"><span class="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1.5">${escapeHtml(config.labels.free)}</span><span class="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1.5">${escapeHtml(config.labels.a4)}</span><span class="bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-3 py-1.5">${escapeHtml(config.labels.age)}: ${escapeHtml(age)}</span></div>

        <section class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h2 class="text-xl font-extrabold text-slate-900">${escapeHtml(config.labels.about)}</h2>
            <p class="mt-3 text-slate-600 leading-relaxed">${escapeHtml(description)}</p>
            <p class="mt-3 text-slate-600 leading-relaxed">${escapeHtml(text.intro)}</p>
        </section>

        <div class="grid gap-5 md:grid-cols-2">
            <section class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7">
                <h2 class="text-lg font-extrabold text-slate-900">${escapeHtml(config.labels.practice)}</h2>
                <p class="mt-3 text-sm text-slate-600 leading-relaxed">${escapeHtml(practice)}</p>
            </section>
            <section class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7">
                <h2 class="text-lg font-extrabold text-slate-900">${escapeHtml(config.labels.level)}</h2>
                <p class="mt-3 text-sm text-slate-600 leading-relaxed">${escapeHtml(whyLevel)}</p>
                <a href="${config.levels}" class="inline-block mt-3 text-sm font-bold text-indigo-700 hover:underline">${escapeHtml(config.labels.levels)} →</a>
            </section>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
            <section class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7">
                <h2 class="text-lg font-extrabold text-slate-900">${escapeHtml(config.labels.how)}</h2>
                <ol class="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed list-decimal pl-5">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
            </section>
            <section class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-7">
                <h2 class="text-lg font-extrabold text-slate-900">${escapeHtml(config.labels.print)}</h2>
                <p class="mt-3 text-sm text-slate-600 leading-relaxed">${escapeHtml(text.print)}</p>
                <a href="${config.guide}" class="inline-block mt-3 text-sm font-bold text-indigo-700 hover:underline">${escapeHtml(config.labels.guide)} →</a>
            </section>
        </div>

        ${related}
    </div>
    <!-- STRONG_DETAIL_END -->`;
}

function breadcrumb(current, config) {
    return `<nav aria-label="Breadcrumb" class="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-2"><a class="hover:text-indigo-700" href="${config.home}">${escapeHtml(config.labels.home)}</a><span aria-hidden="true">›</span><span>${escapeHtml(config.labels.activities)}</span><span aria-hidden="true">›</span><span class="text-slate-700">${escapeHtml(current.name)}</span></nav>`;
}

async function finalizePage(file, locale, config, pages) {
    let html = await readFile(file, 'utf8');
    const current = pageMeta(html, path.basename(file));
    const description = extract(html, /<meta name="description" content="([^"]*)">/i, current.name);
    const image = extract(html, /<meta property="og:image" content="([^"]*)">/i);
    const canonical = current.canonical;
    const title = config.title(current.name, current.type);

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<meta property="og:type" content="[^"]*">/i, '<meta property="og:type" content="article">');
    html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(title)}">`);
    html = removeHeadTags(html, /\s*<meta property="og:site_name"[^>]*>/gi);
    html = removeHeadTags(html, /\s*<meta property="og:locale:alternate"[^>]*>/gi);
    const altLocales = Object.values(locales).filter((item) => item.ogLocale !== config.ogLocale).map((item) => `    <meta property="og:locale:alternate" content="${item.ogLocale}">`).join('\n');
    html = html.replace(/(<meta property="og:locale"[^>]*>)/i, `$1\n    <meta property="og:site_name" content="${escapeHtml(config.siteName)}">\n${altLocales}`);
    html = setTag(html, /<meta name="twitter:card"[^>]*>/i, '<meta name="twitter:card" content="summary_large_image">');
    html = setTag(html, /<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}">`);
    html = setTag(html, /<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}">`);
    html = setTag(html, /<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(image)}">`);
    html = setTag(html, /<meta property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${escapeHtml(current.name)}">`);

    html = removeHeadTags(html, /\s*<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>/gi);
    const icons = `    <link rel="icon" type="image/svg+xml" href="${basePath}assets/favicon/favicon.svg">
    <link rel="icon" type="image/png" sizes="96x96" href="${basePath}assets/favicon/favicon-96x96.png">
    <link rel="apple-touch-icon" href="${basePath}assets/favicon/apple-touch-icon.png">
    <link rel="manifest" href="${basePath}assets/favicon/site.webmanifest">`;
    html = html.replace('</head>', `${icons}\n    <script src="../../assets/js/site-config.js"></script>\n</head>`);
    if (!html.includes('pagead2.googlesyndication.com')) html = html.replace('<meta charset="UTF-8">', `${trackingScripts()}\n    <meta charset="UTF-8">`);

    html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, (match, raw) => {
        try {
            const data = JSON.parse(raw);
            data.name = current.name;
            data.description = description;
            data.url = canonical;
            data.image = image;
            data.mainEntityOfPage = canonical;
            data.provider = { '@type': 'Organization', name: config.siteName, url: config.home };
            data.typicalAgeRange = copy[locale].ages[current.level] || undefined;
            return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
        } catch {
            return match;
        }
    });

    html = html.replace(/<body class="([^"]*)"/i, (match, classes) => `<body class="${classes.includes('pt-') ? classes : `${classes} pt-[36px]`}"`);
    html = html.replace(/<header[\s\S]*?<\/header>/i, header(html, locale, config));
    html = html.replace(/\s*<!-- STRONG_DETAIL_START -->[\s\S]*?<!-- STRONG_DETAIL_END -->\s*/gi, '\n');
    html = html.replace(/<a class="text-sm font-bold text-indigo-700 hover:underline" href="[^"]+">[\s\S]*?<\/a>/i, breadcrumb(current, config));
    html = html.replace(/(<\/article>\s*)(<\/main>)/i, `$1${strongDetail(current, pages, locale, config, description)}\n    $2`);
    html = html.replace(/\s*<footer data-activity-footer[\s\S]*?<\/footer>\s*<script data-activity-helper>[\s\S]*?<\/script>/gi, '');
    html = html.replace('</main>', `</main>\n${footer(locale, config)}`);

    await writeFile(file, html);
}

for (const [locale, config] of Object.entries(locales)) {
    const directory = path.join(root, config.directory);
    const files = (await readdir(directory)).filter((name) => name.endsWith('.html'));
    const pages = [];
    for (const name of files) {
        const file = path.join(directory, name);
        pages.push(pageMeta(await readFile(file, 'utf8'), name));
    }
    for (const name of files) await finalizePage(path.join(directory, name), locale, config, pages);
}

console.log('Finalized and strengthened generated activity pages.');
