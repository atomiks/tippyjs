import Popper from 'popper.js'
import {
  ReferenceElement,
  PopperInstance,
  Props,
  Options,
  Instance,
  Content,
  Listener,
  VirtualReference,
} from './types'
import { isIE } from './browser'
import { closest, closestCallback, arrayFrom } from './ponyfills'
import {
  PASSIVE,
  PADDING,
  PLACEMENT_ATTRIBUTE,
  OUT_OF_BOUNDARIES_ATTRIBUTE,
  ACTIVE_CLASS,
  POPPER_SELECTOR,
} from './constants'
import { isUsingTouch } from './bindGlobalEventListeners'
import { defaultProps, POPPER_INSTANCE_DEPENDENCIES } from './props'
import {
  createPopperElement,
  updatePopperElement,
  getChildren,
  getBasicPlacement,
  updateTransitionEndListener,
  isCursorOutsideInteractiveBorder,
  getOffsetDistanceInPx,
  reflow,
} from './popper'
import {
  hasOwnProperty,
  debounce,
  getValue,
  getModifier,
  includes,
  invokeWithArgsOrReturn,
  setFlipModifierEnabled,
  canReceiveFocus,
  validateOptions,
  evaluateProps,
  setTransitionDuration,
  setVisibilityState,
  isRealElement,
} from './utils'

let idCounter = 1
// Workaround for IE11's lack of new MouseEvent constructor
let mouseMoveListeners: ((event: MouseEvent) => void)[] = []

/**
 * Creates and returns a Tippy object. We're using a closure pattern instead of
 * a class so that the exposed object API is clean without private members
 * prefixed with `_`.
 */
