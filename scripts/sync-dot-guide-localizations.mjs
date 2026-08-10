import { readFile, writeFile } from 'node:fs/promises';

const configs = {
  de: {
    file: new URL('../de/anleitung-punkte-verbinden.html', import.meta.url),
    home: '/worldforkids/de/', assetPrefix: '../', language: 'de', cardLabel: 'PUNKT ZU PUNKT',
    introTitle: 'Punkt-zu-Punkt-Guide',
    intro1: 'Ein vollständiger Ratgeber zu Punkt-zu-Punkt-Aufgaben für Eltern, Lehrkräfte und neugierige junge Lernende.',
    intro2: 'Erfahre, wie Punkt-zu-Punkt-Vorlagen Zählen, Konzentration, Feinmotorik und schrittweises Arbeiten unterstützen.',
    popular: '🔥 Beliebte Punkt-zu-Punkt-Bilder zum direkten Öffnen',
    loadingTop: '🔄 Die neuesten Punkt-zu-Punkt-Bilder werden geladen…',
    glance: 'Punkt zu Punkt auf einen Blick', suitable: 'Geeignet ab:', suitableValue: '3–4 Jahren', difficulty: 'Schwierigkeit:', difficultyValue: 'Stufen 1–5', time: 'Empfohlene Dauer:', timeValue: '5–25 Minuten, je nach Alter', develops: 'Fördert:', developsValue: '- Zählen<br>- Reihenfolgen<br>- Feinmotorik<br>- Konzentration', great: 'Ideal für:', greatValue: '- Vorschulkinder<br>- Schulkinder<br>- Lernen zu Hause<br>- Kita und Schule',
    contents: 'Das findest du in diesem Ratgeber',
    nav: [
      ['co-jsou','📖 Was sind Punkt-zu-Punkt-Bilder?'],['proc-spojuji','🔢 Warum verbinden Kinder Punkte?'],['co-rozvijeji','🧠 Welche Fähigkeiten werden gefördert?'],['vyvoj','📈 Entwicklung nach Alter'],['cisla-pismena','🔢 Zahlen und visuelle Orientierung'],['vek-obtiznost','👶 Alter und Schwierigkeit'],['jak-dite-motivovat','👨‍👩‍👧 Kinder motivieren'],['nejcastejsi-chyby','❌ Häufige Fehler'],['jak-vybrat-pomucky','✏️ Passende Materialien'],['doporuceni-tisk','🖨️ Drucktipps'],['druhy','🧩 Arten von Punkt-zu-Punkt-Aufgaben'],['historie','🏛️ Geschichte von Punkt zu Punkt'],['tvorba','⚙️ So erstellen wir unsere Vorlagen'],['vyuziti-skoly','🏫 Nutzung zu Hause, in Kita und Schule']
    ],
    whatTitle: '📖 Was sind Punkt-zu-Punkt-Bilder?',
    what: [
      '<strong>Einfache Erklärung:</strong> Bei einer Punkt-zu-Punkt-Aufgabe verbindet das Kind Punkte in einer vorgegebenen Reihenfolge. Ist die Folge vollständig, erscheint ein verborgenes Bild, das anschließend ausgemalt werden kann.',
      '<strong>Ein kleines Abenteuer Schritt für Schritt:</strong> Der Reiz liegt darin, dass das fertige Motiv am Anfang oft noch nicht vollständig erkennbar ist. Jeder richtig verbundene Punkt bringt das Kind dem Ergebnis näher.',
      '<strong>Eine ruhige Alternative zum Bildschirm:</strong> Ausdruckbare Punkt-zu-Punkt-Seiten verbinden Spiel, Konzentration und einfaches Lernen. Kinder üben Reihenfolgen und Stiftführung und freuen sich über das entstehende Bild.'
    ],
    whyTitle: '🔢 Warum verbinden Kinder Punkte?',
    why: [
      'Für Kinder bedeutet Punkt zu Punkt mehr als nur Linien zu zeichnen. Es ist ein Rätsel, bei dem nach und nach ein verstecktes Bild entsteht. Die Aufgabe hat ein klares Ziel, einfache Regeln und sofort sichtbaren Fortschritt.',
      'Die Aktivität fördert auch selbstständiges Arbeiten. Kinder suchen den nächsten Schritt, entscheiden über die Linienführung und lernen, eine Aufgabe in einer festen Reihenfolge zu lösen.',
      'Zahlenfolgen werden dabei ganz nebenbei geübt, ohne wie eine klassische Rechenübung zu wirken. Das fertige Bild ist zugleich Belohnung und Ausmalbild.'
    ],
    skillsTitle: '🧠 Welche Fähigkeiten fördern Punkt-zu-Punkt-Aufgaben?',
    skills: [
      ['🔢 Zahlenfolge und Reihenfolge','Kinder suchen die nächste Zahl und verstehen, dass eine richtige Reihenfolge zu einem vollständigen Ergebnis führt.'],
      ['✍️ Feinmotorik und Linienführung','Das Verbinden stärkt Stiftkontrolle, ruhige Handbewegungen und die Vorbereitung auf Zeichnen und Schreiben.'],
      ['👁️ Hand-Augen-Koordination','Die Augen suchen den nächsten Punkt, während die Hand den Stift gezielt dorthin führt.'],
      ['🧩 Räumliche Orientierung','Kinder orientieren sich auf dem Blatt und lernen Positionen, Richtungen und das Gesamtbild besser wahrzunehmen.'],
      ['⏳ Konzentration und Geduld','Jeder Punkt ist ein kleiner Schritt. Längere Folgen trainieren sorgfältiges Arbeiten und Ausdauer.'],
      ['🎨 Kreativität nach dem Verbinden','Nach dem Verbinden kann das Bild ausgemalt, ergänzt oder in eine eigene Geschichte eingebaut werden.'],
      ['😌 Ruhiges Lernen ohne Druck','Klare Regeln und kleine Schritte machen Punkt zu Punkt zu einer entspannten Aktivität, die Lernen und Spiel verbindet.']
    ],
    devTitle: '📈 Entwicklung nach Alter', devIntro: 'Kinder wachsen schrittweise in Punkt-zu-Punkt-Aufgaben hinein. Jüngere Kinder brauchen große Punkte und kurze Wege, ältere schaffen längere Zahlenfolgen und detailliertere Bilder.',
    dev: [
      ['🟢 Erste Verbindungen (3–4 Jahre)','Kurze Linien zwischen wenigen gut sichtbaren Punkten. Stufe 1 nutzt große, nicht nummerierte Punkte sowie einen klaren Start, ein Ende und eine kleine Bildhilfe.'],
      ['🔵 Einfache Zahlenfolgen (5–6 Jahre)','Kinder finden die nächste Zahl, verbinden Punkte der Reihe nach und vervollständigen ein einfaches Bild. Große Abstände bleiben hilfreich.'],
      ['🟠 Längere Punktfolgen (7–9 Jahre)','Mehr Punkte, kleinere Abstände und komplexere Formen verlangen genaueres Planen und längere Konzentration.'],
      ['🟣 Fortgeschrittene Herausforderungen (10+)','Ältere Kinder können dichtere Punktfelder, lange Zahlenfolgen und detaillierte Motive bearbeiten.']
    ],
    numberTitle: '🔢 Zahlenfolge und visuelle Orientierung', numberIntro: 'Unsere Aufgaben bleiben altersgerecht: Stufe 1 arbeitet mit visueller Führung, die Stufen 2–5 mit aufsteigenden Zahlen.',
    numberCards: [
      ['🟢 Stufe 1: Erste Verbindungen','Große unnummerierte Punkte, ein visueller Start und ein Ende sowie eine kleine Bildhilfe zeigen jungen Kindern den Weg.'],
      ['🔢 Stufen 2–5: Zahlenfolgen','Kinder üben Zählen und Zahlenreihenfolge, während das Motiv Punkt für Punkt sichtbar wird.'],
      ['💡 Eine Aktivität, viele Fähigkeiten','Eine einzige Vorlage kann Zählen, Stiftführung, Konzentration, visuelle Wahrnehmung und Kreativität verbinden.']
    ],
    levelsTitle: '👶 Alter & Schwierigkeitsstufen', tableHeaders: ['Empfohlenes Alter','Schwierigkeit','Was Kinder üben'],
    levels: [
      ['3–4 Jahre','LV1','Stufe 1','Anfänger','10–20 große unnummerierte Punkte. Start, Ende und eine kleine Bildhilfe zeigen den Weg.','emerald'],
      ['5–6 Jahre','LV2','Stufe 2','Vorschule','20–30 klar nummerierte Punkte, gelegentlich bis 50; ein oder zwei einfache Folgen.','sky'],
      ['7–9 Jahre','LV3','Stufe 3','Grundschule','50–80 nummerierte Punkte, meist etwa 70; ein oder zwei klare Folgen in einer reicheren Szene.','amber'],
      ['10+ Jahre','LV4','Stufe 4','Fortgeschritten','90–150 nummerierte Punkte; detaillierteres Motiv und eine längere Folge.','purple'],
      ['12+ & Erwachsene','LV5','Stufe 5','Experte','150–1000+ nummerierte Punkte; komplexe Folgen für erfahrene Nutzer.','rose']
    ],
    levelsNote: 'Wenn alle Punkte in der richtigen Reihenfolge verbunden sind, wird das fertige Bild zu einem Ausmalbild derselben Schwierigkeitsstufe.',
    encourageTitle: '👨‍👩‍👧 So motivierst du Kinder', encourage: [
      ['🎯 Mit einfachen Seiten beginnen','Erfolg motiviert. Starte mit kurzen Folgen und steigere die Schwierigkeit erst danach.'],
      ['🔢 Gemeinsam zählen','Jüngere Kinder können die Zahlen beim Verbinden laut sagen und so die Zahlenerkennung natürlich festigen.'],
      ['🎨 Das fertige Bild ausmalen','Das Ausmalen nach dem Verbinden ist eine zusätzliche Belohnung und verlängert die kreative Beschäftigung.'],
      ['👏 Fortschritt loben','Lobe genaues Beobachten, Geduld und Ausdauer – nicht nur das fertige Ergebnis.']
    ],
    mistakesTitle: '❌ Häufige Fehler', mistakes: ['Eine zu lange Zahlenfolge für das Alter wählen.','Zu schnell helfen, statt das Kind den nächsten Punkt selbst finden zu lassen.','Von Anfang an perfekte Genauigkeit erwarten.','Aus der Aktivität einen Test statt eines Spiels machen.','Das anschließende Ausmalen des fertigen Bildes auslassen.'],
    suppliesTitle: '✏️ Die richtigen Materialien wählen', supplies: [
      ['✏️ Bleistift','Für die meisten Aufgaben ideal, weil sich Fehler leicht radieren lassen.'],['🧽 Radiergummi','Hilft beim Korrigieren, ohne dass ein Fehler frustriert.'],['🖍️ Buntstifte','Perfekt zum Ausmalen des Bildes nach dem Verbinden.'],['💡 Klarsichthülle','In einer Hülle kann die Seite mit einem abwischbaren Stift mehrfach genutzt werden.']
    ],
    printTitle: '🖨️ Drucktipps', printTips: ['A4-Papier eignet sich für unsere Vorlagen.','Nur einseitig drucken, wenn anschließend mit Filzstiften ausgemalt wird.','Für jüngere Kinder kann ein größerer Ausdruck hilfreich sein.','Lieblingsseiten laminieren oder in eine Klarsichthülle legen, um sie mehrfach zu verwenden.'],
    typesTitle: '🧩 Arten von Punkt-zu-Punkt-Aufgaben', types: ['🟢 Erste Verbindungen','🔢 Zahlenfolgen','🐶 Tiere','🚗 Fahrzeuge','🌿 Natur','🦖 Dinosaurier','🎄 Feiertage'],
    historyTitle: '🏛️ Die Geschichte von Punkt zu Punkt: vom Lernspiel zur Druckvorlage', history: [
      'Punkt-zu-Punkt-Aufgaben wirken modern, doch die Idee, Punkte zu verbinden und dadurch ein verborgenes Bild sichtbar zu machen, wird seit weit über einem Jahrhundert im Lernen eingesetzt.',
      'Im späten 19. und frühen 20. Jahrhundert erschienen solche Rätsel zunehmend in Kinderbüchern, Zeitungen und Lernmagazinen. Sie verbanden Zählen, Beobachtung und Zeichnen in einer einzigen Aufgabe.',
      'Mit günstigeren Druckverfahren verbreiteten sich Punkt-zu-Punkt-Seiten in Schulen und Familien. Aus einfachen Zählübungen entwickelten sich mit der Zeit immer detailliertere Bilder.',
      'Heute gehören ausdruckbare Punkt-zu-Punkt-Aufgaben zu beliebten Lernaktivitäten für Vorschul- und Grundschulkinder. Sie fördern Beobachtung, Geduld und logische Reihenfolgen spielerisch.',
      'Digitale Werkzeuge ermöglichen heute eine große Auswahl, sodass Familien und Lehrkräfte Aufgaben passend zu Alter und Fähigkeiten auswählen können.'
    ],
    creationTitle: '⚙️ So erstellen wir unsere Punkt-zu-Punkt-Vorlagen', creationIntro: 'Jede Vorlage wird auf die empfohlene Altersgruppe abgestimmt, soll angemessen fordern und schrittweise Sicherheit aufbauen.', creation: [
      ['💡 1. Planung','Thema, Zielalter, Lernziel und Schwierigkeitsstufe werden vor dem ersten Entwurf festgelegt.'],['🤖 2. Design & KI','Digitale Illustration und KI-gestützte Werkzeuge helfen uns, klare und ansprechende Aktivitäten zu erstellen.'],['✅ 3. Kontrolle','Jede Seite wird auf Lesbarkeit, sinnvolle Reihenfolge und passende Schwierigkeit geprüft.'],['📥 4. Web-Optimierung','Zum Schluss wird die Vorlage für schnelles Laden optimiert, kategorisiert und für den kostenlosen Download vorbereitet.']
    ],
    useTitle: '🏫 Ideal für Zuhause, Kita & Schule', useIntro: 'Punkt-zu-Punkt-Vorlagen eignen sich für Zuhause, Unterricht, Kita, Betreuung, Wartezeiten und ruhige Beschäftigung. Sie brauchen fast keine Vorbereitung und verbinden Lernen mit Spaß.', use: [
      ['🏡 Zuhause','Für Regentage, ruhige Nachmittage, Reisen und gemeinsame Lernzeit.'],['🎒 Kita & Schule','Zum Üben von Zählen, Konzentration und Stiftführung in spielerischer Form.'],['🎉 Gruppen & Veranstaltungen','Eine einfache Beschäftigung für Kinderfeste, Ferienprogramme und Gruppenangebote.']
    ], useNote: '✅ Alle Punkt-zu-Punkt-Vorlagen sind für private und pädagogische Nutzung kostenlos, ohne Registrierung und direkt druckbar.',
    moreTitle: '📥 Weitere Punkt-zu-Punkt-Vorlagen entdecken', loadingBottom: '🔄 Weitere Punkt-zu-Punkt-Bilder werden geladen…', cta: '🔢 Mehr Punkt-zu-Punkt-Bilder ansehen →',
    modalVariant: 'Variante auswählen', modalDownload: '📥 Bild herunterladen', modalPrint: '🖨️ Direkt drucken'
  },
  es: {
    file: new URL('../es/guia-unir-puntos.html', import.meta.url),
    home: '/worldforkids/es/', assetPrefix: '../', language: 'es', cardLabel: 'UNE LOS PUNTOS',
    introTitle: 'Guía de unir puntos',
    intro1: 'Una guía completa de actividades de unir puntos para familias, docentes y pequeños aprendices curiosos.',
    intro2: 'Descubre cómo estas fichas ayudan a practicar el conteo, la concentración, la motricidad fina y el trabajo paso a paso.',
    popular: '🔥 Fichas populares de unir puntos listas para abrir', loadingTop: '🔄 Cargando las fichas más recientes de unir puntos…',
    glance: 'Unir puntos de un vistazo', suitable: 'Adecuado desde:', suitableValue: '3–4 años', difficulty: 'Dificultad:', difficultyValue: 'Niveles 1–5', time: 'Tiempo recomendado:', timeValue: '5–25 minutos, según la edad', develops: 'Ayuda a desarrollar:', developsValue: '- conteo<br>- secuencias<br>- motricidad fina<br>- concentración', great: 'Ideal para:', greatValue: '- preescolares<br>- escolares<br>- aprendizaje en casa<br>- infantil y primaria',
    contents: 'Qué encontrarás en esta guía', nav: [
      ['co-jsou','📖 ¿Qué son las fichas de unir puntos?'],['proc-spojuji','🔢 ¿Por qué los niños unen puntos?'],['co-rozvijeji','🧠 ¿Qué habilidades desarrollan?'],['vyvoj','📈 Desarrollo según la edad'],['cisla-pismena','🔢 Números y guía visual'],['vek-obtiznost','👶 Edad y dificultad'],['jak-dite-motivovat','👨‍👩‍👧 Cómo motivar'],['nejcastejsi-chyby','❌ Errores frecuentes'],['jak-vybrat-pomucky','✏️ Elegir materiales'],['doporuceni-tisk','🖨️ Consejos de impresión'],['druhy','🧩 Tipos de fichas'],['historie','🏛️ Historia de unir puntos'],['tvorba','⚙️ Cómo creamos las fichas'],['vyuziti-skoly','🏫 Uso en casa y en la escuela']
    ],
    whatTitle: '📖 ¿Qué son las fichas de unir puntos?', what: [
      '<strong>Definición sencilla:</strong> Es una actividad imprimible en la que el niño conecta puntos siguiendo un orden. Al completar la secuencia aparece una imagen oculta que después puede colorearse.',
      '<strong>Una pequeña aventura paso a paso:</strong> Parte de la diversión está en descubrir poco a poco el dibujo. Cada punto correctamente unido acerca al niño al resultado final.',
      '<strong>Una alternativa tranquila a las pantallas:</strong> Estas fichas combinan juego, atención y aprendizaje sencillo. El niño practica el orden y el control del lápiz mientras descubre la imagen.'
    ],
    whyTitle: '🔢 ¿Por qué los niños unen puntos?', why: [
      'Para un niño, unir puntos no consiste solo en dibujar líneas. Es un pequeño rompecabezas en el que la imagen aparece gradualmente, con un objetivo claro y reglas fáciles de entender.',
      'También favorece la autonomía. El niño busca el siguiente paso, decide por dónde continuar y aprende a resolver una tarea siguiendo una secuencia.',
      'Además, permite practicar el orden de los números sin convertir la actividad en un ejercicio escolar tradicional. La imagen terminada funciona como recompensa y como dibujo para colorear.'
    ],
    skillsTitle: '🧠 ¿Qué habilidades desarrollan las fichas de unir puntos?', skills: [
      ['🔢 Orden numérico y secuencias','El niño busca el número siguiente y comprende que seguir el orden correcto conduce a un resultado completo.'],['✍️ Motricidad fina y control del trazo','Unir puntos mejora el control del lápiz, los movimientos suaves de la mano y habilidades útiles para dibujar y escribir.'],['👁️ Coordinación ojo-mano','Los ojos localizan el siguiente punto mientras la mano dirige el lápiz hacia él.'],['🧩 Orientación espacial','Buscar puntos ayuda a orientarse en la página y a comprender posiciones, direcciones y el dibujo en conjunto.'],['⏳ Concentración y paciencia','Las secuencias largas animan a trabajar con cuidado y a mantener la atención hasta terminar.'],['🎨 Creatividad al terminar','Después de completar la figura, se puede colorear, añadir un fondo o inventar una historia.'],['😌 Aprendizaje tranquilo y sin presión','Las reglas claras y los pequeños pasos convierten unir puntos en una actividad relajada que combina juego y aprendizaje.']
    ],
    devTitle: '📈 Desarrollo según la edad', devIntro: 'Los niños progresan poco a poco. Los más pequeños necesitan puntos grandes y recorridos cortos; los mayores pueden seguir secuencias más largas y dibujos detallados.', dev: [
      ['🟢 Primeras conexiones (3–4 años)','Líneas cortas entre pocos puntos bien visibles. El Nivel 1 utiliza puntos grandes sin números, inicio y final visuales y una pequeña referencia de la imagen.'],['🔵 Secuencias numéricas sencillas (5–6 años)','El niño encuentra el número siguiente, conecta en orden y completa una imagen sencilla. Siguen siendo útiles los espacios amplios y un diseño claro.'],['🟠 Fichas más largas (7–9 años)','Aparecen más puntos, menor separación y formas más complejas. Hace falta comprobar mejor la secuencia y mantener la concentración.'],['🟣 Retos avanzados (10+)','Los niños mayores pueden trabajar con puntos más densos, secuencias largas y temas detallados que exigen más atención.']
    ],
    numberTitle: '🔢 Orden numérico y guía visual', numberIntro: 'Nuestras fichas mantienen el recorrido claro y adecuado a la edad: el Nivel 1 utiliza ayuda visual y los Niveles 2–5 números ascendentes.', numberCards: [
      ['🟢 Nivel 1: primeras conexiones','Puntos grandes sin numerar, un inicio y final visuales y una pequeña referencia ayudan a comprender el recorrido.'],['🔢 Niveles 2–5: secuencias numéricas','Los niños practican el conteo y el orden de los números mientras la imagen aparece punto a punto.'],['💡 Una actividad, muchas habilidades','Una sola ficha puede combinar conteo, control del lápiz, concentración, percepción visual y creatividad.']
    ],
    levelsTitle: '👶 Edad y niveles de dificultad', tableHeaders: ['Edad recomendada','Dificultad','Qué practica el niño'], levels: [
      ['3–4 años','LV1','Nivel 1','Principiante','10–20 puntos grandes sin números. El inicio, el final y una pequeña referencia muestran el recorrido.','emerald'],['5–6 años','LV2','Nivel 2','Preescolar','20–30 puntos claramente numerados, a veces hasta 50; uno o dos recorridos sencillos.','sky'],['7–9 años','LV3','Nivel 3','Primaria','50–80 puntos numerados, normalmente unos 70; uno o dos recorridos claros en una escena más rica.','amber'],['10+ años','LV4','Nivel 4','Avanzado','90–150 puntos numerados; ilustración detallada y una secuencia más larga.','purple'],['12+ y adultos','LV5','Nivel 5','Experto','150–1000+ puntos numerados; secuencias complejas para usuarios experimentados.','rose']
    ], levelsNote: 'Cuando todos los puntos están unidos en el orden correcto, la imagen final se convierte en una página para colorear del mismo nivel de dificultad.',
    encourageTitle: '👨‍👩‍👧 Cómo motivar a los niños', encourage: [
      ['🎯 Empezar con fichas fáciles','El éxito motiva. Empieza con secuencias cortas antes de pasar a retos más detallados.'],['🔢 Contar juntos','Los niños pequeños pueden decir los números en voz alta mientras unen los puntos y reforzar su reconocimiento de forma natural.'],['🎨 Colorear la imagen terminada','Convertir el resultado en una página para colorear añade una recompensa creativa.'],['👏 Celebrar el progreso','Valora la observación, la paciencia y la constancia, no solo terminar la imagen.']
    ],
    mistakesTitle: '❌ Errores frecuentes', mistakes: ['Elegir una secuencia demasiado larga para la edad.','Ayudar demasiado pronto en lugar de dejar que el niño encuentre el siguiente punto.','Esperar una precisión perfecta desde el principio.','Convertir la actividad en un examen en vez de un juego.','Olvidar la posibilidad de colorear la imagen al terminar.'],
    suppliesTitle: '✏️ Elegir los materiales adecuados', supplies: [
      ['✏️ Lápiz','La mejor opción para la mayoría de fichas porque permite borrar fácilmente.'],['🧽 Goma de borrar','Permite corregir errores sin frustración.'],['🖍️ Lápices de colores','Perfectos para colorear la imagen después de unir los puntos.'],['💡 Funda transparente','Dentro de una funda se puede usar un rotulador borrable y repetir la actividad.']
    ],
    printTitle: '🖨️ Consejos de impresión', printTips: ['El papel A4 funciona bien para nuestras fichas.','Imprime por una sola cara si después se va a colorear con rotuladores.','Un tamaño de impresión mayor puede ayudar a los niños pequeños.','Lamina las fichas favoritas o usa una funda transparente para reutilizarlas.'],
    typesTitle: '🧩 Tipos de actividades de unir puntos', types: ['🟢 Primeras conexiones','🔢 Secuencias numéricas','🐶 Animales','🚗 Vehículos','🌿 Naturaleza','🦖 Dinosaurios','🎄 Fiestas y celebraciones'],
    historyTitle: '🏛️ Historia de unir puntos: de ejercicio educativo a actividad imprimible', history: [
      'Las actividades de unir puntos parecen modernas, pero la idea de conectar puntos para revelar una imagen se utiliza en educación desde hace más de un siglo.',
      'A finales del siglo XIX y comienzos del XX estos pasatiempos empezaron a aparecer en libros infantiles, periódicos y revistas educativas porque combinaban números, observación y dibujo.',
      'Con la impresión más accesible, las fichas llegaron a escuelas y hogares de muchos países. Con el tiempo pasaron de ejercicios sencillos de conteo a ilustraciones cada vez más detalladas.',
      'Hoy son una actividad educativa popular para niños de infantil y primaria, ya que fomentan observación, paciencia y secuenciación lógica de una forma lúdica.',
      'Las herramientas digitales permiten ofrecer una gran variedad de retos para elegir el nivel adecuado según la edad y las capacidades.'
    ],
    creationTitle: '⚙️ Cómo creamos nuestras fichas de unir puntos', creationIntro: 'Cada actividad se diseña para adaptarse a la edad recomendada, ofrecer un reto agradable y aumentar la confianza de forma gradual.', creation: [
      ['💡 1. Planificación','Elegimos tema, edad, objetivo de aprendizaje y dificultad antes de preparar el primer concepto.'],['🤖 2. Diseño e IA','Combinamos ilustración digital y herramientas asistidas por IA para crear actividades claras y atractivas.'],['✅ 3. Revisión','Comprobamos legibilidad, secuencia, dificultad y experiencia de uso de cada ficha.'],['📥 4. Optimización web','Finalmente optimizamos la ficha para que cargue rápido, la clasificamos y la preparamos para descarga gratuita.']
    ],
    useTitle: '🏫 Perfectas para casa, infantil y primaria', useIntro: 'Las fichas de unir puntos funcionan bien en casa, aulas, educación infantil, actividades extraescolares, viajes y tiempos de espera. Requieren muy poca preparación y combinan aprendizaje y diversión.', use: [
      ['🏡 En casa','Para días de lluvia, tardes tranquilas, viajes y momentos de aprendizaje en familia.'],['🎒 Infantil y primaria','Para practicar conteo, concentración y control del lápiz de una forma entretenida.'],['🎉 Grupos y eventos','Una actividad sencilla para fiestas infantiles, programas de vacaciones y actividades de grupo.']
    ], useNote: '✅ Todas las fichas de unir puntos son gratuitas para uso personal y educativo, no requieren registro y están listas para imprimir.',
    moreTitle: '📥 Descubre más fichas de unir puntos', loadingBottom: '🔄 Cargando más fichas recomendadas…', cta: '🔢 Ver más fichas de unir puntos →', modalVariant: 'Seleccionar variante', modalDownload: '📥 Descargar imagen', modalPrint: '🖨️ Imprimir directamente'
  }
};

