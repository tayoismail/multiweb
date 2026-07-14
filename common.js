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
})();
