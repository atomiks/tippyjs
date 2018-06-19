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
    onTrigger,
    onMouseLeave,
    onBlur,
    onDelegateShow,
    onDelegateHide
  } = handlers
  const listeners = []

  if (eventType === 'manual') return listeners

  const on = (eventType, handler) => {
    reference.addEventListener(eventType, handler)
    listeners.push({ event: eventType, handler })
  }

  if (!options.target) {
    on(eventType, onTrigger)

    if (browser.supportsTouch && options.touchHold) {
      on('touchstart', onTrigger)
      on('touchend', onMouseLeave)
    }
    if (eventType === 'mouseenter') {
      on('mouseleave', onMouseLeave)
    }
    if (eventType === 'focus') {
      on(isIE ? 'focusout' : 'blur', onBlur)
    }
  } else {
    if (browser.supportsTouch && options.touchHold) {
      on('touchstart', onDelegateShow)
      on('touchend', onDelegateHide)
    }
    if (eventType === 'mouseenter') {
      on('mouseover', onDelegateShow)
      on('mouseout', onDelegateHide)
    }
    if (eventType === 'focus') {
      on('focusin', onDelegateShow)
      on('focusout', onDelegateHide)
    }
    if (eventType === 'click') {
      on('click', onDelegateShow)
    }
  }

  return listeners
}