const card = (title, text) => `<div class="bg-slate-50 border border-slate-100 rounded-2xl p-5"><h3 class="font-bold text-slate-900 flex items-center gap-2">${title}</h3><p class="text-xs text-slate-600 leading-relaxed mt-2">${text}</p></div>`;
const sectionText = (id, title, paras) => `<section id="${id}" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-sm text-slate-600 leading-relaxed font-medium"><h2 class="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-wide">${title}</h2>${paras.map(p=>`<p>${p}</p>`).join('')}</section>`;

function renderMain(c) {
  const nav = c.nav.map(([id,label])=>`<a href="#${id}" class="bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">${label}</a>`).join('');
  const skills = c.skills.map(([t,x],i)=>`<div class="space-y-1 ${i===c.skills.length-1?'sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100':''}"><h3 class="font-bold text-slate-900 flex items-center gap-1.5">${t}</h3><p class="text-xs leading-relaxed">${x}</p></div>`).join('');
  const levels = c.levels.map(([age,code,name,label,text,color])=>`<tr><td class="p-3 font-bold bg-slate-50/40">${age}</td><td class="p-3"><button onclick="guideGoToCatalog('${code}')" class="text-${color}-600 hover:text-${color}-700 text-left font-bold block leading-tight">${name}:<br><span class="font-normal underline">${label}</span></button></td><td class="p-3">${text}</td></tr>`).join('');
  return `<main class="max-w-4xl w-full mx-auto px-4 py-12 flex-grow space-y-12">
<section class="text-center space-y-2"><h1 class="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">${c.introTitle}</h1><p class="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">${c.intro1}</p><p class="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">${c.intro2}</p></section>
<section class="space-y-4"><h2 class="text-lg font-bold text-slate-900 uppercase tracking-wide">${c.popular}</h2><div id="top-spojovacky-container" class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white p-8 text-center rounded-2xl border border-slate-100 text-xs text-slate-400 font-bold py-12 sm:col-span-3">${c.loadingTop}</div></div></section>
<section class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"><div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3"><h2 class="text-md font-extrabold text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2">${c.glance}</h2><div class="text-xs font-bold space-y-2 text-slate-700"><div>${c.suitable}<br><span class="font-medium text-slate-600">${c.suitableValue}</span></div><div>${c.difficulty}<br><span class="font-medium text-slate-600">${c.difficultyValue}</span></div><div>${c.time}<br><span class="font-medium text-slate-600">${c.timeValue}</span></div><div>${c.develops}<br><span class="font-medium text-slate-600">${c.developsValue}</span></div><div>${c.great}<br><span class="font-medium text-slate-600">${c.greatValue}</span></div></div></div><div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 md:col-span-2"><h2 class="text-md font-extrabold text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2">${c.contents}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">${nav}</div></div></section>
${sectionText('co-jsou',c.whatTitle,c.what)}
${sectionText('proc-spojuji',c.whyTitle,c.why)}
<section id="co-rozvijeji" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.skillsTitle}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600 font-medium">${skills}</div></section>
<section id="vyvoj" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.devTitle}</h2><p class="text-sm text-slate-600 leading-relaxed font-medium">${c.devIntro}</p><div class="space-y-4">${c.dev.map(([t,x])=>card(t,x)).join('')}</div></section>
<section id="cisla-pismena" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.numberTitle}</h2><p class="text-sm text-slate-600 leading-relaxed font-medium">${c.numberIntro}</p><div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">${c.numberCards.map(([t,x],i)=>`<div class="${i===2?'bg-indigo-50 border-indigo-100 md:col-span-2':'bg-slate-50 border-slate-100'} border rounded-2xl p-5"><h3 class="font-bold ${i===2?'text-indigo-950':'text-slate-900'} flex items-center gap-2">${t}</h3><p class="${i===2?'text-indigo-900':'text-slate-600'} mt-2">${x}</p></div>`).join('')}</div></section>
<section id="vek-obtiznost" class="space-y-4"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.levelsTitle}</h2><div class="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white"><table class="w-full text-left border-collapse text-xs"><thead><tr class="bg-slate-900 text-white font-bold uppercase tracking-wider">${c.tableHeaders.map(x=>`<th class="p-3">${x}</th>`).join('')}</tr></thead><tbody class="divide-y divide-slate-100 text-slate-700 font-medium">${levels}</tbody></table></div><p class="text-sm text-slate-600 leading-relaxed font-medium">${c.levelsNote}</p></section>
<section id="jak-dite-motivovat" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.encourageTitle}</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${c.encourage.map(([t,x])=>card(t,x)).join('')}</div></section>
<section id="nejcastejsi-chyby" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.mistakesTitle}</h2><ul class="space-y-3 text-sm text-slate-600 font-medium list-disc list-inside">${c.mistakes.map(x=>`<li>${x}</li>`).join('')}</ul></section>
<section id="jak-vybrat-pomucky" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.suppliesTitle}</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">${c.supplies.map(([t,x],i)=>`<div class="${i===3?'bg-indigo-50 border-indigo-100':'bg-slate-50 border-slate-100'} border rounded-2xl p-5"><strong>${t}</strong><br>${x}</div>`).join('')}</div></section>
<section id="doporuceni-tisk" class="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-5"><h2 class="text-xl font-bold text-emerald-950">${c.printTitle}</h2><ul class="space-y-2 text-sm text-emerald-900 font-medium">${c.printTips.map(x=>`<li>• ${x}</li>`).join('')}</ul></section>
<section id="druhy" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.typesTitle}</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-slate-700">${c.types.map(x=>`<div class="bg-slate-50 p-4 rounded-xl border border-slate-100">${x}</div>`).join('')}</div></section>
${sectionText('historie',c.historyTitle,c.history)}
<section id="tvorba" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide text-center">${c.creationTitle}</h2><p class="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto text-center">${c.creationIntro}</p><div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-[11px] font-bold text-slate-700 pt-2">${c.creation.map(([t,x])=>`<div class="bg-slate-50 p-3 rounded-xl border border-slate-100">${t}<br><span class="font-medium text-slate-500 text-[10px]">${x}</span></div>`).join('')}</div></section>
<section id="vyuziti-skoly" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5"><h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">${c.useTitle}</h2><p class="text-sm text-slate-600 leading-relaxed font-medium">${c.useIntro}</p><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium leading-relaxed">${c.use.map(([t,x])=>card(t,x)).join('')}</div><div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-xs text-emerald-950 font-bold leading-relaxed">${c.useNote}</div></section>
<section class="space-y-4 border-t border-slate-100 pt-8"><h2 class="text-md font-bold text-slate-900 uppercase tracking-wide">${c.moreTitle}</h2><div id="bottom-spojovacky-container" class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white p-8 text-center rounded-2xl border border-slate-100 text-xs text-slate-400 font-bold py-12 sm:col-span-3">${c.loadingBottom}</div></div></section>
<section class="text-center pt-4"><button onclick="guideGoToCatalog('vse')" class="inline-block bg-rose-100 border border-rose-200 rounded-full px-8 py-3.5 text-xs font-extrabold text-rose-900 uppercase tracking-wider shadow-xs hover:bg-rose-200 hover:scale-[1.02] transition-all">${c.cta}</button></section>
</main>`;
}

