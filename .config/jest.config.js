// https://github.com/smooth-code/jest-puppeteer/issues/160#issuecomment-491975158
process.env.JEST_PUPPETEER_CONFIG = require.resolve(
  './jest-puppeteer.config.js'
);

module.exports = {
  preset: 'jest-puppeteer-docker',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  testTimeout: 30000,
  globals: {
    __DEV__: true,
  },
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-jsdom-fourteen',
  setupFilesAfterEnv: [require.resolve('../test/setup.js')],
  setupFiles: ['dotenv/config'],
  reporters: ['default', require.resolve('../test/image-reporter.js')],
};
