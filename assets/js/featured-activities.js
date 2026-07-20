/* ═══════════════════════════════════════════════════════════════════════════
   DOPORUČENÉ AKTIVITY V PRŮVODCI
   Horní řada:
   - nejnovější aktivita z různých levelů
   - pokud jsou dostupné jen 2 levely, třetí karta se doplní další
     nejnovější aktivitou z již použitých levelů

   Dolní řada:
   - 3 náhodné aktivity mimo horní trojici
   ═══════════════════════════════════════════════════════════════════════════ */

let GUIDE_ACTIVITY_CONFIG = {};

const guideAgeLabels = {
    en: {
        LV1: '👶 Ages 3–4',
        LV2: '👧👦 Ages 5–6',
        LV3: '👧👦 Ages 7–9',
        LV4: '🧑 Ages 10+',
        LV5: '👨 Ages 12+ & Adults'
    },
    cz: {
        LV1: '👶 Věk 3–4',
        LV2: '👧👦 Věk 5–6',
        LV3: '👧👦 Věk 7–9',
        LV4: '🧑 Věk 10+',
        LV5: '👨 Věk 12+ a dospělí'
    }
};

const guideVariantLabels = {
    en: {
        colored: '🌈 Colored',
        coloring: '◧ B&W',
        partly_colored: '🌗 Partly Colored'
    },
    cz: {
        colored: '🌈 Barevná',
        coloring: '◧ Černobílá',
        partly_colored: '🌗 Částečně barevná'
    }
};

function guideLanguage() {
    return GUIDE_ACTIVITY_CONFIG.language === 'cz' ? 'cz' : 'en';
}

function guideAgeLabel(level) {
    return guideAgeLabels[guideLanguage()][level] || level;
}

function guideVariantLabel(variant) {
    return guideVariantLabels[guideLanguage()][variant] || variant;
}

let guideActivities = [];
let guideActiveVariants = {};

let guideModalActivity = null;
let guideModalVariant = null;


/* ─── CSV ───────────────────────────────────────────────────────────────── */

