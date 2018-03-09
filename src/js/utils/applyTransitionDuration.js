import prefix from './prefix'

/**
 * Sets the transition property to each element
 * @param {Element[]} els - Array of elements
 * @param {String} value
 */
export default function applyTransitionDuration(els, value) {
  els.filter(Boolean).forEach(el => {
    el.style[prefix('transitionDuration')] = `${value}ms`
  })
}
