/**
 * Polyfills for Next.js 15.5.4 compatibility
 * Fixes "exports is not defined" error
 */

// Ensure globalThis is available
if (typeof globalThis === 'undefined') {
  (function() {
    if (typeof global !== 'undefined') {
      global.globalThis = global;
    } else if (typeof window !== 'undefined') {
      window.globalThis = window;
    } else if (typeof self !== 'undefined') {
      self.globalThis = self;
    } else {
      throw new Error('Unable to locate global object');
    }
  })();
}

// Polyfill for exports global
if (typeof globalThis.exports === 'undefined') {
  globalThis.exports = {};
}

// Polyfill for module global
if (typeof globalThis.module === 'undefined') {
  globalThis.module = { exports: {} };
}

// Polyfill for require global (for compatibility)
if (typeof globalThis.require === 'undefined') {
  globalThis.require = function(id: string) {
    // Silently handle require in browser
    return {};
  };
}

// Ensure global is available
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

// Ensure process is available
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'development'
    },
    nextTick(callback) {
      setTimeout(callback, 0);
    }
  };
}

// Handle CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  // Already handled by globalThis.module
}

// Handle AMD exports
if (typeof define === 'function' && define.amd) {
  define(() => {
    return {};
  });
}

// Handle UMD exports
if (typeof exports !== 'undefined') {
  // Already handled by globalThis.exports
}

// Polyfills loaded successfully
