import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const publicRoot = path.join(root, 'public');
const csvTypes = ['bludiste', 'omalovanky', 'spojovacky'];
const baseColumns = ['ID', 'soubor', 'kategorie', 'podkategorie', 'datumPridani', 'sezona', 'zamereni'];
const locales = [
    { code: 'en', column: 'En', dictionaryCode: 'en', state: 'active', label: 'EN' },
    { code: 'cs', column: 'Cz', dictionaryCode: 'cz', state: 'active', label: 'CZ' },
    { code: 'de', column: 'De', dictionaryCode: 'de', state: 'planned', label: 'DE' },
    { code: 'es', column: 'Es', dictionaryCode: 'es', state: 'planned', label: 'ES' }
];
const dictionaryFields = [
    ['kategorie', 'katPreklady', 'Kategorie'],
    ['podkategorie', 'podkatPreklady', 'Podkategorie'],
    ['sezona', 'sezonaPreklady', 'Sezóna'],
    ['zamereni', 'zamereniPreklady', 'Zaměření']
];
const productTypes = { maze: 'bludiste', 'multi-maze': 'bludiste', 'coloring-page': 'omalovanky', 'dot-to-dot': 'spojovacky' };
const variantColumns = { colored: 'colored', coloring: 'coloring', 'partly-colored': 'partly_colored' };

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function parseCsvRow(text) {
    const values = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        if (character === '"') {
            if (quoted && text[index + 1] === '"') {
                current += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (character === ',' && !quoted) {
            values.push(current.trim());
            current = '';
        } else {
            current += character;
        }
    }
    values.push(current.trim());
    return values;
}

function splitValues(value) {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function isFilled(value) {
    return Boolean(String(value || '').trim()) && String(value).trim() !== '0';
}

function identityFromFileBase(fileBase) {
    return String(fileBase || '').match(/^(lv[1-5]_[a-z0-9]+_\d+(?:_\d+)?)/i)?.[1] || '';
}

async function readCsv(type) {
    const filename = path.join(root, 'assets', 'data', `${type}.csv`);
    const lines = (await readFile(filename, 'utf8')).replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
    const headers = parseCsvRow(lines.shift());
    const rows = lines.map((line, lineIndex) => {
        const cells = parseCsvRow(line);
        return { line: lineIndex + 2, row: Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])) };
    });
    return { type, filename, headers, rows };
}

async function readDictionaries() {
    const source = await readFile(path.join(root, 'translations.js'), 'utf8');
    const context = {};
    vm.runInNewContext(`${source}\nglobalThis.__vinMatDictionaries = { katPreklady, podkatPreklady, sezonaPreklady, zamereniPreklady };`, context, { filename: 'translations.js' });
    return context.__vinMatDictionaries;
}

async function walk(directory) {
    const result = [];
    for (const entry of await readdir(directory)) {
        const filename = path.join(directory, entry);
        const details = await stat(filename);
        if (details.isDirectory()) result.push(...await walk(filename));
        else result.push(filename);
    }
    return result;
}

function parseLocalizedImage(relative) {
    const basename = path.basename(relative);
    const match = basename.match(/^(?<identity>lv[1-5]_[a-z0-9]+_\d+(?:_\d+)?)_(?<locale>en|cs|de|es)-(?<subject>.+)-(?<product>multi-maze|maze|coloring-page|dot-to-dot)(?:-(?<variant>colored|coloring|partly-colored))?\.(?<extension>png|webp)$/i);
    if (!match) return null;
    const { identity, locale, product, variant, extension } = match.groups;
    return { identity, locale: locale.toLowerCase(), product, variant: variant || 'coloring', extension: extension.toLowerCase() };
}

function statusText(severity) {
    return severity === 'error' ? 'Chyba' : severity === 'warning' ? 'Upozornění' : 'Informace';
}

