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

    const reference = closest(event.target, selectors.TOOLTIPPED_EL)
    const popper = closest(event.target, selectors.POPPER)

    if (popper) {
      const data = find(store, ref => ref.popper === popper)
      if (data.options.interactive) return
    }

    if (reference) {
      const data = find(store, data => data.reference === reference)
      const {
        options: {
          hideOnClick,
          multiple,
          trigger
        }
      } = data

      // Hide all poppers except the one belonging to the element that was clicked IF
      // `multiple` is false AND they are a touch user, OR
      // `multiple` is false AND it's triggered by a click
      if ((!multiple && browser.usingTouch) || (!multiple && trigger.indexOf('click') !== -1)) {
        return hideAllPoppers(data)
      }

      // If hideOnClick is not strictly true or triggered by a click don't hide poppers
      if (hideOnClick !== true || trigger.indexOf('click') !== -1) return
    }

    // Don't trigger a hide for tippy controllers, and don't needlessly run loop
    if (closest(event.target, selectors.CONTROLLER) || !document.querySelector(selectors.POPPER)) return

    hideAllPoppers()
  }

  const blurHandler = event => {
    const { activeElement: el } = document
    if (el && el.blur && matches.call(el, selectors.TOOLTIPPED_EL)) {
      el.blur()
    }
  }

  // Hook events
  document.addEventListener('click', clickHandler)
  document.addEventListener('touchstart', touchHandler)
  window.addEventListener('blur', blurHandler)

  if (!browser.supportsTouch && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) {
    document.addEventListener('pointerdown', touchHandler)
  }
}
