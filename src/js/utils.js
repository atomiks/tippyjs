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
 * Returns an array of elements based on the value
 * @param {any} value
 * @return {Array}
 */
export function getArrayOfElements(value) {
  if (isSingular(value)) {
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

/**
 * Prevents errors from being thrown while accessing nested modifier objects
 * in `popperOptions`
 * @param {Object} obj
 * @param {String} key
 * @return {Object|undefined}
 */
export function getModifier(obj, key) {
  return obj && obj.modifiers && obj.modifiers[key]
}

/**
 * Determines if an array or string includes a value
 * @param {Array|String} a
 * @param {any} b
 * @return {Boolean}
 */
export function includes(a, b) {
  return a.indexOf(b) > -1
}

/**
 * Determines if the value is singular-like
 * @param {any} value
 * @return {Boolean}
 */
export function isSingular(value) {
  return isPlainObject(value) || value instanceof Element
}

/**
 * Tricking bundlers, linters, and minifiers
 * @return {String}
 */
export function innerHTML() {
  return 'innerHTML'
}

/**
 * Evaluates a function if one, or returns the value
 * @param {any} value
 * @param {any[]} args
 * @return {Boolean}
 */
export function evaluateValue(value, args) {
  return typeof value === 'function' ? value.apply(null, args) : value
}

/**
 * Sets a popperInstance `flip` modifier's enabled state
 * @param {Object[]} modifiers
 * @param {any} value
 */
export function setFlipModifierEnabled(modifiers, value) {
  modifiers.filter(m => m.name === 'flip')[0].enabled = value
}
