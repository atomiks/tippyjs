import { arrayFrom } from './ponyfills'

/**
 * Determines if a value is a plain object
 * @param {any} value
 * @return {Boolean}
 */
export function isPlainObject(value) {
  return {}.toString.call(value) === '[object Object]'
}

/**
 * Safe .hasOwnProperty check, for prototype-less objects
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */
export function hasOwnProperty(obj, key) {
  return {}.hasOwnProperty.call(obj, key)
}

/**
 * Determines if a value is numeric
 * @param {any} value
 * @return {Boolean}
 */
export function isNumeric(value) {
  return !isNaN(value) && !isNaN(parseFloat(value))
}

/**
 * Returns an array of elements based on the value
 * @param {any} value
 * @return {Array}
 */
export function getArrayOfElements(value) {
  if (value instanceof Element || isPlainObject(value)) {
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
 * @param {any} value
 * @param {Number} index
 * @param {any} defaultValue
 */
export function getValue(value, index, defaultValue) {
  if (Array.isArray(value)) {
    const v = value[index]
    return v == null ? defaultValue : v
  }
  return value
}

/**
 * Focuses an element while preventing a scroll jump if it's not within the
 * viewport
 * @param {Element} el
 */
export function focus(el) {
  const x = window.scrollX || window.pageXOffset
  const y = window.scrollY || window.pageYOffset
  el.focus()
  scroll(x, y)
}

/**
 * Defers a function's execution until the call stack has cleared
 * @param {Function} fn
 */
export function defer(fn) {
  setTimeout(fn, 1)
}

/**
 * Debounce utility
 * @param {Function} fn
 * @param {Number} ms
 */
export function debounce(fn, ms) {
  let timeoutId
  return function() {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, arguments), ms)
  }
}
