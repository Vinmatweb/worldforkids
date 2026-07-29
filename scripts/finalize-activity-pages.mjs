import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const basePath = '/worldforkids/';

const locales = {
    en: {
        directory: 'activities', htmlLang: 'en', ogLocale: 'en_US', siteName: "VinMat's World for Kids",
        home: '/worldforkids/', guide: '/worldforkids/guide-activities.html', levels: '/worldforkids/difficulty-levels.html', story: '/worldforkids/our-story.html',
        labels: { home: 'Home', guide: 'Activity Guide', levels: 'Difficulty Levels', story: 'Our Story', privacy: 'Privacy', terms: 'Terms of Use', contact: 'Contact', made: 'Made with ❤️ for creative learning', use: 'Free for personal and educational use', copied: '(Email copied!)' },
        title: (name, type) => `${name} – Free ${type} | VinMat`
    },
    cs: {
        directory: 'cs/aktivity', htmlLang: 'cs', ogLocale: 'cs_CZ', siteName: 'Vinmatův svět pro děti',
        home: '/worldforkids/cs/', guide: '/worldforkids/cs/pruvodce-aktivitami.html', levels: '/worldforkids/cs/urovne-obtiznosti.html', story: '/worldforkids/cs/nas-pribeh.html',
        labels: { home: 'Domů', guide: 'Průvodce aktivitami', levels: 'Úrovně obtížnosti', story: 'Náš příběh', privacy: 'Ochrana soukromí', terms: 'Podmínky užití', contact: 'Kontakt', made: 'Vytvořeno s ❤️ pro kreativní tvoření', use: 'Zdarma pro osobní a vzdělávací použití', copied: '(E-mail zkopírován!)' },
        title: (name, type) => `${name} – ${type} zdarma | VinMat`
    },
    de: {
        directory: 'de/aktivitaeten', htmlLang: 'de', ogLocale: 'de_DE', siteName: 'VinMats Welt für Kinder',
        home: '/worldforkids/de/', guide: '/worldforkids/de/anleitung-aktivitaeten.html', levels: '/worldforkids/de/schwierigkeitsstufen.html', story: '/worldforkids/de/unsere-geschichte.html',
        labels: { home: 'Startseite', guide: 'Aktivitäten-Guide', levels: 'Schwierigkeitsstufen', story: 'Unsere Geschichte', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', contact: 'Kontakt', made: 'Mit ❤️ gemacht für kreatives Gestalten', use: 'Kostenlos für private und pädagogische Nutzung', copied: '(E-Mail kopiert!)' },
        title: (name, type) => `${name} – ${type} kostenlos | VinMat`
    },
    es: {
        directory: 'es/actividades', htmlLang: 'es', ogLocale: 'es_ES', siteName: 'El mundo de VinMat para niños',
        home: '/worldforkids/es/', guide: '/worldforkids/es/guia-actividades.html', levels: '/worldforkids/es/niveles-dificultad.html', story: '/worldforkids/es/nuestra-historia.html',
        labels: { home: 'Inicio', guide: 'Guía de actividades', levels: 'Niveles de dificultad', story: 'Nuestra historia', privacy: 'Privacidad', terms: 'Términos de uso', contact: 'Contacto', made: 'Hecho con ❤️ para aprender y crear', use: 'Gratis para uso personal y educativo', copied: '(¡Correo copiado!)' },
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

async function finalizePage(file, locale, config) {
    let html = await readFile(file, 'utf8');
    const name = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 'Activity').replace(/<[^>]+>/g, '');
    const type = extract(html, /<p class="text-xs[^>]*>([^<·]+)\s*·/i, 'Activity');
    const description = extract(html, /<meta name="description" content="([^"]*)">/i, name);
    const image = extract(html, /<meta property="og:image" content="([^"]*)">/i);
    const canonical = extract(html, /<link rel="canonical" href="([^"]*)">/i);
    const title = config.title(name, type);

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(/<meta property="og:type" content="[^"]*">/i, '<meta property="og:type" content="article">');
    html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`);
    html = removeHeadTags(html, /\s*<meta property="og:site_name"[^>]*>/gi);
    html = removeHeadTags(html, /\s*<meta property="og:locale:alternate"[^>]*>/gi);
    const altLocales = Object.values(locales).filter((item) => item.ogLocale !== config.ogLocale).map((item) => `    <meta property="og:locale:alternate" content="${item.ogLocale}">`).join('\n');
    html = html.replace(/(<meta property="og:locale"[^>]*>)/i, `$1\n    <meta property="og:site_name" content="${config.siteName}">\n${altLocales}`);
    html = setTag(html, /<meta name="twitter:card"[^>]*>/i, '<meta name="twitter:card" content="summary_large_image">');
    html = setTag(html, /<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}">`);
    html = setTag(html, /<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}">`);
    html = setTag(html, /<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${image}">`);
    html = setTag(html, /<meta property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${name}">`);

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
            data.name = name;
            data.description = description;
            data.url = canonical;
            data.image = image;
            data.mainEntityOfPage = canonical;
            data.provider = { '@type': 'Organization', name: config.siteName, url: config.home };
            return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
        } catch {
            return match;
        }
    });

    html = html.replace(/<body class="([^"]*)"/i, (match, classes) => `<body class="${classes.includes('pt-') ? classes : `${classes} pt-[36px]`}"`);
    html = html.replace(/<header[\s\S]*?<\/header>/i, header(html, locale, config));
    html = html.replace(/\s*<footer data-activity-footer[\s\S]*?<\/footer>\s*<script data-activity-helper>[\s\S]*?<\/script>/gi, '');
    html = html.replace('</main>', `</main>\n${footer(locale, config)}`);

    await writeFile(file, html);
}

for (const [locale, config] of Object.entries(locales)) {
    const directory = path.join(root, config.directory);
    const files = (await readdir(directory)).filter((name) => name.endsWith('.html'));
    for (const name of files) await finalizePage(path.join(directory, name), locale, config);
}

console.log('Finalized generated activity pages.');
