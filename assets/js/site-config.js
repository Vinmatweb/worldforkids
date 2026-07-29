/* VinMat's World for Kids — central localization configuration */
(function () {
    'use strict';

    var basePath = '/worldforkids/';

    var languages = {
        en: { code: 'en', label: 'EN', nativeName: 'English', path: '', assetDirectory: 'en', htmlLang: 'en', ogLocale: 'en_US' },
        cs: { code: 'cs', label: 'CZ', nativeName: 'Čeština', path: 'cs/', assetDirectory: 'cs', htmlLang: 'cs', ogLocale: 'cs_CZ' },
        de: { code: 'de', label: 'DE', nativeName: 'Deutsch', path: 'de/', assetDirectory: 'de', htmlLang: 'de', ogLocale: 'de_DE' },
        es: { code: 'es', label: 'ES', nativeName: 'Español', path: 'es/', assetDirectory: 'es', htmlLang: 'es', ogLocale: 'es_ES' }
    };

    var routes = {
        home: { en: '', cs: '', de: '', es: '' },
        activityGuide: { en: 'guide-activities.html', cs: 'pruvodce-aktivitami.html', de: 'anleitung-aktivitaeten.html', es: 'guia-actividades.html' },
        difficultyLevels: { en: 'difficulty-levels.html', cs: 'urovne-obtiznosti.html', de: 'schwierigkeitsstufen.html', es: 'niveles-dificultad.html' },
        ourStory: { en: 'our-story.html', cs: 'nas-pribeh.html', de: 'unsere-geschichte.html', es: 'nuestra-historia.html' },
        mazeGuide: { en: 'guide-mazes.html', cs: 'pruvodce-bludiste.html', de: 'anleitung-labyrinthe.html', es: 'guia-laberintos.html' },
        coloringGuide: { en: 'guide-coloring.html', cs: 'pruvodce-omalovanky.html', de: 'anleitung-ausmalbilder.html', es: 'guia-dibujos.html' },
        dotToDotGuide: { en: 'guide-dot-to-dot.html', cs: 'pruvodce-spojovacky.html', de: 'anleitung-punkte-verbinden.html', es: 'guia-unir-puntos.html' },
        tracingGuide: { en: 'guide-tracing.html', cs: 'pruvodce-obtahovacky.html', de: 'anleitung-nachzeichnen.html', es: 'guia-trazado.html' },
        tracingHistory: { en: 'history-tracing.html', cs: 'historie-obkreslovani.html', de: 'geschichte-nachzeichnen.html', es: 'historia-trazado.html' },
        privacy: { en: 'privacy.html', cs: 'zasady-ochrany-osobnich-udaju.html', de: null, es: null },
        terms: { en: 'terms.html', cs: 'podminky-uziti.html', de: null, es: null }
    };

    function hasRoute(locale, routeKey) {
        var language = languages[locale];
        if (!language || !routes[routeKey]) return false;
        if (routeKey === 'home') return true;
        return typeof routes[routeKey][language.code] === 'string' && routes[routeKey][language.code] !== '';
    }

    function localeUrl(locale, routeKey, search) {
        var language = languages[locale] || languages.en;
        if (!hasRoute(language.code, routeKey)) return null;
        var route = routes[routeKey][language.code];
        return basePath + language.path + route + (search || '');
    }

    window.VinMatSite = {
        basePath: basePath,
        languages: languages,
        routes: routes,
        hasRoute: hasRoute,
        localeUrl: localeUrl
    };
}());
