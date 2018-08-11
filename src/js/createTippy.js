import Popper from 'popper.js'
import { Defaults } from './defaults'
import { Selectors } from './selectors'
import { isUsingTouch, isIE, supportsTouch } from './bindGlobalEventListeners'
import {
  createPopperElement,
  elementCanReceiveFocus,
  getChildren,
  computeArrowTransform,
  updatePopperPosition,
  getPopperPlacement,
  getOffsetDistanceInPx,
  getValue,
  closest,
  closestCallback,
  isCursorOutsideInteractiveBorder,
  applyTransitionDuration,
  prefix,
  setVisibilityState,
  updatePopperElement,
  evaluateProps,
  defer,
  toArray,
  focus,
  toggleListener
} from './utils'

let idCounter = 1

export default function createTippy(reference, collectionProps) {
  const props = evaluateProps(reference, collectionProps)

  // If the reference shouldn't have multiple tippys, return null early
  if (!props.multiple && reference._tippy) {
    return null
  }

  /* ======================= 🔒 Private members 🔒 ======================= */
  let popperMutationObserver = null
  let lastTriggerEvent = {}
  let lastMouseMoveEvent = {}
  let showTimeoutId = 0
  let hideTimeoutId = 0
  let isPreparingToShow = false
  let transitionEndListener = () => {}
  let listeners = []
  let referenceJustProgrammaticallyFocused = false

  /* ======================= 🔑 Public members 🔑 ======================= */
  const id = idCounter++

  const popper = createPopperElement(id, props)

  const popperChildren = getChildren(popper)

  const state = {
    isEnabled: true,
    isVisible: false,
    isDestroyed: false
  }

  const popperInstance = null

  // 🌟 tippy instance
  const tip = {
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
    show,
    hide,
    enable,
    disable,
    destroy
  }

  addEventListeners()

  if (!props.lazy) {
    tip.popperInstance = createPopperInstance()
    tip.popperInstance.disableEventListeners()
  }

  if (props.showOnInit) {
    /**
     * Firefox has a bug where the tooltip will be placed incorrectly due to
     * strange layout on load, `setTimeout` gives the layout time to adjust
     * properly
     */
    setTimeout(prepareShow, 20)
  }

  // Ensure the reference element can receive focus (and is not a delegate)
  if (props.a11y && !props.target && !elementCanReceiveFocus(reference)) {
    reference.setAttribute('tabindex', '0')
  }

  // Install shortcuts
  reference._tippy = tip
  popper._tippy = tip

  return tip

  /* ======================= 🔒 Private methods 🔒 ======================= */
  /**
   * Listener for the `followCursor` prop
   */
  function followCursorListener(event) {
    const { clientX, clientY } = (lastMouseMoveEvent = event)

    if (!tip.popperInstance) {
      return
    }

    tip.popperInstance.reference = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY
      }),
      clientWidth: 0,
      clientHeight: 0
    }

    tip.popperInstance.scheduleUpdate()
  }

  /**
   * Creates the tippy instance for a delegate when it's been triggered
   */
  function createDelegateChildTippy(event) {
    const targetEl = closest(event.target, tip.props.target)
    if (targetEl && !targetEl._tippy) {
      const content = tip.props.content
      if (content) {
        createTippy(targetEl, {
          ...tip.props,
          content,
          target: '',
          showOnInit: true
        })
        prepareShow(event)
      }
    }
  }

  /**
   * Setup before show() is invoked (delays, etc.)
   */
  function prepareShow(event) {
    clearDelayTimeouts()

    if (tip.state.isVisible) {
      return
    }

    // Is a delegate, create an instance for the child target
    if (tip.props.target) {
      createDelegateChildTippy(event)
      return
    }

    isPreparingToShow = true

    if (tip.props.wait) {
      tip.props.wait(show, event)
      return
    }

    /**
     * If the tooltip has a delay, we need to be listening to the mousemove as
     * soon as the trigger event is fired so that it's in the correct position
     * upon mount
     */
    if (hasFollowCursorBehavior()) {
      if (popperChildren.arrow) {
        popperChildren.arrow.style.margin = '0'
      }
      document.addEventListener('mousemove', followCursorListener)
    }

    const delay = getValue(tip.props.delay, 0, Defaults.delay)

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
  function prepareHide() {
    clearDelayTimeouts()

    if (!tip.state.isVisible) {
      return
    }

    isPreparingToShow = false

    const delay = getValue(tip.props.delay, 1, Defaults.delay)

    if (delay) {
      hideTimeoutId = setTimeout(() => {
        if (tip.state.isVisible) {
          hide()
        }
      }, delay)
    } else {
      hide()
    }
  }

  /**
   * Event listener invoked upon trigger
   */
  function onTrigger(event) {
    if (!tip.state.isEnabled) {
      return
    }

    const shouldStopEvent =
      supportsTouch &&
      isUsingTouch &&
      ['mouseenter', 'mouseover', 'focus'].indexOf(event.type) > -1

    if (shouldStopEvent && tip.props.touchHold) {
      return
    }

    lastTriggerEvent = event

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      tip.props.hideOnClick !== false &&
      tip.state.isVisible
    ) {
      prepareHide()
    } else {
      prepareShow(event)
    }
  }

  /**
   * Event listener used for interactive tooltips to detect when they should hide
   */
  function onMouseMove(event) {
    const referenceTheCursorIsOver = closestCallback(
      event.target,
      el => el._tippy
    )

    const isCursorOverPopper =
      closest(event.target, Selectors.POPPER) === tip.popper
    const isCursorOverReference = referenceTheCursorIsOver === tip.reference

    if (isCursorOverPopper || isCursorOverReference) {
      return
    }

    if (
      isCursorOutsideInteractiveBorder(
        getPopperPlacement(tip.popper),
        tip.popper.getBoundingClientRect(),
        event,
        tip.props
      )
    ) {
      document.body.removeEventListener('mouseleave', prepareHide)
      document.removeEventListener('mousemove', onMouseMove)

      prepareHide()
    }
  }

  /**
   * Event listener invoked upon mouseleave
   */
  function onMouseLeave(event) {
    if (
      ['mouseleave', 'mouseout'].indexOf(event.type) > -1 &&
      supportsTouch &&
      isUsingTouch &&
      tip.props.touchHold
    ) {
      return
    }

    if (tip.props.interactive) {
      document.body.addEventListener('mouseleave', prepareHide)
      document.addEventListener('mousemove', onMouseMove)
      return
    }

    prepareHide()
  }

  /**
   * Event listener invoked upon blur
   */
  function onBlur(event) {
    if (event.target !== tip.reference || isUsingTouch) {
      return
    }

    if (tip.props.interactive) {
      if (!event.relatedTarget) {
        return
      }
      if (closest(event.relatedTarget, Selectors.POPPER)) {
        return
      }
    }

    prepareHide()
  }

  /**
   * Event listener invoked when a child target is triggered
   */
  function onDelegateShow(event) {
    if (closest(event.target, tip.props.target)) {
      prepareShow(event)
    }
  }

  /**
   * Event listener invoked when a child target should hide
   */
  function onDelegateHide(event) {
    if (closest(event.target, tip.props.target)) {
      prepareHide()
    }
  }

  /**
   * Creates the popper instance for the tip
   */
  function createPopperInstance() {
    const { tooltip } = tip.popperChildren
    const { props } = tip.props

    const arrowSelector =
      Selectors[tip.props.arrowType === 'round' ? 'ROUND_ARROW' : 'ARROW']
    const arrow = tooltip.querySelector(arrowSelector)

    const config = {
      placement: tip.props.placement,
      ...(props || {}),
      modifiers: {
        ...(props ? props.modifiers : {}),
        arrow: {
          element: arrowSelector,
          ...(props && props.modifiers ? props.modifiers.arrow : {})
        },
        flip: {
          enabled: tip.props.flip,
          padding: tip.props.distance + 5 /* 5px from viewport boundary */,
          behavior: tip.props.flipBehavior,
          ...(props && props.modifiers ? props.modifiers.flip : {})
        },
        offset: {
          offset: tip.props.offset,
          ...(props && props.modifiers ? props.modifiers.offset : {})
        }
      },
      onCreate() {
        tooltip.style[getPopperPlacement(tip.popper)] = getOffsetDistanceInPx(
          tip.props.distance,
          Defaults.distance
        )

        if (arrow && tip.props.arrowTransform) {
          computeArrowTransform(arrow, tip.props.arrowTransform)
        }
      },
      onUpdate() {
        const styles = tooltip.style
        styles.top = ''
        styles.bottom = ''
        styles.left = ''
        styles.right = ''
        styles[getPopperPlacement(tip.popper)] = getOffsetDistanceInPx(
          tip.props.distance,
          Defaults.distance
        )

        if (arrow && tip.props.arrowTransform) {
          computeArrowTransform(arrow, tip.props.arrowTransform)
        }
      }
    }

    /**
     * Ensure the popper's position stays correct if its dimensions change.
     * Use .update() over .scheduleUpdate() so there is no 1 frame flash
     * due to async update.
     */
    const observer = new MutationObserver(() => {
      tip.popperInstance.update()
    })
    observer.observe(tip.popper, { childList: true, subtree: true })
    if (popperMutationObserver) {
      popperMutationObserver.disconnect()
    }
    popperMutationObserver = observer

    return new Popper(tip.reference, tip.popper, config)
  }

  /**
   * Mounts the tooltip to the DOM
   */
  function mount(onceUpdated) {
    if (!tip.popperInstance) {
      tip.popperInstance = createPopperInstance()
      if (!tip.props.livePlacement) {
        tip.popperInstance.disableEventListeners()
      }
    } else {
      tip.popperInstance.scheduleUpdate()
      if (tip.props.livePlacement && !hasFollowCursorBehavior()) {
        tip.popperInstance.enableEventListeners()
      }
    }

    /**
     * If the instance previously had followCursor behavior, it will be
     * positioned incorrectly if triggered by `focus` afterwards.
     * Update the reference back to the real DOM element
     */
    tip.popperInstance.reference = tip.reference
    if (hasFollowCursorBehavior()) {
      if (tip.popperChildren.arrow) {
        tip.popperChildren.arrow.style.margin = ''
      }
    }

    updatePopperPosition(tip.popperInstance, onceUpdated, true)

    if (!tip.props.appendTo.contains(tip.popper)) {
      tip.props.appendTo.appendChild(tip.popper)
    }
  }

  /**
   * Determines if the instance is in `followCursor` mode
   */
  function hasFollowCursorBehavior() {
    return (
      tip.props.followCursor &&
      !isUsingTouch &&
      lastTriggerEvent.type !== 'focus'
    )
  }

  /**
   * Updates the tooltip's position on each animation frame + timeout
   */
  function makeSticky() {
    const applyTransitionDuration = () => {
      tip.popper.style[prefix('transitionDuration')] = `${
        tip.props.updateDuration
      }ms`
    }

    const removeTransitionDuration = () => {
      tip.popper.style[prefix('transitionDuration')] = ''
    }

    const updatePosition = () => {
      if (tip.popperInstance) {
        tip.popperInstance.scheduleUpdate()
      }

      applyTransitionDuration()

      if (tip.state.isVisible) {
        defer(updatePosition)
      } else {
        removeTransitionDuration()
      }
    }

    updatePosition()
  }

  /**
   * Invokes a callback once the tooltip has fully transitioned out
   */
  function onTransitionedOut(duration, callback) {
    onTransitionEnd(false, duration, () => {
      if (!tip.state.isVisible && tip.props.appendTo.contains(tip.popper)) {
        callback()
      }
    })
  }

  /**
   * Invokes a callback once the tooltip has fully transitioned in
   */
  function onTransitionedIn(duration, callback) {
    onTransitionEnd(true, duration, callback)
  }

  /**
   * Invokes a callback once the tooltip's CSS transition ends
   */
  function onTransitionEnd(isInDirection, duration, callback) {
    // Make callback synchronous if duration is 0
    if (duration === 0) {
      return callback()
    }

    const { tooltip } = tip.popperChildren

    const listener = e => {
      if (
        e.target === tooltip &&
        getComputedStyle(tooltip).opacity === (isInDirection ? '1' : '0')
      ) {
        toggleListener(tooltip, 'remove', listener)
        callback()
      }
    }

    toggleListener(tooltip, 'remove', transitionEndListener)
    toggleListener(tooltip, 'add', listener)

    transitionEndListener = listener
  }

  function on(eventType, handler, acc) {
    tip.reference.addEventListener(eventType, handler)
    acc.push({ eventType, handler })
  }

  /**
   * Adds event listeners to the reference based on the `trigger` prop
   */
  function addEventListeners() {
    listeners = tip.props.trigger
      .trim()
      .split(' ')
      .reduce((acc, eventType) => {
        if (eventType === 'manual') {
          return acc
        }

        if (!props.target) {
          on(eventType, onTrigger, acc)
          switch (eventType) {
            case 'mouseenter':
              on('mouseleave', onMouseLeave, acc)
              break
            case 'focus':
              on(isIE ? 'focusout' : 'blur', onBlur, acc)
              break
          }
        } else {
          switch (eventType) {
            case 'mouseenter':
              on('mouseover', onDelegateShow, acc)
              on('mouseout', onDelegateHide, acc)
              break
            case 'focus':
              on('focusin', onDelegateShow, acc)
              on('focusout', onDelegateHide, acc)
              break
            case 'click':
              on(eventType, onDelegateShow, acc)
              break
          }
        }

        return acc
      }, [])
  }

  /**
   * Removes event listeners from the reference
   */
  function removeEventListeners() {
    listeners.forEach(({ eventType, handler }) => {
      tip.reference.removeEventListener(eventType, handler)
    })
  }

  /* ======================= 🔑 Public methods 🔑 ======================= */
  /**
   * Enables the instance to allow it to show or hide
   */
  function enable() {
    tip.state.isEnabled = true
  }

  /**
   * Disables the instance to disallow it to show or hide
   */
  function disable() {
    tip.state.isEnabled = false
  }

  /**
   * Clears pending timeouts related to the `delay` prop if any
   */
  function clearDelayTimeouts() {
    clearTimeout(showTimeoutId)
    clearTimeout(hideTimeoutId)
  }

  /**
   * Sets new props for the instance and redraws the tooltip
   */
  function set(options) {
    const prevProps = tip.props
    const nextProps = evaluateProps(tip.reference, {
      ...tip.props,
      ...options,
      performance: true
    })
    nextProps.performance = options.performance || prevProps.performance
    tip.props = nextProps

    // Update listeners if `trigger` option changed
    if (options.trigger) {
      removeEventListeners()
      addEventListeners()
    }

    // Redraw
    updatePopperElement(tip.popper, prevProps, nextProps)
    tip.popperChildren = getChildren(tip.popper)
    tip.popperInstance && (tip.popperInstance = createPopperInstance())
  }

  /**
   * Shows the tooltip
   */
  function show(
    duration = getValue(tip.props.duration, 0, Defaults.duration[0])
  ) {
    if (
      tip.state.isDestroyed ||
      !tip.state.isEnabled ||
      (isUsingTouch && !tip.props.touch)
    ) {
      return
    }

    // Destroy tooltip if the reference element is no longer on the DOM
    if (
      !tip.reference.isVirtual &&
      !document.documentElement.contains(tip.reference)
    ) {
      return destroy()
    }

    // Do not show tooltip if the reference element has a `disabled` attribute
    if (tip.reference.hasAttribute('disabled')) {
      return
    }

    // If the reference was just programmatically focused for accessibility reasons
    if (referenceJustProgrammaticallyFocused) {
      referenceJustProgrammaticallyFocused = false
      return
    }

    tip.props.onShow(tip)

    tip.popper.style.visibility = 'visible'
    tip.state.isVisible = true

    // Prevent a transition if the popper is at the opposite placement
    applyTransitionDuration(
      [tip.popper, tip.popperChildren.tooltip, tip.popperChildren.backdrop],
      0
    )

    mount(() => {
      if (!tip.state.isVisible) {
        return
      }

      if (!hasFollowCursorBehavior()) {
        // Arrow will sometimes not be positioned correctly. Force another update.
        tip.popperInstance.scheduleUpdate()
      }

      // Set initial position near the cursor
      if (hasFollowCursorBehavior()) {
        tip.popperInstance.disableEventListeners()
        const delay = getValue(tip.props.delay, 0, Defaults.delay)
        if (lastTriggerEvent) {
          followCursorListener(
            delay && lastMouseMoveEvent ? lastMouseMoveEvent : lastTriggerEvent
          )
        }
      }

      applyTransitionDuration(
        [
          tip.popperChildren.tooltip,
          tip.popperChildren.backdrop,
          tip.popperChildren.backdrop ? tip.popperChildren.content : null
        ],
        duration
      )

      if (tip.props.interactive) {
        tip.reference.classList.add('tippy-active')
      }

      if (tip.props.sticky) {
        makeSticky()
      }

      setVisibilityState(
        [tip.popperChildren.tooltip, tip.popperChildren.backdrop],
        'visible'
      )

      onTransitionedIn(duration, () => {
        if (!tip.props.updateDuration) {
          tip.popperChildren.tooltip.classList.add('tippy-notransition')
        }

        if (tip.props.interactive && lastTriggerEvent.type === 'focus') {
          focus(tip.popper)
        }

        tip.reference.setAttribute('aria-describedby', tip.popper.id)

        tip.props.onShown(tip)
      })
    })
  }

  /**
   * Hides the tooltip
   */
  function hide(
    duration = getValue(tip.props.duration, 1, Defaults.duration[1])
  ) {
    if (tip.state.isDestroyed || !tip.state.isEnabled) {
      return
    }

    tip.props.onHide(tip)

    if (tip.props.updateDuration === 0) {
      tip.popperChildren.tooltip.classList.remove('tippy-notransition')
    }

    if (tip.props.interactive) {
      tip.reference.classList.remove('tippy-active')
    }

    tip.popper.style.visibility = 'hidden'
    tip.state.isVisible = false

    applyTransitionDuration(
      [
        tip.popperChildren.tooltip,
        tip.popperChildren.backdrop,
        tip.popperChildren.backdrop ? tip.popperChildren.content : null
      ],
      duration
    )

    setVisibilityState(
      [tip.popperChildren.tooltip, tip.popperChildren.backdrop],
      'hidden'
    )

    if (
      tip.props.interactive &&
      !referenceJustProgrammaticallyFocused &&
      lastTriggerEvent.type === 'focus'
    ) {
      referenceJustProgrammaticallyFocused = true
      focus(tip.reference)
    }

    onTransitionedOut(duration, () => {
      if (!isPreparingToShow) {
        document.removeEventListener('mousemove', followCursorListener)
        lastMouseMoveEvent = null
      }

      tip.reference.removeAttribute('aria-describedby')

      tip.popperInstance.disableEventListeners()

      tip.props.appendTo.removeChild(tip.popper)

      tip.props.onHidden(tip)
    })
  }

  /**
   * Destroys the tooltip
   */
  function destroy(destroyTargetInstances) {
    if (tip.state.isDestroyed) {
      return
    }

    // Ensure the popper is hidden
    if (tip.state.isVisible) {
      hide(0)
    }

    removeEventListeners()

    delete tip.reference._tippy

    if (tip.props.target && destroyTargetInstances) {
      toArray(tip.reference.querySelectorAll(tip.props.target)).forEach(
        child => child._tippy && child._tippy.destroy()
      )
    }

    if (tip.popperInstance) {
      tip.popperInstance.destroy()
    }

    if (popperMutationObserver) {
      popperMutationObserver.disconnect()
    }

    tip.state.isDestroyed = true
  }
}
