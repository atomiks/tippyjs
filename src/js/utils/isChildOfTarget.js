import closest from './closest'

/**
 * Determines if the element is a child of an element that matches
 * the target CSS selector
 * @param {Element} relatedTarget
 * @param {String} target (selector string)
 * @return {Boolean}
 */
export default function isChildOfTarget(el, target) {
  return !!(el && target && closest(el, target))
}
