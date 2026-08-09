// =============================================================================
// translations.js – VinMat's World for Kids
// Přidávej sem překlady kategorií, podkategorií a rozšířených filtrů.
// index.html tento soubor načte automaticky.
// =============================================================================

// ─── KATEGORIE ────────────────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "kategorie"
// Číslo = ID série (1000, 2000, …) – jen pro orientaci
const katPreklady = {
    'zvirata':      { en: '🐾 Domestic & Forest Animals',          cz: '🐾 Domácí a lesní zvířata',          de: '🐾 Haus- und Waldtiere', es: '🐾 Animales domésticos y del bosque' },           // 1000
    'doprava':      { en: '🚗 Transport & Machines',               cz: '🚗 Dopravní prostředky a stroje',    de: '🚗 Fahrzeuge und Maschinen', es: '🚗 Transporte y máquinas' },     // 2000
    'dinosauri':    { en: '🦕 Dinosaurs & Prehistory',             cz: '🦕 Dinosauři a pravěk',              de: '🦕 Dinosaurier und Urzeit', es: '🦕 Dinosaurios y prehistoria' },               // 3000
    'exoticka':     { en: '🦁 Exotic Animals & Ocean World',       cz: '🦁 Exotická zvířata a mořský svět',  de: '🦁 Exotische Tiere und Meereswelt', es: '🦁 Animales exóticos y mundo marino' },   // 4000
    'pohadky':      { en: '🧚 Fairy Tales, Fantasy & Mythology',   cz: '🧚 Pohádky, fantasy a mýtická stvoření', de: '🧚 Märchen, Fantasy und Mythologie', es: '🧚 Cuentos, fantasía y mitología' }, // 5000
    'povolani':     { en: '👷 Jobs & Family',                      cz: '👷 Lidská povolání a rodina',        de: '👷 Berufe und Familie', es: '👷 Profesiones y familia' },         // 6000
    'architektura': { en: '🏛️ Architecture',                       cz: '🏛️ Architektura',                   de: '🏛️ Architektur', es: '🏛️ Arquitectura' },                    // 7000
    'vesmir':       { en: '🚀 Space & Sci-Fi',                     cz: '🚀 Vesmír a sci-fi',                 de: '🚀 Weltraum und Science-Fiction', es: '🚀 Espacio y ciencia ficción' },                  // 8000
    'flora':        { en: '🌸 Flora & Flowers',                    cz: '🌸 Flora a květiny',                 de: '🌸 Flora und Blumen', es: '🌸 Flora y flores' },                  // 9000
    'svatky':       { en: '🎄 Holidays, Traditions & Seasons',     cz: '🎄 Svátky, tradice a roční období',  de: '🎄 Feiertage, Traditionen und Jahreszeiten', es: '🎄 Festividades, tradiciones y estaciones' },   // 10000
    'sport':        { en: '⚽ Sport, Games & Leisure',             cz: '⚽ Sport, hry a volný čas',          de: '⚽ Sport, Spiele und Freizeit', es: '⚽ Deporte, juegos y ocio' },           // 11000
    'jidlo':        { en: '🍎 Food, Sweets & Cooking',             cz: '🍎 Jídlo, sladkosti a vaření',       de: '🍎 Essen, Süßigkeiten und Kochen', es: '🍎 Comida, dulces y cocina' },        // 12000
    'geometrie':    { en: '🔷 Geometry, Patterns & Mandalas',      cz: '🔷 Geometrie, vzory a mandaly',      de: '🔷 Geometrie, Muster und Mandalas', es: '🔷 Geometría, patrones y mandalas' },       // 13000
    'zemepi':       { en: '🗺️ Geography, Maps & Travel',           cz: '🗺️ Zeměpis, mapy a cestování',      de: '🗺️ Geografie, Karten und Reisen', es: '🗺️ Geografía, mapas y viajes' },       // 14000
};

