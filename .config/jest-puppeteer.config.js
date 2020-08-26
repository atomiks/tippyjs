require('dotenv').config();

const getConfig = require('jest-puppeteer-docker/lib/config');
const baseConfig = getConfig();

module.exports = {
  browser: 'chromium',
  launch: {
    dumpio: false,
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  server: {
    command: 'yarn build:visual && yarn serve',
    port: 5000,
    launchTimeout: 20000,
  },
  ...baseConfig,
};
