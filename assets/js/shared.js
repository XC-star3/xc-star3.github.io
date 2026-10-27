(() => {
  const script = document.currentScript;
  const ROOT_PATH = script.getAttribute('src').replace('assets/js/shared.js', '');
  window.SiteStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  };
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function clear(el) {
    if (!el) return;
    el.innerHTML = '';
  }

  function t(key) {
    return window.i18n?.get ? window.i18n.get(key) : key;
  }

  function currentLang() {
    return window.i18n?.currentLang ? window.i18n.currentLang() : window.SiteStorage.get('lang') || 'zh';
  }

  function localized(value) {
    if (value == null) return '';
    if (typeof value === 'string' || Array.isArray(value)) return value;
    const lang = currentLang();
    return value[lang] ?? value.zh ?? value.en ?? '';
  }

  function sitePath(path) {
    return `${ROOT_PATH}${path}`;
  }

  function renderSpanTags(tags, className) {
    if (!Array.isArray(tags)) return '';
    return tags.map((tag) => `<span class="${className}">${tag}</span>`).join('');
  }

  window.SiteShared = { ROOT_PATH, qs, qsa, clear, t, localized, sitePath, renderSpanTags };
})();
