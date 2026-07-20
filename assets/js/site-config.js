/* VinMat's World for Kids — central localization configuration */
(function () {
    'use strict';

    var basePath = '/worldforkids/';

    var languages = {
        en: { code: 'en', label: 'EN', nativeName: 'English', path: '', assetDirectory: 'en', htmlLang: 'en', ogLocale: 'en_US' },
        cs: { code: 'cs', label: 'CZ', nativeName: 'Čeština', path: 'cs/', assetDirectory: 'cs', htmlLang: 'cs', ogLocale: 'cs_CZ' }
    };

    var routes = {
        home: { en: '', cs: '' },
        activityGuide: { en: 'activity-guide.html', cs: 'pruvodce-aktivitami.html' },
        difficultyLevels: { en: 'difficulty-levels.html', cs: 'urovne-obtiznosti.html' },
        ourStory: { en: 'our-story.html', cs: 'nas-pribeh.html' },
        mazeGuide: { en: 'maze-guide.html', cs: 'pruvodce-bludiste.html' },
        coloringGuide: { en: 'coloring-guide.html', cs: 'pruvodce-omalovanky.html' },
        dotToDotGuide: { en: 'dot-to-dot-guide.html', cs: 'pruvodce-spojovacky.html' },
        tracingGuide: { en: 'tracing-guide.html', cs: 'pruvodce-obtahovacky.html' },
        privacy: { en: 'privacy.html', cs: 'zasady-ochrany-osobnich-udaju.html' },
        terms: { en: 'terms.html', cs: 'podminky-uziti.html' }
    };

    function localeUrl(locale, routeKey, search) {
        var language = languages[locale] || languages.en;
        var route = (routes[routeKey] && routes[routeKey][language.code]) || routes.home[language.code];
        return basePath + language.path + route + (search || '');
    }

    window.VinMatSite = {
        basePath: basePath,
        languages: languages,
        routes: routes,
        localeUrl: localeUrl
    };
}());
