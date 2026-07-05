// =============================================================================
// translations.js – VinMat's World for Kids
// Přidávej sem překlady kategorií, podkategorií a rozšířených filtrů.
// index.html tento soubor načte automaticky.
// =============================================================================

// ─── KATEGORIE ────────────────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "kategorie"
// Číslo = ID série (1000, 2000, …) – jen pro orientaci
const katPreklady = {
    'zvirata':      { en: '🐾 Domestic & Forest Animals',          cz: '🐾 Domácí a lesní zvířata' },           // 1000
    'doprava':      { en: '🚗 Transport & Machines',               cz: '🚗 Dopravní prostředky a stroje' },     // 2000
    'dinosauri':    { en: '🦕 Dinosaurs & Prehistory',             cz: '🦕 Dinosauři a pravěk' },               // 3000
    'exoticka':     { en: '🦁 Exotic Animals & Ocean World',       cz: '🦁 Exotická zvířata a mořský svět' },   // 4000
    'pohadky':      { en: '🧚 Fairy Tales, Fantasy & Mythology',   cz: '🧚 Pohádky, fantasy a mýtická stvoření' }, // 5000
    'povolani':     { en: '👷 Jobs & Family',                      cz: '👷 Lidská povolání a rodina' },         // 6000
    'architektura': { en: '🏛️ Architecture',                       cz: '🏛️ Architektura' },                    // 7000
    'vesmir':       { en: '🚀 Space & Sci-Fi',                     cz: '🚀 Vesmír a sci-fi' },                  // 8000
    'flora':        { en: '🌸 Flora & Flowers',                    cz: '🌸 Flora a květiny' },                  // 9000
    'svatky':       { en: '🎄 Holidays, Traditions & Seasons',     cz: '🎄 Svátky, tradice a roční období' },   // 10000
    'sport':        { en: '⚽ Sport, Games & Leisure',             cz: '⚽ Sport, hry a volný čas' },           // 11000
    'jidlo':        { en: '🍎 Food, Sweets & Cooking',             cz: '🍎 Jídlo, sladkosti a vaření' },        // 12000
    'geometrie':    { en: '🔷 Geometry, Patterns & Mandalas',      cz: '🔷 Geometrie, vzory a mandaly' },       // 13000
    'zemepi':       { en: '🗺️ Geography, Maps & Travel',           cz: '🗺️ Zeměpis, mapy a cestování' },       // 14000
};

// ─── PODKATEGORIE ─────────────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "podkategorie"
const podkatPreklady = {
  // 1000 – Domácí a lesní zvířata
    'domaci-zvirata':   { en: '🐕 Pets',            cz: '🐕 Domácí zvířátka' },
    'lesni-zvirata':    { en: '🦊 Forest Animals',  cz: '🦊 Lesní zvířátka' },
    'hmyz':             { en: '🐛 Insects',          cz: '🐛 Hmyz' },
  // 2000 – Doprava
    'vlaky':            { en: '🚂 Trains',           cz: '🚂 Vlaky' },
    'auta':             { en: '🚗 Cars',             cz: '🚗 Auta' },
    'letadla':          { en: '✈️ Aircraft',          cz: '✈️ Letadla' },
    'lode':             { en: '🚢 Ships',            cz: '🚢 Lodě' },
  // 4000 – Exotická a mořská
    'morska-zvirata':   { en: '🐟 Sea Animals',     cz: '🐟 Mořská zvířátka' },
    'exoticka-zvirata': { en: '🦒 Exotic Animals',  cz: '🦒 Exotická zvířata' },
  // 6000 – Povolání a rodina
    'rodina':           { en: '👨‍👩‍👧 Family',          cz: '👨‍👩‍👧 Rodina' },
  // SEM PŘIDÁVEJ DALŠÍ PODKATEGORIE
};

// ─── SEZÓNA ───────────────────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "sezona"
const sezonaPreklady = {
    'jaro':      { en: '🌱 Spring',     cz: '🌱 Jaro' },
    'leto':      { en: '☀️ Summer',     cz: '☀️ Léto' },
    'podzim':    { en: '🍂 Autumn',     cz: '🍂 Podzim' },
    'zima':      { en: '❄️ Winter',     cz: '❄️ Zima' },
    'vanoce':    { en: '🎄 Christmas',  cz: '🎄 Vánoce' },
    'halloween': { en: '🎃 Halloween',  cz: '🎃 Halloween' },
    'velikonoce':{ en: '🐣 Easter',     cz: '🐣 Velikonoce' },
};

// ─── VZDĚLÁVACÍ ZAMĚŘENÍ ──────────────────────────────────────────────────────
// Klíč = hodnota v CSV sloupci "zamereni"
const zamereniPreklady = {
    'logicke-mysleni': { en: '🧠 Logical Thinking',    cz: '🧠 Logické myšlení' },
    'pocitani':        { en: '🔢 Counting',             cz: '🔢 Počítání' },
    'pismena':         { en: '🔤 Letters & ABC',        cz: '🔤 Písmena a abeceda' },
    'jemna-motorika':  { en: '✏️ Fine Motor Skills',    cz: '✏️ Jemná motorika' },
    'barvy':           { en: '🎨 Colors',               cz: '🎨 Barvy' },
    'tvary':           { en: '🔷 Shapes',               cz: '🔷 Tvary' },
};
