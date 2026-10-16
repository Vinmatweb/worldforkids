import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publisherId = 'ca-pub-4310805868565928';
const homepagePaths = new Set(['index.html', 'cs/index.html', 'de/index.html', 'es/index.html']);
const guideAdPages = new Set([
  'guide-activities.html', 'guide-coloring.html', 'guide-dot-to-dot.html', 'guide-mazes.html', 'guide-tracing.html', 'difficulty-levels.html',
  'cs/pruvodce-aktivitami.html', 'cs/pruvodce-omalovanky.html', 'cs/pruvodce-spojovacky.html', 'cs/pruvodce-bludiste.html', 'cs/pruvodce-obtahovacky.html', 'cs/urovne-obtiznosti.html',
  'de/anleitung-aktivitaeten.html', 'de/anleitung-ausmalbilder.html', 'de/anleitung-punkte-verbinden.html', 'de/anleitung-labyrinthe.html', 'de/anleitung-nachzeichnen.html', 'de/schwierigkeitsstufen.html',
  'es/guia-actividades.html', 'es/guia-dibujos.html', 'es/guia-unir-puntos.html', 'es/guia-laberintos.html', 'es/guia-trazado.html', 'es/niveles-dificultad.html'
]);
const monetizedPages = new Set([...homepagePaths, ...guideAdPages]);
const legalPages = new Set([
  'privacy.html',
  'terms.html',
  'cs/zasady-ochrany-osobnich-udaju.html',
  'cs/podminky-uziti.html',
  'de/datenschutz.html',
  'de/nutzungsbedingungen.html',
  'es/privacidad.html',
  'es/terminos-de-uso.html'
]);
const privacyPages = {
  'privacy.html': {
    heading: '2. Cookies and Advertising',
    body: `                <p class="mb-3">
                    The Google AdSense code is integrated on the catalogue homepage and selected in-depth guide pages in all four language versions. Ads may appear after the site is approved for AdSense and when ads are available. The website is primarily designed for parents, guardians, teachers and other adults who choose, download or print activities for children. The presence of printable content for children does not by itself mean that every page or every visitor is treated as child-directed.
                </p>
                <p class="mb-3">
                    If a specific page, user context or ad request must receive child or teen age-restricted treatment under applicable law or Google policy, the relevant Google age-treatment signal will be used. Personalized advertising and remarketing are disabled for ad requests that receive age-restricted treatment. Where consent is legally required, visitors will be offered consent choices through a Google-certified consent management platform before advertising technologies requiring consent are used.
                </p>
                <p>
                    More information about how Google uses information from sites and apps that use Google services is available on
                    <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Google's partner sites policy page</a>.
                </p>`
  },
  'cs/zasady-ochrany-osobnich-udaju.html': {
    heading: '2. Cookies a reklama',
    body: `                <p class="mb-3">
                    Kód Google AdSense je integrován na hlavní stránce katalogu a na vybraných podrobných průvodcích ve všech čtyřech jazykových verzích. Reklamy se mohou zobrazit po schválení webu pro AdSense a podle dostupnosti reklam. Web je určen především rodičům, zákonným zástupcům, pedagogům a dalším dospělým, kteří pro děti vybírají, stahují nebo tisknou aktivity. Samotná přítomnost materiálů pro děti neznamená, že se každá stránka nebo každý návštěvník automaticky považuje za obsah či uživatele určeného dětem.
                </p>
                <p class="mb-3">
                    Pokud musí konkrétní stránka, situace uživatele nebo reklamní požadavek podle platných právních předpisů či pravidel Googlu obdržet věkově omezené zpracování pro děti nebo dospívající, použije se odpovídající signál Googlu pro zpracování podle věku. U reklamních požadavků s věkově omezeným zpracováním se nepoužívá personalizovaná reklama ani remarketing. Tam, kde právní předpisy vyžadují souhlas, budou návštěvníkům před použitím reklamních technologií vyžadujících souhlas nabídnuty volby prostřednictvím platformy CMP certifikované společností Google.
                </p>
                <p>
                    Další informace o tom, jak Google používá údaje ze stránek a aplikací využívajících jeho služby, najdete na stránce
                    <a href="https://policies.google.com/technologies/partner-sites?hl=cs" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Jak Google používá údaje ze stránek a aplikací</a>.
                </p>`
  },
  'de/datenschutz.html': {
    heading: '2. Cookies und Werbung',
    body: `                <p class="mb-3">
                    Der Google-AdSense-Code ist auf der Katalog-Startseite und auf ausgewählten ausführlichen Ratgeberseiten in allen vier Sprachversionen integriert. Anzeigen können erscheinen, sobald die Website für AdSense zugelassen ist und Anzeigen verfügbar sind. Die Website richtet sich in erster Linie an Eltern, Erziehungsberechtigte, Lehrkräfte und andere Erwachsene, die Aktivitäten für Kinder auswählen, herunterladen oder ausdrucken. Dass die Website Druckmaterialien für Kinder enthält, bedeutet nicht automatisch, dass jede Seite oder jeder Besucher als kindgerichtet behandelt wird.
                </p>
                <p class="mb-3">
                    Wenn eine bestimmte Seite, ein Nutzungskontext oder eine Anzeigenanfrage nach geltendem Recht oder nach Google-Richtlinien eine altersbeschränkte Behandlung für Kinder oder Jugendliche erhalten muss, wird das entsprechende Google-Signal zur Altersbehandlung verwendet. Für Anzeigenanfragen mit altersbeschränkter Behandlung sind personalisierte Werbung und Remarketing deaktiviert. Soweit eine Einwilligung gesetzlich erforderlich ist, werden Besuchern vor dem Einsatz einwilligungspflichtiger Werbetechnologien Auswahlmöglichkeiten über eine von Google zertifizierte Consent-Management-Plattform angeboten.
                </p>
                <p>
                    Weitere Informationen darüber, wie Google Informationen von Websites und Apps verwendet, die Google-Dienste nutzen, finden Sie auf der Seite
                    <a href="https://policies.google.com/technologies/partner-sites?hl=de" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Wie Google Informationen von Websites oder Apps verwendet</a>.
                </p>`
  },
  'es/privacidad.html': {
    heading: '2. Cookies y publicidad',
    body: `                <p class="mb-3">
                    El código de Google AdSense está integrado en la página principal del catálogo y en determinadas guías detalladas de las cuatro versiones lingüísticas. Los anuncios podrán mostrarse cuando se apruebe el sitio para AdSense y según su disponibilidad. El sitio web está pensado principalmente para padres, tutores, docentes y otros adultos que eligen, descargan o imprimen actividades para niños. El hecho de ofrecer materiales imprimibles para niños no significa por sí solo que todas las páginas o todos los visitantes deban tratarse automáticamente como dirigidos a niños.
                </p>
                <p class="mb-3">
                    Si una página, un contexto de usuario o una solicitud de anuncio concreta debe recibir un tratamiento restringido por edad para niños o adolescentes conforme a la legislación aplicable o a las políticas de Google, se utilizará la señal de tratamiento por edad correspondiente de Google. La publicidad personalizada y el remarketing se desactivan en las solicitudes que reciben tratamiento restringido por edad. Cuando la ley exija consentimiento, se ofrecerán opciones mediante una plataforma de gestión del consentimiento certificada por Google antes de utilizar tecnologías publicitarias que requieran consentimiento.
                </p>
                <p>
                    Encontrará más información sobre cómo utiliza Google la información de sitios web y aplicaciones que usan sus servicios en la página
                    <a href="https://policies.google.com/technologies/partner-sites?hl=es" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Cómo utiliza Google la información de sitios web o aplicaciones</a>.
                </p>`
  }
};
const activityPrefixes = ['activities/', 'cs/aktivity/', 'de/aktivitaeten/', 'es/actividades/'];
const localeHomes = {
  en: '/worldforkids/',
  cs: '/worldforkids/cs/',
  de: '/worldforkids/de/',
  es: '/worldforkids/es/'
};

