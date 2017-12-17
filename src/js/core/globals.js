export const isBrowser = typeof window !== 'undefined'

export const browser = {}

if (isBrowser) {
  browser.supported = 'requestAnimationFrame' in window
  browser.supportsTouch = 'ontouchstart' in window
  browser.usingTouch = false
  browser.dynamicInputDetection = true
  browser.iOS = /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream
  browser.onUserInputChange = () => {}
  browser._eventListenersBound = false
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

/**
 * The default options applied to each instance
 */
export const defaults = {
  placement: 'top',
  trigger: 'mouseenter focus',
  animation: 'shift-away',
  html: false,
  animateFill: true,
  arrow: false,
  delay: 0,
  duration: [350, 300],
  interactive: false,
  interactiveBorder: 2,
  theme: 'dark',
  size: 'regular',
  distance: 10,
  offset: 0,
  hideOnClick: true,
  multiple: false,
  followCursor: false,
  inertia: false,
  updateDuration: 350,
  sticky: false,
  appendTo: () => document.body,
  zIndex: 9999,
  touchHold: false,
  performance: false,
  dynamicTitle: false,
  flip: true,
  flipBehavior: 'flip',
  arrowType: 'sharp',
  arrowTransform: '',
  maxWidth: '',
  target: null,
  popperOptions: {},
  createPopperInstanceOnInit: false,
  onShow() {},
  onShown() {},
  onHide() {},
  onHidden() {}
}

/**
 * The keys of the defaults object for reducing down into a new object
 * Used in `getIndividualOptions()`
 */
export const defaultsKeys = browser.supported && Object.keys(defaults)
