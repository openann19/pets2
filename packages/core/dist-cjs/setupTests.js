"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const globals_1 = require("@jest/globals");
// Mock localStorage
const localStorageMock = {
    getItem: globals_1.jest.fn(),
    setItem: globals_1.jest.fn(),
    removeItem: globals_1.jest.fn(),
    clear: globals_1.jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    observe() { }
    disconnect() { }
    unobserve() { }
    takeRecords() {
        return [];
    }
};
// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe() { }
    disconnect() { }
    unobserve() { }
};
// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: globals_1.jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: globals_1.jest.fn(), // deprecated
        removeListener: globals_1.jest.fn(), // deprecated
        addEventListener: globals_1.jest.fn(),
        removeEventListener: globals_1.jest.fn(),
        dispatchEvent: globals_1.jest.fn(),
    })),
});
// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: globals_1.jest.fn(),
});
// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: globals_1.jest.fn((callback) => {
        return window.setTimeout(callback, 16);
    }),
});
Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: globals_1.jest.fn((handle) => {
        window.clearTimeout(handle);
    }),
});
// Setup MSW (Mock Service Worker) for API mocking
// import {  } from '../src/__mocks__/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
//# sourceMappingURL=setupTests.js.map