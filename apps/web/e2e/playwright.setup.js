// Polyfill for TransformStream for Playwright tests
if (typeof globalThis.TransformStream === 'undefined') {
    globalThis.TransformStream = require('web-streams-polyfill/ponyfill').TransformStream;
}
