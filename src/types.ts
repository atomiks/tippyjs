import Popper, { ReferenceObject } from 'popper.js'

export type BasePlacement = 'top' | 'bottom' | 'left' | 'right'

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
  reference: ReferenceElement | ReferenceObject
  popper: PopperElement
  data: {
    placement: Placement
  }
  modifiers: { name: string; padding: object | number }[]
}

export interface Props {
  allowHTML: boolean
  animateFill: boolean
  animation: string
  appendTo: 'parent' | Element | ((ref: Element) => Element)
  aria: 'describedby' | 'labelledby' | null
  arrow: boolean | string | SVGElement
  boundary: 'scrollParent' | 'window' | 'viewport' | HTMLElement
  content: Content
  delay: number | [number, number]
  distance: number
  duration: number | [number, number]
  flip: boolean
  flipBehavior: 'flip' | Placement[]
  flipOnUpdate: boolean
  followCursor: boolean | 'horizontal' | 'vertical' | 'initial'
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
  showOnCreate: boolean
  sticky: boolean
  theme: string
  touch: boolean | 'hold' | ['hold', number]
  trigger: string
  triggerTarget: Element | null
  updateDuration: number
  zIndex: number
}

export interface Instance {
  __extraProps?: any
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
  setContent(content: Content): void
  setProps(partialProps: Partial<Props>): void
  show(duration?: number, shouldPreventPopperTransition?: boolean): void
  state: {
    currentPlacement: Placement
    isScheduledToShow: boolean
    isEnabled: boolean
    isVisible: boolean
    isDestroyed: boolean
    isMounted: boolean
    isShown: boolean
  }
}

export interface Singleton extends Instance {
  instances: Instance[]
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

export type TippyCallWrapper = (
  targets: Targets,
  optionalProps?: Partial<Props>,
) => Instance | Instance[]

export interface EnhancedTippy extends Tippy {
  currentInput: { isTouch: boolean }
  defaultProps: Props
  version: string
}

export type PropHOF = (tippy: Tippy) => EnhancedTippy

export interface Tippy {
  (targets: Targets, optionalProps?: Partial<Props>): Instance | Instance[]
  readonly currentInput: { isTouch: boolean }
  readonly defaultProps: Props
  readonly version: string
  hideAll(options?: HideAllOptions): void
  setDefaultProps(partialProps: Partial<Props>): void
}

declare const tippy: Tippy
export default tippy