function modal(c) {
  return `<!-- DOT_GUIDE_MODAL_START --><div id="guide-detail-modal" onclick="guideCloseModalOnBackdrop(event)" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 backdrop-blur-sm"><div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"><button onclick="guideCloseModal()" class="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-700 z-10">✕</button><div class="md:w-3/5 bg-slate-50 p-6 flex items-center justify-center border-r border-slate-100 max-h-[45vh] md:max-h-[90vh]"><div id="guide-modal-image" class="max-w-full max-h-full flex items-center justify-center"></div></div><div class="md:w-2/5 p-8 flex flex-col justify-between bg-white"><div><span id="guide-modal-age" class="inline-block bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-bold mb-3"></span><h2 id="guide-modal-title" class="text-2xl font-bold text-slate-900 leading-tight mb-6"></h2><div id="guide-modal-variant-container" class="mb-8 hidden"><label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">${c.modalVariant}</label><div id="guide-modal-variant-buttons" class="flex flex-wrap gap-2"></div></div></div><div class="space-y-3 pt-4 border-t border-slate-100"><button id="guide-modal-download" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm">${c.modalDownload}</button><button onclick="guidePrintCurrent()" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm">${c.modalPrint}</button></div></div></div></div><!-- DOT_GUIDE_MODAL_END -->`;
}

