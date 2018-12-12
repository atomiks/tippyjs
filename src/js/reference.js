import Defaults from './defaults'
import { matches } from './ponyfills'
import { isNumeric } from './utils'

const keys = Object.keys(Defaults)

/**
 * Determines if an element can receive focus
 * @param {Element} el
 * @return {Boolean}
 */
export function canReceiveFocus(el) {
  return el instanceof Element
    ? matches.call(
        el,
        'a[href],area[href],button,details,input,textarea,select,iframe,[tabindex]',
      ) && !el.hasAttribute('disabled')
    : true
}

/**
 * Returns an object of optional props from data-tippy-* attributes
 * @param {Element} reference
 * @return {Object}
 */
export function getDataAttributeOptions(reference) {
  return keys.reduce((acc, key) => {
    const valueAsString = (
      reference.getAttribute(`data-tippy-${key}`) || ''
    ).trim()

    if (!valueAsString) {
      return acc
    }

    if (key === 'content') {
      acc[key] = valueAsString
    } else if (valueAsString === 'true') {
      acc[key] = true
    } else if (valueAsString === 'false') {
      acc[key] = false
    } else if (isNumeric(valueAsString)) {
      acc[key] = Number(valueAsString)
    } else if (valueAsString[0] === '[' || valueAsString[0] === '{') {
      acc[key] = JSON.parse(valueAsString)
    } else {
      acc[key] = valueAsString
    }

    return acc
  }, {})
}

/**
 * Polyfills the virtual reference (plain object) with Element.prototype props
 * Mutating because DOM elements are mutated, adds `_tippy` property
 * @param {Object} virtualReference
 * @return {Object}
 */
export function polyfillElementPrototypeProperties(virtualReference) {
  const polyfills = {
    isVirtual: true,
    attributes: virtualReference.attributes || {},
    setAttribute(key, value) {
      virtualReference.attributes[key] = value
    },
    getAttribute(key) {
      return virtualReference.attributes[key]
    },
    removeAttribute(key) {
      delete virtualReference.attributes[key]
    },
    hasAttribute(key) {
      return key in virtualReference.attributes
    },
    addEventListener() {},
    removeEventListener() {},
    classList: {
      classNames: {},
      add(key) {
        virtualReference.classList.classNames[key] = true
      },
      remove(key) {
        delete virtualReference.classList.classNames[key]
      },
      contains(key) {
        return key in virtualReference.classList.classNames
      },
    },
  }

  for (const key in polyfills) {
    virtualReference[key] = polyfills[key]
  }
}
