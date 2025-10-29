// Jest setup for PawfectMatch Premium
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder in Node.js environment
const { TextDecoder, TextEncoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
    value: {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
    },
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' &&
        args[0].includes('Warning: ReactDOM.render is no longer supported')) {
        return;
    }
    originalWarn.call(console, ...args);
};