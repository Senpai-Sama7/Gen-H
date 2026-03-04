// genh-premium-site/jest.setup.ts
import '@testing-library/jest-dom';

// Add TextEncoder/TextDecoder polyfills for JSDOM
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)),
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    },
    getRandomValues: jest.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock @vercel/blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn(() => Promise.resolve({ pathname: '/test/blob.json' })),
  del: jest.fn(() => Promise.resolve()),
  head: jest.fn(() => Promise.resolve({ downloadUrl: 'https://test.blob.vercel.com/test' })),
  list: jest.fn(() => Promise.resolve({ blobs: [] })),
}));

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/test'),
}));

// Suppress console.error during tests unless it's a test failure
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((message) => {
    // Suppress React act() warnings
    if (typeof message === 'string' && message.includes('Warning:')) {
      return;
    }
    originalError(message);
  });
  
  console.warn = jest.fn((message) => {
    // Suppress specific warnings
    if (typeof message === 'string' && message.includes('Warning:')) {
      return;
    }
    originalWarn(message);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
