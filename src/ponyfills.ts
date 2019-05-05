import { isBrowser } from './browser'

const elementProto: Record<string, any> = isBrowser ? Element.prototype : {}

export const matches =
  elementProto.matches ||
  elementProto.matchesSelector ||
  elementProto.webkitMatchesSelector ||
  elementProto.mozMatchesSelector ||
  elementProto.msMatchesSelector

/**
 * Ponyfill for Array.from - converts iterable values to an array
 */
export function arrayFrom(value: ArrayLike<any>): any[] {
  return [].slice.call(value)
}

/**
 * Ponyfill for Element.prototype.closest
 */
export function closest(element: Element, selector: string): Element | null {
  return closestCallback(element, (el: Element) => matches.call(el, selector))
}

/**
 * Works like Element.prototype.closest, but uses a callback instead
 */
export function closestCallback(
  element: Element | null,
  callback: Function,
): Element | null {
  while (element) {
    if (callback(element)) {
      return element
    }

    element = element.parentElement
  }

  return null
}
