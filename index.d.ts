import Popper from 'popper.js'

export type BasicPlacement = 'top' | 'bottom' | 'left' | 'right'

export type Placement = Popper.Placement

export type Content = string | Element | ((ref: Element) => Element | string)

export type Targets = string | Element | Element[] | NodeList | VirtualReference

export interface ReferenceElement extends Element {
  _tippy?: Instance
}

export interface PopperElement extends HTMLDivElement {
  _tippy?: Instance
}

export interface VirtualReference extends Popper.ReferenceObject {
  _tippy?: Instance
  parentNode?: Element
  contains(): void
  setAttribute(key: string, value: any): void
  getAttribute(key: string): string
  removeAttribute(key: string): void
  hasAttribute(key: string): boolean
  addEventListener(): void
  removeEventListener(): void
  attributes: {
    [key: string]: any
  }
  classList: {
    add(key: string): void
    remove(key: string): void
    contains(key: string): boolean
    classNames: {
      [key: string]: boolean
    }
    [key: string]: any
  }
}

export interface PopperInstance extends Popper {
  reference: ReferenceElement
  popper: PopperElement
  modifiers: { name: string; padding: object | number }[]
}

export interface Options {
  a11y?: boolean
  allowHTML?: boolean
  animateFill?: boolean
  animation?: 'fade' | 'scale' | 'shift-toward' | 'perspective' | 'shift-away'
  appendTo?: 'parent' | Element | ((ref: Element) => Element)
  aria?: 'describedby' | 'labelledby' | null
  arrow?: boolean
  arrowType?: 'sharp' | 'round'
  boundary?: 'scrollParent' | 'window' | 'viewport' | HTMLElement
  content?: Content
  delay?: number | [number, number]
  distance?: number
  duration?: number | [number, number]
  flip?: boolean
  flipBehavior?: 'flip' | Placement[]
  flipOnUpdate?: boolean
  followCursor?: boolean | 'vertical' | 'horizontal' | 'initial'
  hideOnClick?: boolean | 'toggle'
  ignoreAttributes?: boolean
  inertia?: boolean
  interactive?: boolean
  interactiveBorder?: number
  interactiveDebounce?: number
  lazy?: boolean
  maxWidth?: number | string
  multiple?: boolean
  offset?: number | string
  onHidden?(instance: Instance): void
  onHide?(instance: Instance): void | false
  onMount?(instance: Instance): void
  onShow?(instance: Instance): void | false
  onShown?(instance: Instance): void
  onTrigger?(instance: Instance, event: Event): void
  placement?: Placement
  popperOptions?: Popper.PopperOptions
  role?: string
  showOnInit?: boolean
  size?: 'small' | 'regular' | 'large'
  sticky?: boolean
  target?: string
  theme?: 'dark' | 'light' | 'light-border' | 'google' | string
  touch?: boolean
  touchHold?: boolean
  trigger?: string
  triggerTarget?: Element | null
  updateDuration?: number
  wait?: ((instance: Instance, event?: Event) => void) | null
  zIndex?: number
}

/**
 * @deprecated
 * Use `Options` instead.
 */
export type Props = Options

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
  reference: ReferenceElement | VirtualReference
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

export interface GroupedInstance extends Instance {
  _originalProps: Props
}

export interface GroupOptions {
  delay?: number | [number, number]
  duration?: number | [number, number]
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
  (targets: Targets, options?: Props): Instance | Instance[]
  readonly defaults: Props
  readonly version: string
  group(instances: Instance[], options?: GroupOptions): void
  hideAll(options?: HideAllOptions): void
  setDefaults(options: Props): void
}

declare const tippy: Tippy
export default tippy
