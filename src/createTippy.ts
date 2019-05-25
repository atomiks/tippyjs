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
import { isUsingTouch } from './bindGlobalEventListeners'
import { defaultProps, POPPER_INSTANCE_DEPENDENCIES } from './props'
import {
  createPopperElement,
  updatePopperElement,
  getChildren,
  getBasicPlacement,
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
  warnWhen,
} from './utils'
import { validateProps } from './validation'

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
  let isScheduledToShow = false
  let currentPlacement: Placement = props.placement
  let hasMountCallbackRun = false
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
    // @ts-ignore
    instance.set = (): void => {
      warnWhen(true, '`set()` was renamed to `setProps()` in v5.')
    }
  }

  /* ==================== Initial instance mutations =================== */
  reference._tippy = instance
  popper._tippy = instance

  addTriggersToEventListenersTarget()

  if (!props.lazy) {
    createPopperInstance()
  }

  if (props.showOnInit) {
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
    return includes(['top', 'bottom'], getBasicPlacement(currentPlacement))
  }

  function getIsOppositePlacement(): boolean {
    return includes(['bottom', 'right'], getBasicPlacement(currentPlacement))
  }

  function getIsInFollowCursorMode(): boolean {
    return (
      instance.props.followCursor &&
      !isUsingTouch &&
      lastTriggerEventType !== 'focus'
    )
  }

  function getTransitionableElements(): (HTMLDivElement | null)[] {
    return [tooltip, content, instance.popperChildren.backdrop]
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

  function getEventListenersTarget(): ReferenceElement {
    return instance.props.triggerTarget || reference
  }

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
      instance.clearDelayTimeouts()
      instance.hide()
    }
  }

  function addDocumentClickListener(): void {
    document.addEventListener('click', onDocumentClick, true)
  }

  function removeDocumentClickListener(): void {
    document.removeEventListener('click', onDocumentClick, true)
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

  function getCorrectedPadding(placement: string): number {
    return instance.props.arrow
      ? currentComputedPadding[placement] +
          (instance.props.arrowType === 'round' ? 18 : 16)
      : currentComputedPadding[placement]
  }

  function positionVirtualReferenceNearCursor(event: MouseEvent): void {
    const { clientX, clientY } = (lastMouseMoveEvent = event)

    // Gets set once popperInstance `onCreate` has been called
    if (!currentComputedPadding) {
      return
    }

    const rect = reference.getBoundingClientRect()
    const { followCursor } = instance.props
    const isHorizontal = followCursor === 'horizontal'
    const isVertical = followCursor === 'vertical'

    // Ensure virtual reference is padded to prevent tooltip from overflowing.
    // Seems to be a Popper.js issue
    const padding = { ...currentComputedPadding }
    const isVerticalPlacement = getIsVerticalPlacement()

    if (isVerticalPlacement) {
      padding.left = getCorrectedPadding('left')
      padding.right = getCorrectedPadding('right')
    } else {
      padding.top = getCorrectedPadding('top')
      padding.bottom = getCorrectedPadding('bottom')
    }

    // TODO: Remove the following later if Popper.js changes/fixes the
    // behavior

    // Top / left boundary
    let x = isVerticalPlacement ? Math.max(padding.left, clientX) : clientX
    let y = !isVerticalPlacement ? Math.max(padding.top, clientY) : clientY

    // Bottom / right boundary
    if (isVerticalPlacement && x > padding.right) {
      x = Math.min(clientX, window.innerWidth - padding.right)
    }
    if (!isVerticalPlacement && y > padding.bottom) {
      y = Math.min(clientY, window.innerHeight - padding.bottom)
    }

    // If the instance is interactive, avoid updating the position unless it's
    // over the reference element
    const isCursorOverReference = closestCallback(
      event.target as Element,
      (el: Element): boolean => el === reference,
    )

    if (isCursorOverReference || !instance.props.interactive) {
      instance.popperInstance!.reference.getBoundingClientRect = ():
        | DOMRect
        | ClientRect => ({
        width: 0,
        height: 0,
        top: isHorizontal ? rect.top : y,
        bottom: isHorizontal ? rect.bottom : y,
        left: isVertical ? rect.left : x,
        right: isVertical ? rect.right : x,
      })

      instance.popperInstance!.scheduleUpdate()
    }

    if (followCursor === 'initial' && instance.state.isVisible) {
      removeFollowCursorListener()
    }
  }

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
        getBasicPlacement(currentPlacement),
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
      (supportsTouch && isUsingTouch && touchHold && !isTouchEvent) ||
      (isUsingTouch && !touchHold && isTouchEvent)
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
      popper.removeAttribute('x-placement')
      popper.removeAttribute('x-out-of-boundaries')

      tooltip.setAttribute('data-placement', currentPlacement)
      if (data.attributes['x-out-of-boundaries'] !== false) {
        tooltip.setAttribute('data-out-of-boundaries', '')
      } else {
        tooltip.removeAttribute('data-out-of-boundaries')
      }

      // Apply the `distance` prop
      const basicPlacement = getBasicPlacement(currentPlacement)
      const tooltipStyles = tooltip.style

      tooltipStyles.top = ''
      tooltipStyles.bottom = ''
      tooltipStyles.left = ''
      tooltipStyles.right = ''
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

      computedPadding[basicPlacement] = isPaddingNumber
        ? padding + instance.props.distance
        : (padding[basicPlacement] || 0) + instance.props.distance

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
      reflow(popper)
      currentMountCallback()
    }
  }

  function mount(): void {
    hasMountCallbackRun = false

    const isInFollowCursorMode = getIsInFollowCursorMode()
    const shouldEnableListeners =
      !isInFollowCursorMode &&
      !(instance.props.followCursor === 'initial' && isUsingTouch)

    if (!instance.popperInstance) {
      createPopperInstance()

      if (shouldEnableListeners) {
        instance.popperInstance!.enableEventListeners()
      }
    } else {
      if (!isInFollowCursorMode) {
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
    instance.popperInstance!.reference = reference
    const { arrow } = instance.popperChildren

    if (isInFollowCursorMode) {
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

    addDocumentClickListener()

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
    const isUsingTouchAndTouchDisabled = isUsingTouch && !instance.props.touch

    if (
      isAlreadyVisible ||
      isDestroyed ||
      isDisabled ||
      isUsingTouchAndTouchDisabled
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

      // Double update will apply correct mutations
      if (!getIsInFollowCursorMode()) {
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
              tooltip.id,
            )
          }

          instance.props.onShown(instance)
          instance.state.isShown = true
        },
      )
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
    // We're checking `isMounted` instead if `isVisible` so that `destroy()`'s
    // instance.hide(0) call is not ignored (to unmount the tippy instantly)
    const isAlreadyHidden = !instance.state.isMounted
    const isDestroyed = instance.state.isDestroyed
    const isDisabled = !instance.state.isEnabled

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return
    }

    if (instance.props.onHide(instance) === false) {
      return
    }

    removeDocumentClickListener()

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

    instance.hide(0)

    removeTriggersFromEventListenersTarget()

    delete reference._tippy

    if (instance.popperInstance) {
      instance.popperInstance.destroy()
    }

    instance.state.isDestroyed = true
  }
}
