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

  function applyTranslations(translations) {
    // Text content
    var els = document.querySelectorAll('[data-i18n]');
    els.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });

    // HTML content (for elements with links or formatting)
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    htmlEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (translations[key]) {
        el.innerHTML = translations[key];
      }
    });

    // Placeholders
    var placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.setAttribute('placeholder', translations[key]);
      }
    });

    // Title attributes
    var titleEls = document.querySelectorAll('[data-i18n-title]');
    titleEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (translations[key]) {
        el.setAttribute('title', translations[key]);
      }
    });

    // Aria labels
    var ariaEls = document.querySelectorAll('[data-i18n-aria]');
    ariaEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (translations[key]) {
        el.setAttribute('aria-label', translations[key]);
      }
    });

    // Update page title if translation exists
    if (translations['_page_title']) {
      document.title = translations['_page_title'];
    }

    // Update meta description if translation exists
    if (translations['_meta_description']) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', translations['_meta_description']);
    }
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
