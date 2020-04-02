import 'expect-puppeteer';

import tippy from '../src';
import {render} from '../src/template';
import {cleanDocumentBody} from './utils';
import {toMatchImageSnapshot} from 'jest-image-snapshot';
import {resetVisitedMessages} from '../src/validation';

expect.extend({toMatchImageSnapshot});

tippy.setDefaultProps({
  render,
  content: '__DEFAULT_TEST_CONTENT__',
  duration: 0,
  delay: 0,
});

jest.useFakeTimers();

// We want to use macrotask timers that can be mocked by Jest
global.Promise = require('promise');

global.requestAnimationFrame = (cb) => cb();

// Prevents console from spamming test output while still allowing for debugging
// while writing tests
global.console = {
  log: console.log,
  warn: jest.fn(),
  error: jest.fn(),
};

afterEach(() => {
  global.console.warn.mockReset();
  global.console.error.mockReset();

  resetVisitedMessages();

  if (typeof document !== 'undefined') {
    cleanDocumentBody();
  }
});
