import prefix from './prefix'

/**
* Applies the transition duration to each element
* @param {Array} els - HTML elements
* @param {Number} duration
*/
export default function applyTransitionDuration(els, duration) {
    let _duration
    els.forEach(el => {
        if (!el) return

        _duration = duration

        if (el.hasAttribute('x-circle')) {
            _duration = Math.round(duration/1.1)
        }

        el.style[prefix('transitionDuration')] = _duration + 'ms'
    })
}
