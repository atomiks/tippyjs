import { Browser } from './globals'

/**
* Creates a trigger
* @param {Object} event - the custom event specified in the `trigger` setting
* @param {Element} el - tooltipped element
* @param {Object} handlers - the handlers for each listener
* @param {Boolean} touchHold
* @return {Array} - array of listener objects
*/
export default function createTrigger(event, el, handlers, touchHold) {
  const listeners = []

  if (event === 'manual') return listeners

  // Enter
  el.addEventListener(event, handlers.handleTrigger)
  listeners.push({
    event,
    handler: handlers.handleTrigger
  })

  // Leave
  if (event === 'mouseenter') {
    if (Browser.SUPPORTS_TOUCH && touchHold) {
      el.addEventListener('touchstart', handlers.handleTrigger)
      listeners.push({
        event: 'touchstart',
        handler: handlers.handleTrigger
      })
      el.addEventListener('touchend', handlers.handleMouseleave)
      listeners.push({
        event: 'touchend',
        handler: handlers.handleMouseleave
      })
    }

    el.addEventListener('mouseleave', handlers.handleMouseleave)
    listeners.push({
      event: 'mouseleave',
      handler: handlers.handleMouseleave
    })
  }

  if (event === 'focus') {
    el.addEventListener('blur', handlers.handleBlur)
    listeners.push({
      event: 'blur',
      handler: handlers.handleBlur
    })
  }

  return listeners
}
