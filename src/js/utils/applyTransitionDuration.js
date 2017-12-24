import prefix from './prefix'

/**
 * Applies the transition duration to each element
 * @param {Element[]} els - Array of elements
 * @param {Number} duration
 */
export default function applyTransitionDuration(els, duration) {
  els.forEach(el => {
    if (!el) return
    el.style[prefix('transitionDuration')] = duration + 'ms'
  })
}