function renderReport(report) {
    const counts = ['error', 'warning', 'info'].map((severity) => report.items.filter((item) => item.severity === severity).length);
    const classes = { error: 'error', warning: 'warning', info: 'info' };
    const countLabels = { error: 'chyb', warning: 'upozornění', info: 'informací' };
    const cards = ['error', 'warning', 'info'].map((severity, index) => `<div class="count ${classes[severity]}"><strong>${counts[index]}</strong><span>${countLabels[severity]}</span></div>`).join('');
    const items = report.items.length
        ? report.items.map((item) => `<article class="item ${classes[item.severity]}"><span class="badge">${statusText(item.severity)}</span><div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.detail)}</p></div></article>`).join('\n')
        : '<article class="empty"><h2>Všechno je v pořádku.</h2><p>Kontrola nenašla žádný problém.</p></article>';
    return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Kontrola obsahu | VinMat’s World for Kids</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#667085; --line:#e5e7eb; --bg:#f7f8fc; }
    * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { max-width:1040px; margin:0 auto; padding:40px 20px 72px; } h1 { margin:0; font-size:clamp(28px,5vw,44px); line-height:1.1; } .intro { color:var(--muted); margin:12px 0 28px; max-width:760px; }
    .counts { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:28px; } .count { border-radius:16px; padding:18px; background:white; border:1px solid var(--line); display:flex; gap:9px; align-items:baseline; } .count strong { font-size:28px; } .count span { color:var(--muted); text-transform:uppercase; font-size:11px; font-weight:800; letter-spacing:.06em; }
    .count.error { border-color:#fecaca; } .count.warning { border-color:#fde68a; } .count.info { border-color:#bfdbfe; }
    .item,.empty { display:flex; gap:14px; background:white; border:1px solid var(--line); border-left-width:5px; border-radius:12px; padding:16px 18px; margin:10px 0; } .item.error { border-left-color:#ef4444; } .item.warning { border-left-color:#f59e0b; } .item.info { border-left-color:#3b82f6; } .badge { flex:0 0 auto; height:max-content; border-radius:99px; padding:3px 8px; background:#eef2ff; color:#3730a3; font-size:11px; font-weight:800; text-transform:uppercase; } h2 { margin:0; font-size:16px; } p { margin:4px 0 0; color:#475467; white-space:pre-wrap; } footer { color:var(--muted); font-size:13px; margin-top:28px; }
    @media (max-width:560px) { .counts { grid-template-columns:1fr; } main { padding-top:28px; } }
  </style>
</head>
<body><main>
  <h1>Kontrola obsahu</h1>
  <p class="intro">Automaticky vytvořeno z aktuální verze obsahu. Kontrola neblokuje zveřejnění webu; ukazuje, co je potřeba doplnit.</p>
  <section class="counts" aria-label="Souhrn">${cards}</section>
  <section aria-label="Výsledky">${items}</section>
  <footer>Kontroluje CSV, slovníky, nové lokalizované PNG/WebP soubory a jejich metadata. Stávající soubory bez jazykového kódu jsou vedeny jako dosavadní struktura, nikoli jako chyba.</footer>
</main></body></html>`;
}

async function main() {
    const report = { items: [] };
    const add = (severity, title, detail) => report.items.push({ severity, title, detail });
    const data = await Promise.all(csvTypes.map(readCsv));
    const activities = new Map();

    for (const csv of data) {
        for (const column of baseColumns) if (!csv.headers.includes(column)) add('error', `CSV ${csv.type}: chybí sloupec ${column}`, 'Doplň přesně tento název sloupce.');
        const seenFileBases = new Set();
        for (const { line, row } of csv.rows) {
            const identity = identityFromFileBase(row.soubor);
            if (!identity) add('error', `CSV ${csv.type}, řádek ${line}: neplatný soubor`, `Hodnota „${row.soubor}“ musí začínat například lv1_gem_1001.`);
            if (seenFileBases.has(row.soubor)) add('error', `CSV ${csv.type}, řádek ${line}: duplicitní soubor`, `Hodnota „${row.soubor}“ se smí objevit jen jednou.`);
            seenFileBases.add(row.soubor);
            if (identity) activities.set(`${csv.type}|${identity}`, { type: csv.type, line, row, csv });
        }
    }

    const dictionaries = await readDictionaries();
    const availableLocales = locales.filter((locale) => locale.state === 'active' || data.some((csv) => csv.headers.includes(`nazev${locale.column}`)));
    for (const [field, dictionaryName, fieldLabel] of dictionaryFields) {
        const values = new Set(data.flatMap((csv) => csv.rows.flatMap(({ row }) => splitValues(row[field]))));
        const dictionary = dictionaries[dictionaryName] || {};
        for (const value of values) {
            const missing = availableLocales.filter((locale) => !isFilled(dictionary[value]?.[locale.dictionaryCode]));
            if (!missing.length) continue;
            const activeMissing = missing.filter((locale) => locale.state === 'active');
            const plannedMissing = missing.filter((locale) => locale.state === 'planned');
            if (activeMissing.length) add('error', `Slovník – ${fieldLabel}: „${value}“`, `Nepřeloženo do: ${activeMissing.map((locale) => locale.label).join(', ')}.`);
            if (plannedMissing.length) add('warning', `Slovník – ${fieldLabel}: „${value}“`, `Doplň před spuštěním jazyka: ${plannedMissing.map((locale) => locale.label).join(', ')}.`);
        }
    }

    const files = await walk(publicRoot);
    const localizedGroups = new Map();
    let legacyFiles = 0;
    for (const filename of files) {
        if (!/\.(png|webp)$/i.test(filename)) continue;
        const relative = path.relative(root, filename).split(path.sep).join('/');
        const parsed = parseLocalizedImage(relative);
        if (!parsed) { legacyFiles += 1; continue; }
        const key = `${productTypes[parsed.product]}|${parsed.identity}|${parsed.locale}|${parsed.variant}`;
        const group = localizedGroups.get(key) || { ...parsed, files: [], paths: [] };
        group.files.push(parsed.extension);
        group.paths.push(relative);
        localizedGroups.set(key, group);
    }
    if (legacyFiles) add('info', 'Dosavadní obrázky', `${legacyFiles} souborů ještě používá původní strukturu bez jazykového kódu. Nejde o chybu; budou převedeny při vytváření lokalizovaných verzí.`);

    for (const group of localizedGroups.values()) {
        const type = productTypes[group.product];
        const activity = activities.get(`${type}|${group.identity}`);
        const expectedPathPart = `public/${type}/${group.locale}/`;
        if (!group.paths.every((item) => item.startsWith(expectedPathPart))) add('error', `Obrázek ${group.identity} / ${group.locale.toUpperCase()}: špatná složka`, `Použij public/${type}/${group.locale}/<aktivita>/...`);
        if (!activity) {
            add('error', `Obrázek ${group.identity} / ${group.locale.toUpperCase()}: aktivita není v CSV`, `Produkt ${group.product} patří do ${type}. Doplň řádek do assets/data/${type}.csv.`);
            continue;
        }
        const locale = locales.find((item) => item.code === group.locale);
        const titleColumn = `nazev${locale.column}`;
        const altColumn = `alt${locale.column}_${variantColumns[group.variant]}`;
        if (!activity.csv.headers.includes(titleColumn)) add('error', `CSV ${type}: chybí sloupec ${titleColumn}`, `Existuje obrázek ${group.locale.toUpperCase()}, proto je tento sloupec povinný.`);
        else if (!isFilled(activity.row[titleColumn])) add('error', `Aktivita ${group.identity} / ${group.locale.toUpperCase()}: chybí ${titleColumn}`, `Doplň název na řádku ${activity.line} v ${type}.csv.`);
        if (!activity.csv.headers.includes(altColumn)) add('error', `CSV ${type}: chybí sloupec ${altColumn}`, `Existuje varianta ${group.variant}.`);
        else if (!isFilled(activity.row[altColumn])) add('error', `Aktivita ${group.identity} / ${group.locale.toUpperCase()}: chybí ${altColumn}`, `Doplň ALT text na řádku ${activity.line} v ${type}.csv.`);
        if (!group.files.includes('png')) add('error', `Obrázek ${group.identity} / ${group.locale.toUpperCase()}: chybí PNG`, 'Pro každou lokalizovanou variantu nahraj PNG i WebP.');
        if (!group.files.includes('webp')) add('error', `Obrázek ${group.identity} / ${group.locale.toUpperCase()}: chybí WebP`, 'Pro každou lokalizovanou variantu nahraj PNG i WebP.');
    }

    await writeFile(path.join(root, 'content-check.html'), renderReport(report));
    const counts = ['error', 'warning', 'info'].map((severity) => report.items.filter((item) => item.severity === severity).length);
    console.log(`Content check: ${counts[0]} errors, ${counts[1]} warnings, ${counts[2]} info.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