const analyticsPrivacy = {
  'privacy.html': `                <p class="mb-3">Google Analytics is optional and is available only on the catalogue homepage in each language. Its script does not load until you choose “Allow analytics”. It may then process pages viewed, interactions, device and browser details, and online identifiers such as analytics cookies. Advertising personalization and Google signals are disabled for this analytics configuration.</p>
                <p class="mb-3">Your choice is stored in your browser for up to 180 days. You can decline without losing access to downloads or printing, or withdraw consent at any time through “Analytics settings” in the catalogue footer. Withdrawing consent stops measurement, removes the Analytics cookies accessible to this website and reloads the page without Analytics.</p>
                <p><a href="/worldforkids/?analytics-settings=1" class="text-indigo-600 underline font-bold">Change analytics settings</a>. See also <a href="https://support.google.com/analytics/answer/6004245?hl=en" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">how Google safeguards Analytics data</a>.</p>`,
  'cs/zasady-ochrany-osobnich-udaju.html': `                <p class="mb-3">Google Analytics je volitelný a používá se pouze na hlavní stránce katalogu v jednotlivých jazycích. Jeho skript se nenačte, dokud nezvolíte „Povolit analytiku“. Poté může zpracovávat navštívené stránky, interakce, údaje o zařízení a prohlížeči a online identifikátory, například analytické cookies. Personalizace reklamy a signály Google jsou v tomto nastavení analytiky vypnuté.</p>
                <p class="mb-3">Volba se uchovává ve vašem prohlížeči nejdéle 180 dní. Odmítnutí neomezuje stahování ani tisk. Souhlas můžete kdykoli odvolat přes „Nastavení analytiky“ v patičce katalogu. Odvolání zastaví měření, odstraní cookies Analytics dostupné tomuto webu a znovu načte stránku bez Analytics.</p>
                <p><a href="/worldforkids/cs/?analytics-settings=1" class="text-indigo-600 underline font-bold">Změnit nastavení analytiky</a>. Více informací: <a href="https://support.google.com/analytics/answer/6004245?hl=cs" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">jak Google chrání data v Analytics</a>.</p>`,
  'de/datenschutz.html': `                <p class="mb-3">Google Analytics ist optional und wird nur auf der Katalog-Startseite der einzelnen Sprachen verwendet. Das Skript wird erst geladen, wenn Sie „Analyse erlauben“ wählen. Danach können Seitenaufrufe, Interaktionen, Geräte- und Browserdaten sowie Online-Kennungen wie Analyse-Cookies verarbeitet werden. Anzeigenpersonalisierung und Google-Signale sind in dieser Analytics-Konfiguration deaktiviert.</p>
                <p class="mb-3">Ihre Auswahl wird höchstens 180 Tage in Ihrem Browser gespeichert. Herunterladen und Drucken sind auch ohne Einwilligung möglich. Über „Analyse-Einstellungen“ in der Fußzeile des Katalogs können Sie Ihre Einwilligung jederzeit widerrufen. Dabei wird die Messung gestoppt, die für diese Website zugänglichen Analytics-Cookies werden entfernt und die Seite wird ohne Analytics neu geladen.</p>
                <p><a href="/worldforkids/de/?analytics-settings=1" class="text-indigo-600 underline font-bold">Analyse-Einstellungen ändern</a>. Weitere Informationen: <a href="https://support.google.com/analytics/answer/6004245?hl=de" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">wie Google Analytics-Daten schützt</a>.</p>`,
  'es/privacidad.html': `                <p class="mb-3">Google Analytics es opcional y solo se utiliza en la página principal del catálogo de cada idioma. Su script no se carga hasta que eliges «Permitir análisis». Después puede procesar páginas visitadas, interacciones, datos del dispositivo y navegador e identificadores como cookies de análisis. La personalización de anuncios y las señales de Google están desactivadas en esta configuración de Analytics.</p>
                <p class="mb-3">Tu elección se guarda en el navegador durante un máximo de 180 días. Puedes rechazar el análisis sin perder las descargas ni la impresión. Puedes retirar el consentimiento desde «Configuración de análisis» en el pie del catálogo. Al retirarlo se detiene la medición, se eliminan las cookies de Analytics accesibles para este sitio y se vuelve a cargar la página sin Analytics.</p>
                <p><a href="/worldforkids/es/?analytics-settings=1" class="text-indigo-600 underline font-bold">Cambiar la configuración de análisis</a>. Más información: <a href="https://support.google.com/analytics/answer/6004245?hl=es" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">cómo protege Google los datos de Analytics</a>.</p>`
};

