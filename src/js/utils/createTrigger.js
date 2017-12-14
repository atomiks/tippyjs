import { browser } from '../core/globals'

/**
 * Creates a trigger by adding the necessary event listeners to the reference element
 * @param {String} eventType - the custom event specified in the `trigger` setting
 * @param {Element} reference
 * @param {Object} handlers - the handlers for each event
 * @param {Object} options
 * @return {Array} - array of listener objects
 */
export default function createTrigger(eventType, reference, handlers, options) {
  const listeners = []

  if (eventType === 'manual') return listeners

  const on = (eventType, handler) => {
    reference.addEventListener(eventType, handler)
    listeners.push({ event: eventType, handler })
  }

  if (!options.target) {
    on(eventType, handlers.handleTrigger)

    if (browser.supportsTouch && options.touchHold) {
      on('touchstart', handlers.handleTrigger)
      on('touchend', handlers.handleMouseleave)
    }

    if (eventType === 'mouseenter') {
      on('mouseleave', handlers.handleMouseleave)
    }
    if (eventType === 'focus') {
      on('blur', handlers.handleBlur)
    }
  } else {
    if (eventType === 'mouseenter') {
      on('mouseover', handlers.handleDelegationShow)
      on('mouseout', handlers.handleDelegationHide)
    }
    if (eventType === 'focus') {
      on('focusin', handlers.handleDelegationShow)
      on('focusout', handlers.handleDelegationHide)
    }
  }

  return listeners
}
