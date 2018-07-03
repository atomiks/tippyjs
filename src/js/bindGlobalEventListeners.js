import { Browser } from './Browser'
import { Selectors } from './selectors'
import { hideAllPoppers, closest, closestCallback, toArray } from './utils'

export { Browser }

export const onDocumentTouch = () => {
  if (Browser.isUsingTouch) {
    return
  }

  Browser.isUsingTouch = true

  if (Browser.isIOS) {
    document.body.classList.add('tippy-iOS')
  }

  if (Browser.userInputDetectionEnabled && window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove)
  }

  Browser.onUserInputChange('touch')
}

let lastMouseMovetime = 0
export const onDocumentMouseMove = () => {
  const now = performance.now()

  // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
  if (now - lastMouseMovetime < 20) {
    Browser.isUsingTouch = false
    document.removeEventListener('mousemove', onDocumentMouseMove)
    if (!Browser.isIOS) {
      document.body.classList.remove('tippy-iOS')
    }
    Browser.onUserInputChange('mouse')
  }

  lastMouseMovetime = now
}

export const onDocumentClick = event => {
  // Simulated events dispatched on the document
  if (!(event.target instanceof Element)) {
    return hideAllPoppers()
  }

  const reference = closestCallback(event.target, node => node._tippy)
  const popper = closest(event.target, Selectors.POPPER)

  // Clicked on interactive popper
  if (popper && popper._tippy && popper._tippy.props.interactive) {
    return
  }

  // Clicked on reference
  if (reference && reference._tippy) {
    const tip = reference._tippy
    const isClickTrigger = tip.props.trigger.indexOf('click') > -1

    if (Browser.isUsingTouch || isClickTrigger) {
      return hideAllPoppers(tip)
    }

    if (tip.props.hideOnClick !== true || isClickTrigger) {
      return
    }

    tip.clearDelayTimeouts()
  }

  hideAllPoppers()
}

export const onWindowBlur = () => {
  const { activeElement: el } = document
  if (el && el.blur && el._tippy) {
    el.blur()
  }
}

export const onWindowResize = () => {
  toArray(document.querySelectorAll(Selectors.POPPER)).forEach(popper => {
    const tippyInstance = popper._tippy
    if (!tippyInstance.props.livePlacement) {
      tippyInstance.popperInstance.scheduleUpdate()
    }
  })
}

/**
 * Adds the needed global event listeners
 */
export default function bindEventListeners() {
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
