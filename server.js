/**
 * server.js — Local dev server for MultiWeb
 *
 * Zero-dependency static server that mirrors the production environment:
 *   - Serves the site from the project root
 *   - Maps clean URLs (/video-compressor) to .html files, like Cloudflare Pages
 *   - Sets the same COOP/COEP headers as the `_headers` file, which the
 *     video compressor needs for SharedArrayBuffer / the FFmpeg engine
 *
 * Run with: npm run dev   (or: PORT=8080 node server.js)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const COMMON_HEADERS = {
  // Mirrors the production `_headers` file so WebAssembly tools work locally.
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cache-Control': 'no-cache',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
};

function send(res, statusCode, body, headers) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Missing page: serve the custom 404, like Cloudflare Pages.
      return fs.readFile(path.join(ROOT, '404.html'), (err404, body404) => {
        if (err404) return send(res, 404, 'Not Found', COMMON_HEADERS);
        send(res, 404, body404, COMMON_HEADERS);
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, {
      ...COMMON_HEADERS,
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', COMMON_HEADERS);
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://' + HOST + ':' + PORT).pathname);
  } catch (e) {
    return send(res, 400, 'Bad Request', COMMON_HEADERS);
  }

  if (pathname.endsWith('/')) pathname += 'index.html';
  // Clean URLs: /video-compressor -> video-compressor.html (same as production).
  if (!path.extname(pathname)) pathname += '.html';

  const resolved = path.resolve(ROOT, '.' + pathname);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Forbidden', COMMON_HEADERS);
  }

  serveFile(res, resolved);
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  MultiWeb dev server running');
  console.log('  ➜  http://' + HOST + ':' + PORT);
  console.log('  ➜  http://' + HOST + ':' + PORT + '/video-compressor');
  console.log('  (COOP/COEP headers are set, so the FFmpeg video compressor works)');
  console.log('');
});