import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

const sources = {
  en: `
<section data-guide-sources class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
  <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Sources & further reading</h2>
  <p class="text-sm text-slate-600 leading-relaxed font-medium">These references support the general guidance on pencil skills, children's drawings and spatial problem solving. VinMat worksheets are activity ideas, not diagnostic or therapeutic tools.</p>
  <ul class="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-2">
    <li><a class="text-indigo-700 underline font-bold" href="https://www.ghc.nhs.uk/our-teams-and-services/children-and-young-people/physical-health/childrens-occupational-therapy/" target="_blank" rel="noopener noreferrer">Gloucestershire Health and Care NHS – Children's Occupational Therapy: pencil skills</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/9631202/" target="_blank" rel="noopener noreferrer">Thomas & Jolley – reliability of psychological interpretation of children's drawings</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/35666930/" target="_blank" rel="noopener noreferrer">Ruggeri et al. – children's search strategies in a maze-exploration task</a></li>
  </ul>
</section>`,
  cs: `
<section data-guide-sources class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
  <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Zdroje a další čtení</h2>
  <p class="text-sm text-slate-600 leading-relaxed font-medium">Tyto zdroje podporují obecná doporučení k práci s tužkou, interpretaci dětské kresby a prostorovým úlohám. Pracovní listy VinMat nejsou diagnostický ani terapeutický nástroj.</p>
  <ul class="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-2">
    <li><a class="text-indigo-700 underline font-bold" href="https://www.ghc.nhs.uk/our-teams-and-services/children-and-young-people/physical-health/childrens-occupational-therapy/" target="_blank" rel="noopener noreferrer">Gloucestershire Health and Care NHS – dětská ergoterapie a dovednosti práce s tužkou</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/9631202/" target="_blank" rel="noopener noreferrer">Thomas & Jolley – spolehlivost psychologické interpretace dětských kreseb</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/35666930/" target="_blank" rel="noopener noreferrer">Ruggeri et al. – strategie dětí při řešení prostorové úlohy v bludišti</a></li>
  </ul>
</section>`,
  de: `
<section data-guide-sources class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
  <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Quellen & weiterführende Informationen</h2>
  <p class="text-sm text-slate-600 leading-relaxed font-medium">Diese Quellen stützen die allgemeinen Hinweise zu Stiftführung, Kinderzeichnungen und räumlichen Suchaufgaben. VinMat-Arbeitsblätter sind keine diagnostischen oder therapeutischen Instrumente.</p>
  <ul class="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-2">
    <li><a class="text-indigo-700 underline font-bold" href="https://www.ghc.nhs.uk/our-teams-and-services/children-and-young-people/physical-health/childrens-occupational-therapy/" target="_blank" rel="noopener noreferrer">Gloucestershire Health and Care NHS – Children's Occupational Therapy: pencil skills</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/9631202/" target="_blank" rel="noopener noreferrer">Thomas & Jolley – psychologische Interpretation von Kinderzeichnungen</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/35666930/" target="_blank" rel="noopener noreferrer">Ruggeri et al. – Suchstrategien von Kindern in einer Labyrinthaufgabe</a></li>
  </ul>
</section>`,
  es: `
<section data-guide-sources class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
  <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Fuentes y lecturas recomendadas</h2>
  <p class="text-sm text-slate-600 leading-relaxed font-medium">Estas fuentes respaldan la orientación general sobre el uso del lápiz, los dibujos infantiles y las tareas espaciales. Las fichas de VinMat no son herramientas diagnósticas ni terapéuticas.</p>
  <ul class="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-2">
    <li><a class="text-indigo-700 underline font-bold" href="https://www.ghc.nhs.uk/our-teams-and-services/children-and-young-people/physical-health/childrens-occupational-therapy/" target="_blank" rel="noopener noreferrer">Gloucestershire Health and Care NHS – Children's Occupational Therapy: pencil skills</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/9631202/" target="_blank" rel="noopener noreferrer">Thomas & Jolley – interpretación psicológica de los dibujos infantiles</a></li>
    <li><a class="text-indigo-700 underline font-bold" href="https://pubmed.ncbi.nlm.nih.gov/35666930/" target="_blank" rel="noopener noreferrer">Ruggeri et al. – estrategias infantiles en una tarea espacial de laberinto</a></li>
  </ul>
</section>`
};

