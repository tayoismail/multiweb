/**
 * converter.js — Shared helpers for MultiWeb document conversion tools
 * (word-to-pdf, pdf-to-word, and future Excel directions).
 *
 * All conversions run 100% in the browser — files never leave the device.
 */
(function (global) {
  'use strict';

  var Converter = {

    /** Lazy-load a script tag; resolves when it has loaded. */
    loadScript: function (src) {
      return new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error('Failed to load ' + src)); };
        document.head.appendChild(s);
      });
    },

    /** Load several scripts (in parallel) and resolve when all are ready. */
    loadScripts: function (srcs) {
      return Promise.all(srcs.map(Converter.loadScript));
    },

    /** Read a File object as an ArrayBuffer. */
    readArrayBuffer: function (file) {
      return file.arrayBuffer();
    },

    /** Trigger a browser download for a Blob. */
    downloadBlob: function (blob, filename) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    },

    /** Strip the extension from a filename ("report.docx" -> "report"). */
    baseName: function (name) {
      var i = name.lastIndexOf('.');
      return i > 0 ? name.slice(0, i) : name;
    },

    /** Human-readable byte size. */
    formatBytes: function (bytes) {
      if (!bytes) return '0 B';
      var k = 1024;
      var sizes = ['B', 'KB', 'MB', 'GB'];
      var i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    /**
     * Wire up a drop zone with drag-and-drop + click-to-browse.
     * opts: { accept: string, onFile: function(file) }
     * A hidden <input type="file"> is injected inside the zone.
     */
    bindDropZone: function (zoneEl, opts) {
      if (!zoneEl) return;

      var input = document.createElement('input');
      input.type = 'file';
      input.accept = opts.accept || '';
      input.setAttribute('aria-label', 'Choose a file');
      input.style.cssText = 'position:absolute;inset:0;opacity:0;cursor:pointer;';

      zoneEl.appendChild(input);

      var prevent = function (e) {
        e.preventDefault();
        e.stopPropagation();
      };

      zoneEl.addEventListener('click', function () { input.click(); });

      input.addEventListener('change', function () {
        if (input.files && input.files.length) {
          opts.onFile(input.files[0]);
        }
        input.value = '';
      });

      zoneEl.addEventListener('dragover', function (e) {
        prevent(e);
        zoneEl.classList.add('dragover');
      });
      zoneEl.addEventListener('dragleave', function () {
        zoneEl.classList.remove('dragover');
      });
      zoneEl.addEventListener('drop', function (e) {
        prevent(e);
        zoneEl.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          opts.onFile(e.dataTransfer.files[0]);
        }
      });

      // Keyboard accessibility
      zoneEl.setAttribute('tabindex', '0');
      zoneEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          input.click();
        }
      });
    }
  };

  global.MultiWebConverter = Converter;
})(window);
