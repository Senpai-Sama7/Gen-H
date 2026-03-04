const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!/**/*.d.ts',
    '!/**/*.next.ts',
    '!./node_modules/**',
    '!./.next/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(' +
      '@testing-library/jest-dom|' +
      'react|' +
      'react-dom|' +
      'next' +
    ')/)',
  ],
};

module.exports = createJestConfig(customJestConfig);
