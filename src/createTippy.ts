import Popper from 'popper.js';
import {
  ReferenceElement,
  PopperInstance,
  Props,
  Instance,
  Content,
  LifecycleHooks,
  PopperElement,
} from './types';
import {ListenerObject} from './types-internal';
import {isIE, updateIOSClass} from './browser';
import {PASSIVE, POPPER_SELECTOR} from './constants';
import {currentInput} from './bindGlobalEventListeners';
import {
  defaultProps,
  POPPER_INSTANCE_DEPENDENCIES,
  getExtendedProps,
  evaluateProps,
  validateProps,
} from './props';
import {
  createPopperElement,
  updatePopperElement,
  getChildren,
  getBasePlacement,
  updateTransitionEndListener,
  isCursorOutsideInteractiveBorder,
} from './popper';
import {
  hasOwnProperty,
  getValueAtIndexOrReturn,
  getModifier,
  includes,
  invokeWithArgsOrReturn,
  setTransitionDuration,
  setVisibilityState,
  debounce,
  preserveInvocation,
  closestCallback,
  splitBySpaces,
  normalizeToArray,
  useIfDefined,
  isMouseEvent,
  getOwnerDocument,
  pushIfUnique,
  arrayFrom,
  unique,
  getUnitsInPx,
  reflow,
  setModifierValue,
  getComputedPadding,
} from './utils';
import {warnWhen, createMemoryLeakWarning} from './validation';

let idCounter = 1;
let mouseMoveListeners: ((event: MouseEvent) => void)[] = [];

/**
 * Used by `hideAll()`
 */
export let mountedInstances: Instance[] = [];

/**
 * Creates and returns a Tippy object. We're using a closure pattern instead of
 * a class so that the exposed object API is clean without private members
 * prefixed with `_`.
 */
