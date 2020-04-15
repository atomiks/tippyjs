// https://github.com/smooth-code/jest-puppeteer/issues/160#issuecomment-491975158
process.env.JEST_PUPPETEER_CONFIG = require.resolve(
  './jest-puppeteer.config.js'
);

const jestPuppeteerDocker = require('jest-puppeteer-docker/jest-preset');

module.exports = {
  testMatch: ['<rootDir>/test/**/*.test.js'],
  testTimeout: 30000,
  globals: {
    __DEV__: true,
  },
  setupFiles: ['dotenv/config'],
  reporters: ['default', require.resolve('../test/image-reporter.js')],
  ...jestPuppeteerDocker,
  testEnvironment: 'jest-environment-jsdom-fourteen',
  setupFilesAfterEnv: [
    require.resolve('../test/setup.js'),
    ...jestPuppeteerDocker.setupFilesAfterEnv,
  ],
};
