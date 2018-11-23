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

export type Content = string | Element

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
  appendTo?: Element | ((ref: Element) => Element)
  arrow?: boolean
  arrowType?: 'sharp' | 'round'
  arrowTransform?: string
  content?: Content
  delay?: number | [number, number]
  duration?: number | [number, number]
  distance?: number
  flip?: boolean
  flipBehavior?: 'flip' | Placement[]
  followCursor?: boolean | 'vertical' | 'horizontal'
  hideOnClick?: boolean | 'toggle'
  inertia?: boolean
  interactive?: boolean
  interactiveBorder?: number
  interactiveDebounce?: number
  lazy?: boolean
  livePlacement?: boolean
  maxWidth?: number | string
  multiple?: boolean
  offset?: number | string
  onHidden?(instance: Instance): void
  onHide?(instance: Instance): void
  onMount?(instance: Instance): void
  onShow?(instance: Instance): void
  onShown?(instance: Instance): void
  performance?: boolean
  placement?: Placement
  popperOptions?: Popper.PopperOptions
  shouldPopperHideOnBlur?: (event: FocusEvent) => boolean
  showOnInit?: boolean
  size?: 'small' | 'regular' | 'large'
  sticky?: boolean
  target?: string
  theme?: string
  touch?: boolean
  touchHold?: boolean
  trigger?: 'mouseenter' | 'focus' | 'click' | 'manual'
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

export interface Collection {
  destroyAll(): void
  instances: Instance[]
  props: Props
  targets: Targets
}

export interface Tippy {
  (targets: Targets, options?: Props): Collection
  readonly defaults: Props
  readonly version: string
  disableAnimations(): void
  hideAllPoppers(): void
  one(targets: Targets, options?: Props): Instance
  setDefaults(options: Props): void
  useCapture(): void
}

declare const tippy: Tippy
export default tippy
