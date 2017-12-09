import { selectors } from '../core/globals'

import prefix from './prefix'
import matches from './matches'

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
