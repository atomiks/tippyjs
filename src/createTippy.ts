import {createPopper, StrictModifiers, Modifier} from '@popperjs/core';
import {currentInput} from './bindGlobalEventListeners';
import {isIE} from './browser';
import {TOUCH_OPTIONS} from './constants';
import {
  div,
  getOwnerDocument,
  isCursorOutsideInteractiveBorder,
  isMouseEvent,
  setTransitionDuration,
  setVisibilityState,
  updateTransitionEndListener,
} from './dom-utils';
import {defaultProps, evaluateProps, getExtendedPassedProps} from './props';
import {getChildren} from './template';
import {
  Content,
  Instance,
  LifecycleHooks,
  PopperElement,
  Props,
  ReferenceElement,
} from './types';
import {ListenerObject, PopperTreeData, PopperChildren} from './types-internal';
import {
  arrayFrom,
  debounce,
  getValueAtIndexOrReturn,
  invokeWithArgsOrReturn,
  normalizeToArray,
  pushIfUnique,
  splitBySpaces,
  unique,
  removeUndefinedProps,
} from './utils';
import {createMemoryLeakWarning, errorWhen, warnWhen} from './validation';

let idCounter = 1;
let mouseMoveListeners: ((event: MouseEvent) => void)[] = [];

// Used by `hideAll()`
export let mountedInstances: Instance[] = [];

