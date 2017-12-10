import { browser } from '../core/globals'

/**
 * Creates a trigger by adding the necessary event listeners to the reference element
 * @param {String} eventType - the custom event specified in the `trigger` setting
 * @param {Element} reference
 * @param {Object} handlers - the handlers for each event
 * @param {Boolean} touchHold
 * @return {Array} - array of listener objects
 */
export default function createTrigger(eventType, reference, handlers, touchHold) {
  const listeners = []

  if (eventType === 'manual') return listeners

  // Show
  reference.addEventListener(eventType, handlers.handleTrigger)
  listeners.push({
    event: eventType,
    handler: handlers.handleTrigger,
  })

  // Hide
  if (eventType === 'mouseenter') {
    if (browser.supportsTouch && touchHold) {
      reference.addEventListener('touchstart', handlers.handleTrigger)
      listeners.push({
        event: 'touchstart',
        handler: handlers.handleTrigger,
      })
      reference.addEventListener('touchend', handlers.handleMouseleave)
      listeners.push({
        event: 'touchend',
        handler: handlers.handleMouseleave,
      })
    }

    reference.addEventListener('mouseleave', handlers.handleMouseleave)
    listeners.push({
      event: 'mouseleave',
      handler: handlers.handleMouseleave,
    })
  }

  if (eventType === 'focus') {
    reference.addEventListener('blur', handlers.handleBlur)
    listeners.push({
      event: 'blur',
      handler: handlers.handleBlur,
    })
  }

  return listeners
}
