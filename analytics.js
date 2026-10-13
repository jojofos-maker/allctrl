/* allctrl analytics: Umami pageviews and predefined click events. */
(() => {
  'use strict';
  const websiteId = 'b58ad5c8-e8b3-4151-b09e-08245c609223';
  const hosts = ['www.allctrl.no', 'allctrl.no'];
  if (!hosts.includes(location.hostname) || !websiteId) return;
  try { if (localStorage.getItem('umami.disabled') === '1') return; } catch (_) {}
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;

  const modules = new Set(['allctrl', 'carctrl', 'drinkctrl', 'eatctrl', 'jobctrl', 'listenctrl', 'medctrl', 'playctrl', 'readctrl', 'seectrl', 'sourdoughctrl', 'sportctrl', 'timectrl']);
  const send = name => {
    if (window.umami && typeof window.umami.track === 'function') {
      try { Promise.resolve(window.umami.track(name)).catch(() => {}); } catch (_) {}
    }
  };
  // Only predefined event names are sent. Never send link text, email or URL parameters.
  document.addEventListener('click', event => {
    const element = event.target.closest && event.target.closest('a, button[data-filter]');
    if (!element) return;
    if (element.matches('button[data-filter]')) {
      const filter = element.dataset.filter;
      if (['all', 'hverdag', 'interesser', 'arbeid', 'helhet'].includes(filter)) send('filter_' + filter);
      return;
    }
    let target;
    try { target = new URL(element.href, location.href); } catch (_) { return; }
    if (target.protocol === 'mailto:') {
      const interest = element.dataset.interest;
      if (modules.has(interest)) return send('testinteresse_' + interest);
      return send('kontakt_epost');
    }
    if (target.protocol === 'tel:') return send('kontakt_telefon');
    if (target.hostname === 'linkedin.com' || target.hostname.endsWith('.linkedin.com')) return send('kontakt_linkedin');
    if (target.hostname === 'timectrl-taupe.vercel.app' || target.hostname === 'timectrl.allctrl.no') return send('app_timectrl');
    if (target.hostname === 'jobctrl.allctrl.no' || target.hostname.startsWith('jobctrl-alpha')) return send('app_jobctrl');
    if (!hosts.includes(target.hostname)) return;
    const section = target.pathname.split('/').filter(Boolean)[0];
    if (modules.has(section) && target.pathname !== location.pathname) return send('modul_' + section);
    if (section === 'johan' && target.pathname !== location.pathname) return send('bak_ctrl');
    if (target.hash === '#kontakt') send('vis_kontakt');
    if (target.hash === '#moduler') send('utforsk_moduler');
  });

  const tracker = document.createElement('script');
  tracker.src = 'https://cloud.umami.is/script.js';
  tracker.defer = true;
  tracker.setAttribute('data-website-id', websiteId);
  tracker.setAttribute('data-domains', hosts.join(','));
  tracker.setAttribute('data-exclude-search', 'true');
  tracker.setAttribute('data-exclude-hash', 'true');
  tracker.setAttribute('data-do-not-track', 'true');
  document.head.appendChild(tracker);
})();
