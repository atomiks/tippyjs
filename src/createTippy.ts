import Popper from 'popper.js'
import {
  ReferenceElement,
  PopperInstance,
  Props,
  Instance,
  Content,
} from './types'
import { isIE } from './browser'
import {
  PASSIVE,
  PREVENT_OVERFLOW_PADDING,
  NON_UPDATEABLE_PROPS,
} from './constants'
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
  getValueAtIndexOrReturn,
  getModifier,
  includes,
  invokeWithArgsOrReturn,
  setFlipModifierEnabled,
  evaluateProps,
  setTransitionDuration,
  setVisibilityState,
  debounce,
  preserveInvocation,
  closestCallback,
} from './utils'
import {
  warnWhen,
  validateProps,
  validateExtraPropsFunctionality,
  createMemoryLeakWarning,
  createCannotUpdateWarning,
  INTERACTIVE_A11Y_WARNING,
} from './validation'
import {
  handleAriaDescribedByAttribute,
  handleAriaExpandedAttribute,
} from './reference'

interface PaddingObject {
  top: number
  right: number
  bottom: number
  left: number
}

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
  let showTimeout: any
  let hideTimeout: any
  let scheduleHideAnimationFrame: number
  let isBeingDestroyed = false
  let hasMountCallbackRun = false
  let didHideDueToDocumentMouseDown = false
  let currentMountCallback: () => void
  let currentTransitionEndListener: (event: TransitionEvent) => void
  let listeners: Listener[] = []
  let debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce)

  /* ======================= 🔑 Public members 🔑 ======================= */
  const id = idCounter++
  const popper = createPopperElement(id, props)
  const popperChildren = getChildren(popper)
  const popperInstance: PopperInstance | null = null

  // These two elements are static
  const { tooltip, content } = popperChildren

  const state = {
    // The current real placement (`data-placement` attribute)
    currentPlacement: props.placement,
    // Does the instance have a pending timeout for show()?
    isScheduledToShow: false,
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
    Object.defineProperty(instance, '__extraProps', {
      value: {},
      enumerable: false,
    })
  }

  /* ==================== Initial instance mutations =================== */
  reference._tippy = instance
  popper._tippy = instance

  addListenersToTriggerTarget()
  handleAriaExpandedAttribute(getTriggerTarget(), false, props.interactive)

  if (!props.lazy) {
    createPopperInstance()
  }

  if (props.showOnCreate) {
    scheduleShow()
  }

  // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding
  popper.addEventListener('mouseenter', (): void => {
    if (
      instance.props.interactive &&
      instance.state.isVisible &&
      lastTriggerEventType === 'mouseenter'
    ) {
      instance.clearDelayTimeouts()
    }
  })
  popper.addEventListener('mouseleave', (): void => {
    if (instance.props.interactive && lastTriggerEventType === 'mouseenter') {
      document.addEventListener('mousemove', debouncedOnMouseMove)
    }
  })

  props.onCreate(instance)

  return instance

  /* ======================= 🔒 Private methods 🔒 ======================= */
  function getNormalizedTouchSettings(): [string | boolean, number] {
    const { touch } = instance.props
    return Array.isArray(touch) ? touch : [touch, 0]
  }

  function getIsCustomTouchBehavior(): boolean {
    return getNormalizedTouchSettings()[0] === 'hold'
  }

  function getTransitionableElements(): (HTMLDivElement | null)[] {
    return [tooltip, content, instance.popperChildren.backdrop]
  }

  function getTriggerTarget(): ReferenceElement {
    return instance.props.triggerTarget || reference
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
    if (getTriggerTarget().contains(event.target as Element)) {
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
      setTimeout((): void => {
        didHideDueToDocumentMouseDown = false
      })

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

  function onTransitionedOut(duration: number, callback: () => void): void {
    onTransitionEnd(duration, (): void => {
      if (
        !instance.state.isVisible &&
        popper.parentNode &&
        popper.parentNode.contains(popper)
      ) {
        callback()
      }
    })
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
    getTriggerTarget().addEventListener(eventType, handler, options)
    listeners.push({ eventType, handler, options })
  }

  function addListenersToTriggerTarget(): void {
    if (getIsCustomTouchBehavior()) {
      on('touchstart', onTrigger, PASSIVE)
      on('touchend', onMouseLeave as EventListener, PASSIVE)
    }

    // `click` for keyboard. Mouse uses `mousedown` (onDocumentMouseDown)
    if (!includes(instance.props.trigger, 'click')) {
      on('click', (): void => {
        if (!currentInput.isTouch && instance.props.hideOnClick === true) {
          instance.hide()
        }
      })
    }

    instance.props.trigger
      .trim()
      .split(' ')
      .forEach((eventType): void => {
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
      })
  }

  function removeListenersFromTriggerTarget(): void {
    listeners.forEach(({ eventType, handler, options }: Listener): void => {
      getTriggerTarget().removeEventListener(eventType, handler, options)
    })
    listeners = []
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
      const [value, duration] = getNormalizedTouchSettings()

      if (currentInput.isTouch && value === 'hold' && duration) {
        // We can hijack the show timeout here, it will be cleared by
        // `scheduleHide()` when necessary
        showTimeout = setTimeout((): void => {
          scheduleShow(event)
        }, duration)
      } else {
        scheduleShow(event)
      }
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
        getBasePlacement(instance.state.currentPlacement),
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
    if (event.target !== getTriggerTarget()) {
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
    const isCustomTouch = getIsCustomTouchBehavior()

    return (
      (supportsTouch &&
        currentInput.isTouch &&
        isCustomTouch &&
        !isTouchEvent) ||
      (currentInput.isTouch && !isCustomTouch && isTouchEvent)
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
      instance.state.currentPlacement = data.placement

      if (instance.props.flip && !instance.props.flipOnUpdate) {
        if (data.flipped) {
          instance.popperInstance!.options.placement = data.placement
        }

        setFlipModifierEnabled(instance.popperInstance!.modifiers, false)
      }

      tooltip.setAttribute('data-placement', data.placement)
      if (data.attributes['x-out-of-boundaries'] !== false) {
        tooltip.setAttribute('data-out-of-boundaries', '')
      } else {
        tooltip.removeAttribute('data-out-of-boundaries')
      }

      const basePlacement = getBasePlacement(data.placement)
      const isVerticalPlacement = includes(['top', 'bottom'], basePlacement)
      const isSecondaryPlacement = includes(['bottom', 'right'], basePlacement)

      // Apply `distance` prop
      const tooltipStyles = tooltip.style
      tooltipStyles.top = '0'
      tooltipStyles.left = '0'
      tooltipStyles[
        isVerticalPlacement ? 'top' : 'left'
      ] = `${(isSecondaryPlacement ? 1 : -1) * instance.props.distance}px`
    }

    const config = {
      eventsEnabled: false,
      placement: instance.props.placement,
      ...popperOptions,
      modifiers: {
        ...(popperOptions && popperOptions.modifiers),
        preventOverflow: {
          boundariesElement: instance.props.boundary,
          padding: PREVENT_OVERFLOW_PADDING,
          ...preventOverflowModifier,
        },
        // Adds the `distance` calculation to preventOverflow padding
        tippySetPreventOverflowPadding: {
          enabled: true,
          order: 299,
          fn(data: Popper.Data): Popper.Data {
            const basePlacement = getBasePlacement(data.placement)

            const padding =
              preventOverflowModifier &&
              preventOverflowModifier.padding !== undefined
                ? preventOverflowModifier.padding
                : PREVENT_OVERFLOW_PADDING

            const isPaddingNumber = typeof padding === 'number'

            const paddingObject = { top: 0, bottom: 0, left: 0, right: 0 }

            const computedPadding = (Object.keys(paddingObject) as Array<
              keyof PaddingObject
            >).reduce((obj: PaddingObject, key): PaddingObject => {
              obj[key] = isPaddingNumber ? padding : padding[key]

              if (basePlacement === key) {
                obj[key] = isPaddingNumber
                  ? padding + instance.props.distance
                  : (padding[basePlacement] || 0) + instance.props.distance
              }

              return obj
            }, paddingObject)

            instance.popperInstance!.modifiers.filter(
              (m): boolean => m.name === 'preventOverflow',
            )[0].padding = computedPadding

            return data
          },
        },
        arrow: {
          element: arrow,
          enabled: !!arrow,
          ...getModifier(popperOptions, 'arrow'),
        },
        flip: {
          enabled: instance.props.flip,
          padding: instance.props.distance + PREVENT_OVERFLOW_PADDING,
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

        preserveInvocation(
          popperOptions && popperOptions.onCreate,
          config.onCreate,
          [data],
        )

        runMountCallback()
      },
      onUpdate(data: Popper.Data): void {
        applyMutations(data)

        preserveInvocation(
          popperOptions && popperOptions.onUpdate,
          config.onUpdate,
          [data],
        )

        runMountCallback()
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
    // The mounting callback (`currentMountCallback`) is only run due to a
    // popperInstance update/create
    hasMountCallbackRun = false

    const { appendTo } = instance.props

    let parentNode: any

    // By default, we'll append the popper to the triggerTargets's parentNode so
    // it's directly after the reference element so the elements inside the
    // tippy can be tabbed to
    // If there are clipping issues, the user can specify a different appendTo
    // and ensure focus management is handled correctly manually
    if (
      (instance.props.interactive && appendTo === defaultProps.appendTo) ||
      appendTo === 'parent'
    ) {
      parentNode = getTriggerTarget().parentNode
    } else {
      parentNode = invokeWithArgsOrReturn(appendTo, [reference])
    }

    // The popper element needs to exist on the DOM before its position can be
    // updated as Popper.js needs to read its dimensions
    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper)
    }

    if (__DEV__) {
      // Accessibility check
      warnWhen(
        instance.props.interactive &&
          appendTo === defaultProps.appendTo &&
          getTriggerTarget().nextElementSibling !== popper,
        INTERACTIVE_A11Y_WARNING,
      )
    }

    if (instance.popperInstance) {
      setFlipModifierEnabled(
        instance.popperInstance.modifiers,
        instance.props.flip,
      )

      instance.popperInstance.enableEventListeners()

      // Mounting callback invoked in `onUpdate`
      instance.popperInstance.scheduleUpdate()
    } else {
      // Mounting callback invoked in `onCreate`
      createPopperInstance()

      instance.popperInstance!.enableEventListeners()
    }
  }

  function scheduleShow(event?: Event): void {
    instance.clearDelayTimeouts()

    instance.state.isScheduledToShow = true

    if (!instance.popperInstance) {
      createPopperInstance()
    }

    if (event) {
      instance.props.onTrigger(instance, event)
    }

    addDocumentMouseDownListener()

    const delay = getValueAtIndexOrReturn(
      instance.props.delay,
      0,
      defaultProps.delay,
    )

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
      removeDocumentMouseDownListener()

      return
    }

    instance.state.isScheduledToShow = false

    const delay = getValueAtIndexOrReturn(
      instance.props.delay,
      1,
      defaultProps.delay,
    )

    if (delay) {
      hideTimeout = setTimeout((): void => {
        if (instance.state.isVisible) {
          instance.hide()
        }
      }, delay)
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      scheduleHideAnimationFrame = requestAnimationFrame((): void => {
        instance.hide()
      })
    }
  }

  /* ======================= 🔑 Public methods 🔑 ======================= */
  function enable(): void {
    instance.state.isEnabled = true
  }

  function disable(): void {
    // Disabling the instance should also hide it
    // https://github.com/atomiks/tippy.js-react/issues/106
    instance.hide()
    instance.state.isEnabled = false
  }

  function clearDelayTimeouts(): void {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
    cancelAnimationFrame(scheduleHideAnimationFrame)
  }

  function setProps(partialProps: Partial<Props>): void {
    if (__DEV__) {
      partialProps = { ...partialProps }
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'))
    }

    if (instance.state.isDestroyed) {
      return
    }

    if (__DEV__) {
      validateProps(partialProps)
      validateExtraPropsFunctionality(instance, partialProps)

      NON_UPDATEABLE_PROPS.forEach((prop): void => {
        if (hasOwnProperty(partialProps, prop)) {
          delete partialProps[prop]
          warnWhen(true, createCannotUpdateWarning(prop))
        }
      })
    }

    removeListenersFromTriggerTarget()

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

    addListenersToTriggerTarget()

    cleanupInteractiveMouseListeners()
    debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce)

    updatePopperElement(popper, prevProps, nextProps, instance.state.isVisible)
    instance.popperChildren = getChildren(popper)

    if (instance.popperInstance) {
      if (
        POPPER_INSTANCE_DEPENDENCIES.some((prop): boolean => {
          return (
            hasOwnProperty(partialProps, prop) &&
            partialProps[prop] !== prevProps[prop]
          )
        })
      ) {
        instance.popperInstance.destroy()
        createPopperInstance()

        if (instance.state.isVisible) {
          instance.popperInstance.enableEventListeners()
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
    duration: number = getValueAtIndexOrReturn(
      instance.props.duration,
      0,
      defaultProps.duration,
    ),
    shouldPreventPopperTransition: boolean = true,
  ): void {
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'))
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
    if (getTriggerTarget().hasAttribute('disabled')) {
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

      // Double update will apply correct mutations
      instance.popperInstance!.update()

      instance.props.onMount(instance)
      instance.state.isMounted = true

      const node = getTriggerTarget()
      const { aria, interactive } = instance.props

      handleAriaDescribedByAttribute(node, true, aria, tooltip.id)
      handleAriaExpandedAttribute(node, true, interactive)

      // The content should fade in after the backdrop has mostly filled the
      // tooltip element. `clip-path` is the other alternative but is not well-
      // supported and is buggy on some devices.
      content.style.transitionDelay = instance.popperChildren.backdrop
        ? `${Math.round(duration / 12)}ms`
        : ''

      if (instance.props.sticky) {
        makeSticky(instance)
      }

      setTransitionDuration([popper], instance.props.updateDuration)
      setTransitionDuration(transitionableElements, duration)
      setVisibilityState(transitionableElements, 'visible')

      onTransitionedIn(duration, (): void => {
        instance.props.onShown(instance)
        instance.state.isShown = true
      })
    }

    mount()
  }

  function hide(
    duration: number = getValueAtIndexOrReturn(
      instance.props.duration,
      1,
      defaultProps.duration,
    ),
  ): void {
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'))
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

    const node = getTriggerTarget()
    const { aria, interactive } = instance.props

    handleAriaDescribedByAttribute(node, false, aria, tooltip.id)
    handleAriaExpandedAttribute(node, false, interactive)

    onTransitionedOut(duration, (): void => {
      instance.popperInstance!.disableEventListeners()
      instance.popperInstance!.options.placement = instance.props.placement

      popper.parentNode!.removeChild(popper)
      instance.props.onHidden(instance)
      instance.state.isMounted = false
    })
  }

  function destroy(): void {
    if (__DEV__) {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'))
    }

    if (instance.state.isDestroyed) {
      return
    }

    isBeingDestroyed = true

    instance.hide(0)

    removeListenersFromTriggerTarget()

    delete reference._tippy

    if (instance.popperInstance) {
      instance.popperInstance.destroy()
    }

    isBeingDestroyed = false
    instance.state.isDestroyed = true
  }
}

/**
 * Updates the position of the tippy on every animation frame to ensure it stays
 * stuck to the reference element.
 * Optimized by ensuring the reference's clientRect has actually changed before
 * scheduling an update.
 */
function makeSticky(instance: Instance): void {
  let prevRefRect = instance.reference.getBoundingClientRect()

  function updatePosition(): void {
    const currentRefRect = instance.reference.getBoundingClientRect()

    // Only schedule an update if the reference rect has changed
    if (
      prevRefRect.top !== currentRefRect.top ||
      prevRefRect.right !== currentRefRect.right ||
      prevRefRect.bottom !== currentRefRect.bottom ||
      prevRefRect.left !== currentRefRect.left
    ) {
      instance.popperInstance!.scheduleUpdate()
    }

    prevRefRect = currentRefRect

    if (instance.state.isMounted) {
      requestAnimationFrame(updatePosition)
    }
  }

  updatePosition()
}
