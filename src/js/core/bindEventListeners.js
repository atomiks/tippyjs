import { browser, selectors } from './globals'

import hideAllPoppers from '../utils/hideAllPoppers'
import closest from '../utils/closest'
import matches from '../utils/matches'
import toArray from '../utils/toArray'

/**
 * Adds the needed event listeners
 */
export default function bindEventListeners() {
  const onDocumentTouch = () => {
    if (browser.usingTouch) return

    browser.usingTouch = true

    if (browser.iOS) {
      document.body.classList.add('tippy-touch')
    }

    if (browser.dynamicInputDetection && window.performance) {
      document.addEventListener('mousemove', onDocumentMouseMove)
    }

    browser.onUserInputChange('touch')
  }

  const onDocumentMouseMove = (() => {
    let time

    return () => {
      const now = performance.now()

      // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
      if (now - time < 20) {
        browser.usingTouch = false
        document.removeEventListener('mousemove', onDocumentMouseMove)
        if (!browser.iOS) {
          document.body.classList.remove('tippy-touch')
        }
        browser.onUserInputChange('mouse')
      }

      time = now
    }
  })()

  const onDocumentClick = event => {
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

  const onWindowBlur = () => {
    const { activeElement: el } = document
    if (el && el.blur && matches.call(el, selectors.REFERENCE)) {
      el.blur()
    }
  }

  const onWindowResize = () => {
    toArray(document.querySelectorAll(selectors.POPPER)).forEach(popper => {
      const tippyInstance = popper._tippy
      if (!tippyInstance.options.livePlacement) {
        tippyInstance.popperInstance.scheduleUpdate()
      }
    })
  }

  document.addEventListener('click', onDocumentClick)
  document.addEventListener('touchstart', onDocumentTouch)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('resize', onWindowResize)

  if (!browser.supportsTouch && (navigator.maxTouchPoints || navigator.msMaxTouchPoints)) {
    document.addEventListener('pointerdown', onDocumentTouch)
  }
}
