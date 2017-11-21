import { browser, selectors } from './globals'

import isVisible from '../utils/isVisible'
import closest from '../utils/closest'
import cursorIsOutsideInteractiveBorder from '../utils/cursorIsOutsideInteractiveBorder'

/**
* Returns relevant listeners for each Tippy instance
* @param {Tippy} tippy
* @param {Object} options
* @return {Object} of listeners
*/
export default function getEventListeners(tippy, options) {
  const {
    popper,
    reference,
    options: {
      delay,
      duration,
      interactive,
      interactiveBorder,
      hideOnClick,
      trigger,
      touchHold
    }
  } = tippy

  let showDelay, hideDelay

  const clearTimeouts = () => {
    clearTimeout(showDelay)
    clearTimeout(hideDelay)
  }

  const _show = () => {
    clearTimeouts()

    if (isVisible(popper)) return

    const _delay = Array.isArray(delay) ? delay[0] : delay

    if (delay) {
      showDelay = setTimeout(() => tippy.show(), _delay)
    } else {
      tippy.show()
    }
  }

  const show = event => {
    tippy.options.wait
      ? tippy.options.wait.call(popper, _show, event)
      : _show()
  }

  const hide = () => {
    clearTimeouts()
    
    if (!isVisible(popper)) return

    const _delay = Array.isArray(delay) ? delay[1] : delay

    if (delay) {
      hideDelay = setTimeout(() => {
        if (!isVisible(popper)) return
        tippy.hide()
      }, _delay)
    } else {
      tippy.hide()
    }
  }

  const handleTrigger = event => {
    const shouldStopEvent = (
      browser.supportsTouch &&
      browser.usingTouch &&
      (
        event.type === 'mouseenter' ||
        event.type === 'focus'
      )
    )

    if (shouldStopEvent && touchHold) return
    
    tippy._lastTriggerEvent = event.type
    
    // Toggle show/hide when clicking click-triggered tooltips
    const isClick = event.type === 'click'
    const isNotPersistent = hideOnClick !== 'persistent'

    isClick && isVisible(popper) && isNotPersistent
      ? hide()
      : show(event)

    // iOS prevents click events from firing
    if (shouldStopEvent && browser.iOS && reference.click) {
      reference.click()
    }
  }

  const handleMouseleave = event => {
    if (
      event.type === 'mouseleave' &&
      browser.supportsTouch &&
      browser.usingTouch &&
      touchHold
    ) return

    if (interactive) {
      // Temporarily handle mousemove to check if the mouse left somewhere other than the popper
      const handleMousemove = event => {
        const referenceCursorIsOver = closest(event.target, selectors.REFERENCE)
        const cursorIsOverPopper = closest(event.target, selectors.POPPER) === popper
        const cursorIsOverReference = referenceCursorIsOver === reference

        if (cursorIsOverPopper || cursorIsOverReference) return

        if (cursorIsOutsideInteractiveBorder(event, popper, options)) {
          document.body.removeEventListener('mouseleave', hide)
          document.removeEventListener('mousemove', handleMousemove)
          hide()
        }
      }
      document.body.addEventListener('mouseleave', hide)
      document.addEventListener('mousemove', handleMousemove)
      return
    }

    hide()
  }

  const handleBlur = event => {
    if (!event.relatedTarget || browser.usingTouch) return
    if (closest(event.relatedTarget, selectors.POPPER)) return
    hide()
  }

  return {
    handleTrigger,
    handleMouseleave,
    handleBlur
  }
}
