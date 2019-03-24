import Popper from 'popper.js'
import {
  ReferenceElement,
  PopperInstance,
  Props,
  Options,
  Instance,
  Content,
  Listener,
} from './types'
import { isIE } from './browser'
import { closest, closestCallback, arrayFrom } from './ponyfills'
import { PASSIVE, PADDING, ACTIVE_CLASS, POPPER_SELECTOR } from './constants'
import { isUsingTouch } from './bindGlobalEventListeners'
import { defaultProps, POPPER_INSTANCE_DEPENDENCIES } from './props'
import {
  createPopperElement,
  updatePopperElement,
  afterPopperPositionUpdates,
  getChildren,
  getPopperPlacement,
  applyTransitionDuration,
  toggleTransitionEndListener,
  setVisibilityState,
  isCursorOutsideInteractiveBorder,
  getOffsetDistanceInPx,
} from './popper'
import {
  hasOwnProperty,
  debounce,
  getValue,
  getModifier,
  includes,
  evaluateValue,
  setFlipModifierEnabled,
  canReceiveFocus,
  validateOptions,
  evaluateProps,
} from './utils'

let idCounter = 1

/**
 * Creates and returns a Tippy object. We're using a closure pattern instead of
 * a class so that the exposed object API is clean without private members
 * prefixed with `_`.
 */