const pages = [
  ['guide-coloring.html','en'], ['guide-mazes.html','en'], ['guide-tracing.html','en'], ['guide-activities.html','en'],
  ['cs/pruvodce-omalovanky.html','cs'], ['cs/pruvodce-bludiste.html','cs'], ['cs/pruvodce-obtahovacky.html','cs'], ['cs/pruvodce-aktivitami.html','cs'],
  ['de/anleitung-ausmalbilder.html','de'], ['de/anleitung-labyrinthe.html','de'], ['de/anleitung-nachzeichnen.html','de'], ['de/anleitung-aktivitaeten.html','de'],
  ['es/guia-dibujos.html','es'], ['es/guia-laberintos.html','es'], ['es/guia-trazado.html','es'], ['es/guia-actividades.html','es']
];

function addSources(html, locale) {
  html = html.replace(/\s*<section data-guide-sources[\s\S]*?<\/section>\s*/gi, '\n');
  return html.replace(/\s*<\/main>/i, `\n${sources[locale]}\n</main>`);
}

function saferEnglish(html, file) {
  if (file === 'guide-coloring.html') {
    html = html
      .replaceAll('Coloring Pages Guide | VinMat', 'Coloring Pages Guide for Parents & Teachers | VinMat')
      .replaceAll("Learn how to understand children's drawing, color choices, art supplies and how to choose the right printable coloring pages by age and difficulty level.", "Learn how to choose printable coloring pages by age and difficulty, support comfortable pencil use and keep coloring creative and pressure-free.")
      .replace(/<p>There is also something deeply satisfying about turning a simple black-and-white outline into a colorful picture\.[\s\S]*?<\/p>/, '<p>Turning a black-and-white outline into a finished picture gives clear visual feedback and leaves plenty of room for personal choices about color, detail and pace.</p>')
      .replace(/In hobby programs and some therapeutic settings, coloring can support fine motor skills, focus and patience\./, 'For many people, coloring is simply an enjoyable creative activity that can be done alone or together.')
      .replace(/Many people use coloring as a gentle way to relax, reduce stress and improve focus\. Regular creative work can create a pleasant state of flow, similar to mindful rest\./, 'Some people find focused coloring relaxing because it offers one clear, screen-free task. It should be treated as a leisure activity rather than a treatment.')
      .replace(/<section id="psychologie-barev"[\s\S]*?<\/section>/, `<section id="psychologie-barev" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">🌈 Color choices without over-interpretation</h2>
            <p class="text-sm text-slate-600 leading-relaxed font-medium">Children choose colors for many reasons: preference, availability, the subject they are coloring, imitation, curiosity or mood. A single color choice is not a reliable way to diagnose personality, anxiety or another emotional state.</p>
            <p class="text-sm text-slate-600 leading-relaxed font-medium">A review of research on children's drawings concluded that drawings on their own are too ambiguous to serve as reliable sole indicators of a child's emotional experience. It is safer to ask open questions such as “Which color do you like here?” or “What is happening in your picture?” and let the child explain their own choices.</p>
        </section>`)
      .replace(/<section id="vyvoj-kresby"[\s\S]*?<\/section>/, `<section id="vyvoj-kresby" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">📈 Choosing detail as pencil control grows</h2>
            <p class="text-sm text-slate-600 leading-relaxed font-medium">Children develop pencil control at different rates, so age ranges are only a practical starting point. Occupational-therapy guidance uses broad milestones such as copying lines and a circle around age 3, a cross around age 4 and more complex shapes around age 5. Choose the worksheet that matches the child's current comfort rather than treating an age band as a test.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">3–4 · broad movement</h3><p>Use large motifs, thick outlines and generous spaces. Short sessions and chunky crayons can be easier to control.</p></div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">5–6 · more direction changes</h3><p>Introduce several objects, smaller areas and simple scenes while keeping the outlines clear.</p></div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">7–9 · finer detail</h3><p>More detailed scenes allow longer work, planning and smaller controlled movements.</p></div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">10+ and adults · complex designs</h3><p>Dense patterns and fine contours can be chosen when the user enjoys a longer precision-based activity.</p></div>
            </div>
        </section>`)
      .replace(/\* Some Level 1 coloring pages may also be suitable for children age 2 or younger,[\s\S]*?<\/p>/, '</p>')
      .replace('Ages 2–3', 'Ages 3–4');
  }
  if (file === 'guide-mazes.html') {
    html = html.replace(/This kind of visual tracking practice is also helpful for later reading fluency\./, 'This gives children repeated practice coordinating visual scanning with pencil movement.');
  }
  if (file === 'guide-tracing.html') {
    html = html
      .replace(/At the more detailed levels, tracing may feel restful, soothing and stress-relieving, especially when there is no pressure to work quickly or perfectly\./, 'At the more detailed levels, tracing may feel relaxing when there is no pressure to work quickly or perfectly.')
      .replace(/Longer tracing sessions may also feel restful, calming and stress-relieving, helping the user slow down and focus on one clear task\./, 'Longer tracing sessions may also feel calm and enjoyable when the user can work at a comfortable pace.');
  }
  if (file === 'guide-activities.html') {
    html = html
      .replace(/(<span[^>]*>5–10 min<\/span>)\s*\(short attention span\)/, '$1 (VinMat suggested session)')
      .replace(/(<span[^>]*>10–20 min<\/span>)\s*\(moderate concentration\)/, '$1 (VinMat suggested session)')
      .replace(/(<span[^>]*>20\+ min<\/span>)\s*\(longer creative play\)/, '$1 (VinMat suggested session)')
      .replace('5–10 min (short attention span)', '5–10 min (VinMat suggested session)')
      .replace('10–20 min (moderate concentration)', '10–20 min (VinMat suggested session)')
      .replace('20+ min (longer creative play)', '20+ min (VinMat suggested session)')
      .replace('3+ *', '3+')
      .replace(/\* Thanks to their bold, easy-to-follow outlines,[\s\S]*?2 years old\./, 'Age ranges are practical recommendations, not developmental tests. Choose the easiest comfortable level and move up when the child wants more detail.');
  }
  return html;
}

