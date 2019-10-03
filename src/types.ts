import Popper, {ReferenceObject} from 'popper.js';

export type BasePlacement = 'top' | 'bottom' | 'left' | 'right';

export type Placement = Popper.Placement;

export type Content = string | Element | ((ref: Element) => Element | string);

export type Targets = string | Element | Element[] | NodeList;

export interface ReferenceElement extends Element {
  _tippy?: Instance;
}

export interface PopperElement extends HTMLDivElement {
  _tippy?: Instance;
}

export interface PopperInstance extends Popper {
  reference: ReferenceElement | ReferenceObject;
  popper: PopperElement;
  data: {
    placement: Placement;
  };
  modifiers: {name: string; padding: object | number}[];
}

export interface LifecycleHooks {
  onAfterUpdate(instance: Instance, partialProps: Partial<Props>): void;
  onBeforeUpdate(instance: Instance, partialProps: Partial<Props>): void;
  onCreate(instance: Instance): void;
  onDestroy(instance: Instance): void;
  onHidden(instance: Instance): void;
  onHide(instance: Instance): void | false;
  onMount(instance: Instance): void;
  onShow(instance: Instance): void | false;
  onShown(instance: Instance): void;
  onTrigger(instance: Instance, event: Event): void;
  onUntrigger(instance: Instance, event: Event): void;
}

export interface Props extends LifecycleHooks {
  allowHTML: boolean;
  animation: string;
  appendTo: 'parent' | Element | ((ref: Element) => Element);
  aria: 'describedby' | 'labelledby' | null;
  arrow: boolean | string | SVGElement;
  boundary: 'scrollParent' | 'window' | 'viewport' | HTMLElement;
  content: Content;
  delay: number | [number, number];
  distance: number;
  duration: number | [number, number];
  flip: boolean;
  flipBehavior: 'flip' | Placement[];
  flipOnUpdate: boolean;
  hideOnClick: boolean | 'toggle';
  ignoreAttributes: boolean;
  inertia: boolean;
  interactive: boolean;
  interactiveBorder: number;
  interactiveDebounce: number;
  lazy: boolean;
  maxWidth: number | string;
  multiple: boolean;
  offset: number | string;
  placement: Placement;
  popperOptions: Popper.PopperOptions;
  role: string;
  showOnCreate: boolean;
  theme: string;
  touch: boolean | 'hold' | ['hold', number];
  trigger: string;
  triggerTarget: Element | Element[] | null;
  updateDuration: number;
  zIndex: number;
  [key: string]: any;
}

export interface AnimateFillProps {
  animateFill: boolean;
}

export interface FollowCursorProps {
  followCursor: boolean | 'horizontal' | 'vertical' | 'initial';
}

export interface InlinePositioningProps {
  inlinePositioning: boolean;
}

export interface StickyProps {
  sticky: boolean | 'reference' | 'popper';
}

export interface Instance {
  clearDelayTimeouts(): void;
  destroy(): void;
  disable(): void;
  enable(): void;
  hide(duration?: number): void;
  id: number;
  plugins: Plugin[];
  popper: PopperElement;
  popperChildren: PopperChildren;
  popperInstance: PopperInstance | null;
  props: Props;
  reference: ReferenceElement;
  setContent(content: Content): void;
  setProps(partialProps: Partial<Props>): void;
  show(duration?: number): void;
  state: {
    currentPlacement: Placement | null;
    isEnabled: boolean;
    isVisible: boolean;
    isDestroyed: boolean;
    isMounted: boolean;
    isShown: boolean;
  };
}

export interface PopperChildren {
  tooltip: HTMLDivElement;
  content: HTMLDivElement;
  arrow: HTMLDivElement | null;
}

export interface HideAllOptions {
  duration?: number;
  exclude?: Instance | ReferenceElement;
}

export interface Plugin {
  name?: string;
  defaultValue?: any;
  fn(instance: Instance): Partial<LifecycleHooks>;
}

export interface Tippy<TProps = Props> {
  (targets: Targets, optionalProps?: Partial<TProps>, plugins?: Plugin[]):
    | Instance
    | Instance[];
  readonly currentInput: {isTouch: boolean};
  readonly defaultProps: Props;
  readonly version: string;
  setDefaultProps(partialProps: Partial<Props>): void;
}

declare const tippy: Tippy;
export default tippy;

export type HideAll = (options: HideAllOptions) => void;
declare const hideAll: HideAll;

export type CreateTippyWithPlugins = (outerPlugins: Plugin[]) => Tippy;
declare const createTippyWithPlugins: CreateTippyWithPlugins;

export type Delegate<TProps = Props> = (
  targets: Targets,
  props: Partial<TProps> & {target: string},
  plugins?: Plugin[],
) => Instance | Instance[];

export type CreateSingleton<TProps = Props> = (
  tippyInstances: Instance[],
  optionalProps?: Partial<TProps>,
  plugins?: Plugin[],
) => Instance;

declare const delegate: Delegate;
declare const createSingleton: CreateSingleton;

export interface AnimateFillInstance extends Instance {
  popperChildren: PopperChildren & {
    backdrop: HTMLDivElement | null;
  };
}

export interface AnimateFill {
  name: 'animateFill';
  defaultValue: false;
  fn(instance: AnimateFillInstance): Partial<LifecycleHooks>;
}

export interface FollowCursor {
  name: 'followCursor';
  defaultValue: false;
  fn(instance: Instance): Partial<LifecycleHooks>;
}

export interface InlinePositioning {
  name: 'inlinePositioning';
  defaultValue: false;
  fn(instance: Instance): Partial<LifecycleHooks>;
}

export interface Sticky {
  name: 'sticky';
  defaultValue: false;
  fn(instance: Instance): Partial<LifecycleHooks>;
}

declare const animateFill: AnimateFill;
declare const followCursor: FollowCursor;
declare const inlinePositioning: InlinePositioning;
declare const sticky: Sticky;

declare const roundArrow: string;

export {
  hideAll,
  createTippyWithPlugins,
  delegate,
  createSingleton,
  animateFill,
  followCursor,
  inlinePositioning,
  sticky,
  roundArrow,
};
