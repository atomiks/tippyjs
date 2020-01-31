module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  globals: {
    __DEV__: true,
  },
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-jsdom-fourteen',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  setupFiles: ['dotenv/config'],
};
