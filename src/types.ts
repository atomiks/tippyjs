import * as Popper from '@popperjs/core';

export type BasePlacement = Popper.BasePlacement;

export type Placement = Popper.Placement;

export type Content =
  | string
  | Element
  | DocumentFragment
  | ((ref: Element) => string | Element | DocumentFragment);

export type SingleTarget = Element;

export type MultipleTargets = string | readonly Element[] | NodeList;

export type Targets = SingleTarget | MultipleTargets;

export interface ReferenceElement<TProps = Props> extends Element {
  _tippy?: Instance<TProps>;
}

export interface PopperElement<TProps = Props> extends HTMLDivElement {
  _tippy?: Instance<TProps>;
}

export interface LifecycleHooks<TProps = Props> {
  onAfterUpdate(
    instance: Instance<TProps>,
    partialProps: Partial<TProps>
  ): void;
  onBeforeUpdate(
    instance: Instance<TProps>,
    partialProps: Partial<TProps>
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
  onClickOutside(instance: Instance<TProps>, event: Event): void;
}

export interface RenderProps {
  readonly allowHTML: boolean;
  readonly animation: string | boolean;
  readonly arrow: boolean | string | SVGElement | DocumentFragment;
  readonly content: Content;
  readonly inertia: boolean;
  readonly maxWidth: number | string;
  readonly role: string;
  readonly theme: string;
  readonly zIndex: number;
}

export interface GetReferenceClientRect {
  (): ClientRect | DOMRect;
  contextElement?: Element;
}

export interface Props extends LifecycleHooks, RenderProps {
  readonly animateFill: boolean;
  readonly appendTo: 'parent' | Element | ((ref: Element) => Element);
  readonly aria: {
    readonly content?: 'auto' | 'describedby' | 'labelledby' | null;
    readonly expanded?: 'auto' | boolean;
  };
  readonly delay: number | [number | null, number | null];
  readonly duration: number | [number | null, number | null];
  readonly followCursor: boolean | 'horizontal' | 'vertical' | 'initial';
  readonly getReferenceClientRect: null | GetReferenceClientRect;
  readonly hideOnClick: boolean | 'toggle';
  readonly ignoreAttributes: boolean;
  readonly inlinePositioning: boolean;
  readonly interactive: boolean;
  readonly interactiveBorder: number;
  readonly interactiveDebounce: number;
  readonly moveTransition: string;
  readonly offset:
    | readonly [number, number]
    | (({
        placement,
        popper,
        reference,
      }: {
        readonly placement: Placement;
        readonly popper: Popper.Rect;
        readonly reference: Popper.Rect;
      }) => [number, number]);
  readonly placement: Placement;
  readonly plugins: Plugin<unknown>[];
  readonly popperOptions: Partial<Popper.Options>;
  readonly render:
    | ((
        instance: Instance
      ) => {
        readonly popper: PopperElement;
        readonly onUpdate?: (prevProps: Props, nextProps: Props) => void;
      })
    | null;
  readonly showOnCreate: boolean;
  readonly sticky: boolean | 'reference' | 'popper';
  readonly touch: boolean | 'hold' | ['hold', number];
  readonly trigger: string;
  readonly triggerTarget: Element | readonly Element[] | null;
}

export interface DefaultProps extends Omit<Props, 'delay' | 'duration'> {
  readonly delay: number | readonly [number, number];
  readonly duration: number | readonly [number, number];
}

export interface Instance<TProps = Props> {
  clearDelayTimeouts(): void;
  destroy(): void;
  disable(): void;
  enable(): void;
  hide(): void;
  hideWithInteractivity(event: MouseEvent): void;
  id: number;
  plugins: Plugin<TProps>[];
  popper: PopperElement<TProps>;
  popperInstance: Popper.Instance | null;
  props: TProps;
  reference: ReferenceElement<TProps>;
  setContent(content: Content): void;
  setProps(partialProps: Partial<TProps>): void;
  show(): void;
  state: {
    readonly isEnabled: boolean;
    readonly isVisible: boolean;
    readonly isDestroyed: boolean;
    readonly isMounted: boolean;
    readonly isShown: boolean;
  };
  unmount(): void;
}

export interface TippyStatics {
  readonly currentInput: {readonly isTouch: boolean};
  readonly defaultProps: DefaultProps;
  setDefaultProps(partialProps: Partial<DefaultProps>): void;
}

export interface Tippy<TProps = Props> extends TippyStatics {
  (targets: SingleTarget, optionalProps?: Partial<TProps>): Instance<TProps>;
}

export interface Tippy<TProps = Props> extends TippyStatics {
  (
    targets: MultipleTargets,
    optionalProps?: Partial<TProps>
  ): Instance<TProps>[];
}

declare const tippy: Tippy;

// =============================================================================
// Addon types
// =============================================================================
export interface DelegateInstance<TProps = Props> extends Instance<TProps> {
  destroy(shouldDestroyTargetInstances?: boolean): void;
}

export interface Delegate<TProps = Props> {
  (
    targets: SingleTarget,
    props: Partial<TProps> & {target: string}
  ): DelegateInstance<TProps>;
}

export interface Delegate<TProps = Props> {
  (
    targets: MultipleTargets,
    props: Partial<TProps> & {target: string}
  ): DelegateInstance<TProps>[];
}

export type CreateSingletonProps<TProps = Props> = TProps & {
  overrides: Array<keyof TProps>;
};

export type CreateSingletonInstance<
  TProps = CreateSingletonProps
> = Instance<TProps> & {
  setInstances(instances: Instance<any>[]): void;
  show(target?: ReferenceElement | Instance | number): void;
  showNext(): void;
  showPrevious(): void;
};

export type CreateSingleton<TProps = Props> = (
  tippyInstances: readonly Instance<any>[],
  optionalProps?: Partial<CreateSingletonProps<TProps>>
) => CreateSingletonInstance<CreateSingletonProps<TProps>>;

declare const delegate: Delegate;
declare const createSingleton: CreateSingleton;

// =============================================================================
// Plugin types
// =============================================================================
export interface Plugin<TProps = Props> {
  readonly name?: string;
  readonly defaultValue?: any;
  fn(instance: Instance<TProps>): Partial<LifecycleHooks<TProps>>;
}

export interface AnimateFill extends Plugin {
  readonly name: 'animateFill';
  readonly defaultValue: false;
}

export interface FollowCursor extends Plugin {
  readonly name: 'followCursor';
  readonly defaultValue: false;
}

export interface InlinePositioning extends Plugin {
  readonly name: 'inlinePositioning';
  readonly defaultValue: false;
}

export interface Sticky extends Plugin {
  readonly name: 'sticky';
  readonly defaultValue: false;
}

declare const animateFill: AnimateFill;
declare const followCursor: FollowCursor;
declare const inlinePositioning: InlinePositioning;
declare const sticky: Sticky;

// =============================================================================
// Misc types
// =============================================================================
export interface HideAllOptions {
  readonly duration?: number;
  readonly exclude?: Instance | ReferenceElement;
}

export type HideAll = (options?: HideAllOptions) => void;

declare const hideAll: HideAll;
declare const roundArrow: string;

export default tippy;
export {
  hideAll,
  delegate,
  createSingleton,
  animateFill,
  followCursor,
  inlinePositioning,
  sticky,
  roundArrow,
};
