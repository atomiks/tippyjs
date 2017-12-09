import matches from './matches'

/**
 * Ponyfill to get the closest parent element
 * @param {Element} element - child of parent to be returned
 * @param {String} parentSelector - selector to match the parent if found
 * @return {Element}
 */
export default function closest(element, parentSelector) {
  const fn =
    Element.prototype.closest ||
    function(selector) {
      let el = this
      while (el) {
        if (matches.call(el, selector)) {
          return el
        }
        el = el.parentElement
      }
    }

  return fn.call(element, parentSelector)
}
