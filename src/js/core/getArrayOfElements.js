/**
* Returns an array of elements based on the selector input
* @param {String|Array|Element} selector
* @return {Elements[]}
*/
export default function getArrayOfElements(selector) {
  if (selector instanceof Element) {
    return [selector]
  }
  if (Object.prototype.toString.call(selector) === '[object Array]') {
    return selector;
  }

  return [].slice.call(document.querySelectorAll(selector))
}