export default function createTippy(
  reference: ReferenceElement,
  passedProps: Partial<Props>
): Instance {
  const props = evaluateProps(reference, {
    ...defaultProps,
    ...getExtendedPassedProps(removeUndefinedProps(passedProps)),
  });

  // ===========================================================================
  // 🔒 Private members
  // ===========================================================================
  let showTimeout: any;
  let hideTimeout: any;
  let scheduleHideAnimationFrame: number;
  let isVisibleFromClick = false;
  let didHideDueToDocumentMouseDown = false;
  let didTouchMove = false;
  let ignoreOnFirstUpdate = false;
  let lastTriggerEvent: Event | undefined;
  let currentTransitionEndListener: (event: TransitionEvent) => void;
  let onFirstUpdate: () => void;
  let listeners: ListenerObject[] = [];
  let debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce);
  let currentTarget: Element;

  // ===========================================================================
  // 🔑 Public members
  // ===========================================================================
  const id = idCounter++;
  const popperInstance = null;
  const plugins = unique(props.plugins);

  const state = {
    // Is the instance currently enabled?
    isEnabled: true,
    // Is the tippy currently showing and not transitioning out?
    isVisible: false,
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the tippy currently mounted to the DOM?
    isMounted: false,
    // Has the tippy finished transitioning in?
    isShown: false,
  };

  const instance: Instance = {
    // properties
    id,
    reference,
    popper: div(),
    popperInstance,
    props,
    state,
    plugins,
    // methods
    clearDelayTimeouts,
    setProps,
    setContent,
    show,
    hide,
    hideWithInteractivity,
    enable,
    disable,
    unmount,
    destroy,
  };

  // TODO: Investigate why this early return causes a TDZ error in the tests —
  // it doesn't seem to happen in the browser
  /* istanbul ignore if */
  if (!props.render) {
    if (__DEV__) {
      errorWhen(true, 'render() function has not been supplied.');
    }

    return instance;
  }

  // ===========================================================================
  // Initial mutations
  // ===========================================================================
  const {popper, onUpdate} = props.render(instance);

  popper.setAttribute('data-__NAMESPACE_PREFIX__-root', '');
  popper.id = `__NAMESPACE_PREFIX__-${instance.id}`;

  instance.popper = popper;
  reference._tippy = instance;
  popper._tippy = instance;

  const pluginsHooks = plugins.map((plugin) => plugin.fn(instance));
  const hasAriaExpanded = reference.hasAttribute('aria-expanded');

  addListeners();
  handleAriaExpandedAttribute();
  handleStyles();

  invokeHook('onCreate', [instance]);

  if (props.showOnCreate) {
    scheduleShow();
  }

  // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding
  popper.addEventListener('mouseenter', () => {
    if (instance.props.interactive && instance.state.isVisible) {
      instance.clearDelayTimeouts();
    }
  });

  popper.addEventListener('mouseleave', (event) => {
    if (
      instance.props.interactive &&
      instance.props.trigger.indexOf('mouseenter') >= 0
    ) {
      getDocument().addEventListener('mousemove', debouncedOnMouseMove);
      debouncedOnMouseMove(event);
    }
  });

  return instance;

  // ===========================================================================
  // 🔒 Private methods
  // ===========================================================================
  function getNormalizedTouchSettings(): [string | boolean, number] {
    const {touch} = instance.props;
    return Array.isArray(touch) ? touch : [touch, 0];
  }

  function getIsCustomTouchBehavior(): boolean {
    return getNormalizedTouchSettings()[0] === 'hold';
  }

  function getIsDefaultRenderFn(): boolean {
    // @ts-ignore
    return !!instance.props.render?.$$tippy;
  }

  function getCurrentTarget(): Element {
    return currentTarget || reference;
  }

  function getDocument(): Document {
    const parent = getCurrentTarget().parentNode as Element;
    return parent ? getOwnerDocument(parent) : document;
  }

  function getDefaultTemplateChildren(): PopperChildren {
    return getChildren(popper);
  }

  function getDelay(isShow: boolean): number {
    // For touch or keyboard input, force `0` delay for UX reasons
    // Also if the instance is mounted but not visible (transitioning out),
    // ignore delay
    if (
      (instance.state.isMounted && !instance.state.isVisible) ||
      currentInput.isTouch ||
      (lastTriggerEvent && lastTriggerEvent.type === 'focus')
    ) {
      return 0;
    }

    return getValueAtIndexOrReturn(
      instance.props.delay,
      isShow ? 0 : 1,
      defaultProps.delay
    );
  }

  function handleStyles(): void {
    popper.style.pointerEvents =
      instance.props.interactive && instance.state.isVisible ? '' : 'none';
    popper.style.zIndex = `${instance.props.zIndex}`;
  }

  function invokeHook(
    hook: keyof LifecycleHooks,
    args: [Instance, any?],
    shouldInvokePropsHook = true
  ): void {
    pluginsHooks.forEach((pluginHooks) => {
      if (pluginHooks[hook]) {
        pluginHooks[hook]!(...args);
      }
    });

    if (shouldInvokePropsHook) {
      instance.props[hook](...args);
    }
  }

  function handleAriaContentAttribute(): void {
    const {aria} = instance.props;

    if (!aria.content) {
      return;
    }

    const attr = `aria-${aria.content}`;
    const id = popper.id;
    const nodes = normalizeToArray(instance.props.triggerTarget || reference);

    nodes.forEach((node) => {
      const currentValue = node.getAttribute(attr);

      if (instance.state.isVisible) {
        node.setAttribute(attr, currentValue ? `${currentValue} ${id}` : id);
      } else {
        const nextValue = currentValue && currentValue.replace(id, '').trim();

        if (nextValue) {
          node.setAttribute(attr, nextValue);
        } else {
          node.removeAttribute(attr);
        }
      }
    });
  }

  function handleAriaExpandedAttribute(): void {
    if (hasAriaExpanded || !instance.props.aria.expanded) {
      return;
    }

    const nodes = normalizeToArray(instance.props.triggerTarget || reference);

    nodes.forEach((node) => {
      if (instance.props.interactive) {
        node.setAttribute(
          'aria-expanded',
          instance.state.isVisible && node === getCurrentTarget()
            ? 'true'
            : 'false'
        );
      } else {
        node.removeAttribute('aria-expanded');
      }
    });
  }

  function cleanupInteractiveMouseListeners(): void {
    getDocument().removeEventListener('mousemove', debouncedOnMouseMove);
    mouseMoveListeners = mouseMoveListeners.filter(
      (listener) => listener !== debouncedOnMouseMove
    );
  }

  function onDocumentPress(event: MouseEvent | TouchEvent): void {
    // Moved finger to scroll instead of an intentional tap outside
    if (currentInput.isTouch) {
      if (didTouchMove || event.type === 'mousedown') {
        return;
      }
    }

    // Clicked on interactive popper
    if (
      instance.props.interactive &&
      popper.contains(event.target as Element)
    ) {
      return;
    }

    // Clicked on the event listeners target
    if (getCurrentTarget().contains(event.target as Element)) {
      if (currentInput.isTouch) {
        return;
      }

      if (
        instance.state.isVisible &&
        instance.props.trigger.indexOf('click') >= 0
      ) {
        return;
      }
    } else {
      invokeHook('onClickOutside', [instance, event]);
    }

    if (instance.props.hideOnClick === true) {
      instance.clearDelayTimeouts();
      instance.hide();

      // `mousedown` event is fired right before `focus` if pressing the
      // currentTarget. This lets a tippy with `focus` trigger know that it
      // should not show
      didHideDueToDocumentMouseDown = true;
      setTimeout(() => {
        didHideDueToDocumentMouseDown = false;
      });

      // The listener gets added in `scheduleShow()`, but this may be hiding it
      // before it shows, and hide()'s early bail-out behavior can prevent it
      // from being cleaned up
      if (!instance.state.isMounted) {
        removeDocumentPress();
      }
    }
  }

  function onTouchMove(): void {
    didTouchMove = true;
  }

  function onTouchStart(): void {
    didTouchMove = false;
  }

  function addDocumentPress(): void {
    const doc = getDocument();
    doc.addEventListener('mousedown', onDocumentPress, true);
    doc.addEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
    doc.addEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
    doc.addEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
  }

  function removeDocumentPress(): void {
    const doc = getDocument();
    doc.removeEventListener('mousedown', onDocumentPress, true);
    doc.removeEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
    doc.removeEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
    doc.removeEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
  }

  function onTransitionedOut(duration: number, callback: () => void): void {
    onTransitionEnd(duration, () => {
      if (
        !instance.state.isVisible &&
        popper.parentNode &&
        popper.parentNode.contains(popper)
      ) {
        callback();
      }
    });
  }

  function onTransitionedIn(duration: number, callback: () => void): void {
    onTransitionEnd(duration, callback);
  }

  function onTransitionEnd(duration: number, callback: () => void): void {
    const box = getDefaultTemplateChildren().box;

    function listener(event: TransitionEvent): void {
      if (event.target === box) {
        updateTransitionEndListener(box, 'remove', listener);
        callback();
      }
    }

    // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise
    if (duration === 0) {
      return callback();
    }

    updateTransitionEndListener(box, 'remove', currentTransitionEndListener);
    updateTransitionEndListener(box, 'add', listener);

    currentTransitionEndListener = listener;
  }

  function on(
    eventType: string,
    handler: EventListener,
    options: boolean | object = false
  ): void {
    const nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach((node) => {
      node.addEventListener(eventType, handler, options);
      listeners.push({node, eventType, handler, options});
    });
  }

  function addListeners(): void {
    if (getIsCustomTouchBehavior()) {
      on('touchstart', onTrigger, {passive: true});
      on('touchend', onMouseLeave as EventListener, {passive: true});
    }

    splitBySpaces(instance.props.trigger).forEach((eventType) => {
      if (eventType === 'manual') {
        return;
      }

      on(eventType, onTrigger);

      switch (eventType) {
        case 'mouseenter':
          on('mouseleave', onMouseLeave as EventListener);
          break;
        case 'focus':
          on(isIE ? 'focusout' : 'blur', onBlurOrFocusOut as EventListener);
          break;
        case 'focusin':
          on('focusout', onBlurOrFocusOut as EventListener);
          break;
      }
    });
  }

  function removeListeners(): void {
    listeners.forEach(({node, eventType, handler, options}: ListenerObject) => {
      node.removeEventListener(eventType, handler, options);
    });
    listeners = [];
  }

  function onTrigger(event: Event): void {
    let shouldScheduleClickHide = false;

    if (
      !instance.state.isEnabled ||
      isEventListenerStopped(event) ||
      didHideDueToDocumentMouseDown
    ) {
      return;
    }

    const wasFocused = lastTriggerEvent?.type === 'focus';

    lastTriggerEvent = event;
    currentTarget = event.currentTarget as Element;

    handleAriaExpandedAttribute();

    if (!instance.state.isVisible && isMouseEvent(event)) {
      // If scrolling, `mouseenter` events can be fired if the cursor lands
      // over a new target, but `mousemove` events don't get fired. This
      // causes interactive tooltips to get stuck open until the cursor is
      // moved
      mouseMoveListeners.forEach((listener) => listener(event));
    }

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      (instance.props.trigger.indexOf('mouseenter') < 0 ||
        isVisibleFromClick) &&
      instance.props.hideOnClick !== false &&
      instance.state.isVisible
    ) {
      shouldScheduleClickHide = true;
    } else {
      scheduleShow(event);
    }

    if (event.type === 'click') {
      isVisibleFromClick = !shouldScheduleClickHide;
    }

    if (shouldScheduleClickHide && !wasFocused) {
      scheduleHide(event);
    }
  }

  function onMouseMove(event: MouseEvent): void {
    const target = event.target as Node;
    const isCursorOverReferenceOrPopper =
      getCurrentTarget().contains(target) || popper.contains(target);

    if (event.type === 'mousemove' && isCursorOverReferenceOrPopper) {
      return;
    }

    const popperTreeData = getNestedPopperTree()
      .concat(popper)
      .map((popper) => {
        const instance = popper._tippy!;
        const state = instance.popperInstance?.state;

        if (state) {
          return {
            popperRect: popper.getBoundingClientRect(),
            popperState: state,
            props,
          };
        }

        return null;
      })
      .filter(Boolean) as PopperTreeData[];

    if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
      cleanupInteractiveMouseListeners();
      scheduleHide(event);
    }
  }

  function onMouseLeave(event: MouseEvent): void {
    const shouldBail =
      isEventListenerStopped(event) ||
      (instance.props.trigger.indexOf('click') >= 0 && isVisibleFromClick);

    if (shouldBail) {
      return;
    }

    if (instance.props.interactive) {
      instance.hideWithInteractivity(event);
      return;
    }

    scheduleHide(event);
  }

  function onBlurOrFocusOut(event: FocusEvent): void {
    if (
      instance.props.trigger.indexOf('focusin') < 0 &&
      event.target !== getCurrentTarget()
    ) {
      return;
    }

    // If focus was moved to within the popper
    if (
      instance.props.interactive &&
      event.relatedTarget &&
      popper.contains(event.relatedTarget as Element)
    ) {
      return;
    }

    scheduleHide(event);
  }

  function isEventListenerStopped(event: Event): boolean {
    return currentInput.isTouch
      ? getIsCustomTouchBehavior() !== event.type.indexOf('touch') >= 0
      : false;
  }

  function createPopperInstance(): void {
    destroyPopperInstance();

    const {
      popperOptions,
      placement,
      offset,
      getReferenceClientRect,
      moveTransition,
    } = instance.props;

    const arrow = getIsDefaultRenderFn() ? getChildren(popper).arrow : null;

    const computedReference = getReferenceClientRect
      ? {
          getBoundingClientRect: getReferenceClientRect,
          contextElement:
            getReferenceClientRect.contextElement || getCurrentTarget(),
        }
      : reference;

    const tippyModifier: Modifier<'$$tippy', {}> = {
      name: '$$tippy',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn({state}) {
        if (getIsDefaultRenderFn()) {
          const {box} = getDefaultTemplateChildren();

          ['placement', 'reference-hidden', 'escaped'].forEach((attr) => {
            if (attr === 'placement') {
              box.setAttribute('data-placement', state.placement);
            } else {
              if (state.attributes.popper[`data-popper-${attr}`]) {
                box.setAttribute(`data-${attr}`, '');
              } else {
                box.removeAttribute(`data-${attr}`);
              }
            }
          });

          state.attributes.popper = {};
        }
      },
    };

    type TippyModifier = Modifier<'$$tippy', {}>;
    type ExtendedModifiers = StrictModifiers | Partial<TippyModifier>;

    const modifiers: Array<ExtendedModifiers> = [
      {
        name: 'offset',
        options: {
          offset,
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: {
            top: 2,
            bottom: 2,
            left: 5,
            right: 5,
          },
        },
      },
      {
        name: 'flip',
        options: {
          padding: 5,
        },
      },
      {
        name: 'computeStyles',
        options: {
          adaptive: !moveTransition,
        },
      },
      tippyModifier,
    ];

    if (getIsDefaultRenderFn() && arrow) {
      modifiers.push({
        name: 'arrow',
        options: {
          element: arrow,
          padding: 3,
        },
      });
    }

    modifiers.push(...(popperOptions?.modifiers || []));

    instance.popperInstance = createPopper<ExtendedModifiers>(
      computedReference,
      popper,
      {
        ...popperOptions,
        placement,
        onFirstUpdate,
        modifiers,
      }
    );
  }

  function destroyPopperInstance(): void {
    if (instance.popperInstance) {
      instance.popperInstance.destroy();
      instance.popperInstance = null;
    }
  }

  function mount(): void {
    const {appendTo} = instance.props;

    let parentNode: any;

    // By default, we'll append the popper to the triggerTargets's parentNode so
    // it's directly after the reference element so the elements inside the
    // tippy can be tabbed to
    // If there are clipping issues, the user can specify a different appendTo
    // and ensure focus management is handled correctly manually
    const node = getCurrentTarget();

    if (
      (instance.props.interactive && appendTo === defaultProps.appendTo) ||
      appendTo === 'parent'
    ) {
      parentNode = node.parentNode;
    } else {
      parentNode = invokeWithArgsOrReturn(appendTo, [node]);
    }

    // The popper element needs to exist on the DOM before its position can be
    // updated as Popper needs to read its dimensions
    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper);
    }

    createPopperInstance();

    /* istanbul ignore else */
    if (__DEV__) {
      // Accessibility check
      warnWhen(
        instance.props.interactive &&
          appendTo === defaultProps.appendTo &&
          node.nextElementSibling !== popper,
        [
          'Interactive tippy element may not be accessible via keyboard',
          'navigation because it is not directly after the reference element',
          'in the DOM source order.',
          '\n\n',
          'Using a wrapper <div> or <span> tag around the reference element',
          'solves this by creating a new parentNode context.',
          '\n\n',
          'Specifying `appendTo: document.body` silences this warning, but it',
          'assumes you are using a focus management solution to handle',
          'keyboard navigation.',
          '\n\n',
          'See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity',
        ].join(' ')
      );
    }
  }

  function getNestedPopperTree(): PopperElement[] {
    return arrayFrom(
      popper.querySelectorAll('[data-__NAMESPACE_PREFIX__-root]')
    );
  }

  function scheduleShow(event?: Event): void {
    instance.clearDelayTimeouts();

    if (event) {
      invokeHook('onTrigger', [instance, event]);
    }

    addDocumentPress();

    let delay = getDelay(true);
    const [touchValue, touchDelay] = getNormalizedTouchSettings();

    if (currentInput.isTouch && touchValue === 'hold' && touchDelay) {
      delay = touchDelay;
    }

    if (delay) {
      showTimeout = setTimeout(() => {
        instance.show();
      }, delay);
    } else {
      instance.show();
    }
  }

  function scheduleHide(event: Event): void {
    instance.clearDelayTimeouts();

    invokeHook('onUntrigger', [instance, event]);

    if (!instance.state.isVisible) {
      removeDocumentPress();

      return;
    }

    // For interactive tippies, scheduleHide is added to a document.body handler
    // from onMouseLeave so must intercept scheduled hides from mousemove/leave
    // events when trigger contains mouseenter and click, and the tip is
    // currently shown as a result of a click.
    if (
      instance.props.trigger.indexOf('mouseenter') >= 0 &&
      instance.props.trigger.indexOf('click') >= 0 &&
      ['mouseleave', 'mousemove'].indexOf(event.type) >= 0 &&
      isVisibleFromClick
    ) {
      return;
    }

    const delay = getDelay(false);

    if (delay) {
      hideTimeout = setTimeout(() => {
        if (instance.state.isVisible) {
          instance.hide();
        }
      }, delay);
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      scheduleHideAnimationFrame = requestAnimationFrame(() => {
        instance.hide();
      });
    }
  }

  // ===========================================================================
  // 🔑 Public methods
  // ===========================================================================
  function enable(): void {
    instance.state.isEnabled = true;
  }

  function disable(): void {
    // Disabling the instance should also hide it
    // https://github.com/atomiks/tippy.js-react/issues/106
    instance.hide();
    instance.state.isEnabled = false;
  }

  function clearDelayTimeouts(): void {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    cancelAnimationFrame(scheduleHideAnimationFrame);
  }

  function setProps(partialProps: Partial<Props>): void {
    /* istanbul ignore else */
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    invokeHook('onBeforeUpdate', [instance, partialProps]);

    removeListeners();

    const prevProps = instance.props;
    const nextProps = evaluateProps(reference, {
      ...instance.props,
      ...partialProps,
      ignoreAttributes: true,
    });

    instance.props = nextProps;

    addListeners();

    if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
      cleanupInteractiveMouseListeners();
      debouncedOnMouseMove = debounce(
        onMouseMove,
        nextProps.interactiveDebounce
      );
    }

    // Ensure stale aria-expanded attributes are removed
    if (prevProps.triggerTarget && !nextProps.triggerTarget) {
      normalizeToArray(prevProps.triggerTarget).forEach((node) => {
        node.removeAttribute('aria-expanded');
      });
    } else if (nextProps.triggerTarget) {
      reference.removeAttribute('aria-expanded');
    }

    handleAriaExpandedAttribute();
    handleStyles();

    if (onUpdate) {
      onUpdate(prevProps, nextProps);
    }

    if (instance.popperInstance) {
      createPopperInstance();

      // Fixes an issue with nested tippies if they are all getting re-rendered,
      // and the nested ones get re-rendered first.
      // https://github.com/atomiks/tippyjs-react/issues/177
      // TODO: find a cleaner / more efficient solution(!)
      getNestedPopperTree().forEach((nestedPopper) => {
        // React (and other UI libs likely) requires a rAF wrapper as it flushes
        // its work in one
        requestAnimationFrame(nestedPopper._tippy!.popperInstance!.forceUpdate);
      });
    }

    invokeHook('onAfterUpdate', [instance, partialProps]);
  }

  function setContent(content: Content): void {
    instance.setProps({content});
  }

  function show(): void {
    /* istanbul ignore else */
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
    }

    // Early bail-out
    const isAlreadyVisible = instance.state.isVisible;
    const isDestroyed = instance.state.isDestroyed;
    const isDisabled = !instance.state.isEnabled;
    const isTouchAndTouchDisabled =
      currentInput.isTouch && !instance.props.touch;
    const duration = getValueAtIndexOrReturn(
      instance.props.duration,
      0,
      defaultProps.duration
    );

    if (
      isAlreadyVisible ||
      isDestroyed ||
      isDisabled ||
      isTouchAndTouchDisabled
    ) {
      return;
    }

    // Normalize `disabled` behavior across browsers.
    // Firefox allows events on disabled elements, but Chrome doesn't.
    // Using a wrapper element (i.e. <span>) is recommended.
    if (getCurrentTarget().hasAttribute('disabled')) {
      return;
    }

    invokeHook('onShow', [instance], false);
    if (instance.props.onShow(instance) === false) {
      return;
    }

    instance.state.isVisible = true;

    if (getIsDefaultRenderFn()) {
      popper.style.visibility = 'visible';
    }

    handleStyles();
    addDocumentPress();

    if (!instance.state.isMounted) {
      popper.style.transition = 'none';
    }

    // If flipping to the opposite side after hiding at least once, the
    // animation will use the wrong placement without resetting the duration
    if (getIsDefaultRenderFn()) {
      const {box, content} = getDefaultTemplateChildren();
      setTransitionDuration([box, content], 0);
    }

    onFirstUpdate = (): void => {
      if (!instance.state.isVisible || ignoreOnFirstUpdate) {
        return;
      }

      ignoreOnFirstUpdate = true;

      // reflow
      void popper.offsetHeight;

      popper.style.transition = instance.props.moveTransition;

      if (getIsDefaultRenderFn() && instance.props.animation) {
        const {box, content} = getDefaultTemplateChildren();
        setTransitionDuration([box, content], duration);
        setVisibilityState([box, content], 'visible');
      }

      handleAriaContentAttribute();
      handleAriaExpandedAttribute();

      pushIfUnique(mountedInstances, instance);

      // certain modifiers (e.g. `maxSize`) require a second update after the
      // popper has been positioned for the first time
      instance.popperInstance?.forceUpdate();

      instance.state.isMounted = true;
      invokeHook('onMount', [instance]);

      if (instance.props.animation && getIsDefaultRenderFn()) {
        onTransitionedIn(duration, () => {
          instance.state.isShown = true;
          invokeHook('onShown', [instance]);
        });
      }
    };

    mount();
  }

  function hide(): void {
    /* istanbul ignore else */
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
    }

    // Early bail-out
    const isAlreadyHidden = !instance.state.isVisible;
    const isDestroyed = instance.state.isDestroyed;
    const isDisabled = !instance.state.isEnabled;
    const duration = getValueAtIndexOrReturn(
      instance.props.duration,
      1,
      defaultProps.duration
    );

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return;
    }

    invokeHook('onHide', [instance], false);
    if (instance.props.onHide(instance) === false) {
      return;
    }

    instance.state.isVisible = false;
    instance.state.isShown = false;
    ignoreOnFirstUpdate = false;
    isVisibleFromClick = false;

    if (getIsDefaultRenderFn()) {
      popper.style.visibility = 'hidden';
    }

    cleanupInteractiveMouseListeners();
    removeDocumentPress();
    handleStyles();

    if (getIsDefaultRenderFn()) {
      const {box, content} = getDefaultTemplateChildren();

      if (instance.props.animation) {
        setTransitionDuration([box, content], duration);
        setVisibilityState([box, content], 'hidden');
      }
    }

    handleAriaContentAttribute();
    handleAriaExpandedAttribute();

    if (instance.props.animation) {
      if (getIsDefaultRenderFn()) {
        onTransitionedOut(duration, instance.unmount);
      }
    } else {
      instance.unmount();
    }
  }

  function hideWithInteractivity(event: MouseEvent): void {
    /* istanbul ignore else */
    if (__DEV__) {
      warnWhen(
        instance.state.isDestroyed,
        createMemoryLeakWarning('hideWithInteractivity')
      );
    }

    getDocument().addEventListener('mousemove', debouncedOnMouseMove);
    pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
    debouncedOnMouseMove(event);
  }

  function unmount(): void {
    /* istanbul ignore else */
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('unmount'));
    }

    if (instance.state.isVisible) {
      instance.hide();
    }

    if (!instance.state.isMounted) {
      return;
    }

    destroyPopperInstance();

    // If a popper is not interactive, it will be appended outside the popper
    // tree by default. This seems mainly for interactive tippies, but we should
    // find a workaround if possible
    getNestedPopperTree().forEach((nestedPopper) => {
      nestedPopper._tippy!.unmount();
    });

    if (popper.parentNode) {
      popper.parentNode.removeChild(popper);
    }

    mountedInstances = mountedInstances.filter((i) => i !== instance);

    instance.state.isMounted = false;
    invokeHook('onHidden', [instance]);
  }

  function destroy(): void {
    /* istanbul ignore else */
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    instance.clearDelayTimeouts();
    instance.unmount();

    removeListeners();

    delete reference._tippy;

    instance.state.isDestroyed = true;

    invokeHook('onDestroy', [instance]);
  }
}
