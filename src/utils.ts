import { Props, ReferenceElement, Targets } from './types'
import { arrayFrom } from './ponyfills'
import { isUCBrowser } from './browser'
import { getDataAttributeOptions } from './reference'
import { POPPER_CLASS } from './constants'

/**
 * Determines if the value is a reference element
 */
export function isReferenceElement(value: any): value is ReferenceElement {
  return !!(value && value._tippy && !value.classList.contains(POPPER_CLASS))
}

/**
 * Safe .hasOwnProperty check, for prototype-less objects
 */
export function hasOwnProperty(obj: object, key: string): boolean {
  return {}.hasOwnProperty.call(obj, key)
}

/**
 * Returns an array of elements based on the value
 */
export function getArrayOfElements(value: Targets): Element[] {
  if (isRealElement(value)) {
    return [value]
  }

  if (value instanceof NodeList) {
    return arrayFrom(value)
  }

  if (Array.isArray(value)) {
    return value
  }

  try {
    return arrayFrom(document.querySelectorAll(value))
  } catch (e) {
    return []
  }
}

/**
 * Returns a value at a given index depending on if it's an array or number
 */
export function getValue(value: any, index: number, defaultValue: any): any {
  if (Array.isArray(value)) {
    const v = value[index]
    return v == null ? defaultValue : v
  }

  return value
}

/**
 * Prevents errors from being thrown while accessing nested modifier objects
 * in `popperOptions`
 */
export function getModifier(obj: any, key: string): any {
  return obj && obj.modifiers && obj.modifiers[key]
}

/**
 * Determines if an array or string includes a value
 */
export function includes(a: any[] | string, b: any): boolean {
  return a.indexOf(b) > -1
}

/**
 * Determines if the value is a real element
 */
export function isRealElement(value: any): value is Element {
  return value instanceof Element
}

/**
 * Firefox extensions don't allow setting .innerHTML directly, this will trick
 * it
 */
export function innerHTML(): 'innerHTML' {
  return 'innerHTML'
}

/**
 * Evaluates a function if one, or returns the value
 */
export function invokeWithArgsOrReturn(value: any, args: any[]): any {
  return typeof value === 'function' ? value.apply(null, args) : value
}

/**
 * Sets a popperInstance `flip` modifier's enabled state
 */
export function setFlipModifierEnabled(modifiers: any[], value: any): void {
  modifiers.filter((m): boolean => m.name === 'flip')[0].enabled = value
}

/**
 * Returns a new `div` element
 */
export function div(): HTMLDivElement {
  return document.createElement('div')
}

/**
 * Applies a transition duration to a list of elements
 */
export function setTransitionDuration(
  els: (HTMLDivElement | null)[],
  value: number,
): void {
  els.forEach(
    (el): void => {
      if (el) {
        el.style.transitionDuration = `${value}ms`
      }
    },
  )
}

/**
 * Sets the visibility state to elements so they can begin to transition
 */
export function setVisibilityState(
  els: (HTMLDivElement | null)[],
  state: 'visible' | 'hidden',
): void {
  els.forEach(
    (el): void => {
      if (el) {
        el.setAttribute('data-state', state)
      }
    },
  )
}

/**
 * Evaluates the props object by merging data attributes and
 * disabling conflicting options where necessary
 */
export function evaluateProps(
  reference: ReferenceElement,
  props: Props,
): Props {
  const out = {
    ...props,
    content: invokeWithArgsOrReturn(props.content, [reference]),
    ...(props.ignoreAttributes ? {} : getDataAttributeOptions(reference)),
  }

  if (out.arrow || isUCBrowser) {
    out.animateFill = false
  }

  return out
}

/**
 * Debounce utility. To avoid bloating bundle size, we're only passing 1
 * argument here, a more generic function would pass all arguments. Only
 * `onMouseMove` uses this which takes the event object for now.
 */
export function debounce<T>(
  fn: (arg: T) => void,
  ms: number,
): (arg: T) => void {
  // Avoid wrapping in `setTimeout` if ms is 0 anyway
  if (ms === 0) {
    return fn
  }

  let timeout: any

  return (arg): void => {
    clearTimeout(timeout)
    timeout = setTimeout((): void => {
      fn(arg)
    }, ms)
  }
}