function guideParseCsvRow(text) {
    const result = [];
    let insideQuotes = false;
    let cell = '';

    for (let i = 0; i < text.length; i++) {
        const character = text[i];

        if (character === '"') {
            /*
             * Dvě uvozovky uvnitř CSV buňky znamenají jednu skutečnou
             * uvozovku, například: "Children's ""Easy"" Maze".
             */
            if (insideQuotes && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (character === ',' && !insideQuotes) {
            result.push(cell.trim());
            cell = '';
        } else {
            cell += character;
        }
    }

    result.push(cell.trim());
    return result;
}


async function guideLoadCsv() {
    try {
        const response = await fetch(GUIDE_ACTIVITY_CONFIG.csvFile);

        if (!response.ok) {
            throw new Error(
                'CSV could not be loaded: ' + GUIDE_ACTIVITY_CONFIG.csvFile
            );
        }

        const text = await response.text();
        const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');

        if (rows.length < 2) {
            return [];
        }

        const headers = guideParseCsvRow(rows[0]);
        const activities = [];
        const language = guideLanguage();
        const nameColumn = language === 'cz' ? 'nazevCz' : 'nazevEn';
        const altPrefix = language === 'cz' ? 'altCz' : 'altEn';

        for (let i = 1; i < rows.length; i++) {
            const cells = guideParseCsvRow(rows[i]);
            const row = {};

            headers.forEach((header, index) => {
                row[header] = cells[index] || '';
            });

            if (!row.soubor) {
                continue;
            }

            const level = row.soubor.split('_')[0].toUpperCase();
            const variants = [];

if (row[altPrefix + '_colored'] && row[altPrefix + '_colored'] !== '0') {
    variants.push('colored');
}

if (
    row[altPrefix + '_partly_colored'] &&
    row[altPrefix + '_partly_colored'] !== '0'
) {
    variants.push('partly_colored');
}

if (row[altPrefix + '_coloring'] && row[altPrefix + '_coloring'] !== '0') {
    variants.push('coloring');
}

            /*
             * Bez vyplněných variant považujeme aktivitu za černobílou,
             * stejně jako na hlavní stránce.
             */
            if (variants.length === 0) {
                variants.push('coloring');
            }

            const defaultVariant = variants.includes('colored')
                ? 'colored'
                : variants[0];

            activities.push({
                id: GUIDE_ACTIVITY_CONFIG.type + '-' + row.soubor,
                fileBase: row.soubor,
                level: level,
                dateAdded: row.datumPridani || '',
                name: row[nameColumn] || row.soubor,
                variants: variants,
                defaultVariant: defaultVariant,

                altTexts: {
                    colored: row[altPrefix + '_colored'] || '',
                    coloring: row[altPrefix + '_coloring'] || '',
                    partly_colored: row[altPrefix + '_partly_colored'] || ''
                }
            });
        }

        return activities;

    } catch (error) {
        console.error('Guide activity loading error:', error);
        return [];
    }
}


/* ─── VÝBĚR HORNÍCH A DOLNÍCH KARET ─────────────────────────────────────── */

function guideSortNewestFirst(activities) {
    return [...activities].sort((a, b) => {
        const dateComparison = (b.dateAdded || '').localeCompare(
            a.dateAdded || ''
        );

        /*
         * Při shodném datu zajistí název souboru stabilní pořadí.
         */
        if (dateComparison !== 0) {
            return dateComparison;
        }

        return b.fileBase.localeCompare(a.fileBase);
    });
}


function guideSelectTopActivities(activities, count = 3) {
    const sorted = guideSortNewestFirst(activities);
    const selected = [];
    const usedLevels = new Set();

    /*
     * První průchod:
     * vybereme nejnovější aktivitu z každého dosud nepoužitého levelu.
     */
    sorted.forEach(activity => {
        if (
            selected.length < count &&
            !usedLevels.has(activity.level)
        ) {
            selected.push(activity);
            usedLevels.add(activity.level);
        }
    });

    /*
     * Druhý průchod:
     * pokud zatím existují například pouze LV1 a LV2, doplníme třetí
     * kartu další nejnovější aktivitou, která ještě nebyla vybrána.
     */
    sorted.forEach(activity => {
        if (
            selected.length < count &&
            !selected.some(selectedActivity =>
                selectedActivity.id === activity.id
            )
        ) {
            selected.push(activity);
        }
    });

    return selected;
}


function guideShuffle(activities) {
    const shuffled = [...activities];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] =
            [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}


function guideSelectBottomActivities(activities, topActivities, count = 3) {
    const topIds = new Set(
        topActivities.map(activity => activity.id)
    );

    const remaining = activities.filter(activity =>
        !topIds.has(activity.id)
    );

    return guideShuffle(remaining).slice(0, count);
}


/* ─── OBRÁZKY A VARIANTY ─────────────────────────────────────────────────── */

function guideGetImageBase(activity, variant) {
    const base =
        GUIDE_ACTIVITY_CONFIG.imageFolder + '/' + activity.fileBase;

    /*
     * Pokud existuje pouze jedna varianta, soubor podle logiky indexu
     * nemá příponu -colored nebo -coloring.
     */
    return activity.variants.length === 1
        ? base
        : base + '-' + variant;
}


function guideEscapeHtml(text) {
    return String(text || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


function guideCreatePicture(activity, variant) {
    const imageBase = guideGetImageBase(activity, variant);
    const alt =
        activity.altTexts[variant] ||
        activity.name;

    return `
        <picture class="max-w-full max-h-full flex items-center justify-center">
            <source
                srcset="${guideEscapeHtml(imageBase)}.webp"
                type="image/webp"
            >
            <img
                src="${guideEscapeHtml(imageBase)}.png"
                alt="${guideEscapeHtml(alt)}"
                loading="lazy"
                class="max-w-full max-h-full object-contain
                       transition-transform duration-300
                       group-hover:scale-[1.02]"
onload="guideScheduleImageEqualization()"
                onerror="
                    const source = this.previousElementSibling;
                    if (source) source.remove();
                    this.onerror = null;
                "
            >
        </picture>
    `;
}


function guideSetCardVariant(activityId, variant) {
    const activity = guideActivities.find(item =>
        item.id === activityId
    );

    if (!activity || !activity.variants.includes(variant)) {
        return;
    }

    guideActiveVariants[activityId] = variant;

    /*
     * Jedna aktivita může být jednou nahoře a jednou dole pouze při
     * budoucí změně výběru. querySelectorAll proto aktualizuje všechny
     * případné instance.
     */
    document
        .querySelectorAll(
            '[data-guide-image="' +
            CSS.escape(activityId) +
            '"]'
        )
        .forEach(container => {
            container.innerHTML =
                guideCreatePicture(activity, variant);
        });

    activity.variants.forEach(activityVariant => {
        document
            .querySelectorAll(
                '[data-guide-variant-button="' +
                CSS.escape(activityId + '|' + activityVariant) +
                '"]'
            )
            .forEach(button => {
                button.className =
                    activityVariant === variant
                        ? 'flex-1 py-1 px-1 text-[10px] font-bold ' +
                          'rounded-md bg-slate-900 text-white ' +
                          'transition-colors'
                        : 'flex-1 py-1 px-1 text-[10px] font-bold ' +
                          'rounded-md text-slate-500 ' +
                          'hover:bg-slate-200 transition-colors';
            });
    });
}


function guideOpenActivity(activityId) {
    const activity = guideActivities.find(item =>
        item.id === activityId
    );

    if (!activity) {
        return;
    }

    guideModalActivity = activity;
    guideModalVariant =
        guideActiveVariants[activity.id] ||
        activity.defaultVariant;

    document.getElementById('guide-modal-title').textContent =
        activity.name;

    document.getElementById('guide-modal-age').textContent =
        guideAgeLabel(activity.level);

    guideBuildModalVariantButtons();
    guideUpdateModalImage();

    document.getElementById('guide-modal-download').onclick =
        guideDownloadCurrent;

    document
        .getElementById('guide-detail-modal')
        .classList.remove('hidden');

    document.body.style.overflow = 'hidden';
}


function guideCloseModal() {
    document
        .getElementById('guide-detail-modal')
        .classList.add('hidden');

    document.body.style.overflow = '';

    guideModalActivity = null;
    guideModalVariant = null;
}


function guideCloseModalOnBackdrop(event) {
    if (
        event.target ===
        document.getElementById('guide-detail-modal')
    ) {
        guideCloseModal();
    }
}


function guideBuildModalVariantButtons() {
    if (!guideModalActivity) {
        return;
    }

    const container =
        document.getElementById('guide-modal-variant-container');

    const buttonGroup =
        document.getElementById('guide-modal-variant-buttons');

    buttonGroup.innerHTML = '';

    if (guideModalActivity.variants.length <= 1) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    guideModalActivity.variants.forEach(variant => {
        const button = document.createElement('button');

        button.type = 'button';
        button.textContent =
            guideVariantLabel(variant);

        button.onclick = function () {
            guideSetModalVariant(variant);
        };

        button.dataset.guideModalVariant = variant;

        buttonGroup.appendChild(button);
    });

    guideUpdateModalButtons();
}


function guideSetModalVariant(variant) {
    if (
        !guideModalActivity ||
        !guideModalActivity.variants.includes(variant)
    ) {
        return;
    }

    guideModalVariant = variant;

    /*
     * Varianta zvolená v detailu se zároveň nastaví i na kartě.
     */
    guideSetCardVariant(
        guideModalActivity.id,
        variant
    );

    guideUpdateModalImage();
    guideUpdateModalButtons();
}


function guideUpdateModalButtons() {
    if (!guideModalActivity) {
        return;
    }

    document
        .querySelectorAll('[data-guide-modal-variant]')
        .forEach(button => {
            const isActive =
                button.dataset.guideModalVariant ===
                guideModalVariant;

            button.className = isActive
                ? 'flex-1 py-2 px-4 rounded-xl font-bold text-sm ' +
                  'bg-slate-900 text-white border-2 border-slate-900'
                : 'flex-1 py-2 px-4 rounded-xl font-bold text-sm ' +
                  'bg-slate-50 text-slate-600 border-2 border-slate-200 ' +
                  'hover:bg-slate-100';
        });
}


function guideUpdateModalImage() {
    if (!guideModalActivity || !guideModalVariant) {
        return;
    }

    const container =
        document.getElementById('guide-modal-image');

    const imageBase =
        guideGetImageBase(
            guideModalActivity,
            guideModalVariant
        );

    const alt =
        guideModalActivity.altTexts[guideModalVariant] ||
        guideModalActivity.name;

    container.innerHTML = `
        <picture class="max-w-full max-h-full flex items-center justify-center">
            <source
                srcset="${guideEscapeHtml(imageBase)}.webp"
                type="image/webp"
            >
            <img
                src="${guideEscapeHtml(imageBase)}.png"
                alt="${guideEscapeHtml(alt)}"
                class="max-w-full max-h-[75vh] object-contain rounded-lg"
                onerror="
                    const source = this.previousElementSibling;
                    if (source) source.remove();
                    this.onerror = null;
                "
            >
        </picture>
    `;
}


async function guideFindBestImageUrl(imageBase) {
    try {
        const pngResponse = await fetch(
            imageBase + '.png',
            { method: 'HEAD' }
        );

        if (pngResponse.ok) {
            return imageBase + '.png';
        }
    } catch (error) {
        console.warn('PNG check failed:', error);
    }

    try {
        const webpResponse = await fetch(
            imageBase + '.webp',
            { method: 'HEAD' }
        );

        if (webpResponse.ok) {
            return imageBase + '.webp';
        }
    } catch (error) {
        console.warn('WebP check failed:', error);
    }

    return imageBase + '.png';
}


async function guideDownloadCurrent() {
    if (!guideModalActivity || !guideModalVariant) {
        return;
    }

    const button =
        document.getElementById('guide-modal-download');

    const originalText = button.textContent;

    button.textContent = '⏳ Preparing...';

    const imageBase =
        guideGetImageBase(
            guideModalActivity,
            guideModalVariant
        );

    const url =
        await guideFindBestImageUrl(imageBase);

    const link = document.createElement('a');

    link.href = url;
    link.download =
        guideModalActivity.fileBase +
        '_' +
        guideModalVariant +
        '.' +
        url.split('.').pop();

    document.body.appendChild(link);
    link.click();
    link.remove();

    button.textContent = originalText;
}


async function guidePrintCurrent() {
    if (!guideModalActivity || !guideModalVariant) {
        return;
    }

    const imageBase =
        guideGetImageBase(
            guideModalActivity,
            guideModalVariant
        );

    const relativeUrl =
        await guideFindBestImageUrl(imageBase);

    const absoluteUrl =
        new URL(relativeUrl, window.location.href).href;

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${guideEscapeHtml(guideModalActivity.name)}</title>
            <style>
                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                }

                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                }

                img {
                    max-width: 100%;
                    max-height: 100vh;
                    object-fit: contain;
                }

                @media print {
                    img {
                        max-width: 100%;
                        max-height: 100vh;
                    }
                }
            </style>
        </head>
        <body>
            <img
                src="${absoluteUrl}"
                alt="${guideEscapeHtml(guideModalActivity.name)}"
                onload="window.print(); window.close();"
            >
        </body>
        </html>
    `);

    printWindow.document.close();
}


/* ─── VYKRESLENÍ KARTY ───────────────────────────────────────────────────── */

function guideCreateCard(activity) {
    const variant =
        guideActiveVariants[activity.id] ||
        activity.defaultVariant;

    guideActiveVariants[activity.id] = variant;

    const ageLabel =
        guideAgeLabel(activity.level) ||
        activity.level;

    let variantControls = '';

    if (activity.variants.length > 1) {
        const buttons = activity.variants.map(activityVariant => `
            <button
                type="button"
                data-guide-variant-button="${guideEscapeHtml(
                    activity.id + '|' + activityVariant
                )}"
                onclick="guideSetCardVariant(
                    '${guideEscapeHtml(activity.id)}',
                    '${guideEscapeHtml(activityVariant)}'
                )"
                class="flex-1 py-1 px-1 text-[10px] font-bold
                       rounded-md text-slate-500 hover:bg-slate-200
                       transition-colors"
            >
                ${guideVariantLabel(activityVariant)}
            </button>
        `).join('');

        variantControls = `
            <div class="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                ${buttons}
            </div>
        `;
    } else {
        variantControls = `
            <div class="text-center bg-slate-100 py-1 rounded-lg
                        text-[10px] font-bold text-slate-500">
                ${guideLanguage() === 'cz' ? '◧ Pouze černobílé' : '◧ B&amp;W only'}
            </div>
        `;
    }

    const card = document.createElement('article');

    card.className =
        'bg-white rounded-2xl overflow-hidden shadow-sm ' +
        'hover:shadow-md transition-all border border-slate-100 ' +
        'flex flex-col min-w-0';

    card.innerHTML = `
        <div
            data-guide-image="${guideEscapeHtml(activity.id)}"
            onclick="guideOpenActivity('${guideEscapeHtml(activity.id)}')"
