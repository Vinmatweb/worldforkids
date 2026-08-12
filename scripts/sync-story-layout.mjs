import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

const pages = {
  'de/unsere-geschichte.html': {
    supportTitle: 'Projekt unterstützen',
    intro: 'Wenn Ihnen unsere Aktivitäten Freude gemacht haben, freuen wir uns über freiwillige Unterstützung. Sie hilft dabei, weitere kostenlose Arbeitsblätter zu erstellen und die Website zu betreiben.',
    kofiDesc: 'Unterstützung weiterer Inhalte per Karte oder PayPal',
    kofiCta: 'Auf einen Kaffee einladen',
    paypalDesc: 'Schnelle einmalige Unterstützung für das Projekt',
    paypalCta: 'Mit PayPal unterstützen',
    lightningDesc: 'Schnelle Unterstützung über eine Lightning-Adresse',
    qrAlt: 'Bitcoin-Lightning-QR-Code zur Unterstützung von VinMats Welt für Kinder',
    copyTitle: 'Lightning-Adresse kopieren',
    qrHelp: 'Oder den QR-Code scannen und einen beliebigen Betrag wählen.',
    finalMessage: 'Jeder Beitrag hilft uns, weitere kostenlose Aktivitäten für Kinder zu erstellen.'
  },
  'es/nuestra-historia.html': {
    supportTitle: 'Apoyar el proyecto',
    intro: 'Si nuestras actividades os han resultado útiles, agradecemos cualquier apoyo voluntario. Nos ayuda a crear más fichas gratuitas y a mantener la web en funcionamiento.',
    kofiDesc: 'Apoya nuevas actividades con tarjeta o PayPal',
    kofiCta: 'Invitarnos a un café',
    paypalDesc: 'Apoyo rápido y puntual para el proyecto',
    paypalCta: 'Apoyar con PayPal',
    lightningDesc: 'Apoyo rápido mediante una dirección Lightning',
    qrAlt: 'Código QR de Bitcoin Lightning para apoyar El mundo de VinMat para niños',
    copyTitle: 'Copiar la dirección Lightning',
    qrHelp: 'O escanea el código QR y elige la cantidad que quieras aportar.',
    finalMessage: 'Cada aportación nos ayuda a crear más actividades gratuitas para niños.'
  }
};

function supportPanel(copy) {
  return `        <aside class="lg:col-span-1">
            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 h-full flex flex-col justify-between">

                <div class="space-y-5">
                    <div class="text-center space-y-2">
                        <div class="text-3xl">💝</div>
                        <h2 class="text-xl font-extrabold text-slate-900 uppercase tracking-wide">${copy.supportTitle}</h2>
                        <p class="text-xs text-slate-600 leading-relaxed font-medium">
                            ${copy.intro}
                        </p>
                    </div>

                    <div class="space-y-3">

                        <!-- Ko-fi -->
                        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                            <div>
                                <h3 class="font-bold text-slate-900 text-sm">☕ Ko-fi</h3>
                                <p class="text-[10px] text-slate-500 font-medium">${copy.kofiDesc}</p>
                            </div>
                            <a href="https://ko-fi.com/vinmat"
                               target="_blank"
                               rel="noopener noreferrer"
                               class="block w-full text-center bg-amber-500 hover:bg-amber-600 hover:scale-[1.02] transition-all duration-200 text-white text-xs font-bold py-2 rounded-xl shadow-sm">
                                ${copy.kofiCta}
                            </a>
                        </div>

                        <!-- PayPal -->
                        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                            <div>
                                <h3 class="font-bold text-slate-900 text-sm">💳 PayPal</h3>
                                <p class="text-[10px] text-slate-500 font-medium">${copy.paypalDesc}</p>
                            </div>
                            <a href="https://paypal.me/VinmatForKids"
                               target="_blank"
                               rel="noopener noreferrer"
                               class="block w-full text-center bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 text-white text-xs font-bold py-2 rounded-xl shadow-sm">
                                ${copy.paypalCta}
                            </a>
                        </div>
                    </div>

                    <div class="border-t border-slate-100 pt-5 space-y-4">
                        <div class="text-center space-y-1">
                            <div class="text-2xl">⚡</div>
                            <h3 class="font-bold text-slate-900 text-sm">Bitcoin Lightning</h3>
                            <p class="text-[10px] text-slate-500 font-medium">${copy.lightningDesc}</p>
                        </div>

                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=lightning%3Alnurl1dp68gurn8ghj7amhwuhxzmnevdhkjm3wvdaz7ctsdyhkc6t8dp6xu6twvuhkcmn4wfkz7v33xesk2e33vvkngerp8qkngwtpxqknscnrvvkk2dnx8pjnydpkxy6rsdqjpdwtd"
                             alt="${copy.qrAlt}"
                             class="w-36 h-36 mx-auto bg-white border border-slate-200 rounded-xl p-1"
                             loading="lazy">

                        <div class="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 select-all break-all w-full">
                            <span id="ln-address">vinmatforkids@anycoin.cz</span>
                            <button type="button"
                                    id="ln-copy-button"
                                    onclick="copyLightningAddress()"
                                    class="text-sm hover:scale-110 transition-transform"
                                    title="${copy.copyTitle}"
                                    aria-label="${copy.copyTitle}">📋</button>
                        </div>

                        <div class="grid grid-cols-2 gap-3 w-full">
                            <a id="ln-usd-1"
                               href="lightning:vinmatforkids@anycoin.cz"
                               class="bg-amber-500 hover:bg-amber-600 hover:scale-[1.02] transition-all duration-200 text-white rounded-xl py-2 flex flex-col items-center justify-center shadow-sm">
                                <span class="text-base font-bold">💛 $1</span>
                                <span class="text-[11px] opacity-90 mt-0.5">~1,500 sats</span>
                            </a>

                            <a id="ln-usd-5"
                               href="lightning:vinmatforkids@anycoin.cz"
                               class="bg-amber-500 hover:bg-amber-600 hover:scale-[1.02] transition-all duration-200 text-white rounded-xl py-2 flex flex-col items-center justify-center shadow-sm">
                                <span class="text-base font-bold">💛 $5</span>
                                <span class="text-[11px] opacity-90 mt-0.5">~7,500 sats</span>
                            </a>
                        </div>

                        <p class="text-[10px] text-slate-500 text-center leading-relaxed">
                            ${copy.qrHelp}
                        </p>
                    </div>
                </div>

                <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                    <p class="text-[11px] text-amber-950 font-bold leading-relaxed">
                        ${copy.finalMessage}
                    </p>
                </div>

            </div>
        </aside>`;
}

for (const [file, copy] of Object.entries(pages)) {
  const url = new URL(file, root);
  let html = await readFile(url, 'utf8');
  const original = html;

  html = html.replace(
    '<main class="max-w-5xl w-full mx-auto px-4 py-12 flex-grow space-y-10">',
    '<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-8">'
  );

  html = html.replace(
    '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">',
    '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">'
  );

  html = html.replace(/\s*<aside class="(?:lg:col-span-1|bg-white)[\s\S]*?<\/aside>/, `\n${supportPanel(copy)}`);

  html = html.replace(
    /\s*async function updateLightningUsdButtons\(\) \{[\s\S]*?updateLightningUsdButtons\(\);\s*/,
    '\n\n'
  );

  if (html !== original) {
    await writeFile(url, html, 'utf8');
    console.log(`Story layout and full support panel synchronized: ${file}`);
  } else {
    console.log(`Story layout and full support panel already synchronized: ${file}`);
  }
}
