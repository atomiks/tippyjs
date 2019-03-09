import { isIOS } from './browser'
import Selectors from './selectors'
import { hideAll } from './popper'
import { closest, closestCallback } from './ponyfills'
import { includes } from './utils'
import { PASSIVE } from './constants'
import { ReferenceElement } from './types'

export let isUsingTouch = false

export function onDocumentTouch() {
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
export function onDocumentMouseMove() {
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

export function onDocumentClick(event: MouseEvent) {
  // Simulated events dispatched on the document
  if (!(event.target instanceof Element)) {
    return hideAll()
  }

  // Clicked on an interactive popper
  const popper: ReferenceElement = closest(event.target, Selectors.POPPER)
  if (popper && popper._tippy && popper._tippy.props.interactive) {
    return
  }

  // Clicked on a reference
  const reference: ReferenceElement = closestCallback(
    event.target,
    (el: ReferenceElement) => el._tippy && el._tippy.reference === el,
  )
  if (reference) {
    const instance = reference._tippy

    if (instance) {
      const isClickTrigger = includes(instance.props.trigger || '', 'click')

      if (isUsingTouch || isClickTrigger) {
        return hideAll({ exclude: instance, checkHideOnClick: true })
      }

      if (instance.props.hideOnClick !== true || isClickTrigger) {
        return
      }

      instance.clearDelayTimeouts()
    }
  }

  hideAll({ checkHideOnClick: true })
}

export function onWindowBlur() {
  const { activeElement }: { activeElement: any } = document
  if (activeElement && activeElement.blur && activeElement._tippy) {
    activeElement.blur()
  }
}

/**
 * Adds the needed global event listeners
 */
export default function bindGlobalEventListeners() {
  document.addEventListener('click', onDocumentClick, true)
  document.addEventListener('touchstart', onDocumentTouch, PASSIVE)
  window.addEventListener('blur', onWindowBlur)
}