function normalizePrivacyAnalytics(html, relative) {
  const body = analyticsPrivacy[relative];
  if (!body) return html;
  const heading = html.match(/<h2\b[^>]*>3\.[^<]*<\/h2>/i);
  if (!heading) throw new Error(`${relative}: third privacy section not found`);
  const start = heading.index + heading[0].length;
  const end = html.indexOf('</div>', start);
  if (end === -1) throw new Error(`${relative}: third privacy section end not found`);
  return html.slice(0, start) + '\n' + body + '\n' + html.slice(end);
}

function stripAnalytics(html) {
  return html
    .replace(/\s*<!--\s*Google tag \(gtag\.js\)\s*-->\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\(['"]config['"],\s*['"]G-[^'"]+['"]\);\s*<\/script>\s*/gi, '\n');
}

function stripAnalyticsConsentLoader(html) {
  return html.replace(/\s*<script\b[^>]*src=["'][^"']*assets\/js\/analytics-consent\.js[^"']*["'][^>]*>\s*<\/script>\s*/gi, '\n');
}

function normalizeAnalyticsConsent(html, relative) {
  html = stripAnalyticsConsentLoader(stripAnalytics(html));
  if (!homepagePaths.has(relative)) return html;
  return html.replace('</head>', '    <script defer src="/worldforkids/assets/js/analytics-consent.js?v=20261016"></script>\n</head>');
}

async function collectHtmlFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'public') continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(absolute, relative));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push({ absolute, relative });
  }

  return files;
}

function replaceMissingOgImage(html) {
  return html
    .replaceAll('https://vinmat.eu/worldforkids/assets/images/og-image.png', 'https://vinmat.eu/worldforkids/assets/images/banner.png')
    .replaceAll('/worldforkids/assets/images/og-image.png', '/worldforkids/assets/images/banner.png')
    .replaceAll('assets/images/og-image.png', 'assets/images/banner.png');
}

function normalizeDoubleEscapedEntities(html) {
  return html
    .replaceAll('&amp;#039;', '&#039;')
    .replaceAll('&amp;quot;', '&quot;')
    .replaceAll('&amp;lt;', '&lt;')
    .replaceAll('&amp;gt;', '&gt;');
}

function normalizeSharedScriptPaths(html, relative) {
  // EN activity pages live directly under /activities/, so one ".." reaches
  // the World for Kids root. Localized activity pages are one level deeper
  // (e.g. /cs/aktivity/) and correctly need two ".." segments.
  if (!relative.startsWith('activities/')) return html;
  return html
    .replaceAll('../../assets/js/site-config.js', '../assets/js/site-config.js')
    .replaceAll('../../assets/js/site-navigation.js', '../assets/js/site-navigation.js');
}

function localeFromHtml(html, relative) {
  const bodyLocale = html.match(/<body\b[^>]*\bdata-locale=["'](en|cs|de|es)["']/i)?.[1];
  if (bodyLocale) return bodyLocale;
  if (relative.startsWith('cs/')) return 'cs';
  if (relative.startsWith('de/')) return 'de';
  if (relative.startsWith('es/')) return 'es';
  return 'en';
}

function normalizeLocalizedHomeAnchors(html, relative) {
  const locale = localeFromHtml(html, relative);
  const target = localeHomes[locale] || localeHomes.en;

  // Only rewrite clickable anchors that point exactly to the W4K homepage.
  // Metadata, canonical URLs and structured data are intentionally untouched.
  return html.replace(
    /(<a\b[^>]*\bhref=)(["'])https?:\/\/(?:www\.)?vinmat\.eu\/worldforkids\/?\2/gi,
    (_match, prefix, quote) => `${prefix}${quote}${target}${quote}`
  );
}

function removePopularSortPlaceholder(html, relative) {
  if (!homepagePaths.has(relative)) return html;

  // Popularity has no real data source yet, so do not show a disabled
  // "coming soon" item in the mobile/native sort selector.
  return html
    .replace(/\s*'<option value="popular" disabled>'\s*\+\s*s\.sortPopular\s*\+\s*'<\/option>'\s*\+\s*/g, '\n    ')
    .replace(/\s*<option\s+value=["']popular["'][^>]*>[^<]*<\/option>\s*/gi, '\n');
}

function normalizePrivacyAdvertising(html, relative) {
  const config = privacyPages[relative];
  if (!config) return html;
  const heading = `<h2 class="text-xl font-bold text-slate-900 mb-3">${config.heading}</h2>`;
  const headingIndex = html.indexOf(heading);
  if (headingIndex === -1) return html;
  const sectionStart = html.lastIndexOf('<div', headingIndex);
  const sectionEnd = html.indexOf('</div>', headingIndex);
  if (sectionStart === -1 || sectionEnd === -1) return html;
  const replacement = `<div>\n                ${heading}\n${config.body}\n            </div>`;
  return html.slice(0, sectionStart) + replacement + html.slice(sectionEnd + '</div>'.length);
}

function stripAdsense(html) {
  return html
    .replace(/\s*<!--\s*Google AdSense\s*-->\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"']*["'][^>]*>\s*<\/script>\s*/gi, '\n');
}

function stripConsentSensitiveTracking(html) {
  return stripAdsense(html)
    .replace(/\s*<!--\s*Google tag \(gtag\.js\)\s*-->\s*/gi, '\n')
    .replace(/\s*<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\(['"]config['"],\s*['"]G-[^'"]+['"]\);\s*<\/script>\s*/gi, '\n');
}

function ensureMonetizedPageAdsense(html, relative) {
  if (!monetizedPages.has(relative)) return html;
  html = stripAdsense(html);
  const loader = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>`;
  if (/<meta\s+charset=/i.test(html)) return html.replace(/(<meta\s+charset=[^>]+>)/i, `${loader}\n    $1`);
  return html.replace('</head>', `    ${loader}\n</head>`);
}

function removeVisibleLoadingPlaceholders(html) {
  return html
    .replaceAll('🔄 The latest coloring pages from the CSV table will load here...', 'Browse the current coloring-page catalogue using the filters on the main page.')
    .replaceAll('🔄 The latest mazes from the CSV table will load here...', 'Browse the current maze catalogue using the filters on the main page.')
    .replaceAll('🔄 Loading recommended coloring pages...', 'Browse the current coloring-page catalogue on the main page.')
    .replaceAll('🔄 Loading recommended dot-to-dot printables...', 'Browse the current dot-to-dot catalogue on the main page.')
    .replaceAll('🔄 Loading recommended mazes...', 'Browse the current maze catalogue on the main page.')
    .replaceAll('🔄 Loading recommended worksheets...', 'Browse the current tracing catalogue on the main page.')
    .replaceAll('Loading current statistics...', 'Current activity statistics')
    .replaceAll('🔄 Načítání doporučených listů...', 'Aktuální pracovní listy najdete v katalogu na hlavní stránce.')
    .replaceAll('🔄 Načítání doporučených spojovaček...', 'Aktuální spojovačky najdete v katalogu na hlavní stránce.')
    .replaceAll('🔄 Načítám aktuální statistiky…', 'Aktuální statistiky aktivit')
    .replaceAll('🔄 Cargando las fichas más recientes…', 'Consulta las fichas actuales en el catálogo de la página principal.')
    .replaceAll('🔄 Cargando las fichas más recientes de unir puntos…', 'Consulta las fichas actuales de unir puntos en el catálogo de la página principal.')
    .replaceAll('🔄 Cargando recomendaciones…', 'Consulta las actividades actuales en el catálogo de la página principal.')
    .replaceAll('🔄 Cargando más fichas recomendadas…', 'Consulta las fichas actuales en el catálogo de la página principal.')
    .replaceAll('🔄 Cargando los datos actuales…', 'Estadísticas actuales de actividades');
}

function ensurePlannerNoindex(html, relative) {
  if (relative !== 'vinmat-planner/index.html') return html;
  if (/<meta\s+name=["']robots["']/i.test(html)) {
    return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, nofollow">');
  }
  return html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, '$1\n  <meta name="robots" content="noindex, nofollow">');
}

function isActivityPage(relative) {
  return activityPrefixes.some((prefix) => relative.startsWith(prefix));
}

const files = await collectHtmlFiles(root);
let changed = 0;

for (const file of files) {
  let html = await readFile(file.absolute, 'utf8');
  const original = html;

  html = replaceMissingOgImage(html);
  html = normalizeDoubleEscapedEntities(html);
  html = normalizeSharedScriptPaths(html, file.relative);
  html = normalizeLocalizedHomeAnchors(html, file.relative);
  html = removePopularSortPlaceholder(html, file.relative);
  html = normalizePrivacyAdvertising(html, file.relative);
  html = normalizePrivacyAnalytics(html, file.relative);
  html = removeVisibleLoadingPlaceholders(html);
  html = ensurePlannerNoindex(html, file.relative);

  // Monetize the interactive catalogue and substantial editorial guides.
  // Legal pages, internal utilities and retired worksheet detail URLs remain
  // free of Google ad/analytics tags.
  if (monetizedPages.has(file.relative)) {
    html = ensureMonetizedPageAdsense(html, file.relative);
    if (!homepagePaths.has(file.relative)) {
      html = html
        .replace(/\s*<!--\s*Google tag \(gtag\.js\)\s*-->\s*/gi, '\n')
        .replace(/\s*<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']+["'][^>]*>\s*<\/script>\s*/gi, '\n')
        .replace(/\s*<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\(['"]config['"],\s*['"]G-[^'"]+['"]\);\s*<\/script>\s*/gi, '\n');
    }
  } else {
    html = stripConsentSensitiveTracking(html);
  }

  html = normalizeAnalyticsConsent(html, file.relative);

  if (html !== original) {
    await writeFile(file.absolute, html);
    changed += 1;
    console.log(`AdSense audit safeguard updated: ${file.relative}`);
  }
}

console.log(`AdSense audit safeguards complete. Updated ${changed} HTML file(s).`);

