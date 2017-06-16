import prefix from './prefix'

/**
* Applies the transition duration to each element
* @param {Array} els - HTML elements
* @param {Number} duration
*/
export default function applyTransitionDuration(els, duration) {
    let mutableDuration = duration

    els.forEach(el => {
        if (!el) return

        mutableDuration = duration

        // Circle fill should be a bit quicker
        if (el.hasAttribute('x-circle')) {
            mutableDuration = Math.round(mutableDuration/1.4)
        }

        el.style[prefix('transitionDuration')] = mutableDuration + 'ms'
    })
}