// ─── PODKATEGORIE ─────────────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "podkategorie"
const podkatPreklady = {
  // 1000 – Domácí a lesní zvířata
    'domaci-zvirata':   { en: '🐕 Pets',            cz: '🐕 Domácí zvířátka', de: '🐕 Haustiere', es: '🐕 Mascotas' },
    'lesni-zvirata':    { en: '🦊 Forest Animals',  cz: '🦊 Lesní zvířátka', de: '🦊 Waldtiere', es: '🦊 Animales del bosque' },
    'hmyz':             { en: '🐛 Insects',          cz: '🐛 Hmyz', de: '🐛 Insekten', es: '🐛 Insectos' },
    'lucni': { en: '🦋 Meadow Creatures', cz: '🦋 Luční zvířátka', de: '🦋 Wiesentiere', es: '🦋 Criaturas del prado' },
  // 2000 – Doprava
    'vlaky':            { en: '🚂 Trains',           cz: '🚂 Vlaky', de: '🚂 Züge', es: '🚂 Trenes' },
    'auta':             { en: '🚗 Cars',             cz: '🚗 Auta', de: '🚗 Autos', es: '🚗 Coches' },
    'letadla':          { en: '✈️ Aircraft',          cz: '✈️ Letadla', de: '✈️ Flugzeuge', es: '✈️ Aviones' },
    'lode':             { en: '🚢 Ships',            cz: '🚢 Lodě', de: '🚢 Schiffe', es: '🚢 Barcos' },
  // 4000 – Exotická a mořská
    'morska-zvirata':   { en: '🐟 Sea Animals',     cz: '🐟 Mořská zvířátka', de: '🐟 Meerestiere', es: '🐟 Animales marinos' },
    'exoticka-zvirata': { en: '🦒 Exotic Animals',  cz: '🦒 Exotická zvířata', de: '🦒 Exotische Tiere', es: '🦒 Animales exóticos' },
  // 6000 – Povolání a rodina
    'rodina':           { en: '👨‍👩‍👧 Family',          cz: '👨‍👩‍👧 Rodina', de: '👨‍👩‍👧 Familie', es: '👨‍👩‍👧 Familia' },
	// 8000 – Vesmír a sci-fi
    'mise': { en: '🚀 Space Missions',         cz: '🚀 Vesmírné mise', de: '🚀 Weltraummissionen', es: '🚀 Misiones espaciales' },
    'astronomie':    { en: '🪐 Astronomy & Planets',    cz: '🪐 Astronomie a planety', de: '🪐 Astronomie und Planeten', es: '🪐 Astronomía y planetas' },
    'sci-fi':        { en: '👽 Sci-Fi & Aliens',        cz: '👽 Sci-Fi a mimozemšťané', de: '👽 Science-Fiction und Außerirdische', es: '👽 Ciencia ficción y extraterrestres' },
  // SEM PŘIDÁVEJ DALŠÍ PODKATEGORIE
};

// ─── SEZÓNA ───────────────────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "sezona"
const sezonaPreklady = {
    'jaro':      { en: '🌱 Spring',     cz: '🌱 Jaro', de: '🌱 Frühling', es: '🌱 Primavera' },
    'leto':      { en: '☀️ Summer',     cz: '☀️ Léto', de: '☀️ Sommer', es: '☀️ Verano' },
    'podzim':    { en: '🍂 Autumn',     cz: '🍂 Podzim', de: '🍂 Herbst', es: '🍂 Otoño' },
    'zima':      { en: '❄️ Winter',     cz: '❄️ Zima', de: '❄️ Winter', es: '❄️ Invierno' },
    'vanoce':    { en: '🎄 Christmas',  cz: '🎄 Vánoce', de: '🎄 Weihnachten', es: '🎄 Navidad' },
    'halloween': { en: '🎃 Halloween',  cz: '🎃 Halloween', de: '🎃 Halloween', es: '🎃 Halloween' },
    'velikonoce':{ en: '🐣 Easter',     cz: '🐣 Velikonoce', de: '🐣 Ostern', es: '🐣 Pascua' },
};

// ─── VZDĚLÁVACÍ ZAMĚŘENÍ ──────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "zamereni"
const zamereniPreklady = {
    'logicke-mysleni': { en: '🧠 Logical Thinking',    cz: '🧠 Logické myšlení', de: '🧠 Logisches Denken', es: '🧠 Pensamiento lógico' },
    'pocitani':        { en: '🔢 Counting',             cz: '🔢 Počítání', de: '🔢 Zählen', es: '🔢 Contar' },
    'pismena':         { en: '🔤 Letters & ABC',        cz: '🔤 Písmena a abeceda', de: '🔤 Buchstaben und ABC', es: '🔤 Letras y abecedario' },
    'jemna-motorika':  { en: '✏️ Fine Motor Skills',    cz: '✏️ Jemná motorika', de: '✏️ Feinmotorik', es: '✏️ Motricidad fina' },
    'barvy':           { en: '🎨 Colors',               cz: '🎨 Barvy', de: '🎨 Farben', es: '🎨 Colores' },
    'tvary':           { en: '🔷 Shapes',               cz: '🔷 Tvary', de: '🔷 Formen', es: '🔷 Formas' },
};
