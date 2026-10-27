(() => {
  const storage = window.SiteStorage;
  const fallback = window.SiteDefaultLocale;
  const cache = new Map([['zh', fallback]]);
  let langData = fallback;
  let currentLang = 'zh';
  let requestedLang = storage.get('lang') === 'en' ? 'en' : 'zh';
  let requestId = 0;

  function getNestedValue(obj, key) {
    return key.split('.').reduce((value, part) => value?.[part], obj);
  }

  function t(key) {
    return getNestedValue(langData, key) ?? getNestedValue(fallback, key) ?? key;
  }

  function updatePageLang() {
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
    const titleKey = document.documentElement.getAttribute('data-title-i18n');
    if (titleKey) document.title = t(titleKey);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = t(key);
      if (value === key) return;
      if (el.tagName === 'IMG') el.setAttribute('alt', value);
      else el.innerHTML = value;
    });
    const toggle = document.querySelector('.lang-toggle');
    if (toggle) toggle.textContent = currentLang === 'en' ? '中文' : 'English';
  }

  async function loadLang(lang) {
    const id = ++requestId;
    requestedLang = lang;
    let data = cache.get(lang);
    if (!data) {
      try {
        const response = await fetch(`${window.SiteShared.ROOT_PATH}lang/${lang}.json`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
        if (!data || typeof data !== 'object' || !data.meta || !data.nav) throw new Error('Invalid locale');
        cache.set(lang, data);
      } catch (error) {
        if (id !== requestId) return;
        console.warn(`[i18n] ${lang} unavailable; using Chinese.`, error);
        lang = 'zh';
        data = fallback;
      }
    }
    if (id !== requestId) return;
    currentLang = lang;
    requestedLang = lang;
    langData = data;
    storage.set('lang', lang);
    updatePageLang();
    window.dispatchEvent(new Event('i18nLoaded'));
  }

  window.i18n = {
    get: t,
    currentLang: () => currentLang,
    requestedLang: () => requestedLang,
    changeLang: (lang) => loadLang(lang === 'en' ? 'en' : 'zh'),
  };
  document.addEventListener('DOMContentLoaded', () => {
    updatePageLang();
    loadLang(requestedLang);
  });
})();
