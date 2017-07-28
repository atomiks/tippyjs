import { Selectors } from './globals'

/**
* Prepares the callback functions for `show` and `hide` methods
* @param {Object} refData -  the element/popper reference data
* @param {Number} duration
* @param {Function} callback - callback function to fire once transitions complete
*/
export default function onTransitionEnd(refData, duration, callback) {
  // Make callback synchronous if duration is 0
  if (!duration) {
    return callback()
  }

  const tooltip = refData.popper.querySelector(Selectors.TOOLTIP)
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
  clearTimeout(refData._transitionendTimeout)
  refData._transitionendTimeout = setTimeout(() => {
    !transitionendFired && callback()
  }, duration)
}
