import { browser, selectors } from './globals'

import hideAllPoppers from '../utils/hideAllPoppers'
import closest from '../utils/closest'
import find from '../utils/find'
import matches from '../utils/matches'

/**
 * Adds the needed event listeners
 */
export default function bindEventListeners() {
  const touchHandler = () => {
    if (browser.usingTouch) return

    browser.usingTouch = true

    if (browser.iOS) {
      document.body.classList.add('tippy-touch')
    }

    if (browser.dynamicInputDetection && window.performance) {
      document.addEventListener('mousemove', mousemoveHandler)
    }

    browser.onUserInputChange('touch')
  }

  const mousemoveHandler = (() => {
    let time

    return () => {
      const now = performance.now()

      // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
      if (now - time < 20) {
        browser.usingTouch = false
        document.removeEventListener('mousemove', mousemoveHandler)
        if (!browser.iOS) {
          document.body.classList.remove('tippy-touch')
        }
        browser.onUserInputChange('mouse')
      }

      time = now
    }
  })()

  const clickHandler = event => {
    // Simulated events dispatched on the document
    if (!(event.target instanceof Element)) {
      return hideAllPoppers()
    }

    const reference = closest(event.target, selectors.REFERENCE)
    const popper = closest(event.target, selectors.POPPER)

    if (popper && popper._reference._tippy.options.interactive) return

    if (reference) {
      const { options } = reference._tippy

      // Hide all poppers except the one belonging to the element that was clicked IF
      // `multiple` is false AND they are a touch user, OR
      // `multiple` is false AND it's triggered by a click
      if (
        (!options.multiple && browser.usingTouch) ||
        (!options.multiple && options.trigger.indexOf('click') > -1)
      ) {
        return hideAllPoppers(reference._tippy)
      }

      if (options.hideOnClick !== true || options.trigger.indexOf('click') > -1) return
    }

    hideAllPoppers()
  }

  const blurHandler = event => {
    const { activeElement: el } = document
    if (el && el.blur && matches.call(el, selectors.REFERENCE)) {
      el.blur()
    }
  }

  document.addEventListener('click', clickHandler)
  document.addEventListener('touchstart', touchHandler)
  window.addEventListener('blur', blurHandler)

  if (!browser.supportsTouch && (navigator.maxTouchPoints || navigator.msMaxTouchPoints)) {
    document.addEventListener('pointerdown', touchHandler)
  }
}
