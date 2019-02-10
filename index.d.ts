import Popper from 'popper.js'

export type BasicPlacement = 'top' | 'bottom' | 'left' | 'right'

export type Placement =
  | BasicPlacement
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end'

export type Content = string | Element | ((ref: Element) => Element | string)

export type Targets =
  | string
  | Element
  | Element[]
  | NodeList
  | Popper.ReferenceObject

export interface Props {
  a11y?: boolean
  allowHTML?: boolean
  animateFill?: boolean
  animation?: 'fade' | 'scale' | 'shift-toward' | 'perspective' | 'shift-away'
  appendTo?: 'parent' | Element | ((ref: Element) => Element)
  aria?: 'describedby' | 'labelledby'
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
  updateDuration?: number
  wait?(instance: Instance, event: Event): void
  zIndex?: number
}

export interface Instance {
  clearDelayTimeouts(): void
  destroy(): void
  disable(): void
  enable(): void
  hide(duration?: number): void
  id: number
  popper: Element
  popperChildren: {
    arrow: Element | null
    backdrop: Element | null
    content: Element | null
    tooltip: Element | null
  }
  popperInstance: Popper | null
  props: Props
  reference: Element
  set(options: Props): void
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

export interface GroupOptions {
  delay?: number | [number, number]
  duration?: number | [number, number]
}

export interface HideAllOptions {
  checkHideOnClick?: boolean
  duration?: number
  exclude?: Instance
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