export default function createTippy(
  reference: ReferenceElement,
  collectionProps: Props,
): Instance | null {
  const props = getExtendedProps(evaluateProps(reference, collectionProps));

  // If the reference shouldn't have multiple tippys, return null early
  if (!props.multiple && reference._tippy) {
    return null;
  }

  /* ======================= 🔒 Private members 🔒 ======================= */
  let showTimeout: any;
  let hideTimeout: any;
  let scheduleHideAnimationFrame: number;
  let isBeingDestroyed = false;
  let didHideDueToDocumentMouseDown = false;
  let popperUpdates = 0;
  let lastTriggerEvent: Event;
  let currentMountCallback: () => void;
  let currentTransitionEndListener: (event: TransitionEvent) => void;
  let listeners: ListenerObject[] = [];
  let debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce);
  let currentTarget: Element;

  // Support iframe contexts
  // Static check that assumes any of the `triggerTarget` or `reference`
  // nodes will never change documents, even when they are updated
  const doc = getOwnerDocument(props.triggerTarget || reference);

  /* ======================= 🔑 Public members 🔑 ======================= */
  const id = idCounter++;
  const popper = createPopperElement(id, props);
  const popperChildren = getChildren(popper);
  const popperInstance: PopperInstance | null = null;
  const plugins = unique(props.plugins);

  // These two elements are static
  const {tooltip, content} = popperChildren;
  const transitionableElements = [tooltip, content];

  const state = {
    // The current real placement (`data-placement` attribute)
    currentPlacement: null,
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
    popper,
    popperChildren,
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
    enable,
    disable,
    destroy,
  };

  /* ==================== Initial instance mutations =================== */
  reference._tippy = instance;
  popper._tippy = instance;

  const pluginsHooks = plugins.map(plugin => plugin.fn(instance));

  addListenersToTriggerTarget();
  handleAriaExpandedAttribute();

  if (!props.lazy) {
    createPopperInstance();
  }

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

  popper.addEventListener('mouseleave', () => {
    if (
      instance.props.interactive &&
      includes(instance.props.trigger, 'mouseenter')
    ) {
      doc.addEventListener('mousemove', debouncedOnMouseMove);
    }
  });

  return instance;

  /* ======================= 🔒 Private methods 🔒 ======================= */
  function getNormalizedTouchSettings(): [string | boolean, number] {
    const {touch} = instance.props;
    return Array.isArray(touch) ? touch : [touch, 0];
  }

  function getIsCustomTouchBehavior(): boolean {
    return getNormalizedTouchSettings()[0] === 'hold';
  }

  function getCurrentTarget(): Element {
    return currentTarget || reference;
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
      defaultProps.delay,
    );
  }

  function invokeHook(
    hook: keyof LifecycleHooks,
    args: [Instance, (Event | Partial<Props>)?],
    shouldInvokePropsHook = true,
  ): void {
    pluginsHooks.forEach(pluginHooks => {
      if (hasOwnProperty(pluginHooks, hook)) {
        // @ts-ignore
        pluginHooks[hook](...args);
      }
    });

    if (shouldInvokePropsHook) {
      // @ts-ignore
      instance.props[hook](...args);
    }
  }

  function handleAriaDescribedByAttribute(): void {
    const {aria} = instance.props;

    if (!aria) {
      return;
    }

    const attr = `aria-${aria}`;
    const id = tooltip.id;
    const nodes = normalizeToArray(instance.props.triggerTarget || reference);

    nodes.forEach(node => {
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
    const nodes = normalizeToArray(instance.props.triggerTarget || reference);

    nodes.forEach(node => {
      if (instance.props.interactive) {
        node.setAttribute(
          'aria-expanded',
          instance.state.isVisible && node === getCurrentTarget()
            ? 'true'
            : 'false',
        );
      } else {
        node.removeAttribute('aria-expanded');
      }
    });
  }

  function cleanupInteractiveMouseListeners(): void {
    doc.body.removeEventListener('mouseleave', scheduleHide);
    doc.removeEventListener('mousemove', debouncedOnMouseMove);
    mouseMoveListeners = mouseMoveListeners.filter(
      listener => listener !== debouncedOnMouseMove,
    );
  }

  function onDocumentMouseDown(event: MouseEvent): void {
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
        includes(instance.props.trigger, 'click')
      ) {
        return;
      }
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
        removeDocumentMouseDownListener();
      }
    }
  }

  function addDocumentMouseDownListener(): void {
    doc.addEventListener('mousedown', onDocumentMouseDown, true);
  }

  function removeDocumentMouseDownListener(): void {
    doc.removeEventListener('mousedown', onDocumentMouseDown, true);
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
    function listener(event: TransitionEvent): void {
      if (event.target === tooltip) {
        updateTransitionEndListener(tooltip, 'remove', listener);
        callback();
      }
    }

    // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise
    if (duration === 0) {
      return callback();
    }

    updateTransitionEndListener(
      tooltip,
      'remove',
      currentTransitionEndListener,
    );
    updateTransitionEndListener(tooltip, 'add', listener);

    currentTransitionEndListener = listener;
  }

  function on(
    eventType: string,
    handler: EventListener,
    options: boolean | object = false,
  ): void {
    const nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(node => {
      node.addEventListener(eventType, handler, options);
      listeners.push({node, eventType, handler, options});
    });
  }

  function addListenersToTriggerTarget(): void {
    if (getIsCustomTouchBehavior()) {
      on('touchstart', onTrigger, PASSIVE);
      on('touchend', onMouseLeave as EventListener, PASSIVE);
    }

    splitBySpaces(instance.props.trigger).forEach(eventType => {
      if (eventType === 'manual') {
        return;
      }

      on(eventType, onTrigger);

      switch (eventType) {
        case 'mouseenter':
          on('mouseleave', onMouseLeave as EventListener);
          break;
        case 'focus':
          on(isIE ? 'focusout' : 'blur', onBlur as EventListener);
          break;
      }
    });
  }

  function removeListenersFromTriggerTarget(): void {
    listeners.forEach(({node, eventType, handler, options}: ListenerObject) => {
      node.removeEventListener(eventType, handler, options);
    });
    listeners = [];
  }

  function onTrigger(event: Event): void {
    if (
      !instance.state.isEnabled ||
      isEventListenerStopped(event) ||
      didHideDueToDocumentMouseDown
    ) {
      return;
    }

    lastTriggerEvent = event;
    currentTarget = event.currentTarget as Element;

    handleAriaExpandedAttribute();

    if (!instance.state.isVisible && isMouseEvent(event)) {
      // If scrolling, `mouseenter` events can be fired if the cursor lands
      // over a new target, but `mousemove` events don't get fired. This
      // causes interactive tooltips to get stuck open until the cursor is
      // moved
      mouseMoveListeners.forEach(listener => listener(event));
    }

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      instance.props.hideOnClick !== false &&
      instance.state.isVisible
    ) {
      scheduleHide(event);
    } else {
      const [value, duration] = getNormalizedTouchSettings();

      if (currentInput.isTouch && value === 'hold' && duration) {
        // We can hijack the show timeout here, it will be cleared by
        // `scheduleHide()` when necessary
        showTimeout = setTimeout(() => {
          scheduleShow(event);
        }, duration);
      } else {
        scheduleShow(event);
      }
    }
  }

  function onMouseMove(event: MouseEvent): void {
    const isCursorOverReferenceOrPopper = closestCallback(
      event.target as Element,
      (el: Element) => el === reference || el === popper,
    );

    if (isCursorOverReferenceOrPopper) {
      return;
    }

    const popperTreeData = arrayFrom(popper.querySelectorAll(POPPER_SELECTOR))
      .concat(popper)
      .map((popper: PopperElement) => {
        const instance = popper._tippy!;
        const {tooltip} = instance.popperChildren;
        const {interactiveBorder} = instance.props;

        return {
          popperRect: popper.getBoundingClientRect(),
          tooltipRect: tooltip.getBoundingClientRect(),
          interactiveBorder,
        };
      });

    if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
      cleanupInteractiveMouseListeners();
      scheduleHide(event);
    }
  }

  function onMouseLeave(event: MouseEvent): void {
    if (isEventListenerStopped(event)) {
      return;
    }

    if (instance.props.interactive) {
      doc.body.addEventListener('mouseleave', scheduleHide);
      doc.addEventListener('mousemove', debouncedOnMouseMove);
      pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);

      return;
    }

    scheduleHide(event);
  }

  function onBlur(event: FocusEvent): void {
    if (event.target !== getCurrentTarget()) {
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
    const supportsTouch = 'ontouchstart' in window;
    const isTouchEvent = includes(event.type, 'touch');
    const isCustomTouch = getIsCustomTouchBehavior();

    return (
      (supportsTouch &&
        currentInput.isTouch &&
        isCustomTouch &&
        !isTouchEvent) ||
      (currentInput.isTouch && !isCustomTouch && isTouchEvent)
    );
  }

  function createPopperInstance(): void {
    const {popperOptions} = instance.props;
    const {arrow} = instance.popperChildren;
    const flipModifier = getModifier(popperOptions, 'flip');
    const preventOverflowModifier = getModifier(
      popperOptions,
      'preventOverflow',
    );

    let distancePx: number;

    function applyMutations(data: Popper.Data): void {
      const prevPlacement = instance.state.currentPlacement;
      instance.state.currentPlacement = data.placement;

      if (instance.props.flip && !instance.props.flipOnUpdate) {
        if (data.flipped) {
          instance.popperInstance!.options.placement = data.placement;
        }

        setModifierValue(
          instance.popperInstance!.modifiers,
          'flip',
          'enabled',
          false,
        );
      }

      tooltip.setAttribute('data-placement', data.placement);
      if (data.attributes['x-out-of-boundaries'] !== false) {
        tooltip.setAttribute('data-out-of-boundaries', '');
      } else {
        tooltip.removeAttribute('data-out-of-boundaries');
      }

      const basePlacement = getBasePlacement(data.placement);

      const isVerticalPlacement = includes(['top', 'bottom'], basePlacement);
      const isSecondaryPlacement = includes(['bottom', 'right'], basePlacement);

      // Apply `distance` prop
      tooltip.style.top = '0';
      tooltip.style.left = '0';
      tooltip.style[isVerticalPlacement ? 'top' : 'left'] =
        (isSecondaryPlacement ? 1 : -1) * distancePx + 'px';

      // Careful not to cause an infinite loop here
      // Fixes https://github.com/FezVrasta/popper.js/issues/784
      if (prevPlacement && prevPlacement !== data.placement) {
        instance.popperInstance!.update();
      }
    }

    const config: Popper.PopperOptions = {
      eventsEnabled: false,
      placement: instance.props.placement,
      ...popperOptions,
      modifiers: {
        ...(popperOptions && popperOptions.modifiers),
        // We can't use `padding` on the popper el because of these bugs when
        // flipping from a vertical to horizontal placement or vice-versa,
        // there is severe flickering.
        // https://github.com/FezVrasta/popper.js/issues/720
        // This workaround increases bundle size by 250B minzip unfortunately,
        // due to need to custom compute the distance (since Popper rect does
        // not get affected by the inner tooltip's distance offset)
        tippyDistance: {
          enabled: true,
          order: 0,
          fn(data: Popper.Data): Popper.Data {
            // `html` fontSize may change while `popperInstance` is alive
            // e.g. on resize in media queries
            distancePx = getUnitsInPx(doc, instance.props.distance);

            const basePlacement = getBasePlacement(data.placement);

            const computedPreventOverflowPadding = getComputedPadding(
              basePlacement,
              preventOverflowModifier && preventOverflowModifier.padding,
              distancePx,
            );
            const computedFlipPadding = getComputedPadding(
              basePlacement,
              flipModifier && flipModifier.padding,
              distancePx,
            );

            const instanceModifiers = instance.popperInstance!.modifiers;

            setModifierValue(
              instanceModifiers,
              'preventOverflow',
              'padding',
              computedPreventOverflowPadding,
            );
            setModifierValue(
              instanceModifiers,
              'flip',
              'padding',
              computedFlipPadding,
            );

            return data;
          },
        },
        preventOverflow: {
          boundariesElement: instance.props.boundary,
          ...preventOverflowModifier,
        },
        flip: {
          enabled: instance.props.flip,
          behavior: instance.props.flipBehavior,
          ...flipModifier,
        },
        arrow: {
          element: arrow,
          enabled: !!arrow,
          ...getModifier(popperOptions, 'arrow'),
        },
        offset: {
          offset: instance.props.offset,
          ...getModifier(popperOptions, 'offset'),
        },
      },
      onCreate(data: Popper.Data): void {
        applyMutations(data);

        preserveInvocation(
          popperOptions && popperOptions.onCreate,
          config.onCreate,
          [data],
        );

        runMountCallback();
      },
      onUpdate(data: Popper.Data): void {
        applyMutations(data);

        preserveInvocation(
          popperOptions && popperOptions.onUpdate,
          config.onUpdate,
          [data],
        );

        runMountCallback();
      },
    };

    instance.popperInstance = new Popper(
      reference,
      popper,
      config,
    ) as PopperInstance;
  }

  function runMountCallback(): void {
    // Only invoke currentMountCallback after 2 updates
    // This fixes some bugs in Popper.js (TODO: aim for only 1 update)
    if (popperUpdates === 0) {
      popperUpdates++; // 1
      instance.popperInstance!.update();
    } else if (currentMountCallback && popperUpdates === 1) {
      popperUpdates++; // 2
      reflow(popper);
      currentMountCallback();
    }
  }

  function mount(): void {
    // The mounting callback (`currentMountCallback`) is only run due to a
    // popperInstance update/create
    popperUpdates = 0;

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
    // updated as Popper.js needs to read its dimensions
    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper);
    }

    if (__DEV__) {
      // Accessibility check
      warnWhen(
        instance.props.interactive &&
          appendTo === defaultProps.appendTo &&
          node.nextElementSibling !== popper,
        `Interactive tippy element may not be accessible via keyboard
        navigation because it is not directly after the reference element in
        the DOM source order.

        Using a wrapper <div> or <span> tag around the reference element solves
        this by creating a new parentNode context.
        
        Specifying \`appendTo: document.body\` silences this warning, but it
        assumes you are using a focus management solution to handle keyboard
        navigation.
        
        See: https://atomiks.github.io/tippyjs/accessibility/#interactivity`,
      );
    }

    setModifierValue(
      instance.popperInstance!.modifiers,
      'flip',
      'enabled',
      instance.props.flip,
    );

    instance.popperInstance!.enableEventListeners();

    // Mounting callback invoked in `onUpdate`
    instance.popperInstance!.update();
  }

  function scheduleShow(event?: Event): void {
    instance.clearDelayTimeouts();

    if (!instance.popperInstance) {
      createPopperInstance();
    }

    if (event) {
      invokeHook('onTrigger', [instance, event]);
    }

    addDocumentMouseDownListener();

    const delay = getDelay(true);

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
      removeDocumentMouseDownListener();

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

  /* ======================= 🔑 Public methods 🔑 ======================= */
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
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    if (__DEV__) {
      validateProps(partialProps, plugins);
      warnWhen(
        partialProps.plugins
          ? partialProps.plugins.length !== plugins.length ||
              plugins.some((p, i) => {
                if (partialProps.plugins && partialProps.plugins[i]) {
                  return p !== partialProps.plugins[i];
                } else {
                  return true;
                }
              })
          : false,
        `Cannot update plugins`,
      );
    }

    invokeHook('onBeforeUpdate', [instance, partialProps]);

    removeListenersFromTriggerTarget();

    const prevProps = instance.props;
    const nextProps = evaluateProps(reference, {
      ...instance.props,
      ...partialProps,
      ignoreAttributes: true,
    });

    nextProps.ignoreAttributes = useIfDefined(
      partialProps.ignoreAttributes,
      prevProps.ignoreAttributes,
    );

    instance.props = nextProps;

    addListenersToTriggerTarget();

    if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
      cleanupInteractiveMouseListeners();
      debouncedOnMouseMove = debounce(
        onMouseMove,
        nextProps.interactiveDebounce,
      );
    }

    updatePopperElement(popper, prevProps, nextProps);
    instance.popperChildren = getChildren(popper);

    // Ensure stale aria-expanded attributes are removed
    if (prevProps.triggerTarget && !nextProps.triggerTarget) {
      normalizeToArray(prevProps.triggerTarget).forEach(node => {
        node.removeAttribute('aria-expanded');
      });
    } else if (nextProps.triggerTarget) {
      reference.removeAttribute('aria-expanded');
    }

    handleAriaExpandedAttribute();

    if (instance.popperInstance) {
      if (
        POPPER_INSTANCE_DEPENDENCIES.some(prop => {
          return (
            hasOwnProperty(partialProps, prop as string) &&
            partialProps[prop] !== prevProps[prop]
          );
        })
      ) {
        instance.popperInstance.destroy();
        createPopperInstance();

        if (instance.state.isVisible) {
          instance.popperInstance.enableEventListeners();
        }
      } else {
        instance.popperInstance.update();
      }
    }

    invokeHook('onAfterUpdate', [instance, partialProps]);
  }

  function setContent(content: Content): void {
    instance.setProps({content});
  }

  function show(
    duration = getValueAtIndexOrReturn(
      instance.props.duration,
      0,
      defaultProps.duration,
    ),
  ): void {
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
    }

    // Early bail-out
    const isAlreadyVisible = instance.state.isVisible;
    const isDestroyed = instance.state.isDestroyed;
    const isDisabled = !instance.state.isEnabled;
    const isTouchAndTouchDisabled =
      currentInput.isTouch && !instance.props.touch;

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

    if (!instance.popperInstance) {
      createPopperInstance();
    }

    invokeHook('onShow', [instance], false);
    if (instance.props.onShow(instance) === false) {
      return;
    }

    addDocumentMouseDownListener();

    popper.style.visibility = 'visible';
    instance.state.isVisible = true;

    // Prevent a transition of the popper from its previous position and of the
    // elements at a different placement
    // Check if the tippy was fully unmounted before `show()` was called, to
    // allow for smooth transition for `createSingleton()`
    if (!instance.state.isMounted) {
      setTransitionDuration(transitionableElements.concat(popper), 0);
    }

    currentMountCallback = (): void => {
      if (!instance.state.isVisible) {
        return;
      }

      setTransitionDuration([popper], instance.props.updateDuration);
      setTransitionDuration(transitionableElements, duration);
      setVisibilityState(transitionableElements, 'visible');

      handleAriaDescribedByAttribute();
      handleAriaExpandedAttribute();

      pushIfUnique(mountedInstances, instance);

      updateIOSClass(true);

      instance.state.isMounted = true;
      invokeHook('onMount', [instance]);

      onTransitionedIn(duration, () => {
        instance.state.isShown = true;
        invokeHook('onShown', [instance]);
      });
    };

    mount();
  }

  function hide(
    duration = getValueAtIndexOrReturn(
      instance.props.duration,
      1,
      defaultProps.duration,
    ),
  ): void {
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
    }

    // Early bail-out
    const isAlreadyHidden = !instance.state.isVisible && !isBeingDestroyed;
    const isDestroyed = instance.state.isDestroyed;
    const isDisabled = !instance.state.isEnabled && !isBeingDestroyed;

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return;
    }

    invokeHook('onHide', [instance], false);
    if (instance.props.onHide(instance) === false && !isBeingDestroyed) {
      return;
    }

    removeDocumentMouseDownListener();

    popper.style.visibility = 'hidden';
    instance.state.isVisible = false;
    instance.state.isShown = false;

    setTransitionDuration(transitionableElements, duration);
    setVisibilityState(transitionableElements, 'hidden');

    handleAriaDescribedByAttribute();
    handleAriaExpandedAttribute();

    onTransitionedOut(duration, () => {
      instance.popperInstance!.disableEventListeners();
      instance.popperInstance!.options.placement = instance.props.placement;

      popper.parentNode!.removeChild(popper);

      mountedInstances = mountedInstances.filter(i => i !== instance);

      if (mountedInstances.length === 0) {
        updateIOSClass(false);
      }

      instance.state.isMounted = false;
      invokeHook('onHidden', [instance]);
    });
  }

  function destroy(): void {
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    isBeingDestroyed = true;

    instance.clearDelayTimeouts();
    instance.hide(0);

    removeListenersFromTriggerTarget();

    delete reference._tippy;

    if (instance.popperInstance) {
      instance.popperInstance.destroy();
    }

    isBeingDestroyed = false;
    instance.state.isDestroyed = true;

    invokeHook('onDestroy', [instance]);
  }
}
