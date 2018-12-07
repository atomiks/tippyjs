import { isBrowser } from './browser'

const elementProto = isBrowser ? Element.prototype : {}

export const matches =
  elementProto.matches ||
  elementProto.matchesSelector ||
  elementProto.webkitMatchesSelector ||
  elementProto.mozMatchesSelector ||
  elementProto.msMatchesSelector

/**
 * Ponyfill for Array.from - converts iterable values to an array
 * @param {Array-like} value
 * @return {Array}
 */
export function arrayFrom(value) {
  return [].slice.call(value)
}

/**
 * Ponyfill for Element.prototype.closest
 * @param {Element} element
 * @param {String} parentSelector
 * @return {Element}
 */
export function closest(element, parentSelector) {
  return (
    elementProto.closest ||
    function(selector) {
      let el = this
      while (el) {
        if (matches.call(el, selector)) return el
        el = el.parentElement
      }
    }
  ).call(element, parentSelector)
}

/**
 * Works like Element.prototype.closest, but uses a callback instead
 * @param {Element} element
 * @param {Function} callback
 * @return {Element}
 */
export function closestCallback(element, callback) {
  while (element) {
    if (callback(element)) return element
    element = element.parentElement
  }
}
