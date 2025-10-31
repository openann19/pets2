import '@testing-library/jest-dom';

// === Text Encoding Polyfills ===
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// === Browser API Mocks ===

// ResizeObserver Mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver Mock  
global.IntersectionObserver = jest.fn().mockImplementation((_callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// MutationObserver Mock
global.MutationObserver = jest.fn().mockImplementation((_callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
}));

// === Window Object Extensions ===

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// === Notification API Mock ===
const MockNotification = jest.fn().mockImplementation((title, options) => ({
  title,
  body: options?.body,
  icon: options?.icon,
  close: jest.fn(),
  onclick: null,
  onclose: null,
  onerror: null,
  onshow: null,
}));

Object.defineProperty(MockNotification, 'permission', {
  value: 'granted',
  writable: true,
});

Object.defineProperty(MockNotification, 'requestPermission', {
  value: jest.fn().mockResolvedValue('granted'),
});

// @ts-expect-error - Mock type assignment
global.Notification = MockNotification;

// === Storage Mocks ===
const createStorageMock = () => {
  const storage = new Map<string, string>();

  return {
    getItem: jest.fn((key: string) => storage.get(key) || null),
    setItem: jest.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: jest.fn((key: string) => storage.delete(key)),
    clear: jest.fn(() => storage.clear()),
    get length() {
      return storage.size;
    },
    key: jest.fn((index: number) => {
      const keys = Array.from(storage.keys());
      return keys[index] || null;
    }),
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

// === Geolocation API Mock ===
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 1,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// === Clipboard API Mock ===
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
  writable: true,
});

// === URL Mock ===
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    value: jest.fn(() => 'blob:mock-url'),
  });
}

if (typeof URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: jest.fn(),
  });
}

// === File Reader Mock ===
const MockFileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  abort: jest.fn(),
  result: null,
  error: null,
  onload: null,
  onerror: null,
  onabort: null,
  onloadstart: null,
  onloadend: null,
  onprogress: null,
}));

Object.defineProperty(MockFileReader, 'EMPTY', { value: 0 });
Object.defineProperty(MockFileReader, 'LOADING', { value: 1 });
Object.defineProperty(MockFileReader, 'DONE', { value: 2 });

global.FileReader = MockFileReader as unknown as typeof FileReader;

// === Web Workers Mock ===
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
}));

// === Console Mocks for Cleaner Tests ===
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  // Mock console.error and console.warn to reduce noise in tests
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore original console methods after each test
  console.error = originalError;
  console.warn = originalWarn;
});

// === Performance API Mock ===
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
});

// === Fetch Mock (if not already mocked by MSW) ===
if (!global.fetch) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    blob: jest.fn().mockResolvedValue(new Blob()),
  });
}
