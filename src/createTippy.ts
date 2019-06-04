import Popper from 'popper.js'
import {
  ReferenceElement,
  PopperInstance,
  Props,
  Instance,
  Content,
  Placement,
} from './types'
import { isIE } from './browser'
import { closestCallback } from './ponyfills'
import { PASSIVE, PADDING } from './constants'
import { currentInput } from './bindGlobalEventListeners'
import { defaultProps, POPPER_INSTANCE_DEPENDENCIES } from './props'
import {
  createPopperElement,
  updatePopperElement,
  getChildren,
  getBasePlacement,
  updateTransitionEndListener,
  isCursorOutsideInteractiveBorder,
  reflow,
} from './popper'
import {
  hasOwnProperty,
  getValue,
  getModifier,
  includes,
  invokeWithArgsOrReturn,
  setFlipModifierEnabled,
  evaluateProps,
  setTransitionDuration,
  setVisibilityState,
  debounce,
} from './utils'
import { warnWhen, validateProps } from './validation'

interface Listener {
  eventType: string
  handler: EventListenerOrEventListenerObject
  options: boolean | object
}

let idCounter = 1
// Workaround for IE11's lack of new MouseEvent constructor
let mouseMoveListeners: ((event: MouseEvent) => void)[] = []

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
  let lastTriggerEventType: string
  let lastMouseMoveEvent: MouseEvent
  let showTimeout: any
  let hideTimeout: any
  let animationFrame: number
  let isBeingDestroyed = false
  let isScheduledToShow = false
  let currentPlacement: Placement = props.placement
  let hasMountCallbackRun = false
  let didHideDueToDocumentMouseDown = false
  let currentMountCallback: () => void
  let currentTransitionEndListener: (event: TransitionEvent) => void
  let listeners: Listener[] = []
  let debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce)
  let currentComputedPadding: {
    top: number
    bottom: number
    left: number
    right: number
    [key: string]: number
  }

  /* ======================= 🔑 Public members 🔑 ======================= */
  const id = idCounter++
  const popper = createPopperElement(id, props)
  const popperChildren = getChildren(popper)
  const popperInstance: PopperInstance | null = null

  // These two elements are static
  const { tooltip, content } = popperChildren

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
    setProps,
    setContent,
    show,
    hide,
    enable,
    disable,
    destroy,
  }

  if (__DEV__) {
    Object.defineProperty(instance, 'set', {
      value(): void {
        warnWhen(true, '`set()` was renamed to `setProps()` in v5.')
      },
      enumerable: false,
    })
  }

  /* ==================== Initial instance mutations =================== */
  reference._tippy = instance
  popper._tippy = instance

  addTriggersToEventListenersTarget()

  if (!props.lazy) {
    createPopperInstance()
  }

  if (props.showOnCreate) {
    scheduleShow()
  }

  // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding
  popper.addEventListener(
    'mouseenter',
    (): void => {
      if (
        instance.props.interactive &&
        instance.state.isVisible &&
        lastTriggerEventType === 'mouseenter'
      ) {
        instance.clearDelayTimeouts()
      }
    },
  )
  popper.addEventListener(
    'mouseleave',
    (): void => {
      if (instance.props.interactive && lastTriggerEventType === 'mouseenter') {
        document.addEventListener('mousemove', debouncedOnMouseMove)
      }
    },
  )

  props.onCreate(instance)

  return instance

  /* ======================= 🔒 Private methods 🔒 ======================= */
  function getIsVerticalPlacement(): boolean {
    return includes(['top', 'bottom'], getBasePlacement(currentPlacement))
  }

  function getIsOppositePlacement(): boolean {
    return includes(['bottom', 'right'], getBasePlacement(currentPlacement))
  }

  function getIsInFollowCursorMode(): boolean {
    return instance.props.followCursor && lastTriggerEventType !== 'focus'
  }

  function getTransitionableElements(): (HTMLDivElement | null)[] {
    return [tooltip, content, instance.popperChildren.backdrop]
  }

  function getEventListenersTarget(): ReferenceElement {
    return instance.props.triggerTarget || reference
  }

  function removeFollowCursorListener(): void {
    document.removeEventListener(
      'mousemove',
      positionVirtualReferenceNearCursor,
    )
  }

  function cleanupInteractiveMouseListeners(): void {
    document.body.removeEventListener('mouseleave', scheduleHide)
    document.removeEventListener('mousemove', debouncedOnMouseMove)
    mouseMoveListeners = mouseMoveListeners.filter(
      (listener): boolean => listener !== debouncedOnMouseMove,
    )
  }

  function onDocumentMouseDown(event: MouseEvent): void {
    // Clicked on interactive popper
    if (
      instance.props.interactive &&
      popper.contains(event.target as Element)
    ) {
      return
    }

    // Clicked on the event listeners target
    if (getEventListenersTarget().contains(event.target as Element)) {
      if (currentInput.isTouch) {
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
      instance.clearDelayTimeouts()
      instance.hide()

      // `mousedown` event is fired right before `focus`. This lets a tippy with
      // `focus` trigger know that it should not show
      didHideDueToDocumentMouseDown = true
      setTimeout(
        (): void => {
          didHideDueToDocumentMouseDown = false
        },
      )

      // The listener gets added in `scheduleShow()`, but this may be hiding it
      // before it shows, and hide()'s early bail-out behavior can prevent it
      // from being cleaned up
      if (!instance.state.isMounted) {
        removeDocumentMouseDownListener()
      }
    }
  }

  function addDocumentMouseDownListener(): void {
    document.addEventListener('mousedown', onDocumentMouseDown, true)
  }

  function removeDocumentMouseDownListener(): void {
    document.removeEventListener('mousedown', onDocumentMouseDown, true)
  }

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

  function onTransitionedOut(duration: number, callback: () => void): void {
    onTransitionEnd(
      duration,
      (): void => {
        if (
          !instance.state.isVisible &&
          popper.parentNode &&
          popper.parentNode.contains(popper)
        ) {
          callback()
        }
      },
    )
  }

  function onTransitionedIn(duration: number, callback: () => void): void {
    onTransitionEnd(duration, callback)
  }

  function onTransitionEnd(duration: number, callback: () => void): void {
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

  function on(
    eventType: string,
    handler: EventListener,
    options: boolean | object = false,
  ): void {
    getEventListenersTarget().addEventListener(eventType, handler, options)
    listeners.push({ eventType, handler, options })
  }

  function addTriggersToEventListenersTarget(): void {
    if (instance.props.touchHold) {
      on('touchstart', onTrigger, PASSIVE)
      on('touchend', onMouseLeave as EventListener, PASSIVE)
    }

    // `click` for keyboard. Mouse uses `mousedown` (onDocumentMouseDown)
    if (!includes(instance.props.trigger, 'click')) {
      on(
        'click',
        (): void => {
          if (!currentInput.isTouch && instance.props.hideOnClick === true) {
            instance.hide()
          }
        },
      )
    }

    instance.props.trigger
      .trim()
      .split(' ')
      .forEach(
        (eventType): void => {
          if (eventType === 'manual') {
            return
          }

          on(eventType, onTrigger)
          switch (eventType) {
            case 'mouseenter':
              on('mouseleave', onMouseLeave as EventListener)
              break
            case 'focus':
              on(isIE ? 'focusout' : 'blur', onBlur as EventListener)
              break
          }
        },
      )
  }

  function removeTriggersFromEventListenersTarget(): void {
    listeners.forEach(
      ({ eventType, handler, options }: Listener): void => {
        getEventListenersTarget().removeEventListener(
          eventType,
          handler,
          options,
        )
      },
    )
    listeners = []
  }

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
      getBasePlacement(currentPlacement),
    )
    const isVariation = !!currentPlacement.split('-')[1]
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

    if (
      currentInput.isTouch ||
      (followCursor === 'initial' && instance.state.isVisible)
    ) {
      removeFollowCursorListener()
    }
  }

  function onTrigger(event: Event): void {
    if (
      didHideDueToDocumentMouseDown ||
      !instance.state.isEnabled ||
      isEventListenerStopped(event)
    ) {
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
      scheduleHide(event)
    } else {
      scheduleShow(event)
    }
  }

  function onMouseMove(event: MouseEvent): void {
    const isCursorOverReferenceOrPopper = closestCallback(
      event.target as Element,
      (el: Element): boolean => el === reference || el === popper,
    )

    if (isCursorOverReferenceOrPopper) {
      return
    }

    if (
      isCursorOutsideInteractiveBorder(
        getBasePlacement(currentPlacement),
        popper.getBoundingClientRect(),
        event,
        instance.props,
      )
    ) {
      cleanupInteractiveMouseListeners()
      scheduleHide(event)
    }
  }

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

    scheduleHide(event)
  }

  function onBlur(event: FocusEvent): void {
    if (event.target !== getEventListenersTarget()) {
      return
    }

    // If focus was moved to within the popper
    if (
      instance.props.interactive &&
      event.relatedTarget &&
      popper.contains(event.relatedTarget as Element)
    ) {
      return
    }

    scheduleHide(event)
  }

  function isEventListenerStopped(event: Event): boolean {
    const supportsTouch = 'ontouchstart' in window
    const isTouchEvent = includes(event.type, 'touch')
    const { touchHold } = instance.props

    return (
      (supportsTouch && currentInput.isTouch && touchHold && !isTouchEvent) ||
      (currentInput.isTouch && !touchHold && isTouchEvent)
    )
  }

  function createPopperInstance(): void {
    const { popperOptions } = instance.props
    const { arrow } = instance.popperChildren
    const preventOverflowModifier = getModifier(
      popperOptions,
      'preventOverflow',
    )

    function applyMutations(data: Popper.Data): void {
      const previousPlacement = currentPlacement
      currentPlacement = data.placement

      if (instance.props.flip && !instance.props.flipOnUpdate) {
        if (data.flipped) {
          instance.popperInstance!.options.placement = data.placement
        }

        setFlipModifierEnabled(instance.popperInstance!.modifiers, false)
      }

      // Apply Popper's `x-*` attributes to the tooltip with `data-*`
      tooltip.setAttribute('data-placement', currentPlacement)
      if (data.attributes['x-out-of-boundaries'] !== false) {
        tooltip.setAttribute('data-out-of-boundaries', '')
      } else {
        tooltip.removeAttribute('data-out-of-boundaries')
      }

      // Apply the `distance` prop
      const basePlacement = getBasePlacement(currentPlacement)
      const tooltipStyles = tooltip.style

      tooltipStyles.top = '0'
      tooltipStyles.left = '0'
      tooltipStyles[
        getIsVerticalPlacement() ? 'top' : 'left'
      ] = `${(getIsOppositePlacement() ? 1 : -1) * instance.props.distance}px`

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
        (m): boolean => m.name === 'preventOverflow',
      )[0].padding = computedPadding

      currentComputedPadding = computedPadding

      // The `distance` offset needs to be re-considered by Popper.js if the
      // placement changed
      if (currentPlacement !== previousPlacement) {
        instance.popperInstance!.update()
      }
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
      onCreate(data: Popper.Data): void {
        applyMutations(data)
        runMountCallback()

        if (popperOptions && popperOptions.onCreate) {
          popperOptions.onCreate(data)
        }
      },
      onUpdate(data: Popper.Data): void {
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

  function runMountCallback(): void {
    if (!hasMountCallbackRun && currentMountCallback) {
      hasMountCallbackRun = true
      currentMountCallback()
    }
  }

  function mount(): void {
    // The mounting callback (`currentMountCallback`) is only run due to a
    // popperInstance update/create
    hasMountCallbackRun = false

    const isInFollowCursorMode = getIsInFollowCursorMode()

    if (instance.popperInstance) {
      setFlipModifierEnabled(
        instance.popperInstance.modifiers,
        instance.props.flip,
      )

      if (!isInFollowCursorMode) {
        instance.popperInstance!.reference = reference
        instance.popperInstance.enableEventListeners()
      }

      instance.popperInstance.scheduleUpdate()
    } else {
      createPopperInstance()

      if (!isInFollowCursorMode) {
        instance.popperInstance!.enableEventListeners()
      }
    }
  }

  function scheduleShow(event?: Event): void {
    instance.clearDelayTimeouts()

    if (event) {
      instance.props.onTrigger(instance, event)
    }

    if (instance.state.isVisible) {
      return
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
    if (getIsInFollowCursorMode() && !instance.state.isMounted) {
      if (!instance.popperInstance) {
        createPopperInstance()
      }

      document.addEventListener('mousemove', positionVirtualReferenceNearCursor)
    }

    addDocumentMouseDownListener()

    const delay = getValue(instance.props.delay, 0, defaultProps.delay)

    if (delay) {
      showTimeout = setTimeout((): void => {
        instance.show()
      }, delay)
    } else {
      instance.show()
    }
  }

  function scheduleHide(event: Event): void {
    instance.clearDelayTimeouts()

    instance.props.onUntrigger(instance, event)

    if (!instance.state.isVisible) {
      return removeFollowCursorListener()
    }

    isScheduledToShow = false

    const delay = getValue(instance.props.delay, 1, defaultProps.delay)

    if (delay) {
      hideTimeout = setTimeout((): void => {
        if (instance.state.isVisible) {
          instance.hide()
        }
      }, delay)
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      animationFrame = requestAnimationFrame(
        (): void => {
          instance.hide()
        },
      )
    }
  }

  /* ======================= 🔑 Public methods 🔑 ======================= */
  function enable(): void {
    instance.state.isEnabled = true
  }

  function disable(): void {
    instance.state.isEnabled = false
  }

  function clearDelayTimeouts(): void {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
    cancelAnimationFrame(animationFrame)
  }

  function setProps(partialProps: Partial<Props>): void {
    if (__DEV__) {
      warnWhen(
        instance.state.isDestroyed,
        '`set()` was called on a destroyed instance. ' +
          'This is a no-op but indicates a potential memory leak.',
      )
    }

    if (instance.state.isDestroyed) {
      return
    }

    if (__DEV__) {
      validateProps(partialProps)
    }

    removeTriggersFromEventListenersTarget()

    const prevProps = instance.props
    const nextProps = evaluateProps(reference, {
      ...instance.props,
      ...partialProps,
      ignoreAttributes: true,
    })
    nextProps.ignoreAttributes = hasOwnProperty(
      partialProps,
      'ignoreAttributes',
    )
      ? partialProps.ignoreAttributes || false
      : prevProps.ignoreAttributes
    instance.props = nextProps

    addTriggersToEventListenersTarget()

    cleanupInteractiveMouseListeners()
    debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce)

    updatePopperElement(popper, prevProps, nextProps, instance.state.isVisible)
    instance.popperChildren = getChildren(popper)

    if (instance.popperInstance) {
      if (
        POPPER_INSTANCE_DEPENDENCIES.some(
          (prop): boolean => {
            return (
              hasOwnProperty(partialProps, prop) &&
              partialProps[prop] !== prevProps[prop]
            )
          },
        )
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

  function setContent(content: Content): void {
    instance.setProps({ content })
  }

  function show(
    duration: number = getValue(
      instance.props.duration,
      0,
      (defaultProps.duration as [number, number])[1],
    ),
    shouldPreventPopperTransition: boolean = true,
  ): void {
    if (__DEV__) {
      warnWhen(
        instance.state.isDestroyed,
        '`show()` was called on a destroyed instance. ' +
          'This is a no-op but indicates a potential memory leak.',
      )
    }

    // Early bail-out
    const isAlreadyVisible = instance.state.isVisible
    const isDestroyed = instance.state.isDestroyed
    const isDisabled = !instance.state.isEnabled
    const isTouchAndTouchDisabled =
      currentInput.isTouch && !instance.props.touch

    if (
      isAlreadyVisible ||
      isDestroyed ||
      isDisabled ||
      isTouchAndTouchDisabled
    ) {
      return
    }

    // Normalize `disabled` behavior across browsers.
    // Firefox allows events on disabled elements, but Chrome doesn't.
    // Using a wrapper element (i.e. <span>) is recommended.
    if (getEventListenersTarget().hasAttribute('disabled')) {
      return
    }

    if (instance.props.onShow(instance) === false) {
      return
    }

    addDocumentMouseDownListener()

    popper.style.visibility = 'visible'
    instance.state.isVisible = true

    // Prevent a transition of the popper from its previous position and of the
    // elements at a different placement.
    const transitionableElements = getTransitionableElements()
    setTransitionDuration(
      shouldPreventPopperTransition
        ? transitionableElements.concat(popper)
        : transitionableElements,
      0,
    )

    currentMountCallback = (): void => {
      if (!instance.state.isVisible) {
        return
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

      const isInFollowCursorMode = getIsInFollowCursorMode()

      if (isInFollowCursorMode && lastMouseMoveEvent) {
        positionVirtualReferenceNearCursor(lastMouseMoveEvent)
      } else if (!isInFollowCursorMode) {
        // Double update will apply correct mutations
        instance.popperInstance!.update()
      }

      // Wait for the next tick
      requestAnimationFrame(() => {
        reflow(popper)

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
                tooltip.id,
              )
            }

            instance.props.onShown(instance)
            instance.state.isShown = true
          },
        )
      })
    }

    mount()
  }

  function hide(
    duration: number = getValue(
      instance.props.duration,
      1,
      (defaultProps.duration as [number, number])[1],
    ),
  ): void {
    if (__DEV__) {
      warnWhen(
        instance.state.isDestroyed,
        '`hide()` was called on a destroyed instance. ' +
          'This is a no-op but indicates a potential memory leak.',
      )
    }

    // Early bail-out
    const isAlreadyHidden = !instance.state.isVisible && !isBeingDestroyed
    const isDestroyed = instance.state.isDestroyed
    const isDisabled = !instance.state.isEnabled && !isBeingDestroyed

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return
    }

    if (instance.props.onHide(instance) === false && !isBeingDestroyed) {
      return
    }

    removeDocumentMouseDownListener()

    popper.style.visibility = 'hidden'
    instance.state.isVisible = false
    instance.state.isShown = false

    const transitionableElements = getTransitionableElements()
    setTransitionDuration(transitionableElements, duration)
    setVisibilityState(transitionableElements, 'hidden')

    onTransitionedOut(
      duration,
      (): void => {
        if (!isScheduledToShow) {
          removeFollowCursorListener()
        }

        if (instance.props.aria) {
          getEventListenersTarget().removeAttribute(
            `aria-${instance.props.aria}`,
          )
        }

        instance.popperInstance!.disableEventListeners()
        instance.popperInstance!.options.placement = instance.props.placement

        popper.parentNode!.removeChild(popper)
        instance.props.onHidden(instance)
        instance.state.isMounted = false
      },
    )
  }

  function destroy(): void {
    if (__DEV__) {
      warnWhen(
        instance.state.isDestroyed,
        '`destroy()` was called on an already-destroyed ' +
          'instance. This is a no-op but indicates a potential memory leak.',
      )
    }

    if (instance.state.isDestroyed) {
      return
    }

    isBeingDestroyed = true

    instance.hide(0)

    removeTriggersFromEventListenersTarget()

    delete reference._tippy

    if (instance.popperInstance) {
      instance.popperInstance.destroy()
    }

    isBeingDestroyed = false
    instance.state.isDestroyed = true
  }
}
