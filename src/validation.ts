import {Targets} from './types';

export function createMemoryLeakWarning(method: string): string {
  const txt = method === 'destroy' ? 'n already-' : ' ';

  return [
    `${method}() was called on a${txt}destroyed instance. This is a no-op but`,
    'indicates a potential memory leak.',
  ].join(' ');
}

export function clean(value: string): string {
  const spacesAndTabs = /[ \t]{2,}/g;
  const lineStartWithSpaces = /^[ \t]*/gm;

  return value
    .replace(spacesAndTabs, ' ')
    .replace(lineStartWithSpaces, '')
    .trim();
}

function getDevMessage(message: string): string {
  return clean(`
  %ctippy.js

  %c${clean(message)}

  %c👷‍ This is a development-only message. It will be removed in production.
  `);
}

export function getFormattedMessage(message: string): string[] {
  return [
    getDevMessage(message),
    // title
    'color: #00C584; font-size: 1.3em; font-weight: bold;',
    // message
    'line-height: 1.5',
    // footer
    'color: #a6a095;',
  ];
}

// Assume warnings and errors never have the same message
let visitedMessages: Set<string>;
if (__DEV__) {
  resetVisitedMessages();
}

export function resetVisitedMessages(): void {
  visitedMessages = new Set();
}

export function warnWhen(condition: boolean, message: string): void {
  if (condition && !visitedMessages.has(message)) {
    visitedMessages.add(message);
    console.warn(...getFormattedMessage(message));
  }
}

export function errorWhen(condition: boolean, message: string): void {
  if (condition && !visitedMessages.has(message)) {
    visitedMessages.add(message);
    console.error(...getFormattedMessage(message));
  }
}

export function validateTargets(targets: Targets): void {
  const didPassFalsyValue = !targets;
  const didPassPlainObject =
    Object.prototype.toString.call(targets) === '[object Object]' &&
    !(targets as any).addEventListener;

  errorWhen(
    didPassFalsyValue,
    [
      'tippy() was passed',
      '`' + String(targets) + '`',
      'as its targets (first) argument. Valid types are: String, Element,',
      'Element[], or NodeList.',
    ].join(' ')
  );

  errorWhen(
    didPassPlainObject,
    [
      'tippy() was passed a plain object which is not supported as an argument',
      'for virtual positioning. Use props.getReferenceClientRect instead.',
    ].join(' ')
  );
}
