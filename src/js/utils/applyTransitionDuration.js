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

    const isContent = matches.call(el, selectors.CONTENT)
    const _duration = isContent ? Math.round(duration/1.3) : duration

    el.style[prefix('transitionDuration')] = _duration + 'ms'
  })
}
