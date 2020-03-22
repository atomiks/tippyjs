const {red, bold} = require('colorette');
const fs = require('fs');
const poster = require('poster');

// https://api.anonymousfiles.io/

class ImageReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onTestResult(test, testResult, aggregateResults) {
    if (process.env.CI !== 'true') {
      return;
    }

    if (
      testResult.numFailingTests &&
      testResult.failureMessage.match(/different from snapshot/)
    ) {
      const files = fs.readdirSync(
        './test/functional/__image_snapshots__/__diff_output__/'
      );
      files.forEach(async (value) => {
        const file = `./test/functional/__image_snapshots__/__diff_output__/${value}`;

        poster.post(
          file,
          {
            uploadUrl: 'https://api.anonymousfiles.io/',
            fileId: 'file',
            fileContentType: 'image/png',
          },
          (err, data) => {
            if (err) {
              throw err;
            }

            console.log(
              red(bold(`Uploaded image diff file to ${JSON.parse(data).url}`))
            );
          }
        );
      });
    }
  }
}

module.exports = ImageReporter;
