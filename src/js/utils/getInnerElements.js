import { selectors } from '../core/globals'

/**
 * Returns inner elements of the popper element
 * @param {Element} popper
 * @return {Object}
 */
export default function getInnerElements(popper) {
  const select = s => popper.querySelector(s)
  return {
    tooltip: select(selectors.TOOLTIP),
    backdrop: select(selectors.BACKDROP),
    content: select(selectors.CONTENT),
    arrow: select(selectors.ARROW) || select(selectors.ROUND_ARROW)
  }
}
