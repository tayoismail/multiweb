/**
 * sw.js — Service Worker for MultiWeb
 * Enables offline caching of all pages and assets
 */
var CACHE_NAME = 'multiweb-v3';
var urlsToCache = [
  './',
  './index.html',
  './common-styles.css',
  './common.js',
  './i18n.js',
  './i18n.css',
  './logo.svg',
  './bmi-calculator.html',
  './unit-converter.html',
  './qr-generator.html',
  './word-counter.html',
  './percentage-calculator.html',
  './password-generator.html',
  './image-converter.html',
  './word-unscrambler.html',
  './about.html',
  './contact.html',
  './privacy.html',
  './404.html',
  './mortgage-calculator.html',
  './tip-calculator.html',
  './discount-calculator.html',
  './currency-converter.html',
  './sales-tax-calculator.html',
  './roi-calculator.html',
  './credit-card-calculator.html',
  './sip-calculator.html',
  './investment-calculator.html',
  './retirement-calculator.html',
  './budget-calculator.html',
  './net-worth-calculator.html',
  './savings-calculator.html',
  './inflation-calculator.html',
  './markup-calculator.html',
  './profit-margin-calculator.html',
  './break-even-calculator.html'
];

// Install: cache all critical assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', function (event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Return cached version if available
        if (response) return response;

        // Otherwise fetch from network
        return fetch(event.request).then(function (networkResponse) {
          // Don't cache non-successful responses or non-GET
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone the response (one for cache, one for browser)
          var responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(function () {
          // If offline and not cached, return a basic offline message for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./404.html');
          }
        });
      })
  );
});
