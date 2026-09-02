/**
 * i18n.js — Lightweight internationalization for MultiWeb
 * Loads translations from JSON files and applies them via data-i18n attributes.
 * Stores language preference in localStorage.
 */
(function () {
  'use strict';

  var SUPPORTED_LANGS = ['en', 'fr', 'es', 'de', 'pt', 'ja', 'ar', 'hi', 'zh-CN', 'ko', 'it'];
  var LANG_NAMES = {
    'en': 'English',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'pt': 'Português',
    'ja': '日本語',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'zh-CN': '中文',
    'ko': '한국어',
    'it': 'Italiano'
  };
  var LANG_FLAGS = {
    'en': '🇬🇧',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'de': '🇩🇪',
    'pt': '🇵🇹',
    'ja': '🇯🇵',
    'ar': '🇸🇦',
    'hi': '🇮🇳',
    'zh-CN': '🇨🇳',
    'ko': '🇰🇷',
    'it': '🇮🇹'
  };

  var currentLang = localStorage.getItem('multilang') || 'en';
  var translationsCache = {};

  function getPreferredLang() {
    var stored = localStorage.getItem('multilang');
    if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    var browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      // Check exact match first (e.g., "pt-BR" -> "pt")
      var base = browserLang.split('-')[0];
      if (SUPPORTED_LANGS.indexOf(browserLang) !== -1) return browserLang;
      if (SUPPORTED_LANGS.indexOf(base) !== -1) return base;
    }
    return 'en';
  }

  function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = 'en';
    currentLang = lang;
    localStorage.setItem('multilang', lang);
    document.documentElement.setAttribute('lang', lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    loadTranslations(lang);
  }

  function loadTranslations(lang) {
    if (lang === 'en') {
      applyTranslations({});
      updateLanguageSwitcher();
      return;
    }
    if (translationsCache[lang]) {
      applyTranslations(translationsCache[lang]);
      updateLanguageSwitcher();
      return;
    }
    var url = 'i18n/' + lang + '.json';
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Translation file not found: ' + url);
        return res.json();
      })
      .then(function (data) {
        translationsCache[lang] = data;
        applyTranslations(data);
        updateLanguageSwitcher();
      })
      .catch(function (err) {
        console.warn('i18n: Failed to load translations for', lang, err);
        applyTranslations({});
        updateLanguageSwitcher();
      });
  }

  /**
   * Inject <link rel="alternate" hreflang="xx"> tags into <head>
   * so search engines know this page exists in multiple languages.
   */
  function injectHreflangTags() {
    // Remove any previously injected hreflang tags
    var existing = document.querySelectorAll('link[data-hreflang]');
    existing.forEach(function (el) { el.parentNode.removeChild(el); });

    var canonical = document.querySelector('link[rel="canonical"]');
    var baseUrl = canonical ? canonical.getAttribute('href') : window.location.href.split('?')[0].split('#')[0];

    // x-default points to the canonical (English default)
    var xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', baseUrl);
    xDefault.setAttribute('data-hreflang', '1');
    document.head.appendChild(xDefault);

    // Add hreflang for each non-English supported language
    SUPPORTED_LANGS.forEach(function (lang) {
      if (lang === 'en') return;
      var link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', baseUrl + '?hl=' + lang);
      link.setAttribute('data-hreflang', '1');
      document.head.appendChild(link);
    });

    // Self-referencing English hreflang
    var enLink = document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', baseUrl);
    enLink.setAttribute('data-hreflang', '1');
    document.head.appendChild(enLink);
  }

  /**
   * Update Open Graph, Twitter Card, and keyword meta tags
   * with translated values when available.
   */
  function applyMetaTranslations(translations) {
    if (!translations || Object.keys(translations).length === 0) return;

    // OG title
    if (translations['_og_title']) {
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', translations['_og_title']);
      var twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', translations['_og_title']);
    }

    // OG description
    if (translations['_og_description']) {
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', translations['_og_description']);
      var twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', translations['_og_description']);
    }

    // Meta keywords
    if (translations['_meta_keywords']) {
      var kw = document.querySelector('meta[name="keywords"]');
      if (kw) kw.setAttribute('content', translations['_meta_keywords']);
    }

    // Update og:locale
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      var localeMap = {
        'en': 'en_US', 'fr': 'fr_FR', 'es': 'es_ES', 'de': 'de_DE',
        'pt': 'pt_PT', 'ja': 'ja_JP', 'ar': 'ar_SA', 'hi': 'hi_IN',
        'zh-CN': 'zh_CN', 'ko': 'ko_KR', 'it': 'it_IT'
      };
      ogLocale.setAttribute('content', localeMap[currentLang] || 'en_US');
    }
  }

  /**
   * Update the JSON-LD structured data with inLanguage.
   */
  function applyStructuredDataLang() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function (script) {
      try {
        var data = JSON.parse(script.textContent);
        var langMap = {
          'en': 'en-US', 'fr': 'fr-FR', 'es': 'es-ES', 'de': 'de-DE',
          'pt': 'pt-PT', 'ja': 'ja-JP', 'ar': 'ar-SA', 'hi': 'hi-IN',
          'zh-CN': 'zh-CN', 'ko': 'ko-KR', 'it': 'it-IT'
        };
        data.inLanguage = langMap[currentLang] || 'en-US';
        if (data['@type'] === 'WebApplication' || data['@type'] === 'WebSite') {
          // Add availableLanguage if not already there
          if (!data.availableLanguage) {
            data.availableLanguage = SUPPORTED_LANGS.map(function (l) {
              return langMap[l] || l;
            });
          }
        }
        script.textContent = JSON.stringify(data, null, 2);
      } catch (e) {}
    });
  }

  function applyTranslations(translations) {
    var missingKeys = {};

    // Text content
    var els = document.querySelectorAll('[data-i18n]');
    els.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.textContent = translations[key];
      } else if (currentLang !== 'en') {
        if (!missingKeys[key]) missingKeys[key] = 0;
        missingKeys[key]++;
      }
    });

    // HTML content (for elements with links or formatting)
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    htmlEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (translations[key]) {
        el.innerHTML = translations[key];
      } else if (currentLang !== 'en') {
        if (!missingKeys[key]) missingKeys[key] = 0;
        missingKeys[key]++;
      }
    });

    // Placeholders
    var placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.setAttribute('placeholder', translations[key]);
      } else if (currentLang !== 'en') {
        if (!missingKeys[key]) missingKeys[key] = 0;
        missingKeys[key]++;
      }
    });

    // Title attributes
    var titleEls = document.querySelectorAll('[data-i18n-title]');
    titleEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (translations[key]) {
        el.setAttribute('title', translations[key]);
      } else if (currentLang !== 'en') {
        if (!missingKeys[key]) missingKeys[key] = 0;
        missingKeys[key]++;
      }
    });

    // Aria labels
    var ariaEls = document.querySelectorAll('[data-i18n-aria]');
    ariaEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (translations[key]) {
        el.setAttribute('aria-label', translations[key]);
      } else if (currentLang !== 'en') {
        if (!missingKeys[key]) missingKeys[key] = 0;
        missingKeys[key]++;
      }
    });

    // Button text (only text nodes, preserving child elements like icons)
    var btnTextEls = document.querySelectorAll('[data-i18n-text]');
    btnTextEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-text');
      if (translations[key]) {
        for (var i = 0; i < el.childNodes.length; i++) {
          if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim()) {
            el.childNodes[i].textContent = translations[key];
            break;
          }
        }
      } else if (currentLang !== 'en') {
        if (!missingKeys[key]) missingKeys[key] = 0;
        missingKeys[key]++;
      }
    });

    // Log missing keys in development
    if (currentLang !== 'en' && Object.keys(missingKeys).length > 0) {
      console.groupCollapsed('i18n: Missing keys for ' + currentLang + ' (' + Object.keys(missingKeys).length + ' keys)');
      Object.keys(missingKeys).forEach(function (key) {
        console.warn('Missing key: ' + key + ' (referenced ' + missingKeys[key] + ' time(s))');
      });
      console.groupEnd();
    }

    // Update page title: prefer the page-specific key (set via
    // <meta name="page-title-key" content="..."> in the page head),
    // otherwise fall back to the generic site title.
    var titleKeyMeta = document.querySelector('meta[name="page-title-key"]');
    var pageTitleKey = titleKeyMeta ? titleKeyMeta.getAttribute('content') : null;
    if (pageTitleKey && translations[pageTitleKey]) {
      document.title = translations[pageTitleKey] + ' | MultiWeb';
    } else if (translations['_page_title']) {
      document.title = translations['_page_title'];
    }

    // Update meta description if translation exists
    if (translations['_meta_description']) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', translations['_meta_description']);
    }

    // Update Open Graph, Twitter Card, and keyword meta tags
    applyMetaTranslations(translations);

    // Inject hreflang tags for search engines
    injectHreflangTags();

    // Update structured data language
    applyStructuredDataLang();
  }

  function updateLanguageSwitcher() {
    var switcher = document.getElementById('langSwitcher');
    if (!switcher) return;

    var btn = switcher.querySelector('.lang-current');
    if (btn) {
      btn.innerHTML = LANG_FLAGS[currentLang] + ' ' + LANG_NAMES[currentLang];
    }

    var dropdown = switcher.querySelector('.lang-dropdown');
    if (dropdown) {
      dropdown.innerHTML = '';
      SUPPORTED_LANGS.forEach(function (lang) {
        if (lang === currentLang) return;
        var option = document.createElement('button');
        option.className = 'lang-option';
        option.setAttribute('data-lang', lang);
        option.innerHTML = LANG_FLAGS[lang] + ' ' + LANG_NAMES[lang];
        option.addEventListener('click', function () {
          setLanguage(lang);
          dropdown.classList.remove('open');
        });
        dropdown.appendChild(option);
      });
    }
  }

  function addLanguageSwitcher() {
    // Check if already exists
    if (document.getElementById('langSwitcher')) return;

    var navActions = document.querySelector('.navbar-actions');
    if (!navActions) return;

    var switcher = document.createElement('div');
    switcher.id = 'langSwitcher';
    switcher.className = 'lang-switcher';
    switcher.innerHTML = [
      '<button class="lang-current" aria-label="Change language" aria-expanded="false">',
      LANG_FLAGS[currentLang] + ' ' + LANG_NAMES[currentLang],
      '</button>',
      '<div class="lang-dropdown" role="menu"></div>'
    ].join('');

    // Insert before the theme toggle
    navActions.insertBefore(switcher, navActions.firstChild);

    // Toggle dropdown
    var btn = switcher.querySelector('.lang-current');
    var dropdown = switcher.querySelector('.lang-dropdown');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });

    updateLanguageSwitcher();
  }

  // Initialize
  currentLang = getPreferredLang();
  document.documentElement.setAttribute('lang', currentLang);

  // Support ?hl=xx query parameter for language selection
  var hlParam = new URLSearchParams(window.location.search).get('hl');
  if (hlParam && SUPPORTED_LANGS.indexOf(hlParam) !== -1) {
    currentLang = hlParam;
    localStorage.setItem('multilang', hlParam);
  }
  document.documentElement.setAttribute('lang', currentLang);
  // Set text direction on initial load too (setLanguage also does this)
  if (currentLang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      addLanguageSwitcher();
      loadTranslations(currentLang);
    });
  } else {
    addLanguageSwitcher();
    loadTranslations(currentLang);
  }

  // Expose API
  window.MultiWebI18n = {
    setLanguage: setLanguage,
    getLanguage: function () { return currentLang; },
    getSupportedLanguages: function () { return SUPPORTED_LANGS.slice(); },
    getLanguageName: function (lang) { return LANG_NAMES[lang] || lang; }
  };
})();
