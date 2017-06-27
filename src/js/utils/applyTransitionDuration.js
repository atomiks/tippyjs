import { Selectors } from '../core/globals'
import prefix from './prefix'
import { matches } from './matches'

/**
* Applies the transition duration to each element
* @param {Element[]} els - Array of elements
* @param {Number} duration
*/
export default function applyTransitionDuration(els, duration) {
    let _duration

    els.forEach(el => {
        if (!el) return

        const isCircle = matches.call(el, Selectors.CIRCLE)
        const isContent = matches.call(el, Selectors.CONTENT)

        _duration = isCircle ? Math.round(_duration/1.1)
                             : isContent ? Math.round(duration/1.3)
                                         : duration

        el.style[prefix('transitionDuration')] = _duration + 'ms'
    })
}