function saferCzech(html, file) {
  if (file === 'cs/pruvodce-omalovanky.html') {
    html = html
      .replaceAll('Historie, psychologie barev a rozvoj', 'Obtížnost, pomůcky a tipy')
      .replaceAll('vývoj kresby podle věku, psychologie barev, obtížnost', 'výběr obtížnosti, práce s tužkou, pomůcky')
      .replace('Naučte se porozumět dětské kresbě, psychologii barev, správnému výběru pomůcek i tomu, jak vybírat omalovánky podle věku dítěte.', 'Zjistěte, jak vybírat omalovánky podle věku a obtížnosti, podporovat pohodlnou práci s tužkou a ponechat dítěti dostatek tvůrčí svobody.')
      .replace('2–3 let', '3–4 let')
      .replace('- psychické zklidnění', '- klidnou práci bez obrazovky')
      .replace(/<p>Vybarvování navíc uspokojuje přirozenou lidskou potřebu vidět za sebou okamžitý hmatatelný výsledek\.[\s\S]*?<\/p>/, '<p>Proměna černobílého listu v hotový obrázek dává dítěti jasnou vizuální zpětnou vazbu a prostor rozhodovat o barvách, detailech i tempu práce.</p>')
      .replace('Ve volnočasových programech i některých terapeutických přístupech pomáhají procvičovat jemnou motoriku, soustředění a trpělivost.', 'Pro mnoho lidí jsou omalovánky především příjemnou tvořivou činností, kterou lze dělat samostatně i společně.')
      .replace(/<section id="psychologie-barev"[\s\S]*?<\/section>/, `<section id="psychologie-barev" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">🌈 Barvy bez zbytečné psychologické interpretace</h2>
            <p class="text-sm text-slate-600 leading-relaxed font-medium">Děti volí barvy z mnoha důvodů: podle obliby, dostupnosti, motivu obrázku, napodobování, zvědavosti nebo momentální nálady. Jedna zvolená barva není spolehlivým podkladem pro určování osobnosti, úzkosti ani jiného emočního stavu.</p>
            <p class="text-sm text-slate-600 leading-relaxed font-medium">Přehled výzkumu dětských kreseb upozorňuje, že samotná kresba je příliš nejednoznačná na to, aby byla spolehlivým jediným ukazatelem emočního prožívání dítěte. Lepší je ptát se otevřeně: „Proč se ti sem hodí tahle barva?“ nebo „Co se na obrázku děje?“ a nechat dítě vlastní volbu vysvětlit.</p>
        </section>`)
      .replace(/<section id="vyvoj-kresby"[\s\S]*?<\/section>/, `<section id="vyvoj-kresby" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">📈 Jak volit detail podle práce s tužkou</h2>
            <p class="text-sm text-slate-600 leading-relaxed font-medium">Dovednosti práce s tužkou se vyvíjejí různým tempem, proto berte věkové rozsahy jen jako praktické vodítko. Ergoterapeutická doporučení používají orientační milníky, například kopírování čar a kruhu kolem 3 let, kříže kolem 4 let a složitějších tvarů kolem 5 let. Vybírejte podle toho, co dítě pohodlně zvládá, ne jako test podle data narození.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">3–4 · široké pohyby</h3><p>Velký motiv, silné kontury a velké plochy. Kratší práce a silnější pastelky se obvykle lépe ovládají.</p></div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">5–6 · více změn směru</h3><p>Lze přidat více objektů, menší plochy a jednoduché scény při zachování dobře čitelných obrysů.</p></div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">7–9 · jemnější detail</h3><p>Detailnější scény dávají prostor pro delší práci, plánování a přesnější menší pohyby.</p></div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 mb-2">10+ a dospělí · složité motivy</h3><p>Husté vzory a jemné kontury jsou vhodné pro uživatele, kterým vyhovuje delší práce zaměřená na přesnost.</p></div>
            </div>
        </section>`)
      .replace(/\* Některé velmi jednoduché omalovánky úrovně 1 zvládnou i děti od 2 let[\s\S]*?<\/p>/, '</p>')
      .replace('Psychologie barev u dětí', 'Barvy bez přehnané interpretace')
      .replace('Historie: Od jeskyní k antistresu', 'Historie omalovánek');
  }
  if (file === 'cs/pruvodce-bludiste.html') {
    html = html.replace(/Tento druh vizuálního sledování pomáhá také pozdější plynulosti čtení\./, 'Dítě si tak opakovaně procvičuje spojení vizuálního sledování s pohybem tužky.');
  }
  if (file === 'cs/pruvodce-obtahovacky.html') {
    html = html.replace(/Ve vyšších úrovních může obtahování působit odpočinkově, uklidňujícím dojmem a pomáhat odbourávat stres, zvlášť pokud není tlak na rychlost nebo dokonalost\./, 'Ve vyšších úrovních může obtahování působit jako klidná, relaxační činnost, pokud není tlak na rychlost nebo dokonalost.');
  }
  if (file === 'cs/pruvodce-aktivitami.html') {
    html = html
      .replace('5–10 min</span> (udržení pozornosti)', '5–10 min</span> (doporučená délka VinMat)')
      .replace('10–20 min</span> (střední soustředění)', '10–20 min</span> (doporučená délka VinMat)')
      .replace('20+ min</span> (delší kreativní zabavení)', '20+ min</span> (doporučená délka VinMat)')
      .replace('3+ *</td>', '3+</td>')
      .replace(/\* Naše nejjednodušší omalovánky[\s\S]*?již od 2 let\./, 'Věkové rozsahy jsou praktické doporučení, ne vývojový test. Začněte nejlehčí pohodlnou úrovní a přejděte výš, až když dítě samo chce více detailů.');
  }
  return html;
}

