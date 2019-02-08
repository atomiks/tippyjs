export default {
  a11y: true,
  allowHTML: true,
  animateFill: true,
  animation: 'shift-away',
  appendTo: () => document.body,
  aria: 'describedby',
  arrow: false,
  arrowType: 'sharp',
  boundary: 'scrollParent',
  content: '',
  delay: [0, 20],
  distance: 10,
  duration: [325, 275],
  flip: true,
  flipBehavior: 'flip',
  flipOnUpdate: false,
  followCursor: false,
  hideOnClick: true,
  ignoreAttributes: false,
  inertia: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  lazy: true,
  maxWidth: 350,
  multiple: false,
  offset: 0,
  onHidden() {},
  onHide() {},
  onMount() {},
  onShow() {},
  onShown() {},
  placement: 'top',
  popperOptions: {},
  role: 'tooltip',
  showOnInit: false,
  size: 'regular',
  sticky: false,
  target: '',
  theme: 'dark',
  touch: true,
  touchHold: false,
  trigger: 'mouseenter focus',
  updateDuration: 0,
  wait: null,
  zIndex: 9999,
}

/**
 * If the set() method encounters one of these, the popperInstance must be
 * recreated
 */
export const POPPER_INSTANCE_DEPENDENCIES = [
  'arrow',
  'arrowType',
  'boundary',
  'distance',
  'flip',
  'flipBehavior',
  'flipOnUpdate',
  'offset',
  'placement',
  'popperOptions',
]
