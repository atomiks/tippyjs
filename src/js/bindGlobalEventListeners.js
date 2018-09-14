import { Selectors } from './selectors'
import {
  isBrowser,
  hideAllPoppers,
  closest,
  closestCallback,
  toArray
} from './utils'

const nav = isBrowser ? navigator : {}
const win = isBrowser ? window : {}
export let isIE = /MSIE |Trident\//.test(nav.userAgent)
export let isIOS = /iPhone|iPad|iPod/.test(nav.platform) && !win.MSStream
export let supportsTouch = 'ontouchstart' in win
export let isUsingTouch = false

export const onDocumentTouch = () => {
  if (isUsingTouch) {
    return
  }

  isUsingTouch = true

  if (isIOS) {
    document.body.classList.add('tippy-iOS')
  }

  if (window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove)
  }
}

let lastMouseMoveTime = 0
export const onDocumentMouseMove = () => {
  const now = performance.now()

  // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
  if (now - lastMouseMoveTime < 20) {
    isUsingTouch = false
    document.removeEventListener('mousemove', onDocumentMouseMove)
    if (!isIOS) {
      document.body.classList.remove('tippy-iOS')
    }
  }

  lastMouseMoveTime = now
}

export const onDocumentClick = ({ target }) => {
  // Simulated events dispatched on the document
  if (!(target instanceof Element)) {
    return hideAllPoppers()
  }

  // Clicked on an interactive popper
  const popper = closest(target, Selectors.POPPER)
  if (popper && popper._tippy && popper._tippy.props.interactive) {
    return
  }

  // Clicked on a reference
  const reference = closestCallback(
    target,
    el => el._tippy && el._tippy.reference === el
  )
  if (reference) {
    const tip = reference._tippy
    const isClickTrigger = tip.props.trigger.indexOf('click') > -1

    if (isUsingTouch || isClickTrigger) {
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
  const { activeElement } = document
  if (activeElement && activeElement.blur && activeElement._tippy) {
    activeElement.blur()
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
export default function bindEventListeners(useCapture) {
  document.addEventListener('click', onDocumentClick, useCapture)
  document.addEventListener('touchstart', onDocumentTouch)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('resize', onWindowResize)

  if (
    !supportsTouch &&
    (navigator.maxTouchPoints || navigator.msMaxTouchPoints)
  ) {
    document.addEventListener('pointerdown', onDocumentTouch)
  }
}
