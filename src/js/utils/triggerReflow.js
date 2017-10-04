import prefix from '../utils/prefix'

/**
* Triggers a document repaint or reflow for CSS transition
* @param {Element} tooltip
* @param {Element} circle
*/
export default function triggerReflow(tooltip, circle) {
  // Safari needs the specific 'transform' property to be accessed
  circle
    ? window.getComputedStyle(circle)[prefix('transform')]
    : window.getComputedStyle(tooltip).opacity
}
