export const browser = {}

if (typeof window !== 'undefined') {
  browser.supported = 'requestAnimationFrame' in window
  browser.supportsTouch = 'ontouchstart' in window
  browser.usingTouch = false
  browser.dynamicInputDetection = true
  browser.iOS = /iPhone|iPad|iPod/.test(navigator.platform) && !window.MSStream
}

/**
* The global storage array which holds all data reference objects
* from every instance
* This allows us to hide tooltips from all instances, finding the ref when
* clicking on the body, and for followCursor
*/
export const store = []

/**
* Selector constants used for grabbing elements
*/
export const selectors = {
  POPPER: '.tippy-popper',
  TOOLTIP: '.tippy-tooltip',
  CONTENT: '.tippy-tooltip-content',
  CIRCLE: '[x-circle]',
  ARROW: '[x-arrow]',
  TOOLTIPPED_EL: '[x-tooltipped]',
  CONTROLLER: '[x-tippy-controller]'
}

/**
* The default options applied to each instance
*/
export const defaults = {
  html: false,
  placement: 'top',
  animation: 'shift',
  animateFill: true,
  arrow: false,
  delay: 0,
  trigger: 'mouseenter focus',
  duration: 350,
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
  stickyDuration: 200,
  appendTo: () => document.body,
  zIndex: 9999,
  touchHold: false,
  performance: false,
  dynamicTitle: false,
  flip: true,
  flipBehavior: 'flip',
  arrowStyle: 'sharp',
  arrowTransform: '',
  maxWidth: '350px',
  popperOptions: {}
}

/**
* The keys of the defaults object for reducing down into a new object
* Used in `getIndividualOptions()`
*/
export const defaultsKeys = browser.supported && Object.keys(defaults)
