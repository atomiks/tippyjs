import { Selectors } from './globals'

/**
* Prepares the callback functions for `show` and `hide` methods
* @param {Object} ref -  the element/popper reference
* @param {Number} duration
* @param {Function} callback - callback function to fire once transitions complete
*/
export default function onTransitionEnd(ref, duration, callback) {

    // Make callback synchronous if duration is 0
    if ( ! duration) {
        return callback()
    }

    const tooltip = ref.popper.querySelector(Selectors.TOOLTIP)
    let transitionendFired = false

    const listenerCallback = e => {
        if (e.target !== tooltip) return

        transitionendFired = true

        tooltip.removeEventListener('webkitTransitionEnd', listenerCallback)
        tooltip.removeEventListener('transitionend', listenerCallback)

        callback()
    }

    // Wait for transitions to complete
    tooltip.addEventListener('webkitTransitionEnd', listenerCallback)
    tooltip.addEventListener('transitionend', listenerCallback)

    // transitionend listener sometimes may not fire
    clearTimeout(ref._transitionendTimeout)
    ref._transitionendTimeout = setTimeout(() => {
        !transitionendFired && callback()
    }, duration)
}
