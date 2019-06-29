import { Props } from './types'

export const defaultProps: Partial<Props> = {
  allowHTML: true,
  animateFill: false,
  animation: 'fade',
  appendTo: (): Element => document.body,
  aria: 'describedby',
  arrow: true,
  boundary: 'scrollParent',
  content: '',
  delay: 0,
  distance: 10,
  duration: [325, 275],
  flip: true,
  flipBehavior: 'flip',
  flipOnUpdate: false,
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
  onCreate(): void {},
  onHidden(): void {},
  onHide(): void | false {},
  onMount(): void {},
  onShow(): void | false {},
  onShown(): void {},
  onTrigger(): void {},
  onUntrigger(): void {},
  placement: 'top',
  popperOptions: {},
  role: 'tooltip',
  showOnCreate: false,
  sticky: false,
  theme: '',
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null,
  updateDuration: 0,
  wait: null,
  zIndex: 9999,
}

export const extraProps: Partial<Props> = {
  followCursor: false,
  inlinePositioning: false,
}

/**
 * If the setProps() method encounters one of these, the popperInstance must be
 * recreated
 */
export const POPPER_INSTANCE_DEPENDENCIES: Array<keyof Props> = [
  'arrow',
  'boundary',
  'distance',
  'flip',
  'flipBehavior',
  'flipOnUpdate',
  'offset',
  'placement',
  'popperOptions',
]
