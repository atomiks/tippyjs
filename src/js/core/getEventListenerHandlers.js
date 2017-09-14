import { browser, selectors } from './globals'

import isVisible                        from '../utils/isVisible'
import closest                          from '../utils/closest'
import cursorIsOutsideInteractiveBorder from '../utils/cursorIsOutsideInteractiveBorder'

/**
* Returns relevant listener callbacks for each ref
* @param {Element} reference
* @param {Element} popper
* @param {Object} options
* @return {Object} - relevant listener handlers
*/
export default function getEventListenerHandlers(reference, popper, options) {
  const {
    position,
    delay,
    duration,
    interactive,
    interactiveBorder,
    distance,
    hideOnClick,
    trigger,
    touchHold,
    touchWait
  } = options

  let showDelay, hideDelay

  const clearTimeouts = () => {
    clearTimeout(showDelay)
    clearTimeout(hideDelay)
  }

  const _show = () => {
    clearTimeouts()

    // Not hidden. For clicking when it also has a `focus` event listener
    if (isVisible(popper)) return

    const _delay = Array.isArray(delay) ? delay[0] : delay

    if (delay) {
      showDelay = setTimeout(() => this.show(popper), _delay)
    } else {
      this.show(popper)
    }
  }

  const show = event =>
    this.callbacks.wait
      ? this.callbacks.wait.call(popper, _show, event)
      : _show()

  const hide = () => {
    clearTimeouts()

    const _delay = Array.isArray(delay) ? delay[1] : delay

    if (delay) {
      hideDelay = setTimeout(() => this.hide(popper), _delay)
    } else {
      this.hide(popper)
    }
  }

  const handleTrigger = event => {
    const mouseenterTouch = (
      event.type === 'mouseenter' &&
      browser.supportsTouch &&
      browser.usingTouch
    )

    if (mouseenterTouch && touchHold) return

    // Toggle show/hide when clicking click-triggered tooltips
    const isClick = event.type === 'click'
    const isNotPersistent = hideOnClick !== 'persistent'

    isClick && isVisible(popper) && isNotPersistent
      ? hide()
      : show(event)

    if (mouseenterTouch && browser.iOS && reference.click) {
      reference.click()
    }
  }

  const handleMouseleave = event => {

    // Don't fire 'mouseleave', use the 'touchend'
    if (
      event.type === 'mouseleave' &&
      browser.supportsTouch &&
      browser.usingTouch &&
      touchHold
    ) return

    if (interactive) {
      // Temporarily handle mousemove to check if the mouse left somewhere
      // other than its popper
      const handleMousemove = event => {
        const triggerHide = () => {
          document.body.removeEventListener('mouseleave', hide)
          document.removeEventListener('mousemove', handleMousemove)
          hide()
        }

        const closestTooltippedEl = closest(event.target, selectors.TOOLTIPPED_EL)

        const isOverPopper = closest(event.target, selectors.POPPER) === popper
        const isOverEl = closestTooltippedEl === reference
        const isClickTriggered = trigger.indexOf('click') !== -1
        const isOverOtherTooltippedEl = closestTooltippedEl && closestTooltippedEl !== reference

        if (isOverOtherTooltippedEl) {
          return triggerHide()
        }

        if (isOverPopper || isOverEl || isClickTriggered) return

        if (cursorIsOutsideInteractiveBorder(event, popper, options)) {
          triggerHide()
        }
      }

      document.body.addEventListener('mouseleave', hide)
      document.addEventListener('mousemove', handleMousemove)

      return
    }

    // If it's not interactive, just hide it
    hide()
  }

  const handleBlur = event => {
    // Ignore blur on touch devices, if there is no `relatedTarget`, hide
    // If the related target is a popper, ignore
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
