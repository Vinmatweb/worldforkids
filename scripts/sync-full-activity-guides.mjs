import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const card = 'bg-slate-50 border border-slate-100 rounded-2xl p-5';
const white = 'bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5';
const text = 'text-sm text-slate-600 leading-relaxed font-medium';

function t(locale, de, es) { return locale === 'de' ? de : es; }
function paragraphs(items) { return items.map((p) => `<p class="${text}">${p}</p>`).join(''); }
function section(id, title, body, cls = white) { return `<section${id ? ` id="${id}"` : ''} class="${cls}"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${title}</h2>${body}</section>`; }
function cards(items, cols = 'md:grid-cols-2') {
  return `<div class="grid grid-cols-1 ${cols} gap-4 text-xs font-medium leading-relaxed">${items.map(([title, body]) => `<div class="${card}"><h3 class="font-bold text-slate-900 mb-2">${title}</h3><p class="text-slate-600">${body}</p></div>`).join('')}</div>`;
}
function bullets(items, color = 'text-slate-600') { return `<ul class="space-y-3 ${color} text-sm font-medium list-disc list-inside">${items.map((x) => `<li>${x}</li>`).join('')}</ul>`; }
function toc(items, title) { return `<section class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"><div class="${white} md:col-span-1"><h2 class="text-md font-extrabold text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2">${title[0]}</h2><div class="text-xs font-bold space-y-2 text-slate-700">${title.slice(1).map((x) => `<div>${x}</div>`).join('')}</div></div><div class="${white} md:col-span-2"><h2 class="text-md font-extrabold text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2">${title[title.length - 1]}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">${items.map(([href, label]) => `<a href="#${href}" class="bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">${label}</a>`).join('')}</div></div></section>`; }
function levelTable(locale, type, rows, headers) {
  return `<div class="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white"><table class="w-full text-left border-collapse text-xs"><thead><tr class="bg-slate-900 text-white font-bold uppercase tracking-wider">${headers.map((h) => `<th class="p-3">${h}</th>`).join('')}</tr></thead><tbody class="divide-y divide-slate-100 text-slate-700 font-medium">${rows.map((r, i) => `<tr><td class="p-3 font-bold bg-slate-50/40">${r[0]}</td><td class="p-3"><a href="index.html?type=${type}&age=LV${i + 1}" class="font-bold underline ${['text-emerald-600','text-sky-600','text-amber-600','text-purple-600','text-rose-600'][i]}">${r[1]}</a></td><td class="p-3">${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
}
function hero(title, p1, p2, badge = '') { return `<section class="text-center space-y-3">${badge ? `<div class="inline-block bg-amber-100 border border-amber-200 rounded-full px-4 py-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">${badge}</div>` : ''}<h1 class="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">${title}</h1><p class="${text} max-w-2xl mx-auto">${p1}</p><p class="${text} max-w-2xl mx-auto">${p2}</p></section>`; }
function featured(locale, type, topId, heading) { return `<section class="space-y-4"><h2 class="text-lg font-bold text-slate-900 uppercase tracking-wide">${heading}</h2><div id="${topId}" class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white p-8 text-center rounded-2xl border border-slate-100 text-xs text-slate-400 font-bold py-12 sm:col-span-3">${t(locale,'🔄 Die neuesten Vorlagen werden geladen…','🔄 Cargando las fichas más recientes…')}</div></div></section>`; }
function bottomFeatured(locale, id, heading) { return `<section class="space-y-4 border-t border-slate-100 pt-8"><h2 class="text-md font-bold text-slate-900 uppercase tracking-wide">${heading}</h2><div id="${id}" class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white p-8 text-center rounded-2xl border border-slate-100 text-xs text-slate-400 font-bold py-12 sm:col-span-3">${t(locale,'🔄 Empfehlungen werden geladen…','🔄 Cargando recomendaciones…')}</div></div></section>`; }

function coloring(locale) {
  const de = locale === 'de';
  const main = [
    hero(t(locale,'Ausmalbilder für Kinder','Dibujos para colorear para niños'), t(locale,'Ein ausführlicher Ratgeber für Eltern, Lehrkräfte und alle, die kreative, bildschirmfreie Beschäftigungen suchen.','Una guía completa para familias, docentes y cualquier persona que busque una actividad creativa sin pantallas.'), t(locale,'Hier erfährst du, wie du Motive, Detailgrad und Materialien passend zu Alter, Erfahrung und Ausdauer auswählst.','Aquí aprenderás a elegir tema, nivel de detalle y materiales según la edad, la experiencia y la paciencia del niño.')),
    featured(locale,'omalovanky','top-omalovanky-container',t(locale,'🔥 Beliebte Ausmalbilder zum direkten Öffnen','🔥 Dibujos populares listos para abrir')),
    toc([
      ['co-jsou',t(locale,'📖 Was sind Ausmalbilder?','📖 ¿Qué son los dibujos para colorear?')],
      ['proc-vybarvuji',t(locale,'🎨 Warum malen Kinder aus?','🎨 ¿Por qué colorean los niños?')],
      ['co-rozvijeji',t(locale,'🧠 Welche Fähigkeiten werden gefördert?','🧠 ¿Qué habilidades se desarrollan?')],
      ['vyvoj-kresby',t(locale,'📈 Entwicklung von Zeichnen und Stiftkontrolle','📈 Desarrollo del dibujo y del control del lápiz')],
      ['psychologie-barev',t(locale,'🌈 Farben verstehen, ohne zu überinterpretieren','🌈 Comprender los colores sin interpretarlos de más')],
      ['vek-obtiznost',t(locale,'👶 Alter und Schwierigkeitsstufen','👶 Edad y niveles de dificultad')],
      ['jak-dite-motivovat',t(locale,'👨‍👩‍👧 Kinder motivieren','👨‍👩‍👧 Cómo motivar')],
      ['nejcastejsi-chyby',t(locale,'❌ Häufige Fehler von Erwachsenen','❌ Errores frecuentes de los adultos')],
      ['jak-vybrat-pomucky',t(locale,'🖍️ Materialien auswählen','🖍️ Elegir materiales')],
      ['doporuceni-tisk',t(locale,'🖨️ Drucktipps','🖨️ Consejos de impresión')],
      ['druhy',t(locale,'🧩 Arten von Ausmalbildern','🧩 Tipos de dibujos')],
      ['historie',t(locale,'🏛️ Vom gedruckten Bild zur modernen Vorlage','🏛️ Del dibujo impreso a la ficha moderna')],
      ['tvorba',t(locale,'⚙️ So erstellen wir unsere Seiten','⚙️ Cómo creamos nuestras fichas')],
      ['vyuziti-skoly',t(locale,'🏫 Zu Hause, in Kita und Schule','🏫 En casa, infantil y escuela')]
    ], [t(locale,'Ausmalen auf einen Blick','Colorear de un vistazo'),t(locale,'Geeignet ab: 3–4 Jahren','Adecuado desde: 3–4 años'),t(locale,'Stufen: 1–5','Niveles: 1–5'),t(locale,'Typisch: 10–30 Minuten','Habitual: 10–30 minutos'),t(locale,'Fördert: Motorik, Kreativität, Konzentration','Ayuda: motricidad, creatividad, concentración'),t(locale,'Das findest du in diesem Ratgeber','Qué encontrarás en esta guía')]),
    section('co-jsou',t(locale,'📖 Was sind Ausmalbilder?','📖 ¿Qué son los dibujos para colorear?'),paragraphs([
      t(locale,'Ein Ausmalbild ist eine Schwarz-Weiß-Zeichnung mit klaren Konturen und geschlossenen oder gut erkennbaren Flächen. Die Linien geben Orientierung, die Farbwahl bleibt frei.','Un dibujo para colorear es una ilustración en blanco y negro con contornos claros y zonas fáciles de reconocer. Las líneas dan estructura, pero la elección del color sigue siendo libre.'),
      t(locale,'Ein gutes Arbeitsblatt passt zum Entwicklungsstand. Jüngere Kinder profitieren von großen Motiven und breiten Flächen; ältere Kinder können kleinere Formen, Muster und komplexere Szenen bearbeiten.','Una buena ficha se adapta al momento de desarrollo. Los niños pequeños se benefician de figuras grandes y zonas amplias; los mayores pueden trabajar detalles, patrones y escenas más complejas.'),
      t(locale,'Das Ergebnis muss nicht realistisch sein. Eine violette Kuh, ein grüner Himmel oder ein buntes Fahrzeug sind kreative Entscheidungen und keine Fehler.','El resultado no tiene que ser realista. Una vaca violeta, un cielo verde o un vehículo multicolor son decisiones creativas, no errores.')
    ])),
    section('proc-vybarvuji',t(locale,'🎨 Warum malen Kinder aus?','🎨 ¿Por qué colorean los niños?'),paragraphs([
      t(locale,'Beim Ausmalen entscheidet das Kind selbst über Farbe, Reihenfolge und Tempo. Diese kleinen Entscheidungen geben ihm Kontrolle über das Bild und laden zum Experimentieren ein.','Al colorear, el niño decide los colores, el orden y el ritmo. Esas pequeñas decisiones le dan control sobre la imagen y le invitan a experimentar.'),
      t(locale,'Das sichtbare Fortschreiten von einer weißen Fläche zu einem fertigen Bild kann motivierend sein. Eine Seite lässt sich außerdem problemlos unterbrechen und später fortsetzen.','Ver cómo una zona blanca se convierte poco a poco en una imagen terminada puede resultar motivador. Además, la actividad puede interrumpirse y retomarse más tarde.'),
      t(locale,'Ausmalen ist zugleich eine ruhige Offline-Beschäftigung. Es kann einen Übergang zwischen aktiveren Teilen des Tages und einer ruhigeren Phase schaffen, ohne dass daraus ein Leistungstest wird.','Colorear también es una actividad tranquila sin pantalla. Puede servir como transición entre momentos activos y otros más calmados, sin convertir el resultado en una prueba.')
    ])),
    section('co-rozvijeji',t(locale,'🧠 Was kann Ausmalen fördern?','🧠 ¿Qué puede desarrollar colorear?'),cards([
      [t(locale,'✍️ Stiftkontrolle','✍️ Control del lápiz'),t(locale,'Große und kleine Flächen erfordern unterschiedliche Bewegungen, Richtungswechsel und Druckdosierung.','Las zonas grandes y pequeñas requieren movimientos distintos, cambios de dirección y control de la presión.')],
      [t(locale,'👁️ Hand-Augen-Koordination','👁️ Coordinación ojo-mano'),t(locale,'Die Augen verfolgen Konturen und freie Bereiche, während die Hand die gewählte Fläche füllt.','Los ojos siguen los contornos y las zonas libres mientras la mano rellena el espacio elegido.')],
      [t(locale,'🎨 Kreativität','🎨 Creatividad'),t(locale,'Farben, Kombinationen, Hintergründe und zusätzliche Details können frei gewählt werden.','Los colores, combinaciones, fondos y detalles adicionales pueden elegirse libremente.')],
      [t(locale,'🎯 Konzentration','🎯 Concentración'),t(locale,'Ein Bild kann in kurzen Schritten bearbeitet werden und lädt dazu ein, bei einer Aufgabe zu bleiben.','Una imagen puede completarse por partes y anima a mantener la atención en una sola tarea.')],
      [t(locale,'🧩 Planung','🧩 Planificación'),t(locale,'Kinder entscheiden, wo sie beginnen, welche Bereiche zusammenpassen und welche Farbe als Nächstes folgt.','El niño decide por dónde empezar, qué zonas combinar y qué color utilizar después.')],
      [t(locale,'🌟 Selbstständigkeit','🌟 Autonomía'),t(locale,'Es gibt viele mögliche Ergebnisse; das Kind muss nicht auf eine einzige richtige Lösung hinarbeiten.','Hay muchos resultados posibles y el niño no tiene que buscar una única solución correcta.')]
    ])),
    section('vyvoj-kresby',t(locale,'📈 Zeichnen und Ausmalen entwickeln sich schrittweise','📈 El dibujo y el coloreado se desarrollan poco a poco'),cards([
      [t(locale,'🟢 3–4 Jahre','🟢 3–4 años'),t(locale,'Große Bewegungen, kräftiger Griff und Freude am sichtbaren Farbauftrag. Große geschlossene Flächen funktionieren meist besser als kleine Details.','Movimientos amplios, agarre todavía fuerte y gusto por ver aparecer el color. Las zonas grandes suelen funcionar mejor que los detalles pequeños.')],
      [t(locale,'🔵 5–6 Jahre','🔵 5–6 años'),t(locale,'Mehr Kontrolle bei Richtungswechseln und kleineren Flächen. Einfache Szenen und mehrere Gegenstände sind gut machbar.','Aumenta el control en cambios de dirección y zonas pequeñas. Las escenas sencillas con varios elementos resultan adecuadas.')],
      [t(locale,'🟠 7–9 Jahre','🟠 7–9 años'),t(locale,'Kinder können länger an einem Motiv arbeiten, Farbkombinationen planen und feinere Konturen nutzen.','El niño puede trabajar durante más tiempo, planificar combinaciones de color y utilizar contornos más finos.')],
      [t(locale,'🟣 10+ und Erwachsene','🟣 10+ y adultos'),t(locale,'Dichte Muster, kleine Flächen und komplexere Illustrationen können als längere kreative Herausforderung dienen.','Los patrones densos, zonas pequeñas e ilustraciones complejas pueden convertirse en un reto creativo más largo.')]
    ],'space-y-4')),
    section('psychologie-barev',t(locale,'🌈 Farben wahrnehmen, ohne sie zu diagnostizieren','🌈 Observar los colores sin convertirlos en un diagnóstico'),paragraphs([
      t(locale,'Kinder wählen Farben aus vielen Gründen: Lieblingsfarben, Verfügbarkeit, Stimmung, Nachahmung oder einfach Neugier. Eine einzelne Farbwahl sagt normalerweise nichts Verlässliches über Persönlichkeit oder Gefühle aus.','Los niños eligen colores por muchos motivos: preferencias, disponibilidad, estado de ánimo, imitación o simple curiosidad. Un color aislado no permite sacar conclusiones fiables sobre su personalidad o emociones.'),
      t(locale,'Erwachsene können stattdessen offene Fragen stellen: „Welche Farbe gefällt dir hier?“ oder „Was passiert in deinem Bild?“. So bleibt die Aufmerksamkeit beim Kind und seiner eigenen Geschichte.','Los adultos pueden hacer preguntas abiertas: «¿Qué color te gusta aquí?» o «¿Qué está pasando en tu dibujo?». Así la conversación se centra en la historia del propio niño.'),
      t(locale,'Wenn ein Kind über längere Zeit deutlich belastet wirkt, sollte die Einschätzung nicht aus einem Ausmalbild abgeleitet werden, sondern aus dem Gesamtverhalten und gegebenenfalls mit einer geeigneten Fachperson besprochen werden.','Si un niño parece preocupado o afectado durante un periodo prolongado, no conviene interpretarlo a partir de un dibujo aislado, sino observar el conjunto de su comportamiento y, si hace falta, consultarlo con un profesional adecuado.')
    ])),
    section('vek-obtiznost',t(locale,'👶 Alter und Schwierigkeitsstufen','👶 Edad y niveles de dificultad'),levelTable(locale,'omalovanky', de ? [
      ['3–4 Jahre','Stufe 1 · Anfänger','Ein großes Motiv, kräftige Konturen, sehr große geschlossene Flächen und wenig Ablenkung.'],
      ['5–6 Jahre','Stufe 2 · Vorschule','Mehr Formen und einfache Details, weiterhin klar getrennte Flächen und gut lesbare Konturen.'],
      ['7–9 Jahre','Stufe 3 · Grundschule','Kleine Szenen, mehrere Gegenstände und mittlere Flächen mit mehr Möglichkeiten für eigene Farbkombinationen.'],
      ['10+ Jahre','Stufe 4 · Fortgeschritten','Detailreichere Illustrationen, kleinere Flächen und längere konzentrierte Bearbeitung.'],
      ['12+ & Erwachsene','Stufe 5 · Experte','Sehr viele kleine Flächen, feine Konturen und komplexe Motive für längere kreative Arbeit.']
    ] : [
      ['3–4 años','Nivel 1 · Principiante','Una figura grande, contornos gruesos, zonas muy amplias y pocas distracciones.'],
      ['5–6 años','Nivel 2 · Preescolar','Más formas y detalles sencillos, todavía con zonas bien separadas y contornos claros.'],
      ['7–9 años','Nivel 3 · Primaria','Escenas pequeñas, varios objetos y zonas medianas con más posibilidades de combinar colores.'],
      ['10+ años','Nivel 4 · Avanzado','Ilustraciones más detalladas, zonas pequeñas y un trabajo más prolongado.'],
      ['12+ y adultos','Nivel 5 · Experto','Muchas zonas pequeñas, contornos finos y temas complejos para una actividad creativa larga.']
    ], de ? ['Alter','Stufe','Typische Gestaltung'] : ['Edad','Nivel','Diseño habitual'])),
    section('jak-dite-motivovat',t(locale,'👨‍👩‍👧 So bleibt Ausmalen freiwillig und motivierend','👨‍👩‍👧 Cómo mantener el coloreado voluntario y motivador'),cards([
      [t(locale,'🖼️ Motiv selbst wählen','🖼️ Elegir el dibujo'),t(locale,'Ein interessantes Thema motiviert oft stärker als eine perfekt passende Altersangabe.','Un tema que interesa al niño suele motivar más que una edad perfectamente ajustada.')],
      [t(locale,'🌈 Farben frei lassen','🌈 Dejar libertad de color'),t(locale,'Keine Farbkombination muss korrigiert werden. Fragen sind hilfreicher als Vorgaben.','No hace falta corregir combinaciones. Las preguntas funcionan mejor que las órdenes.')],
      [t(locale,'⏸️ Pausen erlauben','⏸️ Permitir pausas'),t(locale,'Ein Bild darf später fertiggestellt werden. Lange Konzentration ist kein Ziel für sich.','Un dibujo puede terminarse otro día. Mantenerse sentado mucho tiempo no es un objetivo en sí mismo.')],
      [t(locale,'❤️ Prozess loben','❤️ Valorar el proceso'),t(locale,'Geduld, eigene Ideen und Ausdauer sind sinnvollere Rückmeldungen als „schön“ oder „sauber“.','La paciencia, las ideas propias y la constancia son comentarios más útiles que «bonito» o «limpio».')],
      [t(locale,'👨‍👩‍👧 Gemeinsam malen','👨‍👩‍👧 Colorear juntos'),t(locale,'Erwachsene können daneben ein eigenes Bild ausmalen, ohne die Kinderarbeit zu übernehmen.','El adulto puede colorear su propia hoja al lado sin hacerse cargo del trabajo del niño.')],
      [t(locale,'🎨 Erweiterungen anbieten','🎨 Añadir posibilidades'),t(locale,'Nach dem Ausmalen können Hintergrund, Name, Geschichte oder zusätzliche Gegenstände ergänzt werden.','Después se puede añadir un fondo, un nombre, una historia u objetos nuevos.')]
    ])),
    section('nejcastejsi-chyby',t(locale,'❌ Häufige Fehler von Erwachsenen','❌ Errores frecuentes de los adultos'),bullets(de ? [
      'Farben als richtig oder falsch bewerten.',
      'Schon bei jungen Kindern perfekte Konturtreue erwarten.',
      'Bilder von Geschwistern oder Freunden miteinander vergleichen.',
      'Ein zu detailliertes Motiv nur wegen des Alters auswählen.',
      'Darauf bestehen, dass eine begonnene Seite sofort fertiggestellt wird.',
      'Das Ergebnis verbessern oder übermalen, ohne dass das Kind darum gebeten hat.'
    ] : [
      'Decir que un color es correcto o incorrecto.',
      'Esperar que un niño pequeño no se salga nunca del contorno.',
      'Comparar el resultado con el de hermanos o compañeros.',
      'Elegir una ficha demasiado detallada solo por la edad.',
      'Exigir que una página empezada se termine de una vez.',
      'Retocar el resultado del niño sin que lo haya pedido.'
    ])),
    section('jak-vybrat-pomucky',t(locale,'🖍️ Welche Materialien eignen sich?','🖍️ ¿Qué materiales son adecuados?'),cards([
      [t(locale,'🖍️ Wachsmalstifte','🖍️ Ceras'),t(locale,'Gut greifbar und angenehm für große Flächen. Besonders praktisch für jüngere Kinder.','Fáciles de agarrar y cómodas para zonas grandes, especialmente para niños pequeños.')],
      [t(locale,'✏️ Buntstifte','✏️ Lápices de colores'),t(locale,'Vielseitig und kontrollierbar. Dickere Stifte sind für Anfänger oft bequemer.','Versátiles y fáciles de controlar. Los lápices gruesos suelen ser cómodos para principiantes.')],
      [t(locale,'🖊️ Filzstifte','🖊️ Rotuladores'),t(locale,'Kräftige Farben, aber sie können durch dünnes Papier drücken. Eine Unterlage ist sinnvoll.','Colores intensos, pero pueden traspasar papel fino. Conviene usar una hoja protectora debajo.')],
      [t(locale,'🎨 Aquarellstifte','🎨 Lápices acuarelables'),t(locale,'Für ältere Kinder und Erwachsene, die mit Übergängen und Wasser experimentieren möchten.','Para niños mayores y adultos que quieran experimentar con degradados y agua.')]
    ])),
    section('doporuceni-tisk',t(locale,'🖨️ Drucktipps','🖨️ Consejos de impresión'),bullets(de ? ['A4 und 100 % beziehungsweise „Tatsächliche Größe“ verwenden.','Bei Filzstiften stärkeres Papier oder eine Schutzunterlage nutzen.','Einseitig drucken, wenn Farbe durchschlagen könnte.','Für jüngere Kinder kann ein größeres Druckformat hilfreich sein.','Lieblingsseiten in einer Mappe sammeln oder in einer Klarsichthülle wiederverwenden.'] : ['Utiliza A4 y 100 % o «Tamaño real».','Con rotuladores, usa papel más grueso o una hoja protectora debajo.','Imprime a una sola cara si el color puede traspasar.','Para los más pequeños puede resultar útil ampliar la impresión.','Guarda las fichas favoritas en una carpeta o reutilízalas dentro de una funda transparente.'],'text-emerald-900'),'bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-5'),
    section('druhy',t(locale,'🧩 Arten von Ausmalbildern','🧩 Tipos de dibujos para colorear'),cards((de ? ['🐶 Tiere','🚗 Fahrzeuge','🌿 Natur','🚀 Weltraum','🏰 Fantasie','🎄 Jahreszeiten und Feste','🏡 Alltag','🌀 Detailmuster'] : ['🐶 Animales','🚗 Vehículos','🌿 Naturaleza','🚀 Espacio','🏰 Fantasía','🎄 Estaciones y fiestas','🏡 Vida cotidiana','🌀 Patrones detallados']).map((x) => [x,t(locale,'Die Schwierigkeit kann innerhalb jedes Themas von sehr einfach bis sehr detailreich reichen.','La dificultad dentro de cada tema puede ir desde muy sencilla hasta muy detallada.')]),'sm:grid-cols-2 md:grid-cols-4')),
    section('historie',t(locale,'🏛️ Von gedruckten Bildern zu kostenlosen Vorlagen','🏛️ De los dibujos impresos a las fichas gratuitas'),paragraphs([
      t(locale,'Menschen bemalen und verzieren Bilder seit sehr langer Zeit. Gedruckte Mal- und Zeichenbücher machten die Beschäftigung später für Familien und Schulen leicht verfügbar.','Las personas llevan muchísimo tiempo decorando imágenes con color. Más tarde, los libros impresos de dibujo y pintura hicieron esta actividad accesible para familias y escuelas.'),
      t(locale,'Mit günstigerem Druck wurden Ausmalbücher im 20. Jahrhundert zu einer alltäglichen Kinderbeschäftigung mit Themen von Tieren bis Technik.','Con la impresión más asequible, los libros para colorear se convirtieron durante el siglo XX en una actividad cotidiana con temas que iban de animales a tecnología.'),
      t(locale,'Heute können Vorlagen direkt zu Hause ausgewählt und ausgedruckt werden. Dadurch lassen sich Motiv und Schwierigkeitsgrad viel genauer an den jeweiligen Nutzer anpassen.','Hoy las fichas pueden elegirse e imprimirse directamente en casa, lo que permite ajustar mucho mejor el tema y la dificultad a cada persona.'),
      t(locale,'Auch Jugendliche und Erwachsene nutzen detailreiche Ausmalbilder als kreatives Hobby. Der entscheidende Punkt bleibt derselbe: eine klare Vorlage und viel Freiheit bei der eigenen Gestaltung.','Los adolescentes y adultos también utilizan dibujos detallados como afición creativa. La idea básica sigue siendo la misma: una estructura clara y mucha libertad para personalizar el resultado.')
    ])),
    section('tvorba',t(locale,'⚙️ So erstellen wir unsere Ausmalbilder','⚙️ Cómo creamos nuestros dibujos'),cards([
      [t(locale,'💡 1. Thema und Zielgruppe','💡 1. Tema y público'),t(locale,'Wir legen Motiv, Alter und Detailgrad fest.','Definimos el tema, la edad y el nivel de detalle.')],
      [t(locale,'🤖 2. Entwurf','🤖 2. Diseño'),t(locale,'Digitale Illustration und KI-gestützte Werkzeuge helfen beim ersten Entwurf.','La ilustración digital y herramientas asistidas por IA ayudan a crear el primer diseño.')],
      [t(locale,'✅ 3. Prüfung','✅ 3. Revisión'),t(locale,'Konturen, geschlossene Flächen, Lesbarkeit und Altersangemessenheit werden kontrolliert.','Revisamos contornos, zonas cerradas, legibilidad y adecuación a la edad.')],
      [t(locale,'📥 4. Web und Druck','📥 4. Web e impresión'),t(locale,'Die fertige Seite wird für schnelles Laden und einen sauberen A4-Druck vorbereitet.','La ficha final se prepara para cargar rápido y para una impresión A4 limpia.')]
    ],'sm:grid-cols-2 md:grid-cols-4')),
    section('vyuziti-skoly',t(locale,'🏫 Einsatz zu Hause, in Kita und Schule','🏫 Uso en casa, infantil y escuela'),cards([
      [t(locale,'🏠 Zu Hause','🏠 En casa'),t(locale,'Für ruhige Nachmittage, Reisen, gemeinsame Kreativzeit oder eine kurze bildschirmfreie Pause.','Para tardes tranquilas, viajes, tiempo creativo en familia o una pausa corta sin pantallas.')],
      [t(locale,'🎒 Kita und Schule','🎒 Infantil y escuela'),t(locale,'Für freie Arbeitsphasen, Kunstangebote, Themenwochen und einfache Feinmotorikübungen.','Para trabajo autónomo, actividades artísticas, proyectos temáticos y práctica sencilla de motricidad fina.')],
      [t(locale,'🎉 Gruppen und Veranstaltungen','🎉 Grupos y eventos'),t(locale,'Eine unkomplizierte Beschäftigung für Kinderbereiche, Feiern und Nachmittagsprogramme.','Una actividad sencilla para rincones infantiles, celebraciones y programas extraescolares.')]
    ],'md:grid-cols-3')),
    bottomFeatured(locale,'bottom-omalovanky-container',t(locale,'📥 Weitere Ausmalbilder entdecken','📥 Descubre más dibujos para colorear')),
    `<section class="text-center pt-4"><a href="index.html?type=omalovanky" class="inline-block bg-rose-100 border border-rose-200 rounded-full px-8 py-3.5 text-xs font-extrabold text-rose-900 uppercase tracking-wider hover:bg-rose-200 transition-all">${t(locale,'🎨 Alle Ausmalbilder öffnen →','🎨 Abrir todos los dibujos →')}</a></section>`
  ].join('\n');
  return `<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-12">${main}</main>`;
}

function mazes(locale) {
  const de = locale === 'de';
  const main = [
    hero(t(locale,'Labyrinthe für Kinder','Laberintos para niños'),t(locale,'Ein ausführlicher Ratgeber zu druckbaren Labyrinthen für Eltern, Lehrkräfte und alle, die gern knobeln.','Una guía completa de laberintos imprimibles para familias, docentes y cualquiera que disfrute resolviendo pequeños retos.'),t(locale,'Hier findest du Hinweise zu Alter, Schwierigkeitsgrad, Lösungsstrategien, Materialien und dazu, welche Fähigkeiten bei einem guten Labyrinth gefordert werden.','Aquí encontrarás orientación sobre edad, dificultad, estrategias, materiales y las habilidades que intervienen al resolver un buen laberinto.')),
    featured(locale,'bludiste','top-bludiste-container',t(locale,'🔥 Beliebte Labyrinthe zum direkten Öffnen','🔥 Laberintos populares listos para abrir')),
    toc([
      ['co-jsou',t(locale,'📖 Was sind Labyrinthe?','📖 ¿Qué son los laberintos?')],['co-rozvijeji',t(locale,'🧠 Welche Fähigkeiten werden gefördert?','🧠 ¿Qué habilidades desarrollan?')],['vek-obtiznost',t(locale,'👶 Alter und Schwierigkeit','👶 Edad y dificultad')],['jak-dite-ucit',t(locale,'👨‍👩‍👧 Kindern das Lösen beibringen','👨‍👩‍👧 Enseñar a resolverlos')],['co-budete-potrebovat',t(locale,'✏️ Materialien','✏️ Materiales')],['doporuceni-tisk',t(locale,'🖨️ Drucktipps','🖨️ Impresión')],['druhy',t(locale,'🧩 Arten von Labyrinthen','🧩 Tipos de laberintos')],['historie',t(locale,'🏛️ Von Wegen und Irrgärten','🏛️ De los recorridos a los pasatiempos')],['tvorba',t(locale,'⚙️ So erstellen wir Labyrinthe','⚙️ Cómo los creamos')],['nejcastejsi-chyby',t(locale,'❌ Häufige Fehler','❌ Errores frecuentes')],['vyuziti-skoly',t(locale,'🏫 Zu Hause und in der Schule','🏫 En casa y en la escuela')]
    ],[t(locale,'Labyrinthe auf einen Blick','Laberintos de un vistazo'),t(locale,'Geeignet ab: etwa 3 Jahren','Adecuado desde: unos 3 años'),t(locale,'Stufen: 1–5','Niveles: 1–5'),t(locale,'Typisch: 5–30 Minuten','Habitual: 5–30 minutos'),t(locale,'Fördert: Planung, Raumlage, Motorik, Konzentration','Ayuda: planificación, orientación, motricidad, concentración'),t(locale,'Das findest du in diesem Ratgeber','Qué encontrarás en esta guía')]),
    section('co-jsou',t(locale,'📖 Was ist ein Labyrinth und warum macht es Spaß?','📖 ¿Qué es un laberinto y por qué resulta divertido?'),paragraphs([
      t(locale,'Ein Labyrinth ist eine visuelle Aufgabe aus Wegen, Abzweigungen und Sackgassen. Ziel ist es, vom Start einen gültigen Weg bis zum Ziel zu finden.','Un laberinto es un reto visual formado por caminos, cruces y callejones sin salida. El objetivo es encontrar una ruta válida desde el inicio hasta la meta.'),
      t(locale,'Einfache Aufgaben haben breite Wege und wenige Entscheidungen. Anspruchsvollere Labyrinthe enthalten schmale Passagen, viele Abzweigungen und Wege, die zunächst richtig aussehen, später aber enden.','Los más sencillos tienen caminos anchos y pocas decisiones. Los difíciles incluyen pasillos estrechos, muchas bifurcaciones y rutas que parecen correctas pero terminan más adelante.'),
      t(locale,'Der Reiz entsteht aus Erkundung und unmittelbarer Rückmeldung. Eine Sackgasse ist kein Misserfolg, sondern eine Information: Dieser Weg funktioniert nicht, also wird eine andere Möglichkeit ausprobiert.','La gracia está en explorar y recibir información inmediata. Un callejón sin salida no es un fracaso, sino una pista: ese camino no funciona y toca probar otra opción.')
    ])),
    section('co-rozvijeji',t(locale,'🧠 Welche Fähigkeiten können Labyrinthe fördern?','🧠 ¿Qué habilidades pueden desarrollar los laberintos?'),cards([
      [t(locale,'🧠 Logisches Denken','🧠 Pensamiento lógico'),t(locale,'Abzweigungen vergleichen und Folgen abschätzen, bevor die Linie weitergeführt wird.','Comparar opciones y anticipar qué puede ocurrir antes de continuar la línea.')],
      [t(locale,'🗺️ Räumliche Orientierung','🗺️ Orientación espacial'),t(locale,'Links, rechts, oben, unten, Nähe, Abstand und Lage auf dem Blatt werden praktisch genutzt.','Se practican izquierda, derecha, arriba, abajo, distancia y posición dentro de la hoja.')],
      [t(locale,'🎯 Konzentration','🎯 Concentración'),t(locale,'Der Blick muss dem Weg folgen und gleichzeitig mögliche nächste Schritte im Auge behalten.','La vista sigue el recorrido mientras mantiene presentes las próximas decisiones posibles.')],
      [t(locale,'⏳ Geduld','⏳ Paciencia'),t(locale,'Sackgassen zeigen, dass Zurückgehen und ein neuer Versuch ein normaler Teil des Lösens sind.','Los callejones sin salida enseñan que retroceder y probar de nuevo forma parte normal de resolver un problema.')],
      [t(locale,'✏️ Feinmotorik','✏️ Motricidad fina'),t(locale,'Das Führen von Finger oder Stift innerhalb eines Weges trainiert kontrollierte Bewegungen.','Guiar el dedo o el lápiz dentro del camino practica movimientos controlados.')],
      [t(locale,'👁️ Visuelles Scannen','👁️ Exploración visual'),t(locale,'Augen suchen Abzweigungen, Sackgassen und mögliche Verbindungen über die gesamte Seite.','Los ojos buscan cruces, salidas falsas y conexiones por toda la página.')]
    ])),
    section('vek-obtiznost',t(locale,'👶 Alter und Schwierigkeitsstufen','👶 Edad y niveles de dificultad'),levelTable(locale,'bludiste',de ? [
      ['3–4 Jahre','Stufe 1 · Anfänger','Sehr breite Wege, klare Außenlinien, wenige oder keine Abzweigungen. Finger oder dicker Stift reichen aus.'],
      ['5–6 Jahre','Stufe 2 · Vorschule','Einfache T- und Y-Abzweigungen, kurze Sackgassen und eine gut erkennbare Geschichte zwischen Start und Ziel.'],
      ['7–9 Jahre','Stufe 3 · Grundschule','Längere Wege, mehr Kreuzungen und schmalere Passagen verlangen vorausschauendes Suchen.'],
      ['10+ Jahre','Stufe 4 · Fortgeschritten','Viele falsche Wege, visuelle Ablenkung und dichtere Strukturen erfordern längere Konzentration.'],
      ['12+ & Erwachsene','Stufe 5 · Experte','Sehr dichte Irrgärten mit langen Routen, zahlreichen Sackgassen und komplexer Planung.']
    ] : [
      ['3–4 años','Nivel 1 · Principiante','Caminos muy anchos, bordes claros y pocas o ninguna bifurcación. Puede resolverse con el dedo o un lápiz grueso.'],
      ['5–6 años','Nivel 2 · Preescolar','Cruces sencillos en T o Y, callejones cortos y una historia clara entre el inicio y la meta.'],
      ['7–9 años','Nivel 3 · Primaria','Recorridos más largos, más cruces y pasos estrechos que exigen mirar con anticipación.'],
      ['10+ años','Nivel 4 · Avanzado','Muchas rutas falsas, distracciones visuales y estructuras densas que requieren atención prolongada.'],
      ['12+ y adultos','Nivel 5 · Experto','Laberintos muy densos con recorridos largos, numerosos callejones y planificación compleja.']
    ],de ? ['Alter','Stufe','Typische Gestaltung'] : ['Edad','Nivel','Diseño habitual'])),
    section('jak-dite-ucit',t(locale,'👨‍👩‍👧 So lernen Kinder Labyrinthe zu lösen','👨‍👩‍👧 Cómo enseñar a resolver laberintos'),cards([
      [t(locale,'👆 Erst mit dem Finger','👆 Primero con el dedo'),t(locale,'Bei neuen oder schwierigeren Aufgaben kann das Kind den Weg zunächst ohne Stift erkunden.','Ante una ficha nueva o difícil, puede explorar primero el camino sin marcarlo.')],
      [t(locale,'👀 Vom Start aus vorausschauen','👀 Mirar antes de avanzar'),t(locale,'An Kreuzungen kurz anhalten und ein Stück voraus prüfen, statt sofort eine Richtung zu markieren.','En los cruces conviene detenerse y mirar un poco más allá antes de elegir.')],
      [t(locale,'↩️ Sackgassen akzeptieren','↩️ Aceptar los callejones'),t(locale,'Zurückgehen gehört zur Aufgabe. Eine falsche Route liefert nützliche Information.','Retroceder forma parte del juego. Una ruta equivocada aporta información útil.')],
      [t(locale,'🎯 Kleine Ziele setzen','🎯 Marcar pequeños objetivos'),t(locale,'Bei langen Labyrinthen kann bis zur nächsten markanten Kreuzung gearbeitet und dann kurz pausiert werden.','En laberintos largos se puede avanzar hasta un cruce importante y hacer una breve pausa.')],
      [t(locale,'🗣️ Denken erklären lassen','🗣️ Explicar el razonamiento'),t(locale,'Fragen wie „Warum würdest du hier nach links gehen?“ machen die Strategie sichtbar, ohne die Lösung vorzugeben.','Preguntas como «¿por qué irías por la izquierda?» hacen visible la estrategia sin dar la solución.')],
      [t(locale,'🎉 Erfolg nicht übertreiben','🎉 Valorar el proceso'),t(locale,'Lobe genaues Schauen, Ausprobieren und selbstständiges Korrigieren – nicht nur die kürzeste Route.','Valora mirar con atención, probar y corregirse de forma autónoma, no solo llegar rápido.')]
    ])),
    section('co-budete-potrebovat',t(locale,'✏️ Was braucht man?','✏️ ¿Qué se necesita?'),cards([
      [t(locale,'👆 Finger','👆 Dedo'),t(locale,'Für erste Versuche oder zum Vorplanen einer Route.','Para los primeros intentos o para planificar antes de marcar.')],
      [t(locale,'✏️ Bleistift','✏️ Lápiz'),t(locale,'Ideal, wenn falsche Wege wieder radiert werden sollen.','Ideal si se quiere borrar una ruta equivocada.')],
      [t(locale,'🖍️ Buntstift','🖍️ Lápiz de color'),t(locale,'Gut sichtbar und angenehm für breitere Wege.','Visible y cómodo para caminos anchos.')],
      [t(locale,'🖊️ Dünner Filzstift','🖊️ Rotulador fino'),t(locale,'Für ältere Kinder und schmale Wege, wenn die Route schon sicher ist.','Para niños mayores y caminos estrechos cuando la ruta ya está clara.')]
    ])),
    section('doporuceni-tisk',t(locale,'🖨️ Drucktipps','🖨️ Consejos de impresión'),bullets(de ? ['A4 und 100 % beziehungsweise „Tatsächliche Größe“ wählen.','Für Stufe 1 kann ein größeres Format den Weg übersichtlicher machen.','Bei Filzstiften eine Schutzunterlage unter dünnes Papier legen.','Hoher Kontrast hilft, Wege und Außenlinien sauber zu unterscheiden.','Für Wiederholung kann die Seite laminiert oder in eine Klarsichthülle gelegt werden.'] : ['Selecciona A4 y 100 % o «Tamaño real».','En Nivel 1, una impresión más grande puede hacer el recorrido más claro.','Con rotuladores, coloca una hoja protectora bajo papel fino.','Un buen contraste ayuda a distinguir caminos y paredes.','Para reutilizar la ficha, puede plastificarse o colocarse en una funda transparente.'],'text-emerald-900'),'bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-5'),
    section('druhy',t(locale,'🧩 Arten von Labyrinthen','🧩 Tipos de laberintos'),cards((de ? ['🏁 Klassisch: Start → Ziel','🍎 Sammeln und Entdecken','🐾 Tierwege','🚗 Fahrzeuge','🏰 Abenteuer','🔢 Lernlabyrinthe','🌀 Formen und Muster','🧠 Experten-Irrgärten'] : ['🏁 Clásico: inicio → meta','🍎 Recoger y explorar','🐾 Caminos de animales','🚗 Vehículos','🏰 Aventuras','🔢 Laberintos educativos','🌀 Formas y patrones','🧠 Retos expertos']).map((x) => [x,t(locale,'Das Grundprinzip bleibt gleich, aber Geschichte und Wegstruktur verändern die Erfahrung.','El principio es el mismo, pero la historia y la estructura del recorrido cambian la experiencia.')]),'sm:grid-cols-2 md:grid-cols-4')),
    section('historie',t(locale,'🏛️ Von begehbaren Wegen zu Papierlabyrinthen','🏛️ De recorridos físicos a pasatiempos de papel'),paragraphs([
      t(locale,'Verschlungene Wege und Labyrinthmotive tauchen seit langer Zeit in Architektur, Gärten, Kunst und Spielen auf. Manche besitzen nur einen Weg, andere viele echte Entscheidungen.','Los recorridos enrevesados y motivos laberínticos aparecen desde hace mucho tiempo en arquitectura, jardines, arte y juegos. Algunos tienen un único camino y otros muchas decisiones reales.'),
      t(locale,'Mit gedruckten Rätseln wurde aus dem räumlichen Erlebnis eine Aufgabe auf Papier. Dadurch konnten Kinder Wege mit Blick und Stift erkunden, ohne einen echten Irrgarten zu betreten.','Con los pasatiempos impresos, la experiencia espacial se trasladó al papel. Los niños podían explorar rutas con la vista y el lápiz sin entrar en un laberinto real.'),
      t(locale,'Moderne druckbare Labyrinthe lassen sich sehr genau nach Zielgruppe gestalten: Wegbreite, Anzahl der Abzweigungen, Länge und visuelle Ablenkung können schrittweise erhöht werden.','Los laberintos imprimibles modernos permiten ajustar con precisión la dificultad: anchura del camino, número de cruces, longitud y distracciones visuales pueden aumentar gradualmente.'),
      t(locale,'Damit eignen sie sich sowohl als kurze Spielaufgabe als auch als anspruchsvollere Denk- und Konzentrationsübung.','Por eso sirven tanto como juego breve como para retos más largos de razonamiento y concentración.')
    ])),
    section('tvorba',t(locale,'⚙️ So erstellen wir unsere Labyrinthe','⚙️ Cómo creamos nuestros laberintos'),cards([
      [t(locale,'💡 1. Geschichte und Stufe','💡 1. Historia y nivel'),t(locale,'Wir legen Zielgruppe, Wegbreite, Länge und Anzahl der Entscheidungen fest.','Definimos edad, anchura, longitud y cantidad de decisiones.')],
      [t(locale,'🧩 2. Wegstruktur','🧩 2. Estructura'),t(locale,'Der Lösungsweg und sinnvolle Sackgassen werden so angelegt, dass die Stufe verständlich bleibt.','Diseñamos la ruta correcta y callejones razonables para mantener una dificultad coherente.')],
      [t(locale,'🎨 3. Illustration','🎨 3. Ilustración'),t(locale,'Szene und Figuren unterstützen die Geschichte, dürfen den Weg aber nicht unlesbar machen.','La escena y los personajes apoyan la historia sin ocultar el recorrido.')],
      [t(locale,'✅ 4. Test','✅ 4. Prueba'),t(locale,'Wir prüfen Start, Ziel, Lösbarkeit, Druckkontrast und Altersangemessenheit.','Comprobamos inicio, meta, solución, contraste de impresión y adecuación a la edad.')]
    ],'sm:grid-cols-2 md:grid-cols-4')),
    section('nejcastejsi-chyby',t(locale,'❌ Häufige Fehler beim Lösen','❌ Errores frecuentes al resolver'),bullets(de ? ['Zu schnell in eine Abzweigung zeichnen, ohne vorauszuschauen.','Eine Sackgasse als „Fehler“ bewerten und frustriert aufgeben.','Bei einem Kind sofort die richtige Richtung ansagen.','Ein deutlich zu schwieriges Labyrinth nur wegen des Alters auswählen.','Mit zu dickem Stift in sehr schmalen Wegen arbeiten.','Nur auf Geschwindigkeit statt auf Strategie und selbstständiges Korrigieren achten.'] : ['Entrar demasiado rápido en un cruce sin mirar más adelante.','Interpretar un callejón sin salida como fracaso y abandonar.','Decir inmediatamente al niño qué dirección es correcta.','Elegir un laberinto demasiado difícil solo por la edad.','Usar un marcador demasiado grueso en caminos estrechos.','Valorar solo la velocidad en lugar de la estrategia y la autocorrección.'])),
    section('vyuziti-skoly',t(locale,'🏫 Labyrinthe zu Hause, in Kita und Schule','🏫 Laberintos en casa, infantil y escuela'),cards([
      [t(locale,'🏠 Zu Hause','🏠 En casa'),t(locale,'Für Reisen, Wartezeiten, Regentage oder eine kurze ruhige Aufgabe ohne Bildschirm.','Para viajes, esperas, días de lluvia o una actividad tranquila sin pantallas.')],
      [t(locale,'🎒 Kita und Schule','🎒 Infantil y escuela'),t(locale,'Als Feinmotorikübung, Denkaufgabe, frühe Raumorientierung oder ruhige Zusatzaufgabe.','Como práctica de motricidad, razonamiento, orientación espacial o actividad adicional tranquila.')],
      [t(locale,'🎉 Gruppen','🎉 Grupos'),t(locale,'Labyrinthe lassen sich leicht in Themenwochen, Stationenlernen und Kinderbereiche integrieren.','Se integran fácilmente en proyectos temáticos, rincones de trabajo y zonas infantiles.')]
    ],'md:grid-cols-3')),
    bottomFeatured(locale,'bottom-bludiste-container',t(locale,'📥 Weitere Labyrinthe entdecken','📥 Descubre más laberintos')),
    `<section class="text-center pt-4"><a href="index.html?type=bludiste" class="inline-block bg-rose-100 border border-rose-200 rounded-full px-8 py-3.5 text-xs font-extrabold text-rose-900 uppercase tracking-wider hover:bg-rose-200 transition-all">${t(locale,'🧩 Alle Labyrinthe öffnen →','🧩 Abrir todos los laberintos →')}</a></section>`
  ].join('\n');
  return `<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-12">${main}</main>`;
}

function tracing(locale) {
  const de = locale === 'de';
  const main = [
    hero(t(locale,'Nachzeichnen und Linien nachfahren','Trazado y repaso de líneas'),t(locale,'Ein ausführlicher Ratgeber zu Arbeitsblättern mit hellgrauen Führungslinien für Eltern, Lehrkräfte, Kinder und Erwachsene.','Una guía completa de fichas con líneas guía gris claro para familias, docentes, niños y adultos.'),t(locale,'Die Kategorie wird noch vorbereitet. Der Ratgeber erklärt bereits, wie Stiftkontrolle, Linienführung, Ergonomie und Schwierigkeitsstufen bei unseren zukünftigen Vorlagen funktionieren.','La categoría todavía está en preparación. La guía ya explica cómo funcionarán el control del lápiz, la ergonomía, las líneas y los niveles de nuestras futuras fichas.'),t(locale,'✏️ In Vorbereitung','✏️ En preparación')),
    toc([
      ['co-jsou',t(locale,'📖 Was sind Nachzeichenvorlagen?','📖 ¿Qué son las fichas de trazado?')],['proc-obtahuji',t(locale,'✏️ Warum Linien nachfahren?','✏️ ¿Por qué repasar líneas?')],['co-rozvijeji',t(locale,'🧠 Welche Fähigkeiten werden geübt?','🧠 ¿Qué habilidades se practican?')],['vyvoj-grafomotoriky',t(locale,'📈 Entwicklung der Stiftkontrolle','📈 Desarrollo del control del lápiz')],['jak-vybrat',t(locale,'🧩 Die richtige Vorlage wählen','🧩 Elegir la ficha adecuada')],['vek-obtiznost',t(locale,'👶 Stufen 1–5','👶 Niveles 1–5')],['jak-pracovat',t(locale,'👨‍👩‍👧 Sinnvoll begleiten','👨‍👩‍👧 Acompañar sin hacer la tarea')],['nejcastejsi-chyby',t(locale,'❌ Fehler und Ermüdung','❌ Errores y fatiga')],['ergonomie',t(locale,'🪑 Ergonomie','🪑 Ergonomía')],['jak-vybrat-pomucky',t(locale,'🖊️ Stifte und Hilfsmittel','🖊️ Lápices y herramientas')],['doporuceni-tisk',t(locale,'🖨️ Druckqualität','🖨️ Calidad de impresión')],['druhy',t(locale,'🧩 Varianten','🧩 Variantes')],['historie',t(locale,'🏛️ Geschichte','🏛️ Historia')],['tvorba',t(locale,'⚙️ So erstellen wir Vorlagen','⚙️ Cómo creamos las fichas')],['vyuziti-skoly',t(locale,'🏫 Einsatzmöglichkeiten','🏫 Usos')],['faq',t(locale,'❓ Häufige Fragen','❓ Preguntas frecuentes')]
    ],[t(locale,'Nachzeichnen auf einen Blick','Trazado de un vistazo'),t(locale,'Geplant ab: 3–4 Jahren','Previsto desde: 3–4 años'),t(locale,'Stufen: 1–5','Niveles: 1–5'),t(locale,'Führungslinie: hellgrau','Línea guía: gris claro'),t(locale,'Ziel: Kontrolle, Koordination, ruhige Bewegung','Objetivo: control, coordinación y movimiento fluido'),t(locale,'Das findest du in diesem Ratgeber','Qué encontrarás en esta guía')]),
    section('co-jsou',t(locale,'📖 Was sind Nachzeichenvorlagen?','📖 ¿Qué son las fichas de trazado?'),paragraphs([
      t(locale,'Bei unseren Nachzeichenvorlagen ist ein Teil der Illustration bereits mit schwarzen Konturen fertig. Andere Bereiche erscheinen als präzise hellgraue Führungslinien. Diese Linien werden mit Stift oder Buntstift nachgefahren, bis das Bild vollständig ist.','En nuestras fichas de trazado, una parte de la ilustración ya aparece con contornos negros y otras zonas se muestran mediante líneas guía precisas de color gris claro. El usuario repasa esas líneas hasta completar la imagen.'),
      t(locale,'Die graue Linie ist eine Hilfe und keine Prüfung. Kleine Abweichungen sind normal. Wichtiger sind eine entspannte Bewegung, angemessener Druck und die Fähigkeit, der Form zunehmend sicher zu folgen.','La línea gris es una ayuda, no un examen. Las pequeñas desviaciones son normales. Importan más un movimiento relajado, una presión adecuada y seguir la forma con confianza creciente.'),
      t(locale,'Nach dem Nachzeichnen kann die fertige Schwarz-Weiß-Zeichnung zusätzlich ausgemalt werden. Dadurch entstehen zwei aufeinanderfolgende Aktivitäten auf einem Blatt.','Después de repasar, la ilustración terminada puede colorearse. Así una sola ficha ofrece dos actividades consecutivas.')
    ])),
    section('proc-obtahuji',t(locale,'✏️ Warum fahren Kinder Linien nach?','✏️ ¿Por qué los niños repasan líneas?'),paragraphs([
      t(locale,'Eine vorgegebene Linie gibt einen klaren Weg vor. Das Kind muss Blick und Hand koordinieren, Geschwindigkeit an Kurven anpassen und entscheiden, wie es das Blatt für eine angenehme Bewegung positioniert.','Una línea marcada ofrece un camino claro. El niño coordina vista y mano, ajusta la velocidad en curvas y decide cómo colocar el papel para moverse con comodidad.'),
      t(locale,'Für jüngere Kinder kann dies eine Brücke zwischen freiem Kritzeln und bewusstem Zeichnen von Formen sein. Ältere Nutzer können feinere und längere Linien als Präzisionsaufgabe bearbeiten.','Para los pequeños puede ser un puente entre garabatear libremente y dibujar formas con intención. Los mayores pueden trabajar líneas más finas y largas como ejercicio de precisión.'),
      t(locale,'Das Ziel ist nicht, jede Linie perfekt zu treffen. Regelmäßige kurze Übungen mit passender Schwierigkeit sind sinnvoller als eine lange Aufgabe unter Druck.','El objetivo no es seguir cada línea con perfección. Prácticas cortas y ajustadas al nivel suelen ser más útiles que una tarea larga con presión.')
    ])),
    section('co-rozvijeji',t(locale,'🧠 Was können Nachzeichenvorlagen üben?','🧠 ¿Qué pueden practicar las fichas de trazado?'),cards([
      [t(locale,'✍️ Stiftkontrolle','✍️ Control del lápiz'),t(locale,'Gerade Linien, Bögen, Richtungswechsel und kleine Formen verlangen unterschiedliche Handbewegungen.','Rectas, curvas, cambios de dirección y formas pequeñas requieren movimientos distintos.')],
      [t(locale,'👁️ Hand-Augen-Koordination','👁️ Coordinación ojo-mano'),t(locale,'Der Blick verfolgt die Führungslinie, während die Hand ihre Bewegung kontinuierlich anpasst.','La vista sigue la guía mientras la mano ajusta continuamente el movimiento.')],
      [t(locale,'〰️ Bewegungsfluss','〰️ Fluidez'),t(locale,'Längere Linien fördern eine gleichmäßigere Bewegung statt vieler kurzer, ruckartiger Striche.','Las líneas largas favorecen movimientos continuos en lugar de muchos trazos cortos y bruscos.')],
      [t(locale,'🎯 Konzentration','🎯 Concentración'),t(locale,'Eine klar begrenzte Aufgabe erleichtert es, Aufmerksamkeit auf einen konkreten Ablauf zu richten.','Una tarea claramente delimitada facilita concentrarse en una secuencia concreta.')],
      [t(locale,'🧩 Formwahrnehmung','🧩 Percepción de formas'),t(locale,'Kinder sehen, wie einzelne Linien zusammen eine Figur, ein Muster oder einen Gegenstand bilden.','El niño observa cómo varias líneas forman una figura, un patrón o un objeto.')],
      [t(locale,'📝 Vorbereitung auf Schreibbewegungen','📝 Preparación para movimientos de escritura'),t(locale,'Ähnliche Grundbewegungen wie Bögen, Schleifen und Richtungswechsel tauchen später auch beim Schreiben auf.','Curvas, bucles y cambios de dirección también aparecen después en muchos movimientos de escritura.')]
    ])),
    section('vyvoj-grafomotoriky',t(locale,'📈 Stiftkontrolle entwickelt sich schrittweise','📈 El control del lápiz se desarrolla gradualmente'),cards([
      [t(locale,'🟢 3–4 Jahre','🟢 3–4 años'),t(locale,'Kurze, gut sichtbare Linien und große Formen; das Verständnis des Nachfahrens ist wichtiger als Genauigkeit.','Líneas cortas y visibles y formas grandes; comprender la idea de repasar importa más que la precisión.')],
      [t(locale,'🔵 5–6 Jahre','🔵 5–6 años'),t(locale,'Mehr Kurven und Richtungswechsel; längere Abschnitte können ohne häufiges Absetzen verfolgt werden.','Más curvas y cambios de dirección; pueden seguir tramos más largos sin levantar el lápiz tantas veces.')],
      [t(locale,'🟠 7–9 Jahre','🟠 7–9 años'),t(locale,'Feinere Führungslinien, kleinere Formen und komplexere Szenen werden möglich.','Son posibles guías más finas, formas pequeñas y escenas más complejas.')],
      [t(locale,'🟣 10+ und Erwachsene','🟣 10+ y adultos'),t(locale,'Detaillierte Illustrationen mit langen, feinen und dicht liegenden Linien können als Präzisions- und Kreativaufgabe dienen.','Ilustraciones detalladas con líneas largas, finas y próximas pueden servir como reto de precisión y creatividad.')]
    ])),
    section('jak-vybrat',t(locale,'🧩 Die richtige Nachzeichenvorlage auswählen','🧩 Cómo elegir la ficha de trazado adecuada'),cards([
      [t(locale,'👀 Sichtbarkeit','👀 Visibilidad'),t(locale,'Jüngere Kinder brauchen eine deutlichere Führungslinie; ältere Nutzer können feinere Linien verfolgen.','Los pequeños necesitan una guía más visible; los mayores pueden seguir líneas más finas.')],
      [t(locale,'〰️ Linienform','〰️ Forma de la línea'),t(locale,'Gerade und weiche Bögen sind leichter als kleine Schleifen, enge Kurven und viele Richtungswechsel.','Las rectas y curvas suaves son más fáciles que bucles pequeños, giros cerrados y muchos cambios de dirección.')],
      [t(locale,'📏 Länge','📏 Longitud'),t(locale,'Kurze Abschnitte reduzieren Ermüdung; lange Linien fordern Ausdauer und flüssige Bewegung.','Los tramos cortos reducen la fatiga; los largos exigen más continuidad y resistencia.')],
      [t(locale,'🖼️ Motiv','🖼️ Tema'),t(locale,'Ein interessantes Thema kann wichtiger sein als eine perfekt passende Alterszahl.','Un tema atractivo puede ser más importante que una edad perfectamente ajustada.')]
    ])),
    section('vek-obtiznost',t(locale,'👶 Unsere fünf Schwierigkeitsstufen','👶 Nuestros cinco niveles'),`${levelTable(locale,'obtahovacky',de ? [
      ['3–4 Jahre','Stufe 1 · Anfänger','Etwa 40–60 % des Bildes sind vorgezeichnet. Große Formen, kurze Führungslinien und wenige Details.'],
      ['5–6 Jahre','Stufe 2 · Vorschule','Etwa 30 % sind vorgezeichnet. Mehr Kurven und längere Linien, aber weiterhin klare Formen.'],
      ['7–9 Jahre','Stufe 3 · Grundschule','Etwa 20 % sind vorgezeichnet. Feinere Linien, mehr Details und längere zusammenhängende Abschnitte.'],
      ['10+ Jahre','Stufe 4 · Fortgeschritten','Etwa 10 % sind vorgezeichnet. Dichte Details und feine Führungslinien verlangen gute Kontrolle.'],
      ['12+ & Erwachsene','Stufe 5 · Experte','Nur etwa 0–5 % sind vorgezeichnet. Fast die gesamte Illustration wird über feine Führungslinien aufgebaut.']
    ] : [
      ['3–4 años','Nivel 1 · Principiante','Aproximadamente el 40–60 % del dibujo ya está trazado. Formas grandes, guías cortas y pocos detalles.'],
      ['5–6 años','Nivel 2 · Preescolar','Aproximadamente el 30 % está trazado. Más curvas y líneas largas, pero formas todavía muy claras.'],
      ['7–9 años','Nivel 3 · Primaria','Aproximadamente el 20 % está trazado. Líneas más finas, más detalles y tramos continuos más largos.'],
      ['10+ años','Nivel 4 · Avanzado','Aproximadamente el 10 % está trazado. Los detalles densos y las guías finas requieren buen control.'],
      ['12+ y adultos','Nivel 5 · Experto','Solo aproximadamente el 0–5 % está trazado. Casi toda la ilustración se completa siguiendo guías finas.']
    ],de ? ['Alter','Stufe','Aufbau'] : ['Edad','Nivel','Diseño'])}<div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mt-5 text-sm text-indigo-950 font-medium">${t(locale,'Unsere Standard-Führungslinie ist ungefähr 0,1 mm stark und verwendet RGB 195, 195, 195. Sie soll beim Drucken sichtbar bleiben, aber nach dem Nachzeichnen optisch in den Hintergrund treten.','Nuestra línea guía estándar tiene aproximadamente 0,1 mm y utiliza RGB 195, 195, 195. Debe seguir siendo visible al imprimir, pero quedar visualmente en segundo plano después de repasarla.')}</div>`),
    section('jak-pracovat',t(locale,'👨‍👩‍👧 So können Erwachsene sinnvoll helfen','👨‍👩‍👧 Cómo ayudar sin hacer la tarea'),cards([
      [t(locale,'👀 Bild zuerst ansehen','👀 Mirar primero la imagen'),t(locale,'Gemeinsam schwarze und graue Bereiche erkennen und einen angenehmen Startpunkt suchen.','Identificar juntos las zonas negras y grises y elegir un punto de inicio cómodo.')],
      [t(locale,'🔄 Papier drehen lassen','🔄 Permitir girar el papel'),t(locale,'Eine bequeme Strichrichtung ist wichtiger als ein exakt gerade liegendes Blatt.','Una dirección cómoda del trazo importa más que mantener la hoja perfectamente recta.')],
      [t(locale,'⏸️ In Abschnitte teilen','⏸️ Dividir en partes'),t(locale,'Komplexe Bilder müssen nicht in einer Sitzung fertig werden.','Las imágenes complejas no tienen que terminarse en una sola sesión.')],
      [t(locale,'🤝 Nur so viel helfen wie nötig','🤝 Ayudar solo lo necesario'),t(locale,'Papier festhalten oder an eine Pause erinnern ist sinnvoller, als die Linie selbst zu zeichnen.','Sujetar el papel o recordar una pausa es mejor que dibujar la línea por el niño.')]
    ])),
    section('nejcastejsi-chyby',t(locale,'❌ Häufige Fehler und Zeichen von Ermüdung','❌ Errores frecuentes y señales de fatiga'),`${bullets(de ? ['Perfekte Übereinstimmung mit der grauen Linie verlangen.','Zu lange Aufgaben ohne Pause bearbeiten lassen.','Das Handgelenk in einer unbequemen Position festhalten.','Einen zu schweren oder schlecht schreibenden Stift verwenden.','Jede kleine Abweichung sofort kommentieren.'] : ['Exigir seguir la guía con perfección.','Mantener una tarea demasiado larga sin pausas.','Forzar la muñeca en una posición incómoda.','Utilizar un lápiz que requiere demasiada presión.','Comentar cada pequeña desviación.'])}<div class="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-950 font-bold leading-relaxed">${t(locale,'Wenn Hand, Finger oder Unterarm schmerzen, stark ermüden oder Schwierigkeiten beim gewöhnlichen Zeichnen und Schreiben wiederholt auftreten, sollte die Aktivität pausiert und das Thema gegebenenfalls mit einer geeigneten Fachperson besprochen werden.','Si aparecen dolor, fatiga intensa o dificultades repetidas también al dibujar y escribir normalmente, conviene parar la actividad y, si es necesario, comentarlo con un profesional adecuado.')}</div>`),
    section('ergonomie',t(locale,'🪑 Bequeme Haltung beim Zeichnen und Schreiben','🪑 Postura cómoda para dibujar y escribir'),cards([
      [t(locale,'🦶 Füße abstützen','🦶 Apoyar los pies'),t(locale,'Füße auf Boden oder stabilem Hocker geben dem Körper eine ruhige Basis.','Los pies en el suelo o en un apoyo estable dan una base firme al cuerpo.')],
      [t(locale,'📐 Passende Tischhöhe','📐 Altura de mesa adecuada'),t(locale,'Unterarme sollen aufliegen können, ohne dass die Schultern hochgezogen werden.','Los antebrazos deben poder apoyarse sin elevar los hombros.')],
      [t(locale,'📄 Blatt leicht drehen','📄 Girar ligeramente la hoja'),t(locale,'Die Papierposition darf an Handseite und Strichrichtung angepasst werden.','La posición del papel puede adaptarse a la mano y a la dirección del trazo.')],
      [t(locale,'🧘 Kurze Pausen','🧘 Pausas cortas'),t(locale,'Finger lockern, Position wechseln und kurz aufstehen hilft bei längeren Aufgaben.','Mover los dedos, cambiar de postura y levantarse un momento ayuda en tareas largas.')]
    ])),
    section('jak-vybrat-pomucky',t(locale,'🖊️ Stifte und Hilfsmittel auswählen','🖊️ Elegir lápices y herramientas'),cards([
      [t(locale,'✏️ Weicher Bleistift','✏️ Lápiz blando'),t(locale,'Gut kontrollierbar und radierbar, ohne übermäßigen Druck zu verlangen.','Controlable y borrable sin exigir demasiada presión.')],
      [t(locale,'🖍️ Buntstift','🖍️ Lápiz de color'),t(locale,'Kann die nachgezeichnete Linie sichtbar von den schwarzen Konturen unterscheiden.','Permite diferenciar la línea repasada de los contornos negros.')],
      [t(locale,'🖊️ Feiner Stift','🖊️ Punta fina'),t(locale,'Für ältere Nutzer und feine Linien, wenn die Bewegung bereits sicher ist.','Para usuarios mayores y guías finas cuando el movimiento ya es seguro.')],
      [t(locale,'🧽 Radiergummi und Unterlage','🧽 Goma y base firme'),t(locale,'Eine stabile Oberfläche und die Möglichkeit zu korrigieren reduzieren unnötigen Druck.','Una superficie firme y la posibilidad de corregir reducen presión innecesaria.')]
    ])),
    section('doporuceni-tisk',t(locale,'🖨️ Druckqualität ist besonders wichtig','🖨️ La calidad de impresión es especialmente importante'),paragraphs([
      t(locale,'Die hellgrauen Führungslinien müssen sichtbar bleiben, dürfen aber nicht wie fertige schwarze Konturen wirken. Deshalb sollte der Druckmodus nicht auf extrem sparsamen Tonerverbrauch gestellt werden.','Las líneas guía gris claro deben seguir siendo visibles, pero no parecer contornos negros terminados. Por eso conviene evitar modos de ahorro extremo de tinta o tóner.'),
      t(locale,'A4 und 100 % beziehungsweise „Tatsächliche Größe“ erhalten Linienstärke und Abstände. Eine starke automatische Skalierung kann feine Details verändern.','A4 y 100 % o «Tamaño real» mantienen el grosor y las distancias. Un escalado automático fuerte puede alterar detalles finos.'),
      t(locale,'Bei einem sehr hellen Drucker kann eine normale oder hohe Qualitätsstufe helfen. Zuerst eine Testseite drucken, bevor mehrere Exemplare vorbereitet werden.','Si la impresora produce un gris demasiado claro, puede ayudar una calidad normal o alta. Conviene imprimir una página de prueba antes de preparar muchas copias.')
    ]),'bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-5'),
    section('druhy',t(locale,'🧩 Varianten von Nachzeichenvorlagen','🧩 Variantes de fichas de trazado'),cards([
      [t(locale,'⬛ Schwarz-Weiß','⬛ Blanco y negro'),t(locale,'Graue Führungslinien werden nachgefahren; anschließend kann das gesamte Bild ausgemalt werden.','Se repasan las guías y después puede colorearse toda la imagen.')],
      [t(locale,'🌈 Teilweise farbig','🌈 Parcialmente coloreada'),t(locale,'Einige Bereiche sind bereits farbig, andere werden nachgezeichnet und anschließend ergänzt.','Algunas zonas ya tienen color y otras se repasan y completan después.')],
      [t(locale,'🔤 Formen, Zahlen und Buchstaben','🔤 Formas, números y letras'),t(locale,'Das gleiche Prinzip kann später auch für Grundformen und frühe Schreibbewegungen genutzt werden.','El mismo principio puede aplicarse a formas básicas y movimientos previos a la escritura.')],
      [t(locale,'♻️ Wiederverwendbar','♻️ Reutilizable'),t(locale,'In einer Klarsichthülle kann eine Vorlage mit abwischbarem Stift mehrfach bearbeitet werden.','Dentro de una funda transparente puede repetirse con un rotulador borrable.')]
    ])),
    section('historie',t(locale,'🏛️ Vom Übertragen von Linien zu modernen Arbeitsblättern','🏛️ De transferir líneas a las fichas modernas'),`${paragraphs([
      t(locale,'Das Nachfahren und Übertragen vorhandener Linien wurde lange in Kunst, Handwerk, Architektur und technischem Zeichnen genutzt. Transparente Materialien halfen dabei, Formen zu kopieren, zu korrigieren oder weiterzuentwickeln.','Repasar y transferir líneas existentes se ha utilizado durante mucho tiempo en arte, artesanía, arquitectura y dibujo técnico. Los materiales transparentes ayudaban a copiar, corregir o desarrollar formas.'),
      t(locale,'Mit gedruckten Lern- und Zeichenmaterialien wurde das Grundprinzip auch für Kinder leicht zugänglich: Eine sichtbare Vorlage zeigt die Bewegung, die eigene Hand führt sie nach.','Con los materiales educativos impresos, la idea se volvió accesible para los niños: una guía visible muestra el recorrido y la mano lo reproduce.'),
      t(locale,'Moderne Vorlagen drucken die Führungslinie direkt in die Illustration. Sichtbarkeit, Linienstärke und Anteil der bereits fertigen Kontur können so gezielt an das gewünschte Niveau angepasst werden.','Las fichas modernas imprimen la guía directamente dentro de la ilustración. La visibilidad, el grosor y la parte ya terminada pueden ajustarse al nivel deseado.')
    ])}<div class="pt-2"><a href="${t(locale,'geschichte-nachzeichnen.html','historia-trazado.html')}" class="inline-block bg-indigo-100 border border-indigo-200 rounded-full px-6 py-3 text-xs font-extrabold text-indigo-900 uppercase tracking-wider hover:bg-indigo-200 transition-all">${t(locale,'📖 Ausführliche Geschichte →','📖 Historia ampliada →')}</a></div>`),
    section('tvorba',t(locale,'⚙️ So erstellen wir unsere Nachzeichenvorlagen','⚙️ Cómo creamos nuestras fichas de trazado'),cards([
      [t(locale,'💡 1. Motiv und Stufe','💡 1. Tema y nivel'),t(locale,'Motiv, Zielalter und Anteil der vorgezeichneten Kontur werden festgelegt.','Definimos tema, edad y proporción del contorno ya dibujado.')],
      [t(locale,'🤖 2. Bildentwurf','🤖 2. Diseño de imagen'),t(locale,'Digitale Illustration und KI-gestützte Werkzeuge liefern einen ersten geeigneten Entwurf.','La ilustración digital y herramientas asistidas por IA ayudan a crear un primer diseño.')],
      [t(locale,'🩶 3. Führungslinien','🩶 3. Líneas guía'),t(locale,'Ausgewählte Konturen werden als präzise hellgraue Linien mit passender Dichte aufgebaut.','Convertimos contornos seleccionados en guías gris claro con densidad adecuada.')],
      [t(locale,'✅ 4. Drucktest','✅ 4. Prueba de impresión'),t(locale,'Sichtbarkeit, Kontinuität, Detailgrad und Lesbarkeit werden auf normalem Druck geprüft.','Comprobamos visibilidad, continuidad, detalle y legibilidad en una impresión normal.')],
      [t(locale,'📥 5. Veröffentlichung','📥 5. Publicación'),t(locale,'Die fertige Datei wird für schnelles Laden und sauberen A4-Druck vorbereitet.','La ficha final se prepara para carga rápida y una impresión A4 limpia.')]
    ],'sm:grid-cols-2 md:grid-cols-5')),
    section('vyuziti-skoly',t(locale,'🏫 Einsatz zu Hause, in Kita und Schule','🏫 Uso en casa, infantil y escuela'),cards([
      [t(locale,'🏠 Zu Hause','🏠 En casa'),t(locale,'Als kurze Offline-Aktivität, gemeinsame Kreativzeit oder ruhige Übung für Stiftkontrolle.','Como actividad breve sin pantallas, tiempo creativo en familia o práctica tranquila del lápiz.')],
      [t(locale,'🎒 Kita','🎒 Infantil'),t(locale,'Für Grundbewegungen, thematische Bilder und eine ruhige Kleingruppenaktivität.','Para movimientos básicos, temas concretos y una actividad tranquila en pequeño grupo.')],
      [t(locale,'📚 Schule und Betreuung','📚 Escuela y extraescolares'),t(locale,'Als ergänzende Motorikaufgabe, kreative Erweiterung oder ruhige Beschäftigung nach einer anderen Aufgabe.','Como práctica complementaria de motricidad, extensión creativa o actividad tranquila al terminar otra tarea.')]
    ],'md:grid-cols-3')),
    section('faq',t(locale,'❓ Häufige Fragen','❓ Preguntas frecuentes'),`<div class="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">${(de ? [
      ['Sind Nachzeichenvorlagen dasselbe wie Ausmalbilder?','Nein. Zuerst werden die grauen Linien nachgefahren; danach kann das fertige Bild zusätzlich ausgemalt werden.'],
      ['Muss das Kind exakt auf der grauen Linie bleiben?','Nein. Die Linie ist eine Orientierung. Kleine Abweichungen gehören zum Lernen.'],
      ['Ab welchem Alter sind die Vorlagen gedacht?','Unsere erste Stufe ist ungefähr für 3–4 Jahre geplant. Wichtiger als das Alter sind Interesse und aktuelle Stiftkontrolle.'],
      ['Ersetzen sie das Schreibenlernen?','Nein. Sie können vorbereitende Bewegungen unterstützen, ersetzen aber weder freies Zeichnen noch gezieltes Schreibenlernen.'],
      ['Warum sind die Linien so hell?','Sie sollen beim Bearbeiten gut sichtbar sein, aber nach dem Nachzeichnen optisch hinter der eigenen Linie zurücktreten.']
    ] : [
      ['¿Son lo mismo que dibujos para colorear?','No. Primero se repasan las líneas grises y después la imagen terminada también puede colorearse.'],
      ['¿Hay que seguir exactamente la línea gris?','No. Es una guía. Las pequeñas desviaciones forman parte natural del aprendizaje.'],
      ['¿Desde qué edad están pensadas?','Nuestro primer nivel está previsto aproximadamente para 3–4 años. Importan más el interés y el control actual del lápiz.'],
      ['¿Sustituyen el aprendizaje de la escritura?','No. Pueden apoyar movimientos previos, pero no sustituyen el dibujo libre ni la enseñanza específica de escritura.'],
      ['¿Por qué las líneas son tan claras?','Deben verse al trabajar, pero quedar visualmente detrás del trazo propio cuando se completa la ficha.']
    ]).map(([q,a]) => `<details class="${card}"><summary class="font-bold text-slate-900 cursor-pointer">${q}</summary><p class="text-xs mt-3">${a}</p></details>`).join('')}</div>`)
  ].join('\n');
  return `<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-12">${main}</main>`;
}

function tracingHistory(locale) {
  const main = [
    hero(t(locale,'Geschichte des Nachzeichnens','Historia del trazado'),t(locale,'Wie aus dem Übertragen von Formen und Linien moderne Nachzeichenvorlagen für Kinder und Erwachsene entstanden.','Cómo la transferencia y el repaso de formas y líneas evolucionaron hasta las fichas modernas para niños y adultos.'),t(locale,'Diese Übersicht konzentriert sich auf das Prinzip und seine praktische Entwicklung, ohne einzelne historische Personen oder unbelegte Anekdoten in den Mittelpunkt zu stellen.','Esta página se centra en la evolución práctica del método sin depender de personajes concretos ni anécdotas difíciles de verificar.')),
    section('grundidee',t(locale,'📖 Die Grundidee: Eine vorhandene Linie als Orientierung','📖 La idea básica: usar una línea existente como guía'),paragraphs([
      t(locale,'Wer eine sichtbare Kontur nachfährt, verbindet Beobachtung und eigene Bewegung. Dieses einfache Prinzip kann zum Kopieren, Üben, Übertragen oder Verfeinern einer Form verwendet werden.','Quien repasa un contorno visible combina observación y movimiento propio. Este principio sencillo puede utilizarse para copiar, practicar, transferir o perfeccionar una forma.'),
      t(locale,'Frühe Verfahren nutzten transparente oder halbtransparente Materialien, damit eine vorhandene Zeichnung darunter sichtbar blieb. Die eigene Linie entstand darüber oder auf einem neuen Blatt.','Los métodos tradicionales utilizaban materiales transparentes o semitransparentes para mantener visible el dibujo original y crear una nueva línea encima o en otra hoja.')
    ])),
    section('berufe',t(locale,'🏗️ Kunst, Handwerk und technisches Zeichnen','🏗️ Arte, oficio y dibujo técnico'),paragraphs([
      t(locale,'Das Übertragen von Konturen war praktisch, wenn Entwürfe wiederholt, Varianten verglichen oder Formen sauber weiterbearbeitet werden sollten. Deshalb fand es in vielen gestalterischen und technischen Bereichen Verwendung.','Transferir contornos resultaba práctico para repetir diseños, comparar variantes o seguir trabajando formas con precisión, por lo que se utilizó en muchos ámbitos creativos y técnicos.'),
      t(locale,'Mit standardisierten Zeichenmaterialien wurde das Verfahren genauer und leichter reproduzierbar. Entscheidend war immer dieselbe Verbindung: Vorlage sehen, Bewegung planen und eine eigene Linie erzeugen.','Con materiales de dibujo estandarizados, el proceso se volvió más preciso y reproducible. La conexión seguía siendo la misma: ver una guía, planificar el movimiento y crear una línea propia.')
    ])),
    section('bildung',t(locale,'🎒 Der Weg in Lern- und Übungsmaterialien','🎒 El paso a materiales educativos'),paragraphs([
      t(locale,'Gedruckte Übungsblätter übernahmen das Prinzip, weil es ohne zusätzliche Geräte funktioniert. Eine Seite kann eine Bewegung sichtbar vormachen und gleichzeitig genügend Raum für die eigene Ausführung lassen.','Las fichas impresas adoptaron el principio porque funciona sin equipos especiales. Una página puede mostrar visualmente un movimiento y dejar espacio suficiente para que el usuario lo reproduzca.'),
      t(locale,'Für Kinder eignen sich zunächst einfache Grundformen, kurze Linien und große Radien. Mit wachsender Erfahrung können die Linien länger, feiner und komplexer werden.','Para niños pequeños funcionan mejor las formas básicas, líneas cortas y curvas amplias. Con la experiencia, las guías pueden hacerse más largas, finas y complejas.')
    ])),
    section('modern',t(locale,'🩶 Moderne hellgraue Führungslinien','🩶 Líneas guía gris claro modernas'),paragraphs([
      t(locale,'Heute kann die Führungslinie direkt in eine Illustration integriert werden. Dadurch entsteht keine separate Kopierfolie: Der Nutzer arbeitet unmittelbar auf dem später fertigen Bild.','Hoy la línea guía puede integrarse directamente en la ilustración. Ya no hace falta una hoja transparente separada: el usuario trabaja sobre la propia imagen final.'),
      t(locale,'Digitale Bearbeitung erlaubt es, Stärke, Helligkeit, Länge und Anteil der Führungslinien genau zu steuern. Das macht eine nachvollziehbare Abstufung von sehr einfachen bis sehr anspruchsvollen Vorlagen möglich.','La edición digital permite controlar grosor, claridad, longitud y proporción de las guías, lo que facilita una progresión coherente desde fichas muy sencillas hasta otras muy complejas.')
    ])),
    section('system',t(locale,'📐 Unser technisches System','📐 Nuestro sistema técnico'),`${paragraphs([
      t(locale,'Für VinMat verwenden wir als Ausgangspunkt eine Führungslinie von ungefähr 0,1 mm mit RGB 195, 195, 195. Sie muss bei normalem Druck lesbar bleiben und gleichzeitig deutlich leichter wirken als die fertige schwarze Kontur.','En VinMat utilizamos como punto de partida una guía de aproximadamente 0,1 mm con RGB 195, 195, 195. Debe seguir siendo legible en una impresión normal y verse claramente más ligera que el contorno negro terminado.'),
      t(locale,'Die Schwierigkeit wird außerdem über den Anteil bereits fertiger Kontur gesteuert: ungefähr 40–60 % in Stufe 1, 30 % in Stufe 2, 20 % in Stufe 3, 10 % in Stufe 4 und nur 0–5 % in Stufe 5.','La dificultad también se controla mediante la parte del contorno ya terminada: aproximadamente 40–60 % en Nivel 1, 30 % en Nivel 2, 20 % en Nivel 3, 10 % en Nivel 4 y solo 0–5 % en Nivel 5.')
    ])}`),
    section('entwicklung',t(locale,'👶 Warum Stufen sinnvoll sind','👶 Por qué son útiles los niveles'),cards([
      [t(locale,'🟢 Einstieg','🟢 Inicio'),t(locale,'Kurze und deutliche Linien helfen, das Prinzip zu verstehen, ohne dass Präzision zum Hindernis wird.','Las líneas cortas y visibles ayudan a comprender la actividad sin que la precisión se convierta en obstáculo.')],
      [t(locale,'🔵 Aufbau','🔵 Progreso'),t(locale,'Mit zunehmender Kontrolle können Kurven, Richtungswechsel und längere Abschnitte hinzukommen.','Con más control se añaden curvas, cambios de dirección y tramos más largos.')],
      [t(locale,'🟣 Präzision','🟣 Precisión'),t(locale,'Feine Linien und dichte Details bieten älteren Kindern und Erwachsenen eine konzentrierte Zeichenaufgabe.','Las líneas finas y los detalles densos ofrecen a mayores y adultos un reto de dibujo concentrado.')]
    ],'md:grid-cols-3')),
    section('digital',t(locale,'💻 Digitale Werkzeuge verändern die Herstellung, nicht das Grundprinzip','💻 Las herramientas digitales cambian la producción, no el principio'),paragraphs([
      t(locale,'Illustrationssoftware und KI-gestützte Entwürfe können heute bei Motivfindung und Bildaufbau helfen. Die eigentliche Arbeitsblattgestaltung verlangt trotzdem Entscheidungen über Linienkontinuität, Druckbarkeit, Schwierigkeitsgrad und altersgerechte Details.','El software de ilustración y los diseños asistidos por IA pueden ayudar con temas y composición, pero crear una ficha útil sigue exigiendo decisiones sobre continuidad de líneas, impresión, dificultad y detalle adecuado.'),
      t(locale,'Das Endprodukt bleibt eine sehr einfache Interaktion: anschauen, Linie verfolgen, mit der eigenen Hand nachfahren und das Bild danach weitergestalten.','El producto final mantiene una interacción muy sencilla: observar, seguir una línea, reproducirla con la mano y continuar personalizando la imagen.')
    ])),
    section('heute',t(locale,'🏠 Nachzeichnen heute','🏠 El trazado hoy'),paragraphs([
      t(locale,'Nachzeichenvorlagen können zu Hause, in Kita, Schule oder Betreuung eingesetzt werden. Sie sind eine Ergänzung zu freiem Zeichnen, Basteln, Bewegung und gezieltem Schreibenlernen – kein Ersatz dafür.','Las fichas de trazado pueden utilizarse en casa, infantil, escuela o actividades extraescolares. Complementan el dibujo libre, las manualidades, el movimiento y el aprendizaje específico de escritura; no los sustituyen.'),
      t(locale,'Der Nutzen hängt stark davon ab, ob die Aufgabe zur aktuellen Fähigkeit passt und freiwillig bleibt. Eine kurze passende Seite ist oft sinnvoller als eine zu komplexe Vorlage, die nur wegen des Alters ausgewählt wurde.','Su utilidad depende mucho de que la tarea se adapte a la habilidad actual y siga siendo voluntaria. Una ficha breve y adecuada suele funcionar mejor que otra demasiado compleja elegida solo por la edad.')
    ])),
    `<section class="text-center pt-4"><a href="${t(locale,'anleitung-nachzeichnen.html','guia-trazado.html')}" class="inline-block bg-indigo-100 border border-indigo-200 rounded-full px-8 py-3.5 text-xs font-extrabold text-indigo-900 uppercase tracking-wider hover:bg-indigo-200 transition-all">${t(locale,'✏️ Zurück zum Nachzeichnen-Ratgeber →','✏️ Volver a la guía de trazado →')}</a></section>`
  ].join('\n');
  return `<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-12">${main}</main>`;
}

function modal(locale) {
  return `<!-- FULL GUIDE FEATURED START --><div id="guide-detail-modal" onclick="guideCloseModalOnBackdrop(event)" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 backdrop-blur-sm"><div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"><button onclick="guideCloseModal()" class="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-700 z-10">✕</button><div class="md:w-3/5 bg-slate-50 p-6 flex items-center justify-center border-r border-slate-100 max-h-[45vh] md:max-h-[90vh]"><div id="guide-modal-image" class="max-w-full max-h-full flex items-center justify-center"></div></div><div class="md:w-2/5 p-8 flex flex-col justify-between bg-white"><div><span id="guide-modal-age" class="inline-block bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-bold mb-3"></span><h2 id="guide-modal-title" class="text-2xl font-bold text-slate-900 leading-tight mb-6"></h2><div id="guide-modal-variant-container" class="mb-8 hidden"><label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">${t(locale,'Variante wählen','Elegir variante')}</label><div id="guide-modal-variant-buttons" class="flex flex-wrap gap-2"></div></div></div><div class="space-y-3 pt-4 border-t border-slate-100"><button id="guide-modal-download" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm">${t(locale,'📥 Bild herunterladen','📥 Descargar imagen')}</button><button onclick="guidePrintCurrent()" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm">${t(locale,'🖨️ Direkt drucken','🖨️ Imprimir directamente')}</button></div></div></div></div><script src="../assets/js/featured-activities.js"></script><!-- FULL GUIDE FEATURED END -->`;
}

async function apply(file, locale, builder, featuredConfig = null) {
  const url = new URL(file, ROOT);
  let html = await readFile(url, 'utf8');
  const nextMain = builder(locale);
  if (!/<main\b[\s\S]*?<\/main>/i.test(html)) throw new Error(`${file}: main not found`);
  html = html.replace(/<main\b[\s\S]*?<\/main>/i, nextMain);
  html = html.replace(/<!-- FULL GUIDE FEATURED START -->[\s\S]*?<!-- FULL GUIDE FEATURED END -->/g, '');
  html = html.replace(/<script src="\.\.\/assets\/js\/featured-activities\.js"><\/script>/g, '');
  html = html.replace(/<script>\s*loadFeaturedActivities\([\s\S]*?\);\s*<\/script>/g, '');
  if (featuredConfig) {
    const support = `${modal(locale)}<script>loadFeaturedActivities({type:'${featuredConfig.type}',language:'${locale}',topContainer:'${featuredConfig.top}',bottomContainer:'${featuredConfig.bottom}',cardLabel:'${featuredConfig.label}',assetPrefix:'../'});</script>`;
    html = html.replace(/<footer\b/i, `${support}\n<footer`);
  }
  await writeFile(url, html);
  console.log(`Expanded: ${file}`);
}

await apply('de/anleitung-ausmalbilder.html','de',coloring,{type:'omalovanky',top:'top-omalovanky-container',bottom:'bottom-omalovanky-container',label:'AUSMALBILD'});
await apply('es/guia-dibujos.html','es',coloring,{type:'omalovanky',top:'top-omalovanky-container',bottom:'bottom-omalovanky-container',label:'DIBUJO'});
await apply('de/anleitung-labyrinthe.html','de',mazes,{type:'bludiste',top:'top-bludiste-container',bottom:'bottom-bludiste-container',label:'LABYRINTH'});
await apply('es/guia-laberintos.html','es',mazes,{type:'bludiste',top:'top-bludiste-container',bottom:'bottom-bludiste-container',label:'LABERINTO'});
await apply('de/anleitung-nachzeichnen.html','de',tracing);
await apply('es/guia-trazado.html','es',tracing);
await apply('de/geschichte-nachzeichnen.html','de',tracingHistory);
await apply('es/historia-trazado.html','es',tracingHistory);

console.log('Full DE/ES activity-guide parity applied.');
