export const Browser = {}

if (typeof window !== 'undefined') {
  Browser.SUPPORTED = 'requestAnimationFrame' in window
  Browser.SUPPORTS_TOUCH = 'ontouchstart' in window
  Browser.touch = false
  Browser.dynamicInputDetection = true
  // Chrome device/touch emulation can make this dynamic
  Browser.iOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
* The global storage array which holds all data reference objects
* from every instance
* This allows us to hide tooltips from all instances, finding the ref when
* clicking on the body, and for followCursor
*/
export const Store = []

/**
* Selector constants used for grabbing elements
*/
export const Selectors = {
  POPPER: '.tippy-popper',
  TOOLTIP: '.tippy-tooltip',
  CONTENT: '.tippy-tooltip-content',
  CIRCLE: '[x-circle]',
  ARROW: '[x-arrow]',
  TOOLTIPPED_EL: '[data-tooltipped]',
  CONTROLLER: '[data-tippy-controller]'
}

/**
* The default settings applied to each instance
*/
export const Defaults = {
  html: false,
  position: 'top',
  animation: 'shift',
  animateFill: true,
  arrow: false,
  arrowSize: 'regular',
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
  flipDuration: 350,
  sticky: false,
  stickyDuration: 200,
  appendTo: null,
  zIndex: 9999,
  touchHold: false,
  performance: false,
  dynamicTitle: false,
  popperOptions: {}
}

/**
* The keys of the defaults object for reducing down into a new object
* Used in `getIndividualSettings()`
*/
export const DefaultsKeys = Browser.SUPPORTED && Object.keys(Defaults)
