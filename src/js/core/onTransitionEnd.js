import getInnerElements from '../utils/getInnerElements'

/**
* Prepares the callback functions for `show` and `hide` methods
* @param {Tippy} tippy
* @param {Number} duration
* @param {Function} callback - callback function to fire once transition completes
*/
export default function onTransitionEnd(tippy, duration, callback) {
  // Make callback synchronous if duration is 0
  if (!duration) {
    return callback()
  }

  const { tooltip } = getInnerElements(tippy.popper)
  
  const toggleListeners = (action, handler) => {
    if (!handler) return
    tooltip[action + 'EventListener']('webkitTransitionEnd', handler)
    tooltip[action + 'EventListener']('transitionend', handler)
  }
  
  const listener = e => {
    if (e.target === tooltip) {
      toggleListeners('remove')
      callback()
    }
  }
  
  toggleListeners('remove', tippy._transitionendListener)
  toggleListeners('add', listener)
  
  tippy._transitionendListener = listener
}
