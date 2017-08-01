/**
* Returns an array of elements based on the selector input
* @param {String|Element|Element[]} selector
* @return {Element[]}
*/
export default function getArrayOfElements(selector) {
  if (selector instanceof Element) {
    return [selector]
  }

  if (Array.isArray(selector)) {
    return selector
  }

  return [].slice.call(document.querySelectorAll(selector))
}
