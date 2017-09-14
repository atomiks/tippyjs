import { selectors } from '../core/globals'

/**
* Returns inner elements of the popper element
* @param {Element} popper
* @return {Object}
*/
export default function getInnerElements(popper) {
  return {
    tooltip: popper.querySelector(selectors.TOOLTIP),
    circle: popper.querySelector(selectors.CIRCLE),
    content: popper.querySelector(selectors.CONTENT)
  }
}