export default function createTippy(
  reference: ReferenceElement,
  collectionProps: Props,
): Instance | null {
  const props = evaluateProps(reference, collectionProps)

  // If the reference shouldn't have multiple tippys, return null early
  if (!props.multiple && reference._tippy) {
    return null
  }

  /* ======================= 🔒 Private members 🔒 ======================= */
  // The last trigger event type that caused the tippy to show
  let lastTriggerEventType: string

  // The last mousemove event object created by the document mousemove event
  let lastMouseMoveEvent: MouseEvent

  // Timeout created by the show delay
  let showTimeoutId: number

  // Timeout created by the hide delay
  let hideTimeoutId: number

  // Frame created by scheduleHide()
  let animationFrameId: number

  // Flag to determine if the tippy is scheduled to show due to the show timeout
  let isScheduledToShow = false

  // The current `transitionend` callback reference
  let transitionEndListener: (event: TransitionEvent) => void

  // Array of event listeners currently attached to the reference element
  let listeners: Listener[] = []

  // Private onMouseMove handler reference, debounced or not
  let debouncedOnMouseMove =
    props.interactiveDebounce > 0
      ? debounce(onMouseMove, props.interactiveDebounce)
      : onMouseMove

  // Node the tippy is currently appended to
  let parentNode: Element

  // The tippy's previous placement
  let previousPlacement: string

  let wasVisibleDuringPreviousUpdate = false

  /* ======================= 🔑 Public members 🔑 ======================= */
  // id used for the `aria-describedby` / `aria-labelledby` attribute
  const id = idCounter++

  // Popper element reference
  const popper = createPopperElement(id, props)

  // Popper element children: { arrow, backdrop, content, tooltip }
  const popperChildren = getChildren(popper)

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

  // Popper.js instance for the tippy is lazily created
  const popperInstance: PopperInstance | null = null

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

  addTriggersToReference()

  if (!props.lazy) {
    createPopperInstance()
    instance.popperInstance!.disableEventListeners()
  }

  if (props.showOnInit) {
    scheduleShow()
  }

  // Ensure the reference element can receive focus (and is not a delegate)
  if (props.a11y && !props.target && !canReceiveFocus(reference)) {
    reference.setAttribute('tabindex', '0')
  }

  // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding
  popper.addEventListener('mouseenter', (event: MouseEvent) => {
    if (
      instance.props.interactive &&
      instance.state.isVisible &&
      lastTriggerEventType === 'mouseenter'
    ) {
      scheduleShow(event)
    }
  })
  popper.addEventListener('mouseleave', () => {
    if (instance.props.interactive && lastTriggerEventType === 'mouseenter') {
      document.addEventListener('mousemove', debouncedOnMouseMove)
    }
  })

  // Install shortcuts
  reference._tippy = instance
  popper._tippy = instance

  return instance

  /* ======================= 🔒 Private methods 🔒 ======================= */
  /**
   * Positions the virtual reference near the cursor
   */
  function positionVirtualReferenceNearCursor(event: MouseEvent): void {
    const { clientX, clientY } = (lastMouseMoveEvent = event)

    if (!instance.popperInstance) {
      return
    }

    // Ensure virtual reference is padded to prevent tooltip from
    // overflowing. Maybe Popper.js issue?
    const placement = getPopperPlacement(instance.popper)
    const padding = instance.props.arrow
      ? PADDING + (instance.props.arrowType === 'round' ? 18 : 16)
      : PADDING
    const isVerticalPlacement = includes(['top', 'bottom'], placement)
    const isHorizontalPlacement = includes(['left', 'right'], placement)

    // Top / left boundary
    let x = isVerticalPlacement ? Math.max(padding, clientX) : clientX
    let y = isHorizontalPlacement ? Math.max(padding, clientY) : clientY

    // Bottom / right boundary
    if (isVerticalPlacement && x > padding) {
      x = Math.min(clientX, window.innerWidth - padding)
    }
    if (isHorizontalPlacement && y > padding) {
      y = Math.min(clientY, window.innerHeight - padding)
    }

    const rect = instance.reference.getBoundingClientRect()
    const { followCursor } = instance.props
    const isHorizontal = followCursor === 'horizontal'
    const isVertical = followCursor === 'vertical'

    instance.popperInstance.reference = {
      ...instance.popperInstance.reference,
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: isHorizontal ? rect.top : y,
        bottom: isHorizontal ? rect.bottom : y,
        left: isVertical ? rect.left : x,
        right: isVertical ? rect.right : x,
      }),
      clientWidth: 0,
      clientHeight: 0,
    }

    instance.popperInstance.scheduleUpdate()

    if (followCursor === 'initial' && instance.state.isVisible) {
      removeFollowCursorListener()
    }
  }

  /**
   * Creates the tippy instance for a delegate when it's been triggered
   */
  function createDelegateChildTippy(event?: Event): void {
    if (event) {
      const targetEl: ReferenceElement = closest(
        event.target as Element,
        instance.props.target,
      )
      if (targetEl && !targetEl._tippy) {
        createTippy(targetEl, {
          ...instance.props,
          content: evaluateValue(collectionProps.content, [targetEl]),
          appendTo: collectionProps.appendTo,
          target: '',
          showOnInit: true,
        })
        scheduleShow(event)
      }
    }
  }

  /**
   * Setup before show() is invoked (delays, etc.)
   */
  function scheduleShow(event?: Event): void {
    clearDelayTimeouts()

    if (instance.state.isVisible) {
      return
    }

    // Is a delegate, create an instance for the child target
    if (instance.props.target) {
      return createDelegateChildTippy(event)
    }

    isScheduledToShow = true

    if (instance.props.wait) {
      return instance.props.wait(instance, event)
    }

    // If the tooltip has a delay, we need to be listening to the mousemove as
    // soon as the trigger event is fired, so that it's in the correct position
    // upon mount.
    // Edge case: if the tooltip is still mounted, but then scheduleShow() is
    // called, it causes a jump.
    if (hasFollowCursorBehavior() && !instance.state.isMounted) {
      document.addEventListener('mousemove', positionVirtualReferenceNearCursor)
    }

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
      animationFrameId = requestAnimationFrame(() => {
        hide()
      })
    }
  }

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
   * Cleans up old listeners
   */
  function cleanupOldMouseListeners(): void {
    document.body.removeEventListener('mouseleave', scheduleHide)
    document.removeEventListener('mousemove', debouncedOnMouseMove)
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
    const referenceTheCursorIsOver = closestCallback(
      event.target as Element,
      (el: ReferenceElement) => el._tippy,
    )

    const isCursorOverPopper =
      closest(event.target as Element, POPPER_SELECTOR) === instance.popper
    const isCursorOverReference =
      referenceTheCursorIsOver === instance.reference

    if (isCursorOverPopper || isCursorOverReference) {
      return
    }

    if (
      isCursorOutsideInteractiveBorder(
        getPopperPlacement(instance.popper),
        instance.popper.getBoundingClientRect(),
        event,
        instance.props,
      )
    ) {
      cleanupOldMouseListeners()
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
      return
    }

    scheduleHide()
  }

  /**
   * Event listener invoked upon blur
   */
  function onBlur(event: FocusEvent): void {
    if (event.target !== instance.reference) {
      return
    }

    if (
      instance.props.interactive &&
      event.relatedTarget &&
      instance.popper.contains(event.relatedTarget as Element)
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

      tooltip.setAttribute('x-placement', data.placement)

      const basePlacement = getPopperPlacement(instance.popper)
      const styles = tooltip.style

      // Account for the `distance` offset
      styles.top = styles.bottom = styles.left = styles.right = ''
      styles[basePlacement] = getOffsetDistanceInPx(instance.props.distance)

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

      computedPadding[basePlacement] = isPaddingNumber
        ? padding + instance.props.distance
        : (padding[basePlacement] || 0) + instance.props.distance

      instance.popperInstance!.modifiers.filter(
        m => m.name === 'preventOverflow',
      )[0].padding = computedPadding
    }

    const config = {
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
      // This gets invoked when calling `.set()` and updating a popper
      // instance dependency, since a new popper instance gets created
      onCreate(data: Popper.Data) {
        applyMutations(data)

        if (popperOptions && popperOptions.onCreate) {
          popperOptions.onCreate(data)
        }
      },
      // This gets invoked on initial create and show()/scroll/resize update.
      // This is due to `afterPopperPositionUpdates` overwriting onCreate()
      // with onUpdate()
      onUpdate(data: Popper.Data) {
        applyMutations(data)

        if (popperOptions && popperOptions.onUpdate) {
          popperOptions.onUpdate(data)
        }
      },
    }

    instance.popperInstance = new Popper(
      instance.reference,
      instance.popper,
      config,
    ) as PopperInstance
  }

  /**
   * Mounts the tooltip to the DOM, callback to show tooltip is run **after**
   * popper's position has updated
   */
  function mount(callback: () => void): void {
    const shouldEnableListeners =
      !hasFollowCursorBehavior() &&
      !(instance.props.followCursor === 'initial' && isUsingTouch)

    if (!instance.popperInstance) {
      createPopperInstance()
      if (!shouldEnableListeners) {
        instance.popperInstance!.disableEventListeners()
      }
    } else {
      if (!hasFollowCursorBehavior()) {
        instance.popperInstance.scheduleUpdate()
        if (shouldEnableListeners) {
          instance.popperInstance.enableEventListeners()
        }
      }
      setFlipModifierEnabled(
        instance.popperInstance.modifiers,
        instance.props.flip,
      )
    }

    // If the instance previously had followCursor behavior, it will be
    // positioned incorrectly if triggered by `focus` afterwards.
    // Update the reference back to the real DOM element
    instance.popperInstance!.reference = instance.reference
    const { arrow } = instance.popperChildren

    if (hasFollowCursorBehavior()) {
      if (arrow) {
        arrow.style.margin = '0'
      }
      if (lastMouseMoveEvent) {
        positionVirtualReferenceNearCursor(lastMouseMoveEvent)
      }
    } else if (arrow) {
      arrow.style.margin = ''
    }

    // Allow followCursor: 'initial' on touch devices
    if (
      isUsingTouch &&
      lastMouseMoveEvent &&
      instance.props.followCursor === 'initial'
    ) {
      positionVirtualReferenceNearCursor(lastMouseMoveEvent)
      if (arrow) {
        arrow.style.margin = '0'
      }
    }

    afterPopperPositionUpdates(instance.popperInstance!, callback)

    const { appendTo } = instance.props

    parentNode =
      appendTo === 'parent'
        ? instance.reference.parentNode
        : evaluateValue(appendTo, [instance.reference])

    if (!parentNode.contains(instance.popper)) {
      parentNode.appendChild(instance.popper)
      instance.props.onMount(instance)
      instance.state.isMounted = true
    }
  }

  /**
   * Determines if the instance is in `followCursor` mode
   */
  function hasFollowCursorBehavior(): boolean {
    return (
      instance.props.followCursor &&
      !isUsingTouch &&
      lastTriggerEventType !== 'focus'
    )
  }

  /**
   * Updates the tooltip's position on each animation frame
   */
  function makeSticky(): void {
    applyTransitionDuration(
      [instance.popper],
      isIE ? 0 : instance.props.updateDuration,
    )

    function updatePosition(): void {
      if (instance.popperInstance) {
        instance.popperInstance.scheduleUpdate()
      }

      if (instance.state.isMounted) {
        requestAnimationFrame(updatePosition)
      } else {
        applyTransitionDuration([instance.popper], 0)
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
        parentNode &&
        parentNode.contains(instance.popper)
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
        toggleTransitionEndListener(tooltip, 'remove', listener)
        callback()
      }
    }

    // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise
    if (duration === 0) {
      return callback()
    }

    toggleTransitionEndListener(tooltip, 'remove', transitionEndListener)
    toggleTransitionEndListener(tooltip, 'add', listener)

    transitionEndListener = listener
  }

  /**
   * Adds an event listener to the reference and stores it in `listeners`
   */
  function on(
    eventType: string,
    handler: EventListener,
    options: boolean | object = false,
  ): void {
    instance.reference.addEventListener(eventType, handler, options)
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
      instance.reference.removeEventListener(eventType, handler, options)
    })
    listeners = []
  }

  /**
   * Returns inner elements used in show/hide methods
   */
  function getInnerElements(): (HTMLDivElement | null)[] {
    return [
      instance.popperChildren.tooltip,
      instance.popperChildren.backdrop,
      instance.popperChildren.content,
    ]
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
    cancelAnimationFrame(animationFrameId)
  }

  /**
   * Sets new props for the instance and redraws the tooltip
   */
  function set(options: Options): void {
    // Backwards-compatible after TypeScript change
    options = options || {}

    validateOptions(options, defaultProps)

    const prevProps = instance.props
    const nextProps = evaluateProps(instance.reference, {
      ...instance.props,
      ...options,
      ignoreAttributes: true,
    })
    nextProps.ignoreAttributes = hasOwnProperty(options, 'ignoreAttributes')
      ? options.ignoreAttributes || false
      : prevProps.ignoreAttributes
    instance.props = nextProps

    if (
      hasOwnProperty(options, 'trigger') ||
      hasOwnProperty(options, 'touchHold')
    ) {
      removeTriggersFromReference()
      addTriggersToReference()
    }

    if (hasOwnProperty(options, 'interactiveDebounce')) {
      cleanupOldMouseListeners()
      debouncedOnMouseMove = debounce(
        onMouseMove,
        options.interactiveDebounce || 0,
      )
    }

    updatePopperElement(instance.popper, prevProps, nextProps)
    instance.popperChildren = getChildren(instance.popper)

    if (instance.popperInstance) {
      instance.popperInstance.update()

      if (
        POPPER_INSTANCE_DEPENDENCIES.some((prop: string) =>
          hasOwnProperty(options, prop),
        )
      ) {
        instance.popperInstance.destroy()
        createPopperInstance()
        if (!instance.state.isVisible) {
          instance.popperInstance.disableEventListeners()
        }
        if (instance.props.followCursor && lastMouseMoveEvent) {
          positionVirtualReferenceNearCursor(lastMouseMoveEvent)
        }
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
    if (instance.reference.hasAttribute('disabled')) {
      return
    }

    if (instance.props.onShow(instance) === false) {
      return
    }

    instance.popper.style.visibility = 'visible'
    instance.state.isVisible = true

    if (instance.props.interactive) {
      instance.reference.classList.add(ACTIVE_CLASS)
    }

    // Prevent a transition if the popper is at the opposite placement
    applyTransitionDuration(
      [
        instance.popper,
        instance.popperChildren.tooltip,
        instance.popperChildren.backdrop,
      ],
      0,
    )

    mount(() => {
      if (!instance.state.isVisible) {
        return
      }

      // Arrow will sometimes not be positioned correctly. Force another update
      if (!hasFollowCursorBehavior()) {
        instance.popperInstance!.update()
      }

      applyTransitionDuration([instance.popper], props.updateDuration)
      applyTransitionDuration(getInnerElements(), duration)

      if (instance.popperChildren.backdrop) {
        instance.popperChildren.content.style.transitionDelay =
          Math.round(duration / 12) + 'ms'
      }

      if (instance.props.sticky) {
        makeSticky()
      }

      setVisibilityState(getInnerElements(), 'visible')

      onTransitionedIn(duration, () => {
        if (instance.props.aria) {
          instance.reference.setAttribute(
            `aria-${instance.props.aria}`,
            instance.popper.id,
          )
        }

        instance.props.onShown(instance)
        instance.state.isShown = true
      })
    })
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
    if (instance.state.isDestroyed || !instance.state.isEnabled) {
      return
    }

    if (instance.props.onHide(instance) === false) {
      return
    }

    if (instance.props.interactive) {
      instance.reference.classList.remove(ACTIVE_CLASS)
    }

    instance.popper.style.visibility = 'hidden'
    instance.state.isVisible = false
    instance.state.isShown = false
    wasVisibleDuringPreviousUpdate = false

    applyTransitionDuration(getInnerElements(), duration)

    setVisibilityState(getInnerElements(), 'hidden')

    onTransitionedOut(duration, () => {
      if (!isScheduledToShow) {
        removeFollowCursorListener()
      }

      if (instance.props.aria) {
        instance.reference.removeAttribute(`aria-${instance.props.aria}`)
      }

      instance.popperInstance!.disableEventListeners()
      instance.popperInstance!.options.placement = instance.props.placement

      parentNode.removeChild(instance.popper)
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

    // If the popper is currently mounted to the DOM, we want to ensure it gets
    // hidden and unmounted instantly upon destruction
    if (instance.state.isMounted) {
      hide(0)
    }

    removeTriggersFromReference()

    delete instance.reference._tippy

    if (instance.props.target && destroyTargetInstances) {
      arrayFrom(
        instance.reference.querySelectorAll(instance.props.target),
      ).forEach((child: ReferenceElement) => {
        if (child._tippy) {
          child._tippy.destroy()
        }
      })
    }

    if (instance.popperInstance) {
      instance.popperInstance.destroy()
    }

    instance.state.isDestroyed = true
  }
}