export default function createTippy(
  reference: ReferenceElement | VirtualReference,
  collectionProps: Props,
): Instance | null {
  const props = evaluateProps(reference, collectionProps)

  // If the reference shouldn't have multiple tippys, return null early
  if (!props.multiple && reference._tippy) {
    return null
  }

  /* ======================= 🔒 Private members 🔒 ======================= */
  let lastTriggerEventType: string
  let lastMouseMoveEvent: MouseEvent
  let showTimeoutId: number
  let hideTimeoutId: number
  let scheduleHideAnimationFrameId: number
  let isScheduledToShow = false
  let isBeingDestroyed = false
  let previousPlacement: string
  let wasVisibleDuringPreviousUpdate = false
  let hasMountCallbackRun = false
  let currentMountCallback: () => void
  let currentTransitionEndListener: (event: TransitionEvent) => void
  let listeners: Listener[] = []
  let currentComputedPadding: {
    top: number
    bottom: number
    left: number
    right: number
    [key: string]: number
  }
  let debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce)

  /* ======================= 🔑 Public members 🔑 ======================= */
  const id = idCounter++
  const popper = createPopperElement(id, props)
  const popperChildren = getChildren(popper)
  const popperInstance: PopperInstance | null = null

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
  }

  const instance: Instance = {
    // properties
    id,
    reference,
    popper,
    popperChildren,
    popperInstance,
    props,
    state,
    // methods
    clearDelayTimeouts,
    set,
    setContent,
    show,
    hide,
    enable,
    disable,
    destroy,
  }

  /* ==================== Initial instance mutations =================== */
  reference._tippy = instance
  popper._tippy = instance

  addTriggersToReference()

  if (!props.lazy) {
    createPopperInstance()
  }

  if (props.showOnInit) {
    scheduleShow()
  }

  // Ensure the event listeners target can receive focus
  if (
    props.a11y &&
    !props.target &&
    !canReceiveFocus(getEventListenersTarget())
  ) {
    getEventListenersTarget().setAttribute('tabindex', '0')
  }

  // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding
  popper.addEventListener('mouseenter', (event: MouseEvent) => {
    if (
      instance.props.interactive &&
      instance.state.isVisible &&
      lastTriggerEventType === 'mouseenter'
    ) {
      // We don't want props.onTrigger() to be called here, since the `event`
      // object is not related to the reference element
      scheduleShow(event, true)
    }
  })
  popper.addEventListener('mouseleave', () => {
    if (instance.props.interactive && lastTriggerEventType === 'mouseenter') {
      document.addEventListener('mousemove', debouncedOnMouseMove)
    }
  })

  return instance

  /* ======================= 🔒 Private methods 🔒 ======================= */
  /**
   * Removes the follow cursor listener
   */
  function removeFollowCursorListener(): void {
    document.removeEventListener(
      'mousemove',
      positionVirtualReferenceNearCursor,
    )
  }

  /**
   * Cleans up interactive mouse listeners
   */
  function cleanupInteractiveMouseListeners(): void {
    document.body.removeEventListener('mouseleave', scheduleHide)
    document.removeEventListener('mousemove', debouncedOnMouseMove)
    mouseMoveListeners = mouseMoveListeners.filter(
      (listener): boolean => listener !== debouncedOnMouseMove,
    )
  }

  /**
   * Returns correct target used for event listeners
   */
  function getEventListenersTarget(): ReferenceElement | VirtualReference {
    return instance.props.triggerTarget || reference
  }

  /**
   * Adds the document click event listener for the instance
   */
  function addDocumentClickListener(): void {
    document.addEventListener('click', onDocumentClick, true)
  }

  /**
   * Removes the document click event listener for the instance
   */
  function removeDocumentClickListener(): void {
    document.removeEventListener('click', onDocumentClick, true)
  }

  /**
   * Returns transitionable inner elements used in show/hide methods
   */
  function getTransitionableElements(): (HTMLDivElement | null)[] {
    return [
      instance.popperChildren.tooltip,
      instance.popperChildren.backdrop,
      instance.popperChildren.content,
    ]
  }

  /**
   * Determines if the instance is in `followCursor` mode.
   * NOTE: in v5, touch devices will use `initial` behavior no matter the value.
   */
  function getIsInLooseFollowCursorMode(): boolean {
    const { followCursor } = instance.props
    return (
      (followCursor && lastTriggerEventType !== 'focus') ||
      (isUsingTouch && followCursor === 'initial')
    )
  }

  /**
   * Updates the tooltip's position on each animation frame
   */
  function makeSticky(): void {
    setTransitionDuration([popper], isIE ? 0 : instance.props.updateDuration)

    function updatePosition(): void {
      instance.popperInstance!.scheduleUpdate()

      if (instance.state.isMounted) {
        requestAnimationFrame(updatePosition)
      } else {
        setTransitionDuration([popper], 0)
      }
    }

    updatePosition()
  }

  /**
   * Invokes a callback once the tooltip has fully transitioned out
   */
  function onTransitionedOut(duration: number, callback: () => void): void {
    onTransitionEnd(duration, () => {
      if (
        !instance.state.isVisible &&
        popper.parentNode &&
        popper.parentNode.contains(popper)
      ) {
        callback()
      }
    })
  }

  /**
   * Invokes a callback once the tooltip has fully transitioned in
   */
  function onTransitionedIn(duration: number, callback: () => void): void {
    onTransitionEnd(duration, callback)
  }

  /**
   * Invokes a callback once the tooltip's CSS transition ends
   */
  function onTransitionEnd(duration: number, callback: () => void): void {
    const { tooltip } = instance.popperChildren

    /**
     * Listener added as the `transitionend` handler
     */
    function listener(event: TransitionEvent): void {
      if (event.target === tooltip) {
        updateTransitionEndListener(tooltip, 'remove', listener)
        callback()
      }
    }

    // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise
    if (duration === 0) {
      return callback()
    }

    updateTransitionEndListener(tooltip, 'remove', currentTransitionEndListener)
    updateTransitionEndListener(tooltip, 'add', listener)

    currentTransitionEndListener = listener
  }

  /**
   * Adds an event listener to the reference and stores it in `listeners`
   */
  function on(
    eventType: string,
    handler: EventListener,
    options: boolean | object = false,
  ): void {
    getEventListenersTarget().addEventListener(eventType, handler, options)
    listeners.push({ eventType, handler, options })
  }

  /**
   * Adds event listeners to the reference based on the `trigger` prop
   */
  function addTriggersToReference(): void {
    if (instance.props.touchHold && !instance.props.target) {
      on('touchstart', onTrigger, PASSIVE)
      on('touchend', onMouseLeave as EventListener, PASSIVE)
    }

    instance.props.trigger
      .trim()
      .split(' ')
      .forEach(eventType => {
        if (eventType === 'manual') {
          return
        }

        // Non-delegates
        if (!instance.props.target) {
          on(eventType, onTrigger)
          switch (eventType) {
            case 'mouseenter':
              on('mouseleave', onMouseLeave as EventListener)
              break
            case 'focus':
              on(isIE ? 'focusout' : 'blur', onBlur as EventListener)
              break
          }
        } else {
          // Delegates
          switch (eventType) {
            case 'mouseenter':
              on('mouseover', onDelegateShow)
              on('mouseout', onDelegateHide)
              break
            case 'focus':
              on('focusin', onDelegateShow)
              on('focusout', onDelegateHide)
              break
            case 'click':
              on(eventType, onDelegateShow)
              break
          }
        }
      })
  }

  /**
   * Removes event listeners from the reference
   */
  function removeTriggersFromReference(): void {
    listeners.forEach(({ eventType, handler, options }: Listener) => {
      getEventListenersTarget().removeEventListener(eventType, handler, options)
    })
    listeners = []
  }

  /**
   * Positions the virtual reference near the cursor
   */
  function positionVirtualReferenceNearCursor(event: MouseEvent): void {
    const { clientX: x, clientY: y } = (lastMouseMoveEvent = event)

    // Gets set once popperInstance `onCreate` has been called
    if (!currentComputedPadding) {
      return
    }

    // If the instance is interactive, avoid updating the position unless it's
    // over the reference element
    const isCursorOverReference = closestCallback(
      event.target as Element,
      (el: Element): boolean => el === reference,
    )

    const rect = reference.getBoundingClientRect()
    const { followCursor } = instance.props
    const isHorizontal = followCursor === 'horizontal'
    const isVertical = followCursor === 'vertical'

    // The virtual reference needs some size to prevent itself from overflowing
    const isVerticalPlacement = includes(
      ['top', 'bottom'],
      getBasicPlacement(popper),
    )
    const fullPlacement = popper.getAttribute(PLACEMENT_ATTRIBUTE)
    const isVariation = fullPlacement ? !!fullPlacement.split('-')[1] : false
    const size = isVerticalPlacement ? popper.offsetWidth : popper.offsetHeight
    const halfSize = size / 2
    const verticalIncrease = isVerticalPlacement
      ? 0
      : isVariation
      ? size
      : halfSize
    const horizontalIncrease = isVerticalPlacement
      ? isVariation
        ? size
        : halfSize
      : 0

    if (isCursorOverReference || !instance.props.interactive) {
      instance.popperInstance!.reference = {
        ...instance.popperInstance!.reference,
        // These `client` values don't get used by Popper.js if they are 0
        clientWidth: 0,
        clientHeight: 0,
        getBoundingClientRect: (): DOMRect | ClientRect => ({
          width: isVerticalPlacement ? size : 0,
          height: isVerticalPlacement ? 0 : size,
          top: (isHorizontal ? rect.top : y) - verticalIncrease,
          bottom: (isHorizontal ? rect.bottom : y) + verticalIncrease,
          left: (isVertical ? rect.left : x) - horizontalIncrease,
          right: (isVertical ? rect.right : x) + horizontalIncrease,
        }),
      }

      instance.popperInstance!.update()
    }

    if (followCursor === 'initial' && instance.state.isVisible) {
      removeFollowCursorListener()
    }
  }

  /**
   * Creates the tippy instance for a delegate when it's been triggered
   */
  function createDelegateChildTippy(event?: Event): void {
    if (event) {
      const targetEl: ReferenceElement | null = closest(
        event.target as Element,
        instance.props.target,
      )

      if (targetEl && !targetEl._tippy) {
        createTippy(targetEl, {
          ...instance.props,
          content: invokeWithArgsOrReturn(collectionProps.content, [targetEl]),
          appendTo: collectionProps.appendTo,
          target: '',
          showOnInit: true,
        })
      }
    }
  }

  /**
   * Event listener invoked upon trigger
   */
  function onTrigger(event: Event): void {
    if (!instance.state.isEnabled || isEventListenerStopped(event)) {
      return
    }

    if (!instance.state.isVisible) {
      lastTriggerEventType = event.type

      if (event instanceof MouseEvent) {
        lastMouseMoveEvent = event

        // If scrolling, `mouseenter` events can be fired if the cursor lands
        // over a new target, but `mousemove` events don't get fired. This
        // causes interactive tooltips to get stuck open until the cursor is
        // moved
        mouseMoveListeners.forEach((listener): void => listener(event))
      }
    }

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      instance.props.hideOnClick !== false &&
      instance.state.isVisible
    ) {
      scheduleHide()
    } else {
      scheduleShow(event)
    }
  }

  /**
   * Event listener used for interactive tooltips to detect when they should
   * hide
   */
  function onMouseMove(event: MouseEvent): void {
    const isCursorOverPopper =
      closest(event.target as Element, POPPER_SELECTOR) === popper
    const isCursorOverReference = closestCallback(
      event.target as Element,
      (el: Element) => el === reference,
    )

    if (isCursorOverPopper || isCursorOverReference) {
      return
    }

    if (
      isCursorOutsideInteractiveBorder(
        getBasicPlacement(popper),
        popper.getBoundingClientRect(),
        event,
        instance.props,
      )
    ) {
      cleanupInteractiveMouseListeners()
      scheduleHide()
    }
  }

  /**
   * Event listener invoked upon mouseleave
   */
  function onMouseLeave(event: MouseEvent): void {
    if (isEventListenerStopped(event)) {
      return
    }

    if (instance.props.interactive) {
      document.body.addEventListener('mouseleave', scheduleHide)
      document.addEventListener('mousemove', debouncedOnMouseMove)
      mouseMoveListeners.push(debouncedOnMouseMove)

      return
    }

    scheduleHide()
  }

  /**
   * Event listener invoked upon blur
   */
  function onBlur(event: FocusEvent): void {
    if (event.target !== getEventListenersTarget()) {
      return
    }

    if (
      instance.props.interactive &&
      event.relatedTarget &&
      popper.contains(event.relatedTarget as Element)
    ) {
      return
    }

    scheduleHide()
  }

  /**
   * Event listener invoked when a child target is triggered
   */
  function onDelegateShow(event: Event): void {
    if (closest(event.target as Element, instance.props.target)) {
      scheduleShow(event)
    }
  }

  /**
   * Event listener invoked when a child target should hide
   */
  function onDelegateHide(event: Event): void {
    if (closest(event.target as Element, instance.props.target)) {
      scheduleHide()
    }
  }

  /**
   * Determines if an event listener should stop further execution due to the
   * `touchHold` option
   */
  function isEventListenerStopped(event: Event): boolean {
    const supportsTouch = 'ontouchstart' in window
    const isTouchEvent = includes(event.type, 'touch')
    const { touchHold } = instance.props

    return (
      (supportsTouch && isUsingTouch && touchHold && !isTouchEvent) ||
      (isUsingTouch && !touchHold && isTouchEvent)
    )
  }

  /**
   * Runs the mount callback
   */
  function runMountCallback(): void {
    if (!hasMountCallbackRun && currentMountCallback) {
      hasMountCallbackRun = true
      reflow(popper)
      currentMountCallback()
    }
  }

  /**
   * Creates the popper instance for the instance
   */
  function createPopperInstance(): void {
    const { popperOptions } = instance.props
    const { tooltip, arrow } = instance.popperChildren
    const preventOverflowModifier = getModifier(
      popperOptions,
      'preventOverflow',
    )

    function applyMutations(data: Popper.Data): void {
      if (instance.props.flip && !instance.props.flipOnUpdate) {
        if (data.flipped) {
          instance.popperInstance!.options.placement = data.placement
        }

        setFlipModifierEnabled(instance.popperInstance!.modifiers, false)
      }

      // Apply all of the popper's attributes to the tootip node as well.
      // Allows users to avoid using the .tippy-popper selector for themes.
      tooltip.setAttribute(PLACEMENT_ATTRIBUTE, data.placement)

      if (data.attributes[OUT_OF_BOUNDARIES_ATTRIBUTE] !== false) {
        tooltip.setAttribute(OUT_OF_BOUNDARIES_ATTRIBUTE, '')
      } else {
        tooltip.removeAttribute(OUT_OF_BOUNDARIES_ATTRIBUTE)
      }

      // Prevents a transition when changing placements (while tippy is visible)
      // for scroll/resize updates
      if (
        previousPlacement &&
        previousPlacement !== data.placement &&
        wasVisibleDuringPreviousUpdate
      ) {
        tooltip.style.transition = 'none'
        requestAnimationFrame(() => {
          tooltip.style.transition = ''
        })
      }
      previousPlacement = data.placement
      wasVisibleDuringPreviousUpdate = instance.state.isVisible

      const basicPlacement = getBasicPlacement(popper)
      const styles = tooltip.style

      // Account for the `distance` offset
      styles.top = styles.bottom = styles.left = styles.right = ''
      styles[basicPlacement] = getOffsetDistanceInPx(instance.props.distance)

      const padding =
        preventOverflowModifier && preventOverflowModifier.padding !== undefined
          ? preventOverflowModifier.padding
          : PADDING
      const isPaddingNumber = typeof padding === 'number'

      const computedPadding = {
        top: isPaddingNumber ? padding : padding.top,
        bottom: isPaddingNumber ? padding : padding.bottom,
        left: isPaddingNumber ? padding : padding.left,
        right: isPaddingNumber ? padding : padding.right,
        ...(!isPaddingNumber && padding),
      }

      computedPadding[basicPlacement] = isPaddingNumber
        ? padding + instance.props.distance
        : (padding[basicPlacement] || 0) + instance.props.distance

      instance.popperInstance!.modifiers.filter(
        m => m.name === 'preventOverflow',
      )[0].padding = computedPadding

      currentComputedPadding = computedPadding
    }

    const config = {
      eventsEnabled: false,
      placement: instance.props.placement,
      ...popperOptions,
      modifiers: {
        ...(popperOptions ? popperOptions.modifiers : {}),
        preventOverflow: {
          boundariesElement: instance.props.boundary,
          padding: PADDING,
          ...preventOverflowModifier,
        },
        arrow: {
          element: arrow,
          enabled: !!arrow,
          ...getModifier(popperOptions, 'arrow'),
        },
        flip: {
          enabled: instance.props.flip,
          // The tooltip is offset by 10px from the popper in CSS,
          // we need to account for its distance
          padding: instance.props.distance + PADDING,
          behavior: instance.props.flipBehavior,
          ...getModifier(popperOptions, 'flip'),
        },
        offset: {
          offset: instance.props.offset,
          ...getModifier(popperOptions, 'offset'),
        },
      },
      onCreate(data: Popper.Data) {
        applyMutations(data)
        runMountCallback()

        if (popperOptions && popperOptions.onCreate) {
          popperOptions.onCreate(data)
        }
      },
      onUpdate(data: Popper.Data) {
        applyMutations(data)
        runMountCallback()

        if (popperOptions && popperOptions.onUpdate) {
          popperOptions.onUpdate(data)
        }
      },
    }

    instance.popperInstance = new Popper(
      reference,
      popper,
      config,
    ) as PopperInstance
  }

  /**
   * Mounts the tooltip to the DOM
   */
  function mount(): void {
    hasMountCallbackRun = false

    const isInLooseFollowCursorMode = getIsInLooseFollowCursorMode()

    if (instance.popperInstance) {
      setFlipModifierEnabled(
        instance.popperInstance.modifiers,
        instance.props.flip,
      )

      if (!isInLooseFollowCursorMode) {
        instance.popperInstance.reference = reference
        instance.popperInstance.enableEventListeners()
      }

      instance.popperInstance.scheduleUpdate()
    } else {
      createPopperInstance()

      if (!isInLooseFollowCursorMode) {
        instance.popperInstance!.enableEventListeners()
      }
    }

    const { appendTo } = instance.props
    const parentNode =
      appendTo === 'parent'
        ? reference.parentNode
        : invokeWithArgsOrReturn(appendTo, [reference])

    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper)
      instance.props.onMount(instance)
      instance.state.isMounted = true
    }
  }

  /**
   * Setup before show() is invoked (delays, etc.)
   */
  function scheduleShow(
    event?: Event,
    shouldAvoidCallingOnTrigger?: boolean,
  ): void {
    clearDelayTimeouts()

    if (instance.state.isVisible) {
      return
    }

    // Is a delegate, create an instance for the child target
    if (instance.props.target) {
      return createDelegateChildTippy(event)
    }

    isScheduledToShow = true

    if (event && !shouldAvoidCallingOnTrigger) {
      instance.props.onTrigger(instance, event)
    }

    if (instance.props.wait) {
      return instance.props.wait(instance, event)
    }

    // If the tooltip has a delay, we need to be listening to the mousemove as
    // soon as the trigger event is fired, so that it's in the correct position
    // upon mount.
    // Edge case: if the tooltip is still mounted, but then scheduleShow() is
    // called, it causes a jump.
    if (getIsInLooseFollowCursorMode() && !instance.state.isMounted) {
      if (!instance.popperInstance) {
        createPopperInstance()
      }

      document.addEventListener('mousemove', positionVirtualReferenceNearCursor)
    }

    addDocumentClickListener()

    const delay = getValue(instance.props.delay, 0, defaultProps.delay)

    if (delay) {
      showTimeoutId = setTimeout(() => {
        show()
      }, delay)
    } else {
      show()
    }
  }

  /**
   * Setup before hide() is invoked (delays, etc.)
   */
  function scheduleHide(): void {
    clearDelayTimeouts()

    if (!instance.state.isVisible) {
      return removeFollowCursorListener()
    }

    isScheduledToShow = false

    const delay = getValue(instance.props.delay, 1, defaultProps.delay)

    if (delay) {
      hideTimeoutId = setTimeout(() => {
        if (instance.state.isVisible) {
          hide()
        }
      }, delay)
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      scheduleHideAnimationFrameId = requestAnimationFrame(() => {
        hide()
      })
    }
  }

  /**
   * Listener to handle clicks on the document to determine if the
   * instance should hide
   */
  function onDocumentClick(event: MouseEvent): void {
    // Clicked on interactive popper
    if (
      instance.props.interactive &&
      popper.contains(event.target as Element)
    ) {
      return
    }

    // Clicked on the event listeners target
    if (getEventListenersTarget().contains(event.target as Element)) {
      if (isUsingTouch) {
        return
      }

      if (
        instance.state.isVisible &&
        includes(instance.props.trigger, 'click')
      ) {
        return
      }
    }

    if (instance.props.hideOnClick === true) {
      clearDelayTimeouts()
      hide()
    }
  }

  /* ======================= 🔑 Public methods 🔑 ======================= */
  /**
   * Enables the instance to allow it to show or hide
   */
  function enable(): void {
    instance.state.isEnabled = true
  }

  /**
   * Disables the instance to disallow it to show or hide
   */
  function disable(): void {
    instance.state.isEnabled = false
  }

  /**
   * Clears pending timeouts related to the `delay` prop if any
   */
  function clearDelayTimeouts(): void {
    clearTimeout(showTimeoutId)
    clearTimeout(hideTimeoutId)
    cancelAnimationFrame(scheduleHideAnimationFrameId)
  }

  /**
   * Sets new props for the instance and redraws the tooltip
   */
  function set(options: Options): void {
    // Backwards-compatible after TypeScript change
    options = options || {}

    validateOptions(options, defaultProps)

    removeTriggersFromReference()

    const prevProps = instance.props
    const nextProps = evaluateProps(reference, {
      ...instance.props,
      ...options,
      ignoreAttributes: true,
    })
    nextProps.ignoreAttributes = hasOwnProperty(options, 'ignoreAttributes')
      ? options.ignoreAttributes || false
      : prevProps.ignoreAttributes
    instance.props = nextProps

    addTriggersToReference()

    cleanupInteractiveMouseListeners()
    debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce)

    updatePopperElement(popper, prevProps, nextProps)
    instance.popperChildren = getChildren(popper)

    if (instance.popperInstance) {
      if (
        POPPER_INSTANCE_DEPENDENCIES.some(prop => {
          return (
            hasOwnProperty(options, prop) && options[prop] !== prevProps[prop]
          )
        })
      ) {
        instance.popperInstance.destroy()
        createPopperInstance()

        if (instance.state.isVisible) {
          instance.popperInstance.enableEventListeners()
        }

        if (instance.props.followCursor && lastMouseMoveEvent) {
          positionVirtualReferenceNearCursor(lastMouseMoveEvent)
        }
      } else {
        instance.popperInstance.update()
      }
    }
  }

  /**
   * Shortcut for .set({ content: newContent })
   */
  function setContent(content: Content): void {
    set({ content })
  }

  /**
   * Shows the tooltip
   */
  function show(
    duration: number = getValue(
      instance.props.duration,
      0,
      (defaultProps.duration as [number, number])[1],
    ),
  ): void {
    if (
      instance.state.isDestroyed ||
      !instance.state.isEnabled ||
      (isUsingTouch && !instance.props.touch)
    ) {
      return
    }

    // Standardize `disabled` behavior across browsers.
    // Firefox allows events on disabled elements, but Chrome doesn't.
    // Using a wrapper element (i.e. <span>) is recommended.
    if (getEventListenersTarget().hasAttribute('disabled')) {
      return
    }

    if (instance.props.onShow(instance) === false) {
      return
    }

    addDocumentClickListener()

    popper.style.visibility = 'visible'
    instance.state.isVisible = true

    if (instance.props.interactive) {
      getEventListenersTarget().classList.add(ACTIVE_CLASS)
    }

    // Prevent a transition if the popper is at the opposite placement
    const transitionableElements = getTransitionableElements()
    setTransitionDuration(transitionableElements.concat(popper), 0)

    currentMountCallback = (): void => {
      if (!instance.state.isVisible) {
        return
      }

      const isInLooseFollowCursorMode = getIsInLooseFollowCursorMode()

      if (isInLooseFollowCursorMode && lastMouseMoveEvent) {
        positionVirtualReferenceNearCursor(lastMouseMoveEvent)
      } else if (!isInLooseFollowCursorMode) {
        // Double update will apply correct mutations
        instance.popperInstance!.update()
      }

      if (instance.popperChildren.backdrop) {
        instance.popperChildren.content.style.transitionDelay =
          Math.round(duration / 12) + 'ms'
      }

      if (instance.props.sticky) {
        makeSticky()
      }

      setTransitionDuration([popper], instance.props.updateDuration)
      setTransitionDuration(transitionableElements, duration)
      setVisibilityState(transitionableElements, 'visible')

      onTransitionedIn(
        duration,
        (): void => {
          if (instance.props.aria) {
            getEventListenersTarget().setAttribute(
              `aria-${instance.props.aria}`,
              popper.id,
            )
          }

          instance.props.onShown(instance)
          instance.state.isShown = true
        },
      )
    }

    mount()
  }

  /**
   * Hides the tooltip
   */
  function hide(
    duration: number = getValue(
      instance.props.duration,
      1,
      (defaultProps.duration as [number, number])[1],
    ),
  ): void {
    if (
      instance.state.isDestroyed ||
      (!instance.state.isEnabled && !isBeingDestroyed)
    ) {
      return
    }

    if (instance.props.onHide(instance) === false && !isBeingDestroyed) {
      return
    }

    removeDocumentClickListener()

    popper.style.visibility = 'hidden'
    instance.state.isVisible = false
    instance.state.isShown = false
    wasVisibleDuringPreviousUpdate = false

    if (instance.props.interactive) {
      getEventListenersTarget().classList.remove(ACTIVE_CLASS)
    }

    const transitionableElements = getTransitionableElements()
    setTransitionDuration(transitionableElements, duration)
    setVisibilityState(transitionableElements, 'hidden')

    onTransitionedOut(duration, () => {
      if (!isScheduledToShow) {
        removeFollowCursorListener()
      }

      if (instance.props.aria) {
        getEventListenersTarget().removeAttribute(`aria-${instance.props.aria}`)
      }

      instance.popperInstance!.disableEventListeners()
      instance.popperInstance!.options.placement = instance.props.placement

      popper.parentNode!.removeChild(popper)
      instance.props.onHidden(instance)
      instance.state.isMounted = false
    })
  }

  /**
   * Destroys the tooltip
   */
  function destroy(destroyTargetInstances?: boolean): void {
    if (instance.state.isDestroyed) {
      return
    }

    isBeingDestroyed = true

    // If the popper is currently mounted to the DOM, we want to ensure it gets
    // hidden and unmounted instantly upon destruction
    if (instance.state.isMounted) {
      hide(0)
    }

    removeTriggersFromReference()

    delete reference._tippy

    const { target } = instance.props
    if (target && destroyTargetInstances && isRealElement(reference)) {
      arrayFrom(reference.querySelectorAll(target)).forEach(
        (child: ReferenceElement) => {
          if (child._tippy) {
            child._tippy.destroy()
          }
        },
      )
    }

    if (instance.popperInstance) {
      instance.popperInstance.destroy()
    }

    isBeingDestroyed = false
    instance.state.isDestroyed = true
  }
}
