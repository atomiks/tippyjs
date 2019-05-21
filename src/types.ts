import Popper from 'popper.js'

export type BasicPlacement = 'top' | 'bottom' | 'left' | 'right'

export type Placement = Popper.Placement

export type Content = string | Element | ((ref: Element) => Element | string)

export type Targets = string | Element | Element[] | NodeList

export interface ReferenceElement extends Element {
  _tippy?: Instance
}

export interface PopperElement extends HTMLDivElement {
  _tippy?: Instance
}

export interface PopperInstance extends Popper {
  reference: ReferenceElement
  popper: PopperElement
  data: {
    placement: Placement
  }
  modifiers: { name: string; padding: object | number }[]
}

export interface Props {
  allowHTML: boolean
  animateFill: boolean
  animation: 'fade' | 'shift-away' | string
  appendTo: 'parent' | Element | ((ref: Element) => Element)
  aria: 'describedby' | 'labelledby' | null
  arrow: boolean
  arrowType: 'sharp' | 'round' | string
  boundary: 'scrollParent' | 'window' | 'viewport' | HTMLElement
  content: Content
  delay: number | [number, number]
  distance: number
  duration: number | [number, number]
  flip: boolean
  flipBehavior: 'flip' | Placement[]
  flipOnUpdate: boolean
  followCursor: boolean | 'vertical' | 'horizontal' | 'initial'
  hideOnClick: boolean | 'toggle'
  ignoreAttributes: boolean
  inertia: boolean
  interactive: boolean
  interactiveBorder: number
  interactiveDebounce: number
  lazy: boolean
  maxWidth: number | string
  multiple: boolean
  offset: number | string
  onCreate(instance: Instance): void
  onHidden(instance: Instance): void
  onHide(instance: Instance): void | false
  onMount(instance: Instance): void
  onShow(instance: Instance): void | false
  onShown(instance: Instance): void
  onTrigger(instance: Instance, event: Event): void
  onUntrigger(instance: Instance, event: Event): void
  placement: Placement
  popperOptions: Popper.PopperOptions
  role: string
  showOnInit: boolean
  size: 'small' | 'regular' | 'large'
  sticky: boolean
  theme: string
  touch: boolean
  touchHold: boolean
  trigger: string
  triggerTarget: Element | null
  updateDuration: number
  wait: ((instance: Instance, event?: Event) => void) | null
  zIndex: number
}

export type Options = Partial<Props>

export interface Instance {
  clearDelayTimeouts(): void
  destroy(): void
  disable(): void
  enable(): void
  hide(duration?: number): void
  id: number
  popper: PopperElement
  popperChildren: PopperChildren
  popperInstance: PopperInstance | null
  props: Props
  reference: ReferenceElement
  set(options: Options): void
  setContent(content: Content): void
  show(duration?: number): void
  state: {
    isEnabled: boolean
    isVisible: boolean
    isDestroyed: boolean
    isMounted: boolean
    isShown: boolean
  }
}

export interface PopperChildren {
  tooltip: HTMLDivElement
  content: HTMLDivElement
  arrow: HTMLDivElement | null
  backdrop: HTMLDivElement | null
}

export interface HideAllOptions {
  duration?: number
  exclude?: Instance | ReferenceElement
}

export interface Tippy {
  (targets: Targets, options?: Options): Instance | Instance[] | null
  readonly defaults: Props
  readonly version: string
  hideAll(options?: HideAllOptions): void
  setDefaults(partialDefaults: Options): void
}

declare const tippy: Tippy
export default tippy
