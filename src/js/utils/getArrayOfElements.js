import isObjectLiteral from './isObjectLiteral'

/**
 * Returns an array of elements based on the selector input
 * @param {String|Element|Element[]|NodeList|Object} selector
 * @return {Element[]}
 */
export default function getArrayOfElements(selector) {
  if (selector instanceof Element || isObjectLiteral(selector)) {
    return [selector]
  }

  if (selector instanceof NodeList) {
    return [].slice.call(selector)
  }

  if (Array.isArray(selector)) {
    return selector
  }

  try {
    return [].slice.call(document.querySelectorAll(selector))
  } catch (_) {
    return []
  }
}
