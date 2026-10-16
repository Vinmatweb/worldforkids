/* Optional W4K analytics. No Google Analytics tag loads before consent. */
(function () {
    'use strict';

    const measurementId = 'G-GZFJ4TX5RR';
    const storageKey = 'vinmat-w4k-analytics-consent';
    const lifetime = 180 * 24 * 60 * 60 * 1000;
    const disableKey = 'ga-disable-' + measurementId;
    const copy = {
        en: {
            title: 'Optional visitor statistics',
            description: 'With your consent, we use Google Analytics and analytics cookies to understand how the site is used. You can change your choice in the footer at any time. Downloads and printing work without consent.',
            decline: 'Without analytics', accept: 'Allow analytics', settings: 'Analytics settings', privacy: 'Privacy policy',
            privacyUrl: '/worldforkids/privacy.html'
        },
        cs: {
            title: 'Volitelné statistiky návštěvnosti',
            description: 'S vaším souhlasem používáme Google Analytics a analytické cookies pro měření používání webu. Volbu můžete kdykoli změnit v patičce. Stahování i tisk fungují také bez souhlasu.',
            decline: 'Bez analytiky', accept: 'Povolit analytiku', settings: 'Nastavení analytiky', privacy: 'Ochrana soukromí',
            privacyUrl: '/worldforkids/cs/zasady-ochrany-osobnich-udaju.html'
        },
        de: {
            title: 'Optionale Besucherstatistik',
            description: 'Mit Ihrer Einwilligung verwenden wir Google Analytics und Analyse-Cookies, um die Nutzung der Website zu verstehen. Sie können Ihre Auswahl jederzeit in der Fußzeile ändern. Herunterladen und Drucken funktionieren auch ohne Einwilligung.',
            decline: 'Ohne Analyse', accept: 'Analyse erlauben', settings: 'Analyse-Einstellungen', privacy: 'Datenschutz',
            privacyUrl: '/worldforkids/de/datenschutz.html'
        },
        es: {
            title: 'Estadísticas de visitas opcionales',
            description: 'Con tu consentimiento, usamos Google Analytics y cookies de análisis para conocer el uso del sitio. Puedes cambiar tu elección en el pie de página. Las descargas y la impresión funcionan también sin consentimiento.',
            decline: 'Sin análisis', accept: 'Permitir análisis', settings: 'Configuración de análisis', privacy: 'Privacidad',
            privacyUrl: '/worldforkids/es/privacidad.html'
        }
    };

    let analyticsLoaded = false;
    let dialog;
    let settingsButton;
    let returnFocus;
    window[disableKey] = true;

    function language() {
        const lang = (document.documentElement.lang || 'en').split('-')[0];
        return copy[lang] ? lang : 'en';
    }

    function savedChoice() {
        try {
            const record = JSON.parse(localStorage.getItem(storageKey));
            if (record && record.version === 1 && typeof record.granted === 'boolean' &&
                Number.isFinite(record.updatedAt) && record.updatedAt <= Date.now() &&
                Date.now() - record.updatedAt < lifetime) return record;
        } catch (_) { /* Unavailable storage never implies consent. */ }
        return null;
    }

    function clearAnalyticsCookies() {
        const names = document.cookie.split(';').map(value => value.trim().split('=')[0])
            .filter(name => /^_ga(?:_|$)/.test(name));
        const host = location.hostname;
        const domains = ['', host, '.' + host];
        for (const name of names) {
            for (const domain of domains) {
                for (const path of ['/', '/worldforkids/', location.pathname]) {
                    document.cookie = name + '=; Max-Age=0; path=' + path +
                        (domain ? '; domain=' + domain : '') + '; SameSite=Lax; Secure';
                }
            }
        }
    }

    function startAnalytics() {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        window[disableKey] = false;
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', {
            analytics_storage: 'denied', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied'
        });
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            cookie_expires: lifetime / 1000
        });
        const tag = document.createElement('script');
        tag.id = 'vinmat-w4k-analytics-tag';
        tag.async = true;
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
        document.head.appendChild(tag);
    }

    function stopAnalytics() {
        window[disableKey] = true;
        clearAnalyticsCookies();
        if (analyticsLoaded) {
            // Reload after revocation so the previously loaded tag cannot keep running.
            location.reload();
        }
    }

    function choose(granted) {
        try {
            localStorage.setItem(storageKey, JSON.stringify({version: 1, granted: granted, updatedAt: Date.now()}));
        } catch (_) { /* The choice still applies to the current page. */ }
        dialog.hidden = true;
        if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
        if (granted) startAnalytics();
        else stopAnalytics();
    }

    function openSettings(manual) {
        updateLanguage();
        returnFocus = manual ? document.activeElement : null;
        dialog.hidden = false;
        if (manual) dialog.querySelector('button').focus();
    }

    function updateLanguage() {
        if (!dialog) return;
        const text = copy[language()];
        dialog.querySelector('h2').textContent = text.title;
        dialog.querySelector('p').textContent = text.description;
        dialog.querySelector('[data-analytics-decline]').textContent = text.decline;
        dialog.querySelector('[data-analytics-accept]').textContent = text.accept;
        const link = dialog.querySelector('a');
        link.textContent = text.privacy;
        link.href = text.privacyUrl;
        settingsButton.textContent = text.settings;
    }

    function init() {
        const style = document.createElement('style');
        style.textContent = '#vinmat-analytics-consent[hidden]{display:none!important}' +
            '#vinmat-analytics-consent{position:fixed;z-index:10000;right:16px;bottom:16px;width:min(480px,calc(100% - 32px));box-sizing:border-box;padding:20px;border:1px solid #c7d2fe;border-radius:16px;background:#fff;color:#1e293b;box-shadow:0 12px 45px #0f172a30;font:14px/1.55 system-ui,sans-serif}' +
            '#vinmat-analytics-consent h2{margin:0 0 8px;font:700 17px/1.3 system-ui,sans-serif;color:#1e1b4b}' +
            '#vinmat-analytics-consent p{margin:0 0 12px}' +
            '#vinmat-analytics-consent .consent-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}' +
            '#vinmat-analytics-consent button{flex:1;min-width:145px;border:1px solid #6366f1;border-radius:9px;padding:10px 12px;background:#eef2ff;color:#312e81;font:700 14px system-ui,sans-serif;cursor:pointer}' +
            '#vinmat-analytics-consent a,#vinmat-analytics-settings{color:#4338ca;text-decoration:underline;cursor:pointer}' +
            '#vinmat-analytics-consent button:focus-visible,#vinmat-analytics-consent a:focus-visible,#vinmat-analytics-settings:focus-visible{outline:3px solid #6366f1;outline-offset:3px}' +
            '#vinmat-analytics-settings{border:0;background:transparent;padding:6px;font:inherit}' +
            '@media print{#vinmat-analytics-consent,#vinmat-analytics-settings{display:none!important}}';
        document.head.appendChild(style);
        dialog = document.createElement('section');
        dialog.id = 'vinmat-analytics-consent';
        dialog.hidden = true;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'false');
        dialog.setAttribute('aria-labelledby', 'vinmat-analytics-title');
        dialog.setAttribute('aria-describedby', 'vinmat-analytics-description');
        dialog.innerHTML = '<h2 id="vinmat-analytics-title"></h2><p id="vinmat-analytics-description"></p>' +
            '<div class="consent-actions"><button type="button" data-analytics-decline></button>' +
            '<button type="button" data-analytics-accept></button></div><a></a>';
        dialog.querySelector('[data-analytics-decline]').addEventListener('click', function () { choose(false); });
        dialog.querySelector('[data-analytics-accept]').addEventListener('click', function () { choose(true); });
        document.body.appendChild(dialog);
        const footerRow = document.createElement('div');
        footerRow.style.cssText = 'text-align:center;margin-top:8px';
        settingsButton = document.createElement('button');
        settingsButton.type = 'button';
        settingsButton.id = 'vinmat-analytics-settings';
        settingsButton.addEventListener('click', function () { openSettings(true); });
        footerRow.appendChild(settingsButton);
        (document.querySelector('footer') || document.body).appendChild(footerRow);
        updateLanguage();
        new MutationObserver(updateLanguage).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
        const choice = savedChoice();
        if (choice && choice.granted) startAnalytics();
        else clearAnalyticsCookies();
        const requested = new URLSearchParams(location.search).get('analytics-settings') === '1';
        if (!choice || requested) openSettings(requested);
        window.addEventListener('storage', function (event) {
            if (event.key !== storageKey) return;
            const current = savedChoice();
            if (current && current.granted) startAnalytics();
            else stopAnalytics();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
    else init();
}());
