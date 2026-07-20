/* Shared language switcher. Loaded after a page's inline scripts. */
(function () {
    'use strict';

    function targetLocale(button) {
        var id = button.id || '';
        if (id.indexOf('cz') !== -1 || id.indexOf('cs') !== -1) return 'cs';
        if (id.indexOf('en') !== -1) return 'en';
        return null;
    }

    function addBackToTopButton() {
        // Některé starší stránky tlačítko již obsahují přímo v HTML. Nové a
        // generované stránky jej dostanou jednotně odsud, bez kopírování kódu.
        if (document.getElementById('backToTop')) return;

        var button = document.createElement('button');
        var isCzech = document.body.getAttribute('data-locale') === 'cs';
        button.id = 'backToTop';
        button.type = 'button';
        button.textContent = '⬆️';
        button.setAttribute('aria-label', isCzech ? 'Zpět nahoru' : 'Back to top');
        button.style.cssText = [
            'position:fixed',
            'bottom:3.5rem',
            'left:min(calc(50% + 30rem), calc(100vw - 60px))',
            'z-index:50',
            'border:0',
            'background:transparent',
            'font-size:1.875rem',
            'line-height:1',
            'cursor:pointer',
            'opacity:0',
            'pointer-events:none',
            'transition:opacity .3s ease, transform .3s ease'
        ].join(';');
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        button.addEventListener('mouseenter', function () { button.style.transform = 'scale(1.1)'; });
        button.addEventListener('mouseleave', function () { button.style.transform = ''; });
        document.body.appendChild(button);

        function updateVisibility() {
            var visible = window.scrollY > 500;
            button.style.opacity = visible ? '1' : '0';
            button.style.pointerEvents = visible ? 'auto' : 'none';
        }

        window.addEventListener('scroll', updateVisibility, { passive: true });
        updateVisibility();
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

    addBackToTopButton();
}());
