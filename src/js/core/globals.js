export const isBrowser = typeof window !== 'undefined'

export const isIE = isBrowser && /MSIE |Trident\//.test(navigator.userAgent)

export const browser = {}

if (isBrowser) {
  browser.supported = 'requestAnimationFrame' in window
  browser.supportsTouch = 'ontouchstart' in window
  browser.usingTouch = false
  browser.dynamicInputDetection = true
  browser.iOS = /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream
  browser.onUserInputChange = () => {}
}

/**
 * Selector constants used for grabbing elements
 */
export const selectors = {
  POPPER: '.tippy-popper',
  TOOLTIP: '.tippy-tooltip',
  CONTENT: '.tippy-content',
  BACKDROP: '.tippy-backdrop',
  ARROW: '.tippy-arrow',
  ROUND_ARROW: '.tippy-roundarrow',
  REFERENCE: '[data-tippy]'
}
