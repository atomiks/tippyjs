import { Browser } from './Browser'
import { Selectors } from './selectors'
import { hideAllPoppers, closest, matches, toArray } from './utils'

/**
 * Adds the needed global event listeners
 */
export default function bindEventListeners() {
  const onDocumentTouch = () => {
    if (Browser.isUsingTouch) {
      return
    }

    Browser.isUsingTouch = true

    if (Browser.isIOS) {
      document.body.classList.add('tippy-touch')
    }

    if (Browser.userInputDetectionEnabled && window.performance) {
      document.addEventListener('mousemove', onDocumentMouseMove)
    }

    Browser.onUserInputChange('touch')
  }

  const onDocumentMouseMove = (() => {
    let time

    return () => {
      const now = performance.now()

      // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
      if (now - time < 20) {
        Browser.isUsingTouch = false
        document.removeEventListener('mousemove', onDocumentMouseMove)
        if (!Browser.isIOS) {
          document.body.classList.remove('tippy-touch')
        }
        Browser.onUserInputChange('mouse')
      }

      time = now
    }
  })()

  const onDocumentClick = event => {
    // Simulated events dispatched on the document
    if (!(event.target instanceof Element)) {
      return hideAllPoppers()
    }

    const reference = closest(event.target, Selectors.REFERENCE)
    const popper = closest(event.target, Selectors.POPPER)

    if (popper && popper._tippy && popper._tippy.options.interactive) {
      return
    }

    if (reference && reference._tippy) {
      const { options } = reference._tippy
      const isMultiple = options.multiple
      const isClickTrigger = options.trigger.indexOf('click') > -1

      if (
        (!isMultiple && Browser.isUsingTouch) ||
        (!isMultiple && isClickTrigger)
      ) {
        return hideAllPoppers(reference._tippy)
      }

      if (options.hideOnClick !== true || isClickTrigger) {
        return
      }
    }

    hideAllPoppers()
  }

  const onWindowBlur = () => {
    const { activeElement: el } = document
    if (el && el.blur && matches.call(el, Selectors.REFERENCE)) {
      el.blur()
    }
  }

  const onWindowResize = () => {
    toArray(document.querySelectorAll(Selectors.POPPER)).forEach(popper => {
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

  if (
    !Browser.supportsTouch &&
    (navigator.maxTouchPoints || navigator.msMaxTouchPoints)
  ) {
    document.addEventListener('pointerdown', onDocumentTouch)
  }
}
