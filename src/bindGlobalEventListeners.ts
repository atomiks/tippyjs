import { isIOS } from './browser'
import { PASSIVE, IOS_CLASS } from './constants'

export let isUsingTouch = false

export function onDocumentTouch(): void {
  if (isUsingTouch) {
    return
  }

  isUsingTouch = true

  if (isIOS) {
    document.body.classList.add(IOS_CLASS)
  }

  if (window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove)
  }
}

let lastMouseMoveTime = 0
export function onDocumentMouseMove(): void {
  const now = performance.now()

  // Chrome 60+ is 1 mousemove per animation frame, use 20ms time difference
  if (now - lastMouseMoveTime < 20) {
    isUsingTouch = false

    document.removeEventListener('mousemove', onDocumentMouseMove)

    if (!isIOS) {
      document.body.classList.remove(IOS_CLASS)
    }
  }

  lastMouseMoveTime = now
}

export function onWindowBlur(): void {
  const { activeElement }: { activeElement: any } = document

  if (activeElement && activeElement.blur && activeElement._tippy) {
    activeElement.blur()
  }
}

/**
 * Adds the needed global event listeners
 */
export default function bindGlobalEventListeners(): void {
  document.addEventListener('touchstart', onDocumentTouch, PASSIVE)
  window.addEventListener('blur', onWindowBlur)
}
