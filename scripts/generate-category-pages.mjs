import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const base = 'https://vinmat.eu/worldforkids';

const locales = {
  en: {
    dir: 'activities', home: '/', activityLabel: 'Activities', browseTitle: 'Browse printable activities',
    intro: 'Choose a category to browse printable worksheets with direct links to every available activity.',
    privacy: '/privacy.html', terms: '/terms.html', privacyLabel: 'Privacy', termsLabel: 'Terms of Use', back: 'Back to all activities', guide: 'Read the practical guide', free: 'Free printable',
  },
  cs: {
    dir: 'cs/aktivity', home: '/cs/', activityLabel: 'Aktivity', browseTitle: 'Procházet pracovní listy',
    intro: 'Vyberte kategorii a prohlédněte si pracovní listy s přímými odkazy na všechny dostupné aktivity.',
    privacy: '/cs/zasady-ochrany-osobnich-udaju.html', terms: '/cs/podminky-uziti.html', privacyLabel: 'Ochrana soukromí', termsLabel: 'Podmínky užití', back: 'Zpět na všechny aktivity', guide: 'Praktický průvodce', free: 'Zdarma k vytisknutí',
  },
  de: {
    dir: 'de/aktivitaeten', home: '/de/', activityLabel: 'Aktivitäten', browseTitle: 'Druckvorlagen nach Kategorie',
    intro: 'Wähle eine Kategorie und öffne die verfügbaren Druckvorlagen direkt über die statischen Links.',
    privacy: '/de/datenschutz.html', terms: '/de/nutzungsbedingungen.html', privacyLabel: 'Datenschutz', termsLabel: 'Nutzungsbedingungen', back: 'Zurück zu allen Aktivitäten', guide: 'Praktischen Ratgeber lesen', free: 'Kostenlose Druckvorlage',
  },
  es: {
    dir: 'es/actividades', home: '/es/', activityLabel: 'Actividades', browseTitle: 'Fichas imprimibles por categoría',
    intro: 'Elige una categoría y abre las fichas disponibles mediante enlaces directos a cada actividad.',
    privacy: '/es/privacidad.html', terms: '/es/terminos-de-uso.html', privacyLabel: 'Privacidad', termsLabel: 'Términos de uso', back: 'Volver a todas las actividades', guide: 'Leer la guía práctica', free: 'Ficha gratuita',
  }
};

