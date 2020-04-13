require('dotenv').config();

module.exports = {
  browser: 'chromium',
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== 'false',
  },
  server: {
    command: 'npm run build:visual && npm run serve',
    port: 5000,
    launchTimeout: 20000,
  },
};
