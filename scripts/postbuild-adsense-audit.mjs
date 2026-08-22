import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publisherId = 'ca-pub-4310805868565928';
const homepagePaths = new Set(['index.html', 'cs/index.html', 'de/index.html', 'es/index.html']);
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
                    VinMat's World for Kids may use Google AdSense to display advertising. Because this project includes content intended for children, interest-based advertising and remarketing must not be used for child-directed ad requests. Before advertising is enabled, the project will be configured for Google's age-restricted treatment for child-directed content.
                </p>
                <p class="mb-3">
                    Google may still use limited cookies, local storage or similar technologies for non-personalized or limited ads, frequency capping, security, fraud prevention and aggregated reporting where permitted. Where consent is legally required, visitors will be offered consent choices through a Google-certified consent management platform before advertising cookies or local storage are used.
                </p>
                <p>
                    More information about how Google uses information from sites and apps that use Google services is available on
                    <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Google's partner sites policy page</a>.
                </p>`
  },
  'cs/zasady-ochrany-osobnich-udaju.html': {
    heading: '2. Cookies a reklama',
    body: `                <p class="mb-3">
                    VinMatův svět pro děti může využívat Google AdSense k zobrazování reklam. Protože projekt obsahuje obsah určený dětem, u reklamních požadavků pro dětský obsah nesmí být používána zájmově orientovaná reklama ani remarketing. Před spuštěním reklam bude projekt nastaven na věkově omezené zpracování Googlu pro obsah určený dětem.
                </p>
                <p class="mb-3">
                    Google může i u nepersonalizovaných nebo omezených reklam používat v povoleném rozsahu omezené cookies, místní úložiště nebo podobné technologie například pro omezení frekvence, zabezpečení, prevenci podvodů a souhrnné reportování. Tam, kde právní předpisy vyžadují souhlas, budou návštěvníkům před použitím reklamních cookies nebo místního úložiště nabídnuty volby prostřednictvím platformy CMP certifikované společností Google.
                </p>
                <p>
                    Další informace o tom, jak Google používá údaje ze stránek a aplikací využívajících jeho služby, najdete na stránce
                    <a href="https://policies.google.com/technologies/partner-sites?hl=cs" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Jak Google používá údaje ze stránek a aplikací</a>.
                </p>`
  },
  'de/datenschutz.html': {
    heading: '2. Cookies und Werbung',
    body: `                <p class="mb-3">
                    VinMats Welt für Kinder kann Google AdSense zur Anzeige von Werbung verwenden. Da dieses Projekt Inhalte für Kinder umfasst, dürfen für kindgerichtete Anzeigenanfragen keine interessenbezogene Werbung und kein Remarketing verwendet werden. Bevor Werbung aktiviert wird, wird das Projekt für die altersbeschränkte Behandlung von Google für kindgerichtete Inhalte eingerichtet.
                </p>
                <p class="mb-3">
                    Google kann im zulässigen Umfang auch bei nicht personalisierten oder eingeschränkten Anzeigen begrenzte Cookies, lokalen Speicher oder ähnliche Technologien verwenden, etwa für Frequency Capping, Sicherheit, Betrugsprävention und aggregierte Berichte. Soweit eine Einwilligung gesetzlich erforderlich ist, werden Besuchern vor der Nutzung von Werbe-Cookies oder lokalem Speicher Auswahlmöglichkeiten über eine von Google zertifizierte Consent-Management-Plattform angeboten.
                </p>
                <p>
                    Weitere Informationen darüber, wie Google Informationen von Websites und Apps verwendet, die Google-Dienste nutzen, finden Sie auf der Seite
                    <a href="https://policies.google.com/technologies/partner-sites?hl=de" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-bold">Wie Google Informationen von Websites oder Apps verwendet</a>.
                </p>`
  },
  'es/privacidad.html': {
    heading: '2. Cookies y publicidad',
    body: `                <p class="mb-3">
                    El mundo de VinMat para niños puede utilizar Google AdSense para mostrar publicidad. Como este proyecto incluye contenido dirigido a niños, las solicitudes de anuncios correspondientes a contenido infantil no deben utilizar publicidad basada en intereses ni remarketing. Antes de activar la publicidad, el proyecto se configurará con el tratamiento restringido por edad de Google para contenido dirigido a niños.
                </p>
                <p class="mb-3">
                    Cuando esté permitido, Google puede seguir utilizando cookies limitadas, almacenamiento local o tecnologías similares para anuncios no personalizados o limitados, control de frecuencia, seguridad, prevención del fraude e informes agregados. Cuando la ley exija consentimiento, se ofrecerán opciones mediante una plataforma de gestión del consentimiento certificada por Google antes de utilizar cookies publicitarias o almacenamiento local.
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
  const sectionStart = html.lastIndexOf('            <div>', headingIndex);
  const sectionEnd = html.indexOf('            </div>', headingIndex);
  if (sectionStart === -1 || sectionEnd === -1) return html;
  const replacement = `            <div>\n                ${heading}\n${config.body}\n            </div>`;
  return html.slice(0, sectionStart) + replacement + html.slice(sectionEnd + '            </div>'.length);
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

function ensureHomepageAdsense(html, relative) {
  if (!homepagePaths.has(relative)) return html;
  html = stripAdsense(html);
  const loader = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>`;
  if (/<meta\s+charset=/i.test(html)) return html.replace(/(<meta\s+charset=[^>]+>)/i, `${loader}\n    $1`);
  return html.replace('</head>', `    ${loader}\n</head>`);
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
  html = ensurePlannerNoindex(html, file.relative);

  // Ads live on the four catalog homepages. Activity detail pages are kept
  // focused on the printable itself and search/internal navigation.
  if (isActivityPage(file.relative)) html = stripAdsense(html);
  if (homepagePaths.has(file.relative)) html = ensureHomepageAdsense(html, file.relative);
  if (legalPages.has(file.relative)) html = stripConsentSensitiveTracking(html);

  if (html !== original) {
    await writeFile(file.absolute, html);
    changed += 1;
    console.log(`AdSense audit safeguard updated: ${file.relative}`);
  }
}

console.log(`AdSense audit safeguards complete. Updated ${changed} HTML file(s).`);
