import { browser, isIE } from '../core/globals'

/**
 * Creates a trigger by adding the necessary event listeners to the reference element
 * @param {String} eventType - the custom event specified in the `trigger` setting
 * @param {Element} reference
 * @param {Object} handlers - the handlers for each event
 * @param {Object} options
 * @return {Array} - array of listener objects
 */
export default function createTrigger(eventType, reference, handlers, options) {
  const {
    handleTrigger,
    handleMouseLeave,
    handleBlur,
    handleDelegateShow,
    handleDelegateHide
  } = handlers
  const listeners = []

  if (eventType === 'manual') return listeners

  const on = (eventType, handler) => {
    reference.addEventListener(eventType, handler)
    listeners.push({ event: eventType, handler })
  }

  if (!options.target) {
    on(eventType, handleTrigger)

    if (browser.supportsTouch && options.touchHold) {
      on('touchstart', handleTrigger)
      on('touchend', handleMouseLeave)
    }
    if (eventType === 'mouseenter') {
      on('mouseleave', handleMouseLeave)
    }
    if (eventType === 'focus') {
      on(isIE ? 'focusout' : 'blur', handleBlur)
    }
  } else {
    if (browser.supportsTouch && options.touchHold) {
      on('touchstart', handleDelegateShow)
      on('touchend', handleDelegateHide)
    }
    if (eventType === 'mouseenter') {
      on('mouseover', handleDelegateShow)
      on('mouseout', handleDelegateHide)
    }
    if (eventType === 'focus') {
      on('focusin', handleDelegateShow)
      on('focusout', handleDelegateHide)
    }
    if (eventType === 'click') {
      on('click', handleDelegateShow)
    }
  }

  return listeners
}