class="bg-slate-50 p-3 flex items-center
       justify-center cursor-pointer group"
            title="${guideLanguage() === 'cz' ? 'Otevřít' : 'Open'} ${guideEscapeHtml(activity.name)}"
        >
            ${guideCreatePicture(activity, variant)}
        </div>

        <div class="p-3 flex-grow flex flex-col justify-between
                    border-t border-slate-50">
            <div class="mb-3 min-w-0">
                <div class="flex justify-between items-center gap-2 mb-1">
                    <span class="text-[9px] font-bold tracking-wider
                                 text-slate-400 uppercase">
                        ${guideEscapeHtml(GUIDE_ACTIVITY_CONFIG.cardLabel)}
                    </span>

                    <span class="text-[10px] text-slate-400 font-bold
                                 whitespace-nowrap">
                        ${guideEscapeHtml(ageLabel)}
                    </span>
                </div>

                <h3
                    onclick="guideOpenActivity(
                        '${guideEscapeHtml(activity.id)}'
                    )"
                    class="font-bold text-xs text-slate-900 leading-tight
                           cursor-pointer hover:text-indigo-600 uppercase
                           line-clamp-2"
                >
                    ${guideEscapeHtml(activity.name)}
                </h3>
            </div>

            ${variantControls}
        </div>
    `;

    /*
     * Nastaví správně tmavé tlačítko právě aktivní varianty.
     */
    requestAnimationFrame(() => {
        guideSetCardVariant(activity.id, variant);
    });

    return card;
}

let guideEqualizeTimer = null;

function guideEqualizeImageRows(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    const cards = Array.from(container.children);

    /*
     * Nejdříve zrušíme výšky nastavené při předchozím rozměru okna.
     */
    cards.forEach(card => {
        const imageArea = card.querySelector('[data-guide-image]');

        if (imageArea) {
            imageArea.style.height = 'auto';
        }
    });

    /*
     * Seskupení karet podle jejich svislé pozice = podle řádků.
     */
    const rows = new Map();

    cards.forEach(card => {
        const rowPosition = Math.round(card.offsetTop);

        if (!rows.has(rowPosition)) {
            rows.set(rowPosition, []);
        }

        rows.get(rowPosition).push(card);
    });

    rows.forEach(rowCards => {
        let tallestHeight = 0;

        rowCards.forEach(card => {
            const imageArea = card.querySelector('[data-guide-image]');
            const image = imageArea
                ? imageArea.querySelector('img')
                : null;

            if (!imageArea || !image) {
                return;
            }

            /*
             * Výška obrázku + přibližně 24 px za horní a dolní padding.
             */
            const requiredHeight =
                image.getBoundingClientRect().height + 24;

            tallestHeight = Math.max(
                tallestHeight,
                requiredHeight
            );
        });

        if (tallestHeight > 0) {
            rowCards.forEach(card => {
                const imageArea =
                    card.querySelector('[data-guide-image]');

                if (imageArea) {
                    imageArea.style.height =
                        Math.ceil(tallestHeight) + 'px';
                }
            });
        }
    });
}


function guideScheduleImageEqualization() {
    clearTimeout(guideEqualizeTimer);

    guideEqualizeTimer = setTimeout(() => {
        guideEqualizeImageRows(
            GUIDE_ACTIVITY_CONFIG.topContainerId
        );

        guideEqualizeImageRows(
            GUIDE_ACTIVITY_CONFIG.bottomContainerId
        );
    }, 100);
}


window.addEventListener(
    'resize',
    guideScheduleImageEqualization
);

function guideRenderActivities(containerId, activities) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.warn('Guide container not found:', containerId);
        return;
    }

    container.innerHTML = '';

    if (activities.length === 0) {
        const emptyMessage = GUIDE_ACTIVITY_CONFIG.language === 'cz'
            ? 'Zatím tu nejsou žádné pracovní listy.'
            : 'No printable activities are available yet.';
        container.innerHTML = `
            <div class="bg-white p-8 text-center rounded-2xl
                        border border-slate-100 text-xs text-slate-400
                        font-bold py-12 sm:col-span-3">
                ${emptyMessage}
            </div>
        `;
        return;
    }

    activities.forEach(activity => {
        container.appendChild(
            guideCreateCard(activity)
        );
    });
	guideScheduleImageEqualization();
}


/* ─── INICIALIZACE ────────────────────────────────────────────────────────── */

async function guideInitializeActivities() {
    guideActivities = await guideLoadCsv();

    if (guideActivities.length === 0) {
        guideRenderActivities(
            GUIDE_ACTIVITY_CONFIG.topContainerId,
            []
        );

        guideRenderActivities(
            GUIDE_ACTIVITY_CONFIG.bottomContainerId,
            []
        );

        return;
    }

    const topActivities =
        guideSelectTopActivities(guideActivities, 3);

    const bottomActivities =
        guideSelectBottomActivities(
            guideActivities,
            topActivities,
            3
        );

    guideRenderActivities(
        GUIDE_ACTIVITY_CONFIG.topContainerId,
        topActivities
    );

    guideRenderActivities(
        GUIDE_ACTIVITY_CONFIG.bottomContainerId,
        bottomActivities
    );
}

function loadFeaturedActivities(options) {
    const assetPrefix = options.assetPrefix || '';
    GUIDE_ACTIVITY_CONFIG = {
        type: options.type,
        csvFile: assetPrefix + 'assets/data/' + options.type + '.csv',
        imageFolder: assetPrefix + 'public/' + options.type,
        topContainerId: options.topContainer,
        bottomContainerId: options.bottomContainer,
        language: options.language || 'en',
        cardLabel: options.cardLabel || options.type.toUpperCase()
    };

    guideActivities = [];
    guideActiveVariants = {};
    guideModalActivity = null;
    guideModalVariant = null;

    guideInitializeActivities();
}
