import { browser, selectors, store } from './globals'

import hideAllPoppers from './hideAllPoppers'
import closest from '../utils/closest'
import find    from '../utils/find'
import matches from '../utils/matches'

/**
* Adds the needed event listeners
*/
export default function bindEventListeners() {
  const touchHandler = () => {
    browser.usingTouch = true

    if (browser.iOS) {
      document.body.classList.add('tippy-touch')
    }

    if (browser.dynamicInputDetection && window.performance) {
      document.addEventListener('mousemove', mousemoveHandler)
    }
  }

  const mousemoveHandler = (() => {
    let time

    return () => {
      const now = performance.now()

      // Chrome 60+ is 1 mousemove per rAF, use 20ms time difference
      if (now - time < 20) {
        browser.usingTouch = false
        document.removeEventListener('mousemove', mousemoveHandler)
        if (!browser.iOS) {
          document.body.classList.remove('tippy-touch')
        }
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

    if (popper) {
      const tippy = find(store, tippy => tippy.popper === popper)
      if (tippy.options.interactive) return
    }

    if (reference) {
      const tippy = find(store, tippy => tippy.reference === reference)

      // Hide all poppers except the one belonging to the element that was clicked IF
      // `multiple` is false AND they are a touch user, OR
      // `multiple` is false AND it's triggered by a click
      if (
        (!tippy.options.multiple && browser.usingTouch) ||
        (!tippy.options.multiple && tippy.options.trigger.indexOf('click') > -1)
      ) {
        return hideAllPoppers(tippy)
      }

      // If hideOnClick is not strictly true or triggered by a click don't hide poppers
      if (tippy.options.hideOnClick !== true || tippy.options.trigger.indexOf('click') > -1) return
    }

    // Don't needlessly run loop if no poppers are on the document
    if (!document.querySelector(selectors.POPPER)) return

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