function scripts(c) {
  return `<!-- DOT_GUIDE_FEATURED_START --><script src="${c.assetPrefix}assets/js/featured-activities.js"></script><script>loadFeaturedActivities({type:'spojovacky',language:'${c.language}',assetPrefix:'${c.assetPrefix}',topContainer:'top-spojovacky-container',bottomContainer:'bottom-spojovacky-container',cardLabel:'${c.cardLabel}'});function guideGoToCatalog(level){localStorage.setItem('vinmat_auto_filter_typ','spojovacky');if(level&&level!=='vse')localStorage.setItem('vinmat_auto_filter_level',level);else localStorage.removeItem('vinmat_auto_filter_level');window.location.href='${c.home}';}</script><!-- DOT_GUIDE_FEATURED_END -->`;
}

for (const c of Object.values(configs)) {
  let html = await readFile(c.file, 'utf8');
  html = html.replace(/<main\b[\s\S]*?<\/main>/, renderMain(c));
  html = html.replace(/<!-- DOT_GUIDE_MODAL_START -->[\s\S]*?<!-- DOT_GUIDE_MODAL_END -->/g, '');
  html = html.replace(/<!-- DOT_GUIDE_FEATURED_START -->[\s\S]*?<!-- DOT_GUIDE_FEATURED_END -->/g, '');
  html = html.replace(/<footer\b/, `${modal(c)}\n<footer`);
  html = html.replace(/<script src="\.\.\/assets\/js\/site-navigation\.js"><\/script>/, `${scripts(c)}\n    <script src="../assets/js/site-navigation.js"></script>`);
  await writeFile(c.file, html);

  const ids = c.nav.map(([id])=>id);
  for (const id of ids) {
    if (!html.includes(`id="${id}"`)) throw new Error(`${c.language}: missing dot-guide section #${id}`);
  }
  if (!html.includes('top-spojovacky-container') || !html.includes('bottom-spojovacky-container')) throw new Error(`${c.language}: featured dot-to-dot containers missing`);
}

console.log('Expanded DE/ES dot-to-dot guides to match the full EN/CZ guide structure.');
