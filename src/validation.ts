import { Props, Targets, Instance } from './types'
import { hasOwnProperty, includes } from './utils'
import { defaultProps } from './props'

export const CONTENT_WARNING = `
  tippy() was passed an Element as the \`content\` prop, but more than one tippy
  instance was created by this invocation. This means the content element will 
  only be appended to the last tippy instance.

  Instead, pass the .innerHTML of the element, or use a function that returns a
  cloned version of the element instead.

  1) content: () => element.cloneNode(true)
  2) content: element.innerHTML
`

export const TARGET_WARNING = `
  The target prop was removed in v5 and replaced with the delegate() method in
  order to conserve bundle size.
  
  Read more: https//atomiks.github.io/tippyjs/addons#event-delegation
`

export const A11Y_WARNING = `
  The a11y prop was removed in v5. Make sure the element you are giving a tippy
  to is natively focusable, such as <button> or <input>, not <div> or <span>.
`

export const SHOW_ON_INIT_WARNING = `
  The showOnInit prop was renamed to showOnCreate in v5.
`

export const ARROW_TYPE_WARNING = `
  The arrowType prop was removed in v5 in favor of overloading the arrow prop.

  Before: {arrow: true, arrowType: "round"}
  After: {arrow: "round"}
`

export const TOUCH_HOLD_WARNING = `
  The touchHold prop was removed in v5 in favor of overloading the touch prop.

  Before: {touchHold: true}
  After: {touch: "hold"}
`

export const SIZE_WARNING = `
  The size prop was removed in v5. Instead, use a theme that specifies CSS
  padding and font-size properties.
`

export const GOOGLE_THEME_WARNING = `
  The included theme "google" was renamed to "material" in v5.
`

export const PLACEMENT_WARNING = `
  Specifying placement in popperOptions is not supported. Use the base-level
  placement prop instead.

  Before: {popperOptions: {placement: "bottom"}}
  After: {placement: "bottom"}
`

export const VIRTUAL_REFERENCE_OBJECT_WARNING = `
  tippy() was passed a plain object which is no longer supported as a method
  of virtual positioning. Instead, pass a placeholder element like:

  tippy(document.createElement("div"))

  You can override its getBoundingClientRect() method, just like a regular plain
  object.
`

export const FOLLOW_CURSOR_WARNING = `
  The followCursor prop was specified, but the instance has not been configured
  with followCursor functionality.

  In v5, followCursor was moved to a separate piece of code in order to conserve
  bundle size.

  Read more: https://atomiks.github.io/tippyjs/extra-props/
`

export const ARRAY_MISTAKE_ERROR = `
  First argument to createSingleton() must be an *array* of tippy instances. The
  passed value was a *single* tippy instance.
`

export const EXISTING_SINGLETON_ERROR = `
  The passed tippy instance(s) are already part of an existing singleton
  instance. Make sure you destroy the previous singleton before calling
  createSingleton() again.
`

export const MISSING_TARGET_WARNING = `
  You must specify a target prop indicating the CSS selector string
  matching the target elements that should receive a tippy.
`

export function createInvalidCreateSingletonArgumentError(arg: string): string {
  return `
  The first argument passed to createSingleton() must be an array of tippy
  instances.

  The passed value was: ${arg}
  `
}

export function createInvalidTargetsArgumentError(targets: any): string {
  return `
    tippy() was passed \`${targets}\` as its targets (first) argument.

    Valid types are: String, Element, Element[], or NodeList.
  `
}

export function createUnknownPropWarning(prop: string): string {
  return `
    The ${prop} prop is not a valid prop. You may have spelled it incorrectly.

    All props: https://atomiks.github.io/tippyjs/all-props/
  `
}

export function createCannotUpdateWarning(prop: string): string {
  return `
    The ${prop} prop cannot be updated via setProps(). The instance must be 
    destroyed and re-created with it specified in the optionalProps object.
  `
}

export function createMemoryLeakWarning(method: string): string {
  const txt = method === 'destroy' ? 'n already-' : ' '

  return `
    ${method}() was called on a${txt}destroyed instance. This is a no-op but
    indicates a potential memory leak.
  `
}

function clean(value: string): string {
  const spacesAndTabs = /[ \t]{2,}/g
  const lineStartWithSpaces = /^[ \t]*/gm

  return value
    .replace(spacesAndTabs, ' ')
    .replace(lineStartWithSpaces, '')
    .trim()
}

function getDevMessage(message: string): string {
  return clean(`
  %ctippy.js

  %c${clean(message)}

  %c👷‍ This is a development-only message. It will be removed in production.
  `)
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
  ]
}

/**
 * Helpful wrapper around `console.warn()`.
 * TODO: Should we use a cache so it only warns a single time and not spam the
 * console? (Need to consider hot reloading and invalidation though). Chrome
 * already batches warnings as well.
 */
export function warnWhen(condition: boolean, message: string): void {
  if (condition) {
    console.warn(...getFormattedMessage(message))
  }
}

/**
 * Helpful wrapper around thrown errors
 */
export function throwErrorWhen(condition: boolean, message: string): void {
  if (condition) {
    throw new Error(message)
  }
}

/**
 * Validates props with the valid `defaultProps` object
 */
export function validateProps(partialProps: Partial<Props> = {}): void {
  Object.keys(partialProps).forEach((prop): void => {
    const value = (partialProps as any)[prop]

    const didSpecifyPlacementInPopperOptions =
      prop === 'popperOptions' && value && hasOwnProperty(value, 'placement')
    const didPassUnknownProp =
      !hasOwnProperty(defaultProps, prop) &&
      !includes(
        [
          'a11y',
          'arrowType',
          'followCursor',
          'showOnInit',
          'size',
          'target',
          'touchHold',
        ],
        prop,
      )

    warnWhen(prop === 'target', TARGET_WARNING)
    warnWhen(prop === 'a11y', A11Y_WARNING)
    warnWhen(prop === 'showOnInit', SHOW_ON_INIT_WARNING)
    warnWhen(prop === 'arrowType', ARROW_TYPE_WARNING)
    warnWhen(prop === 'touchHold', TOUCH_HOLD_WARNING)
    warnWhen(prop === 'size', SIZE_WARNING)
    warnWhen(prop === 'theme' && value === 'google', GOOGLE_THEME_WARNING)
    warnWhen(didSpecifyPlacementInPopperOptions, PLACEMENT_WARNING)
    warnWhen(didPassUnknownProp, createUnknownPropWarning(prop))
  })
}

/**
 * Validates the `targets` value passed to `tippy()`
 */
export function validateTargets(targets: Targets): void {
  const didPassFalsyValue = !targets
  const didPassPlainObject =
    Object.prototype.toString.call(targets) === '[object Object]' &&
    !(targets as any).addEventListener

  throwErrorWhen(didPassFalsyValue, createInvalidTargetsArgumentError(targets))
  throwErrorWhen(didPassPlainObject, VIRTUAL_REFERENCE_OBJECT_WARNING)
}

/**
 * Ensures the instance has been configured with the extra prop's functionality
 * if the user is specifying it as a prop
 */
export function validateExtraPropsFunctionality(
  instance: Instance,
  partialProps: Partial<Props> = {},
): void {
  const extraProps = ['followCursor']

  extraProps.forEach((prop): void => {
    if (hasOwnProperty(partialProps, prop) && !instance.__extraProps[prop]) {
      warnWhen(prop === 'followCursor', FOLLOW_CURSOR_WARNING)
    }
  })
}
