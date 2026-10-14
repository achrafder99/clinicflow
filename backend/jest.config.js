/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      { jsc: { parser: { syntax: 'typescript' }, target: 'es2022' } },
    ],
  },
  setupFiles: ['<rootDir>/src/tests/setup-env.ts'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/scripts/**', '!src/tests/**'],
};