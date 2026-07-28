/* Shared navigation, language switcher and small page-wide helpers. */
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
    var socialIcons = {
        YouTube: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        Instagram: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
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

    function targetLocale(button) {
        var explicitTarget = button.getAttribute('data-language-target');
        if (explicitTarget) return explicitTarget;
        var id = button.id || '';
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
        return Object.values(languageLabels).indexOf(element.textContent.trim()) !== -1;
    }

    function routeAvailable(locale) {
        if (!window.VinMatSite) return false;
        return typeof VinMatSite.hasRoute === 'function'
            ? VinMatSite.hasRoute(locale, currentRouteKey())
            : Boolean(VinMatSite.localeUrl(locale, currentRouteKey(), ''));
    }

    function normalizeSocialIcons(topBar) {
        if (!topBar) return;
        Object.keys(socialIcons).forEach(function (label) {
            topBar.querySelectorAll('a[aria-label="' + label + '"]').forEach(function (link) {
                link.innerHTML = socialIcons[label];
                link.classList.add('text-white', 'hover:text-amber-400', 'transition-colors');
            });
        });
    }

    function normalizeMainNavigation(topBar, locale) {
        if (!topBar || !window.VinMatSite || currentRouteKey() === 'home') return;
        var links = Array.from(topBar.querySelectorAll('a')).filter(function (link) {
            if (link.target === '_blank' || link.hasAttribute('aria-label')) return false;
            if (isLanguageControl(link)) return false;
            return true;
        });
        var routeKeys = ['home', 'activityGuide', 'difficultyLevels', 'ourStory'];
        var labels = navLabels[locale] || navLabels.en;
        routeKeys.forEach(function (routeKey, index) {
            var link = links[index];
            if (!link) return;
            var url = VinMatSite.localeUrl(locale, routeKey, '');
            if (url) link.href = url;
            if (routeKey === 'home') {
                var span = link.querySelector('span');
                if (span) span.textContent = labels.home;
            } else {
                link.textContent = labels[routeKey];
            }
        });
    }

    function normalizeLanguageSwitchers(topBar, locale) {
        if (!topBar || !window.VinMatSite || currentRouteKey() === 'home') return;
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

    function normalizeHeader() {
        var topBar = document.querySelector('body > div.fixed.top-0, body > div[class*="fixed"][class*="top-0"]');
        var locale = currentLocale();
        normalizeSocialIcons(topBar);
        normalizeMainNavigation(topBar, locale);
        normalizeLanguageSwitchers(topBar, locale);
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
        var button = event.target.closest('[data-language-target], [id^="lang-to-"]');
        if (!button || !window.VinMatSite) return;
        var locale = targetLocale(button);
        if (!locale || !VinMatSite.languages[locale]) return;
        var url = VinMatSite.localeUrl(locale, currentRouteKey(), currentSearch());
        if (!url) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(url);
    }, true);

    normalizeHeader();
    addBackToTopButton();
}());
