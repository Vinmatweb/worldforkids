/* Shared language switcher. Loaded after a page's inline scripts. */
(function () {
    'use strict';

    function targetLocale(button) {
        var id = button.id || '';
        if (id.indexOf('cz') !== -1 || id.indexOf('cs') !== -1) return 'cs';
        if (id.indexOf('en') !== -1) return 'en';
        return null;
    }

    document.addEventListener('click', function (event) {
        var button = event.target.closest('[data-language-target], #lang-to-en, #lang-to-cz, #lang-to-en-desktop, #lang-to-cz-desktop');
        if (!button || !window.VinMatSite) return;

        var locale = button.getAttribute('data-language-target') || targetLocale(button);
        if (!locale || !VinMatSite.languages[locale]) return;

        var routeKey = document.body.getAttribute('data-route-key') || 'home';
        var query = new URLSearchParams(window.location.search);
        query.delete('lang');
        var search = query.toString() ? '?' + query.toString() : '';

        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(VinMatSite.localeUrl(locale, routeKey, search));
    }, true);
}());