const categories = {
  coloring: {
    prefixes: { en: 'coloring-', cs: 'omalovanka-', de: 'ausmalbild-', es: 'dibujo-' },
    files: { en: 'coloring-pages.html', cs: 'cs/omalovanky.html', de: 'de/ausmalbilder.html', es: 'es/dibujos-para-colorear.html' },
    guides: { en: '/guide-coloring.html', cs: '/cs/pruvodce-omalovanky.html', de: '/de/anleitung-ausmalbilder.html', es: '/es/guia-dibujos.html' },
    icon: '🎨',
    title: { en: 'Free Printable Coloring Pages for Kids', cs: 'Omalovánky pro děti k vytisknutí zdarma', de: 'Kostenlose Ausmalbilder für Kinder zum Ausdrucken', es: 'Dibujos para colorear gratis para imprimir' },
    desc: {
      en: 'Browse free printable coloring pages organized into clear difficulty levels. Open any picture to see its full-size preview, suggested age, printing information and download option.',
      cs: 'Prohlédněte si omalovánky zdarma rozdělené do přehledných úrovní obtížnosti. U každého obrázku najdete velký náhled, doporučený věk, informace k tisku a možnost stažení.',
      de: 'Entdecke kostenlose Ausmalbilder in klaren Schwierigkeitsstufen. Jede Vorlage führt zu einer Detailseite mit großem Bild, Altersempfehlung, Druckhinweisen und Download.',
      es: 'Explora dibujos para colorear gratuitos organizados por niveles de dificultad. Cada ficha enlaza a una página con vista grande, edad recomendada, consejos de impresión y descarga.'
    }
  },
  mazes: {
    prefixes: { en: 'maze-', cs: 'bludiste-', de: 'labyrinth-', es: 'laberinto-' },
    files: { en: 'mazes.html', cs: 'cs/bludiste.html', de: 'de/labyrinthe.html', es: 'es/laberintos.html' },
    guides: { en: '/guide-mazes.html', cs: '/cs/pruvodce-bludiste.html', de: '/de/anleitung-labyrinthe.html', es: '/es/guia-laberintos.html' },
    icon: '🧩',
    title: { en: 'Free Printable Mazes for Kids', cs: 'Bludiště pro děti k vytisknutí zdarma', de: 'Kostenlose Labyrinthe für Kinder zum Ausdrucken', es: 'Laberintos para niños gratis para imprimir' },
    desc: {
      en: 'Browse illustrated printable mazes from simple routes for younger children to more challenging layouts. Each maze has its own detail page with level, suggested age and printable file.',
      cs: 'Prohlédněte si ilustrovaná bludiště od jednoduchých cest pro menší děti po náročnější varianty. Každé bludiště má vlastní stránku s úrovní, doporučeným věkem a souborem k tisku.',
      de: 'Entdecke illustrierte Labyrinthe von einfachen Wegen für jüngere Kinder bis zu anspruchsvolleren Varianten. Jede Aufgabe hat eine eigene Seite mit Stufe, Altersempfehlung und Druckdatei.',
      es: 'Explora laberintos ilustrados desde recorridos sencillos para niños pequeños hasta diseños más difíciles. Cada actividad tiene su página con nivel, edad recomendada y archivo imprimible.'
    }
  },
  dots: {
    prefixes: { en: 'dot-to-dot-', cs: 'spojovacka-', de: 'punkte-verbinden-', es: 'une-puntos-' },
    files: { en: 'dot-to-dot.html', cs: 'cs/spojovacky.html', de: 'de/punkte-verbinden.html', es: 'es/unir-puntos.html' },
    guides: { en: '/guide-dot-to-dot.html', cs: '/cs/pruvodce-spojovacky.html', de: '/de/anleitung-punkte-verbinden.html', es: '/es/guia-unir-puntos.html' },
    icon: '🔢',
    title: { en: 'Free Printable Dot-to-Dot Worksheets', cs: 'Spojovačky pro děti k vytisknutí zdarma', de: 'Kostenlose Punkt-zu-Punkt-Bilder zum Ausdrucken', es: 'Fichas de unir puntos gratis para imprimir' },
    desc: {
      en: 'Browse printable dot-to-dot worksheets with difficulty matched to different ages. Open a worksheet for the full preview, level information, suggested age and direct printable download.',
      cs: 'Prohlédněte si spojovačky s obtížností přizpůsobenou různému věku. Na detailu pracovního listu najdete celý náhled, úroveň, doporučený věk a přímé stažení k tisku.',
      de: 'Entdecke Punkt-zu-Punkt-Vorlagen mit unterschiedlichen Schwierigkeitsstufen. Die Detailseite zeigt Vorschau, Stufe, Altersempfehlung und den direkten Download zum Ausdrucken.',
      es: 'Explora fichas de unir puntos con distintos niveles de dificultad. La página de cada ficha muestra la vista completa, el nivel, la edad recomendada y la descarga para imprimir.'
    }
  }
};

function escapeHtml(value = '') {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
function attr(html, name) {
  return html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, 'i'))?.[1] || '';
}
function extract(html, regex) { return html.match(regex)?.[1]?.trim() || ''; }
function absolute(file) { return `${base}/${file}`; }

