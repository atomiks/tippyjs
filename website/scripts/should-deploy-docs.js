#!/usr/bin/env node

const {execSync} = require('child_process');

const {TRAVIS_COMMIT_RANGE = '', TRAVIS_COMMIT_MESSAGE = ''} = process.env;

console.log(`TRAVIS_COMMIT_RANGE=${TRAVIS_COMMIT_RANGE}`);
console.log(`TRAVIS_COMMIT_MESSAGE=${TRAVIS_COMMIT_MESSAGE}`);

let commitMessages;

if (TRAVIS_COMMIT_RANGE) {
  // see https://github.com/travis-ci/travis-ci/issues/4596
  const COMMIT_RANGE = TRAVIS_COMMIT_RANGE.replace('...', '..');
  const BASE_COMMIT = COMMIT_RANGE.split('..')[0];

  // make sure that the command doesn't error out,
  // the output is being validated below
  const baseCommitType = execSync(`git cat-file -t ${BASE_COMMIT} || true`)
    .toString()
    .trim();

  if (baseCommitType !== 'commit') {
    // commit not found -> history was rewritten
    console.log(`Commit ${BASE_COMMIT} not found, exiting...`);
    process.exit(0);
  }

  const commitList = execSync(
    `git rev-list ${COMMIT_RANGE} --oneline`
  ).toString();

  console.log(`Commits included in this build:\n${commitList}`);

  commitMessages = commitList
    .split('\n')
    // filter out empty lines
    .filter((line) => line)
    // extract commit message, line should be something like: `dbede8c message`
    .map((line) => line.slice(8));
} else {
  commitMessages = [TRAVIS_COMMIT_MESSAGE];
}

const DOCS_PREFIXES = ['docs', 'release'];

const shouldDeployDocs = commitMessages.some((message) => {
  return DOCS_PREFIXES.some((prefix) => message.startsWith(`${prefix}: `));
});

console.log(`SHOULD_DEPLOY_DOCS=${shouldDeployDocs}`);
