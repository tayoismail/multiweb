/**
 * common.js — Shared utilities for MultiWeb
 * Theme toggle, mobile nav, FAQ accordion, and keyboard handlers
 */
(function () {
  'use strict';

  // ===== Theme Toggle =====
  var html = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');

  function getPreferredTheme() {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  if (themeToggle) {
    setTheme(getPreferredTheme());

    themeToggle.addEventListener('click', function () {
      setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // ===== Mobile Nav Toggle =====
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navOpen = false;

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navOpen = !navOpen;
      navToggle.classList.toggle('active', navOpen);
      navMenu.classList.toggle('open', navOpen);
      navToggle.setAttribute('aria-expanded', navOpen);
    });

    // Close nav on link click
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navOpen = false;
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navOpen) {
        navOpen = false;
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // ===== FAQ Accordion =====
  var faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(function (item) {
      var q = item.querySelector('.faq-question');
      if (!q) return;
      q.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        faqItems.forEach(function (other) {
          other.classList.remove('open');
          var a = other.querySelector('.faq-answer');
          if (a) {
            a.style.maxHeight = '0';
            a.style.padding = '0 20px';
          }
          var oq = other.querySelector('.faq-question');
          if (oq) oq.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('open');
          var a = item.querySelector('.faq-answer');
          if (a) {
            a.style.maxHeight = a.scrollHeight + 'px';
            a.style.padding = '0 20px 18px';
          }
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Initialize first open FAQ
    var firstFaq = document.querySelector('.faq-item.open .faq-answer');
    if (firstFaq) {
      firstFaq.style.maxHeight = firstFaq.scrollHeight + 'px';
      firstFaq.style.padding = '0 20px 18px';
    }
  }

  // ===== Register Service Worker =====
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      // Use relative path to support both root domains and subdirectories (GitHub Pages)
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('Service worker registration failed:', err);
      });
    });
  }

  // ===== Cookie Consent & Google Analytics (GA4) with Consent Mode v2 =====
  var hasLocalStorage = !!window.localStorage;

  function getCookieConsent() {
    if (!hasLocalStorage) return 'declined';
    return localStorage.getItem('cookie-consent');
  }

  function setCookieConsent(value) {
    if (!hasLocalStorage) return;
    localStorage.setItem('cookie-consent', value);
  }

  function grantAnalyticsConsent() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }

  function showCookieBanner(forceShow) {
    // Don't show if already dismissed (unless forcing re-show)
    if (!forceShow && getCookieConsent() !== null) {
      if (getCookieConsent() === 'accepted') {
        grantAnalyticsConsent();
      }
      return;
    }

    // Remove any existing banner first
    var existing = document.querySelector('.cookie-banner');
    if (existing) existing.parentNode.removeChild(existing);

    // Create banner
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('aria-describedby', 'cookie-consent-desc');
    banner.innerHTML = [
      '<div class="cookie-banner-inner container">',
      '  <div class="cookie-banner-text">',
      '    <span class="cookie-banner-icon" aria-hidden="true">🍪</span>',
      '    <p id="cookie-consent-desc">We use cookies for analytics to improve your experience. By accepting, you help us understand how our tools are used. No personal data is collected. <a href="privacy.html">Learn more</a></p>',
      '  </div>',
      '  <div class="cookie-banner-actions">',
      '    <button class="btn btn-sm btn-outline cookie-decline" type="button">Decline</button>',
      '    <button class="btn btn-sm btn-outline-primary cookie-accept" type="button">Accept</button>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(function () {
      banner.classList.add('cookie-banner-visible');
    });

    banner.querySelector('.cookie-accept').addEventListener('click', function () {
      setCookieConsent('accepted');
      grantAnalyticsConsent();
      hideBanner(banner);
    });

    banner.querySelector('.cookie-decline').addEventListener('click', function () {
      setCookieConsent('declined');
      hideBanner(banner);
    });
  }

  function hideBanner(banner) {
    if (!banner || !banner.parentNode) return;
    banner.classList.remove('cookie-banner-visible');
    banner.classList.add('cookie-banner-hiding');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 400);
  }

  // ===== Consent Withdrawal (footer link) =====
  function addFooterCookieLink() {
    var footerBottom = document.querySelector('.footer-bottom');
    if (!footerBottom || document.querySelector('.cookie-settings-link')) return;
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'cookie-settings-link';
    link.textContent = 'Cookie Settings';
    link.style.cssText = 'color:var(--text-footer);text-decoration:underline;font-size:inherit;';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showCookieBanner(true);
    });
    footerBottom.appendChild(link);
  }

  // ===== Donation Button (Flutterwave) =====
  var FLUTTERWAVE_LINK = 'https://flutterwave.com/donate/ko16jzqgtovw';

  function addDonationButton() {
    var footerBottom = document.querySelector('.footer-bottom');
    if (!footerBottom || document.querySelector('.donate-btn')) return;

    var donateBtn = document.createElement('a');
    donateBtn.href = FLUTTERWAVE_LINK;
    donateBtn.target = '_blank';
    donateBtn.rel = 'noopener noreferrer';
    donateBtn.className = 'donate-btn';
    donateBtn.innerHTML = '<span aria-hidden="true">❤️</span> Support Us';
    footerBottom.appendChild(donateBtn);

    // Track donation button clicks with GA4 (only if consent granted)
    donateBtn.addEventListener('click', function () {
      if (typeof window.gtag === 'function' && getCookieConsent() === 'accepted') {
        window.gtag('event', 'donation_button_click', {
          event_category: 'engagement',
          event_label: 'footer_support_us',
          value: 1
        });
      }
    });
  }

  // Initialize consent on page load
  showCookieBanner(false);
  addFooterCookieLink();
  addDonationButton();
})();