async function collect(locale, category) {
  const cfg = locales[locale];
  const cat = categories[category];
  const entries = await readdir(path.join(root, cfg.dir));
  const prefix = cat.prefixes[locale];
  const matches = entries.filter((name) => name.endsWith('.html') && name.startsWith(prefix)).sort();
  const items = [];
  for (const name of matches) {
    const html = await readFile(path.join(root, cfg.dir, name), 'utf8');
    const title = extract(html, /<h1\b[^>]*>([^<]+)<\/h1>/i);
    const meta = attr(html, 'description') || extract(html, /<p class="mt-4 text-slate-600 leading-relaxed">([^<]+)<\/p>/i);
    const image = extract(html, /<source\s+srcset="([^"]+)"\s+type="image\/webp"/i) || extract(html, /<img\s+src="([^"]+)"/i);
    const level = extract(html, /<p class="text-xs font-bold text-slate-400 uppercase tracking-wider">([^<]+)<\/p>/i);
    items.push({ title, meta, image, level, href: `/${cfg.dir}/${name}` });
  }
  return items;
}

function langLinks(category) {
  const cat = categories[category];
  const tags = { en:'en', cs:'cs', de:'de', es:'es' };
  return Object.entries(tags).map(([loc, tag]) => `<link rel="alternate" hreflang="${tag}" href="${absolute(cat.files[loc])}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${absolute(cat.files.en)}">`;
}

function cards(items, cfg) {
  return items.map((item) => `<a href="${base}${item.href}" class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
    <div class="bg-slate-50 aspect-[4/5] flex items-center justify-center overflow-hidden"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" width="480" height="600" class="w-full h-full object-contain group-hover:scale-[1.02] transition-transform"></div>
    <div class="p-4"><div class="text-[11px] uppercase tracking-wider font-bold text-indigo-600">${escapeHtml(item.level || cfg.free)}</div><h2 class="mt-1 text-base font-extrabold text-slate-900 leading-tight">${escapeHtml(item.title)}</h2><p class="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">${escapeHtml(item.meta)}</p></div>
  </a>`).join('\n');
}

function page(locale, category, items) {
  const cfg = locales[locale];
  const cat = categories[category];
  const current = absolute(cat.files[locale]);
  const count = items.length;
  const countText = locale === 'cs' ? `${count} dostupných pracovních listů` : locale === 'de' ? `${count} verfügbare Vorlagen` : locale === 'es' ? `${count} fichas disponibles` : `${count} worksheets available`;
  const jsonLd = JSON.stringify({ '@context':'https://schema.org', '@type':'CollectionPage', name:cat.title[locale], url:current, description:cat.desc[locale], inLanguage:locale === 'cs' ? 'cs' : locale, mainEntity:{ '@type':'ItemList', numberOfItems:count, itemListElement:items.map((item,i)=>({ '@type':'ListItem', position:i+1, url:`${base}${item.href}`, name:item.title })) } });
  return `<!DOCTYPE html>
<html lang="${locale === 'cs' ? 'cs' : locale}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(cat.title[locale])} | VinMat</title>
<meta name="description" content="${escapeHtml(cat.desc[locale])}"><meta name="robots" content="index, follow">
<link rel="canonical" href="${current}">
${langLinks(category)}
<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(cat.title[locale])} | VinMat"><meta property="og:description" content="${escapeHtml(cat.desc[locale])}"><meta property="og:url" content="${current}"><meta property="og:image" content="${base}/assets/images/banner.png">
<script type="application/ld+json">${jsonLd}</script>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
<header class="bg-slate-900 text-white"><div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4"><a href="${base}${cfg.home}" class="font-black text-lg">VinMat's World for Kids</a><a href="${base}${cfg.home}" class="text-sm font-bold text-slate-300 hover:text-white">← ${cfg.back}</a></div></header>
<main class="max-w-7xl mx-auto px-4 py-10">
<nav class="text-xs font-semibold text-slate-500 mb-6"><a href="${base}${cfg.home}" class="hover:text-indigo-700">${cfg.activityLabel}</a> <span class="mx-2">›</span> <span>${escapeHtml(cat.title[locale])}</span></nav>
<section class="max-w-3xl"><div class="text-4xl mb-3">${cat.icon}</div><h1 class="text-3xl md:text-5xl font-black tracking-tight text-slate-900">${escapeHtml(cat.title[locale])}</h1><p class="mt-5 text-slate-600 text-lg leading-relaxed">${escapeHtml(cat.desc[locale])}</p><div class="mt-5 flex flex-wrap gap-3 items-center"><span class="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 text-sm font-bold">${countText}</span><a href="${base}${cat.guides[locale]}" class="rounded-full bg-white text-slate-700 border border-slate-200 px-4 py-2 text-sm font-bold hover:border-indigo-300">${cfg.guide} →</a></div></section>
<section class="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">${cards(items, cfg)}</section>
<section class="mt-12 bg-white border border-slate-200 rounded-2xl p-6 md:p-8"><h2 class="text-xl font-extrabold text-slate-900">${cfg.browseTitle}</h2><p class="mt-2 text-sm text-slate-600 leading-relaxed">${cfg.intro}</p><a href="${base}${cfg.home}" class="inline-block mt-4 text-indigo-700 font-bold hover:underline">${cfg.back} →</a></section>
</main>
<footer class="bg-slate-900 text-slate-400 text-sm mt-12"><div class="max-w-7xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-between"><span>© 2026 VinMat</span><span><a href="${base}${cfg.privacy}" class="hover:text-white">${cfg.privacyLabel}</a> · <a href="${base}${cfg.terms}" class="hover:text-white">${cfg.termsLabel}</a></span></div></footer>
</body></html>`;
}

function categoryNav(locale) {
  const cfg = locales[locale];
  const navCards = Object.values(categories).map((cat) => `<a href="${base}/${cat.files[locale]}" class="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all"><div class="text-2xl">${cat.icon}</div><div class="mt-2 font-extrabold text-slate-900">${escapeHtml(cat.title[locale])}</div></a>`).join('');
  return `<!-- CATEGORY_NAV_START --><section class="mb-8"><div class="mb-4"><h2 class="text-xl font-extrabold text-slate-900">${cfg.browseTitle}</h2><p class="text-sm text-slate-500 mt-1">${cfg.intro}</p></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4">${navCards}</div></section><!-- CATEGORY_NAV_END -->`;
}

async function injectHome(locale) {
  const file = path.join(root, locale === 'en' ? 'index.html' : `${locale}/index.html`);
  let html = await readFile(file, 'utf8');
  const block = categoryNav(locale);
  if (/<!-- CATEGORY_NAV_START -->[\s\S]*?<!-- CATEGORY_NAV_END -->/.test(html)) {
    html = html.replace(/<!-- CATEGORY_NAV_START -->[\s\S]*?<!-- CATEGORY_NAV_END -->/, block);
  } else if (html.includes('<!-- O PROJEKTU -->')) {
    html = html.replace('<!-- O PROJEKTU -->', `${block}\n\n<!-- O PROJEKTU -->`);
  } else {
    throw new Error(`About marker not found in ${file}`);
  }
  await writeFile(file, html);
}

for (const locale of Object.keys(locales)) {
  for (const category of Object.keys(categories)) {
    const items = await collect(locale, category);
    if (!items.length) throw new Error(`No ${category} items found for ${locale}`);
    const target = path.join(root, categories[category].files[locale]);
    await writeFile(target, page(locale, category, items));
  }
  await injectHome(locale);
}

let sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const cat of Object.values(categories)) {
  for (const file of Object.values(cat.files)) {
    const url = absolute(file);
    if (!sitemap.includes(`<loc>${url}</loc>`)) sitemap = sitemap.replace('</urlset>', `  <url><loc>${url}</loc></url>\n</urlset>`);
  }
}
await writeFile(path.join(root, 'sitemap.xml'), sitemap);
console.log('Generated 12 localized category pages, homepage category navigation and sitemap entries.');
