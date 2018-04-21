let Defaults = {
  a11y: true,
  content: '',
  placement: 'top',
  livePlacement: true,
  trigger: 'mouseenter focus',
  animation: 'shift-away',
  animateFill: true,
  arrow: false,
  delay: 0,
  duration: [325, 275],
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
  appendTo: reference => reference.parentNode,
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
  allowHTML: true,
  popperOptions: {},
  createPopperInstanceOnInit: false,
  onShow() {},
  onShown() {},
  onHide() {},
  onHidden() {}
}

const setDefaults = partialDefaults => {
  Defaults = { ...Defaults, ...partialDefaults }
}

export { Defaults, setDefaults }