function saferGermanSpanish(html, file, locale) {
  if (locale === 'de') {
    html = html
      .replaceAll('Fördert: Motorik, Kreativität, Konzentration', 'Zum Üben: Stiftkontrolle, Kreativität, konzentriertes Arbeiten')
      .replaceAll('Welche Fähigkeiten werden gefördert?', 'Welche Fähigkeiten lassen sich üben?')
      .replaceAll('Was kann Ausmalen fördern?', 'Was lässt sich beim Ausmalen üben?');
  } else {
    html = html
      .replaceAll('Ayuda: motricidad, creatividad, concentración', 'Para practicar: control del lápiz, creatividad y atención a la tarea')
      .replaceAll('¿Qué habilidades se desarrollan?', '¿Qué habilidades se pueden practicar?')
      .replaceAll('¿Qué puede desarrollar colorear?', '¿Qué se puede practicar al colorear?');
  }
  return html;
}

let changed = 0;
for (const [file, locale] of pages) {
  const url = new URL(file, root);
  let html;
  try { html = await readFile(url, 'utf8'); } catch { continue; }
  const original = html;
  html = locale === 'en' ? saferEnglish(html, file) : locale === 'cs' ? saferCzech(html, file) : saferGermanSpanish(html, file, locale);
  html = addSources(html, locale);
  if (html !== original) {
    await writeFile(url, html);
    changed += 1;
    console.log(`Guide quality strengthened: ${file}`);
  }
}

console.log(`Guide-content quality pass complete. Updated ${changed} file(s).`);
