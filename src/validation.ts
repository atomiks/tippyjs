import {Props, Targets, Plugin} from './types';
import {hasOwnProperty, includes} from './utils';
import {defaultProps, getExtendedProps} from './props';

export function createMemoryLeakWarning(method: string): string {
  const txt = method === 'destroy' ? 'n already-' : ' ';

  return `
    ${method}() was called on a${txt}destroyed instance. This is a no-op but
    indicates a potential memory leak.
  `;
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

/**
 * Helpful wrapper around `console.warn()`.
 * TODO: Should we use a cache so it only warns a single time and not spam the
 * console? (Need to consider hot reloading and invalidation though). Chrome
 * already batches warnings as well.
 */
export function warnWhen(condition: boolean, message: string): void {
  if (condition) {
    console.warn(...getFormattedMessage(message));
  }
}

/**
 * Helpful wrapper around thrown errors
 */
export function throwErrorWhen(condition: boolean, message: string): void {
  if (condition) {
    throw new Error(clean(message));
  }
}

/**
 * Validates props with the valid `defaultProps` object
 */
export function validateProps(
  partialProps: Partial<Props> = {},
  plugins: Plugin[] = [],
): void {
  Object.keys(partialProps).forEach((prop): void => {
    const value = partialProps[prop];

    const didSpecifyPlacementInPopperOptions =
      prop === 'popperOptions' && value && hasOwnProperty(value, 'placement');
    const didPassUnknownProp =
      !hasOwnProperty(getExtendedProps(defaultProps, plugins), prop) &&
      !includes(
        ['a11y', 'arrowType', 'showOnInit', 'size', 'target', 'touchHold'],
        prop,
      );

    warnWhen(
      prop === 'target',
      `The \`target\` prop was removed in v5 and replaced with the delegate()
      method in order to conserve bundle size.
      
      Read more: https//atomiks.github.io/tippyjs/addons#event-delegation`,
    );

    warnWhen(
      prop === 'a11y',
      `The \`a11y\` prop was removed in v5. Make sure the element you are giving
      a tippy to is natively focusable, such as <button> or <input>, not <div>
      or <span>.`,
    );

    warnWhen(
      prop === 'showOnInit',
      `The \`showOnInit\` prop was renamed to \`showOnCreate\` in v5.`,
    );

    warnWhen(
      prop === 'arrowType',
      `The \`arrowType\` prop was removed in v5 in favor of overloading the
      \`arrow\` prop.
  
      Before: {arrow: true, arrowType: "round"}
      After: {arrow: "round"}`,
    );

    warnWhen(
      prop === 'touchHold',
      `The \`touchHold\` prop was removed in v5 in favor of overloading the
      \`touch\` prop.
      
      Before: {touchHold: true}
      After: {touch: "hold"}`,
    );

    warnWhen(
      prop === 'size',
      `The \`size\` prop was removed in v5. Instead, use a theme that specifies
      CSS padding and font-size properties.`,
    );

    warnWhen(
      prop === 'theme' && value === 'google',
      `The included theme "google" was renamed to "material" in v5.`,
    );

    warnWhen(
      didSpecifyPlacementInPopperOptions,
      `Specifying placement in \`popperOptions\` is not supported. Use the
      base-level \`placement\` prop instead.
      
      Before: {popperOptions: {placement: "bottom"}}
      After: {placement: "bottom"}`,
    );

    warnWhen(
      didPassUnknownProp,
      `The \`${prop}\` prop is not a valid prop. You may have spelled it 
      incorrectly, or if it's a plugin, forgot to pass it in an array as a 3rd
      argument to \`tippy()\`.

      In v5, the following props were turned into plugins:

      * animateFill
      * followCursor
      * sticky
      
      All props: https://atomiks.github.io/tippyjs/all-props/
      Plugins: https://atomiks.github.io/tippyjs/plugins/`,
    );
  });
}

/**
 * Validates the `targets` value passed to `tippy()`
 */
export function validateTargets(targets: Targets): void {
  const didPassFalsyValue = !targets;
  const didPassPlainObject =
    Object.prototype.toString.call(targets) === '[object Object]' &&
    !(targets as any).addEventListener;

  throwErrorWhen(
    didPassFalsyValue,
    `tippy() was passed \`${targets}\` as its targets (first) argument.

    Valid types are: String, Element, Element[], or NodeList.`,
  );

  throwErrorWhen(
    didPassPlainObject,
    `tippy() was passed a plain object which is no longer supported as an
    argument.
    
    See https://atomiks.github.io/tippyjs/misc/#custom-position`,
  );
}
