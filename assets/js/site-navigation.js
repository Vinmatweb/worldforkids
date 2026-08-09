/* Shared navigation, language switcher, footer localization and responsive helpers. */
(function () {
    'use strict';

    var languageOrder = ['cs', 'en', 'de', 'es'];
    var languageLabels = { cs: 'CZ', en: 'EN', de: 'DE', es: 'ES' };

    var navLabels = {
        en: { home: 'Home', activityGuide: 'Activity Guide', difficultyLevels: 'Difficulty Levels', ourStory: 'Our Story', backToTop: 'Back to top' },
        cs: { home: 'Domů', activityGuide: 'Průvodce aktivitami', difficultyLevels: 'Úrovně obtížnosti', ourStory: 'Náš příběh', backToTop: 'Zpět nahoru' },
        de: { home: 'Startseite', activityGuide: 'Aktivitäten-Guide', difficultyLevels: 'Schwierigkeitsstufen', ourStory: 'Unsere Geschichte', backToTop: 'Nach oben' },
        es: { home: 'Inicio', activityGuide: 'Guía de actividades', difficultyLevels: 'Niveles de dificultad', ourStory: 'Nuestra historia', backToTop: 'Volver arriba' }
    };

    var footerLabels = {
        en: {
            copyright: '© 2026 Made with ❤️ for great crafting',
            disclaimer: 'All downloads free for personal & educational use',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            contact: 'Contact'
        },
        cs: {
            copyright: '© 2026 Vyrobeno s ❤️ pro skvělé tvoření',
            disclaimer: 'Všechna stahování jsou zdarma pro osobní a vzdělávací účely',
            privacy: 'Zásady ochrany osobních údajů',
            terms: 'Podmínky užití',
            contact: 'Kontakt'
        },
        de: {
            copyright: '© 2026 Mit ❤️ gemacht für kreative Kinder',
            disclaimer: 'Alle Downloads sind für die private und pädagogische Nutzung kostenlos',
            privacy: 'Datenschutz',
            terms: 'Nutzungsbedingungen',
            contact: 'Kontakt'
        },
        es: {
            copyright: '© 2026 Hecho con ❤️ para niños creativos',
            disclaimer: 'Todas las descargas son gratuitas para uso personal y educativo',
            privacy: 'Privacidad',
            terms: 'Términos de uso',
            contact: 'Contacto'
        }
    };

    function currentLocale() {
        var locale = document.body && document.body.getAttribute('data-locale');
        return window.VinMatSite && VinMatSite.languages[locale] ? locale : 'en';
    }

    function currentRouteKey() {
        return (document.body && document.body.getAttribute('data-route-key')) || 'home';
    }

    function currentSearch() {
        var query = new URLSearchParams(window.location.search);
        query.delete('lang');
        return query.toString() ? '?' + query.toString() : '';
    }

    function targetLocale(control) {
        var explicitTarget = control.getAttribute('data-language-target');
        if (explicitTarget) return explicitTarget;
        var id = control.id || '';
        if (id.indexOf('cz') !== -1 || id.indexOf('cs') !== -1) return 'cs';
        if (id.indexOf('en') !== -1) return 'en';
        if (id.indexOf('de') !== -1) return 'de';
        if (id.indexOf('es') !== -1) return 'es';
        return null;
    }

    function isLanguageControl(element) {
        if (!element || !/^(A|BUTTON)$/.test(element.tagName)) return false;
        if (element.hasAttribute('data-language-target')) return true;
        if (/^lang-to-(cz|cs|en|de|es)(-desktop)?$/.test(element.id || '')) return true;
        return false;
    }

    function routeAvailable(locale) {
        if (!window.VinMatSite) return false;
        return typeof VinMatSite.hasRoute === 'function'
            ? VinMatSite.hasRoute(locale, currentRouteKey())
            : Boolean(VinMatSite.localeUrl(locale, currentRouteKey(), ''));
    }

    function normalizeMainNavigation(locale) {
        if (!window.VinMatSite) return;
        var labels = navLabels[locale] || navLabels.en;
        var items = [
            { id: 'nav-home', route: 'home', label: 'home' },
            { id: 'nav-pruvodce', route: 'activityGuide', label: 'activityGuide' },
            { id: 'nav-urovne', route: 'difficultyLevels', label: 'difficultyLevels' },
            { id: 'nav-pribeh', route: 'ourStory', label: 'ourStory' }
        ];

        items.forEach(function (item) {
            var link = document.getElementById(item.id);
            if (!link) return;
            var url = VinMatSite.localeUrl(locale, item.route, '');
            if (url) link.href = url;
            if (item.route === 'home') {
                var span = link.querySelector('span');
                if (span) span.textContent = labels[item.label];
                else link.textContent = labels[item.label];
            } else {
                link.textContent = labels[item.label];
            }
        });
    }

    function normalizeLanguageSwitchers(topBar, locale) {
        if (!topBar || !window.VinMatSite) return;
        var controls = Array.from(topBar.querySelectorAll('a, button')).filter(isLanguageControl);
        var groups = [];

        controls.forEach(function (control) {
            var parent = control.parentElement;
            if (parent && groups.indexOf(parent) === -1) groups.push(parent);
        });

        groups.forEach(function (group) {
            Array.from(group.children).forEach(function (child) {
                if (isLanguageControl(child)) child.remove();
            });

            languageOrder.forEach(function (target) {
                if (target === locale || !routeAvailable(target)) return;
                var url = VinMatSite.localeUrl(target, currentRouteKey(), currentSearch());
                if (!url) return;
                var link = document.createElement('a');
                link.href = url;
                link.setAttribute('data-language-target', target);
                link.className = 'hover:text-amber-400 transition-colors font-bold';
                link.textContent = languageLabels[target];
                group.appendChild(link);
            });
        });
    }

    function normalizeFooter(locale) {
        if (!window.VinMatSite) return;
        var labels = footerLabels[locale] || footerLabels.en;
        var copyright = document.getElementById('txt-footer-copyright');
        var disclaimer = document.getElementById('txt-footer-disclaimer');
        var privacy = document.getElementById('txt-footer-privacy');
        var terms = document.getElementById('txt-footer-terms');
        var contact = document.getElementById('txt-footer-contact');

        if (copyright) copyright.textContent = labels.copyright;
        if (disclaimer) disclaimer.textContent = labels.disclaimer;
        if (contact) contact.textContent = labels.contact;

        var privacyUrl = VinMatSite.localeUrl(locale, 'privacy', '');
        var termsUrl = VinMatSite.localeUrl(locale, 'terms', '');
        if (privacy) {
            privacy.textContent = labels.privacy;
            if (privacyUrl) privacy.href = privacyUrl;
        }
        if (terms) {
            terms.textContent = labels.terms;
            if (termsUrl) terms.href = termsUrl;
        }

        document.querySelectorAll('footer a').forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var text = (link.textContent || '').trim();
            if (/(privacy|privacy-cz|zasady-ochrany-osobnich-udaju|datenschutz|privacidad)\.html/i.test(href) || /^(Privacy Policy|Zásady ochrany osobních údajů|Datenschutz|Privacidad)$/i.test(text)) {
                link.textContent = labels.privacy;
                if (privacyUrl) link.href = privacyUrl;
            }
            if (/(terms|terms-cz|podminky-uziti|nutzungsbedingungen|terminos|terminos-de-uso)\.html/i.test(href) || /^(Terms of (?:Use|Service)|Podmínky užití|Nutzungsbedingungen|Términos de uso)$/i.test(text)) {
                link.textContent = labels.terms;
                if (termsUrl) link.href = termsUrl;
            }
        });
    }

    function improveResponsiveHeader(topBar) {
        if (!topBar || topBar.getAttribute('data-responsive-header') === 'true') return;
        topBar.setAttribute('data-responsive-header', 'true');
        var navigationGrid = topBar.querySelector('.grid.grid-cols-1');
        var secondRow = navigationGrid && navigationGrid.children.length > 1 ? navigationGrid.children[1] : null;
        var mobileTools = secondRow && secondRow.children.length > 1 ? secondRow.children[1] : null;

        function updateLayout() {
            var isNarrow = window.innerWidth < 480;
            if (secondRow) {
                secondRow.style.flexDirection = isNarrow ? 'column' : '';
                secondRow.style.alignItems = isNarrow ? 'stretch' : '';
                secondRow.style.rowGap = isNarrow ? '0.25rem' : '';
            }
            if (mobileTools) {
                mobileTools.style.alignSelf = isNarrow ? 'flex-end' : '';
                mobileTools.style.marginLeft = isNarrow ? '0' : '';
            }
            window.requestAnimationFrame(function () {
                document.body.style.paddingTop = Math.ceil(topBar.getBoundingClientRect().height) + 'px';
            });
        }

        window.addEventListener('resize', updateLayout, { passive: true });
        updateLayout();
    }

    function normalizePageChrome() {
        var locale = currentLocale();
        var topBar = document.querySelector('body > div.fixed.top-0, body > div[class*="fixed"][class*="top-0"]');
        normalizeMainNavigation(locale);
        normalizeLanguageSwitchers(topBar, locale);
        normalizeFooter(locale);
        improveResponsiveHeader(topBar);
    }

    function addBackToTopButton() {
        var locale = currentLocale();
        var labels = navLabels[locale] || navLabels.en;
        var existingButton = document.getElementById('backToTop');
        if (existingButton) {
            existingButton.setAttribute('aria-label', labels.backToTop);
            return;
        }
        var button = document.createElement('button');
        button.id = 'backToTop';
        button.type = 'button';
        button.textContent = '⬆️';
        button.setAttribute('aria-label', labels.backToTop);
        button.style.cssText = [
            'position:fixed', 'bottom:3.5rem', 'left:min(calc(50% + 30rem), calc(100vw - 60px))',
            'z-index:50', 'border:0', 'background:transparent', 'font-size:1.875rem', 'line-height:1',
            'cursor:pointer', 'opacity:0', 'pointer-events:none', 'transition:opacity .3s ease, transform .3s ease'
        ].join(';');
        button.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
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
        var control = event.target.closest('[data-language-target], [id^="lang-to-"]');
        if (!control || !window.VinMatSite) return;
        var locale = targetLocale(control);
        if (!locale || !VinMatSite.languages[locale]) return;
        var url = VinMatSite.localeUrl(locale, currentRouteKey(), currentSearch());
        if (!url) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(url);
    }, true);

    normalizePageChrome();
    addBackToTopButton();
}());
