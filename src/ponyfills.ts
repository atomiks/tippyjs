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
export function closest(element: Element, parentSelector: string): Element {
  return (
    elementProto.closest ||
    function(selector: string) {
      let el = this
      while (el) {
        if (matches.call(el, selector)) {
          return el
        }
        el = el.parentElement
      }
    }
  ).call(element, parentSelector)
}

/**
 * Works like Element.prototype.closest, but uses a callback instead
 */
export function closestCallback(element: Element, callback: Function): Element {
  while (element) {
    if (callback(element)) {
      return element
    }
    element = element.parentElement
  }
}
