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

export interface LifecycleHooks<TProps = Props> {
  onAfterUpdate(
    instance: Instance<TProps>,
    partialProps: Partial<TProps>,
  ): void;
  onBeforeUpdate(
    instance: Instance<TProps>,
    partialProps: Partial<TProps>,
  ): void;
  onCreate(instance: Instance<TProps>): void;
  onDestroy(instance: Instance<TProps>): void;
  onHidden(instance: Instance<TProps>): void;
  onHide(instance: Instance<TProps>): void | false;
  onMount(instance: Instance<TProps>): void;
  onShow(instance: Instance<TProps>): void | false;
  onShown(instance: Instance<TProps>): void;
  onTrigger(instance: Instance<TProps>, event: Event): void;
  onUntrigger(instance: Instance<TProps>, event: Event): void;
}

export interface Props extends LifecycleHooks {
  allowHTML: boolean;
  animation: string;
  appendTo: 'parent' | Element | ((ref: Element) => Element);
  aria: 'describedby' | 'labelledby' | null;
  arrow: boolean | string | SVGElement;
  boundary: 'scrollParent' | 'window' | 'viewport' | HTMLElement;
  content: Content;
  delay: number | [number | null, number | null];
  distance: number | string;
  duration: number | [number | null, number | null];
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
  plugins: Plugin[];
  popperOptions: Popper.PopperOptions;
  role: string;
  showOnCreate: boolean;
  theme: string;
  touch: boolean | 'hold' | ['hold', number];
  trigger: string;
  triggerTarget: Element | Element[] | null;
  updateDuration: number;
  zIndex: number;
}

export interface DefaultProps extends Props {
  delay: number | [number, number];
  duration: number | [number, number];
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

export interface Instance<TProps = Props> {
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
  props: TProps;
  reference: ReferenceElement;
  setContent(content: Content): void;
  setProps(partialProps: Partial<TProps>): void;
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

export interface Plugin<TProps = Props> {
  name?: string;
  defaultValue?: any;
  fn(instance: Instance<TProps>): Partial<LifecycleHooks<TProps>>;
}

export interface Tippy<TProps = Props> {
  (
    targets: Targets,
    optionalProps?: Partial<TProps>,
    /** @deprecated use Props.plugins */
    plugins?: Plugin[],
  ): Instance<TProps> | Instance<TProps>[];
  readonly currentInput: {isTouch: boolean};
  readonly defaultProps: DefaultProps;
  readonly version: string;
  setDefaultProps(partialProps: Partial<DefaultProps>): void;
}

declare const tippy: Tippy;
export default tippy;

export type HideAll = (options: HideAllOptions) => void;
declare const hideAll: HideAll;

/**
 * @deprecated use tippy.setDefaultProps({plugins: [...]});
 */
export type CreateTippyWithPlugins = (outerPlugins: Plugin[]) => Tippy;
declare const createTippyWithPlugins: CreateTippyWithPlugins;

export type Delegate<TProps = Props> = (
  targets: Targets,
  props: Partial<TProps> & {target: string},
  /** @deprecated use Props.plugins */
  plugins?: Plugin[],
) => Instance<TProps> | Instance<TProps>[];

export type CreateSingleton<TProps = Props> = (
  tippyInstances: Instance[],
  optionalProps?: Partial<TProps>,
  /** @deprecated use Props.plugins */
  plugins?: Plugin[],
) => Instance<TProps>;

declare const delegate: Delegate;
declare const createSingleton: CreateSingleton;

export interface AnimateFillInstance
  extends Instance<Props & AnimateFillProps> {
  popperChildren: PopperChildren & {
    backdrop: HTMLDivElement | null;
  };
}

export interface AnimateFill extends Plugin<Props & AnimateFillProps> {
  name: 'animateFill';
  defaultValue: false;
  fn(
    instance: AnimateFillInstance,
  ): Partial<LifecycleHooks<Props & AnimateFillProps>>;
}

export interface FollowCursor extends Plugin<Props & FollowCursorProps> {
  name: 'followCursor';
  defaultValue: false;
}

export interface InlinePositioning
  extends Plugin<Props & InlinePositioningProps> {
  name: 'inlinePositioning';
  defaultValue: false;
}

export interface Sticky extends Plugin<Props & StickyProps> {
  name: 'sticky';
  defaultValue: false;
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
