import Popper from 'popper.js'
import { Browser } from './browser'
import { Selectors } from './selectors'
import {
  getDataAttributeOptions,
  addEventListeners,
  createPopperElement,
  elementCanReceiveFocus,
  getChildren,
  computeArrowTransform,
  updatePopperPosition,
  getPopperPlacement,
  getOffsetDistanceInPx,
  getValue,
  closest,
  cursorIsOutsideInteractiveBorder,
  applyTransitionDuration,
  prefix,
  setVisibilityState,
  evaluateOptions,
  defer,
  setAttr,
  toArray
} from './utils'

let idCounter = 1

export default function createTippy(reference, collectionOptions) {
  // If the reference already has a tippy instance (or it doesn't exist)
  if (!reference || reference._tippy) {
    return null
  }

  /* ========================= 🔒 Private props 🔒 ========================= */
  let mutationObservers = []
  let lastTriggerEvent = {}
  let lastMouseMoveEvent = {}
  let showTimeoutId = 0
  let hideTimeoutId = 0
  let isPreparingToShow = false
  let transitionEndListener = () => {}

  /* ========================= 🔑 Public props 🔑 ========================= */
  // The id counter is incremented each time a tippy is created
  // 🚨 NOTE: mutation here
  const id = idCounter++

  const options = evaluateOptions(reference, {
    ...collectionOptions,
    ...(collectionOptions.performance ? {} : getDataAttributeOptions(reference))
  })

  // Add listeners to the element based on `options.trigger`
  // 🚨 NOTE: mutation here
  const listeners = addEventListeners(reference, options, {
    onTrigger,
    onMouseLeave,
    onBlur,
    onDelegateShow,
    onDelegateHide
  })

  const popper = createPopperElement(id, options)

  const popperChildren = getChildren(popper)

  const state = {
    isEnabled: true,
    isVisible: false,
    isDestroyed: false
  }

  const popperInstance = null

  // 🌟 tippy instance
  const tip = {
    id,
    reference,
    popper,
    popperChildren,
    popperInstance,
    options,
    listeners,
    state,
    show,
    hide,
    enable,
    disable,
    destroy
  }

  if (options.createPopperInstanceOnInit) {
    tip.popperInstance = createPopperInstance()
    tip.popperInstance.disableEventListeners()
  }

  if (options.showOnInit) {
    enter()
  }

  // Ensure the reference element can receive focus (and is not a delegate)
  // 🚨 NOTE: mutation here
  if (options.a11y && !options.target && !elementCanReceiveFocus(reference)) {
    reference.setAttribute('tabindex', '0')
  }

  // Highlight the element as having an active tippy instance with a `data` attribute
  // 🚨 NOTE: mutation here
  setAttr(
    reference,
    options.target ? 'data-tippy-delegate' : 'data-tippy-reference'
  )

  // Install shortcuts
  // 🚨 NOTE: mutations here
  reference._tippy = tip
  popper._tippy = tip

  // ❤️ Thanks hoisting
  return tip

  /* ========================= 🔒 Private methods 🔒 ========================= */
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

  function createDelegateChildTippy(event) {
    const targetEl = closest(event.target, options.target)
    if (targetEl && !targetEl._tippy) {
      const content = tip.options.content
      if (content) {
        createTippy(targetEl, {
          ...tip.options,
          content,
          target: null,
          showOnInit: true
        })
        enter(event)
      }
    }
  }

  function enter(event) {
    clearDelayTimeouts()

    if (tip.state.isVisible) {
      return
    }

    // Is a delegate, create an instance for the child target
    if (tip.options.target) {
      createDelegateChildTippy(event)
      return
    }

    isPreparingToShow = true

    if (tip.options.wait) {
      tip.options.wait(show, event)
      return
    }

    // If the tooltip has a delay, we need to be listening to the mousemove as soon as the trigger
    // event is fired so that it's in the correct position upon mount.
    if (hasFollowCursorBehavior()) {
      if (popperChildren.arrow) {
        popperChildren.arrow.style.margin = '0'
      }
      document.addEventListener('mousemove', followCursorListener)
    }

    const delay = getValue(tip.options.delay, 0)

    if (delay) {
      showTimeoutId = setTimeout(() => {
        show()
      }, delay)
    } else {
      show()
    }
  }

  function leave() {
    clearDelayTimeouts()

    if (!tip.state.isVisible) {
      return
    }

    isPreparingToShow = false

    const delay = getValue(tip.options.delay, 1)

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

  function onTrigger(event) {
    if (!tip.state.isEnabled) {
      return
    }

    const shouldStopEvent =
      Browser.supportsTouch &&
      Browser.isUsingTouch &&
      ['mouseenter', 'mouseover', 'focus'].indexOf(event.type) > -1

    if (shouldStopEvent && tip.options.touchHold) {
      return
    }

    lastTriggerEvent = event

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      tip.options.hideOnClick !== 'persistent' &&
      tip.state.isVisible
    ) {
      leave()
    } else {
      enter(event)
    }

    // iOS prevents click events from firing
    if (shouldStopEvent && Browser.isIOS && reference.click) {
      reference.click()
    }
  }

  function onMouseLeave(event) {
    if (
      ['mouseleave', 'mouseout'].indexOf(event.type) > -1 &&
      Browser.supportsTouch &&
      Browser.isUsingTouch &&
      tip.options.touchHold
    ) {
      return
    }

    if (tip.options.interactive) {
      const onMouseMove = event => {
        const referenceCursorIsOver = closest(event.target, Selectors.REFERENCE)
        const cursorIsOverPopper =
          closest(event.target, Selectors.POPPER) === tip.popper
        const cursorIsOverReference = referenceCursorIsOver === tip.reference

        if (cursorIsOverPopper || cursorIsOverReference) {
          return
        }

        if (cursorIsOutsideInteractiveBorder(event, tip.popper, tip.options)) {
          document.body.removeEventListener('mouseleave', leave)
          document.removeEventListener('mousemove', onMouseMove)

          leave()
        }
      }

      document.body.addEventListener('mouseleave', tip.hide)
      document.addEventListener('mousemove', onMouseMove)
      return
    }

    leave()
  }

  function onBlur(event) {
    if (event.target !== tip.reference || Browser.isUsingTouch) {
      return
    }

    if (tip.options.interactive) {
      if (!event.relatedTarget) {
        return
      }
      if (closest(event.relatedTarget, Selectors.POPPER)) {
        return
      }
    }

    leave()
  }

  function onDelegateShow(event) {
    if (closest(event.target, options.target)) {
      enter(event)
    }
  }

  function onDelegateHide(event) {
    if (closest(event.target, options.target)) {
      leave()
    }
  }

  function clearDelayTimeouts() {
    clearTimeout(showTimeoutId)
    clearTimeout(hideTimeoutId)
  }

  function createPopperInstance() {
    const { tooltip } = popperChildren
    const { popperOptions } = tip.options

    const arrowSelector =
      Selectors[tip.options.arrowType === 'round' ? 'ROUND_ARROW' : 'ARROW']
    const arrow = tooltip.querySelector(arrowSelector)

    const config = {
      placement: options.placement,
      ...(popperOptions || {}),
      modifiers: {
        ...(popperOptions ? popperOptions.modifiers : {}),
        arrow: {
          element: arrowSelector,
          ...(popperOptions && popperOptions.modifiers
            ? popperOptions.modifiers.arrow
            : {})
        },
        flip: {
          enabled: options.flip,
          padding: options.distance + 5 /* 5px from viewport boundary */,
          behavior: options.flipBehavior,
          ...(popperOptions && popperOptions.modifiers
            ? popperOptions.modifiers.flip
            : {})
        },
        offset: {
          offset: options.offset,
          ...(popperOptions && popperOptions.modifiers
            ? popperOptions.modifiers.offset
            : {})
        }
      },
      onCreate() {
        tooltip.style[getPopperPlacement(tip.popper)] = getOffsetDistanceInPx(
          tip.options.distance
        )

        if (arrow && options.arrowTransform) {
          computeArrowTransform(tip.popper, arrow, tip.options.arrowTransform)
        }
      },
      onUpdate() {
        const styles = tooltip.style
        styles.top = ''
        styles.bottom = ''
        styles.left = ''
        styles.right = ''
        styles[getPopperPlacement(tip.popper)] = getOffsetDistanceInPx(
          tip.options.distance
        )

        if (arrow && tip.options.arrowTransform) {
          computeArrowTransform(tip.popper, arrow, tip.options.arrowTransform)
        }
      }
    }

    // If content within the popper changes, its dimensions will also change,
    // thus causing it to be placed incorrectly. It should update BEFORE
    // the next animation frame (i.e. not `scheduleUpdate`), otherwise there
    // will be a 1 frame flash where it jumps
    addMutationObserver({
      target: tip.popper,
      callback: () => {
        tip.popperInstance.update()
      },
      options: {
        childList: true,
        subtree: true,
        characterData: true
      }
    })

    return new Popper(tip.reference, tip.popper, config)
  }

  function mount(onceUpdated) {
    if (!tip.popperInstance) {
      tip.popperInstance = createPopperInstance()
      if (!tip.options.livePlacement) {
        tip.popperInstance.disableEventListeners()
      }
    } else {
      tip.popperInstance.scheduleUpdate()
      if (tip.options.livePlacement && !hasFollowCursorBehavior()) {
        tip.popperInstance.enableEventListeners()
      }
    }

    // If the instance previously had followCursor behavior, it will be positioned incorrectly
    // if triggered by `focus` afterwards - update the reference back to the real DOM element
    if (hasFollowCursorBehavior()) {
      if (popperChildren.arrow) {
        popperChildren.arrow.style.margin = ''
      }
      tip.popperInstance.reference = tip.reference
    }

    updatePopperPosition(tip.popperInstance, onceUpdated, true)

    if (!tip.options.appendTo.contains(tip.popper)) {
      tip.options.appendTo.appendChild(tip.popper)
    }
  }

  function hasFollowCursorBehavior() {
    return (
      tip.options.followCursor &&
      !Browser.isUsingTouch &&
      lastTriggerEvent &&
      lastTriggerEvent.type !== 'focus'
    )
  }

  function addMutationObserver({ target, callback, options }) {
    if (!window.MutationObserver) {
      return
    }

    const observer = new MutationObserver(callback)
    observer.observe(target, options)

    mutationObservers.push(observer)
  }

  function makeSticky() {
    const applyTransitionDuration = () => {
      tip.popper.style[prefix('transitionDuration')] = `${
        tip.options.updateDuration
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
        requestAnimationFrame(updatePosition)
      } else {
        removeTransitionDuration()
      }
    }

    updatePosition()
  }

  function onTransitionEnd(duration, callback) {
    // Make callback synchronous if duration is 0
    if (!duration) {
      return callback()
    }

    const { tooltip } = popperChildren

    const toggleListeners = (action, listener) => {
      if (!listener) {
        return
      }
      tooltip[action + 'EventListener'](
        'ontransitionend' in window ? 'transitionend' : 'webkitTransitionEnd',
        listener
      )
    }

    const listener = e => {
      if (e.target === tooltip) {
        toggleListeners('remove', listener)
        callback()
      }
    }

    toggleListeners('remove', transitionEndListener)
    toggleListeners('add', listener)

    transitionEndListener = listener
  }

  /* ========================= 🔑 Public methods 🔑 ========================= */
  function enable() {
    tip.state.isEnabled = true
  }

  function disable() {
    tip.state.isEnabled = false
  }

  function show(duration) {
    duration = getValue(duration !== undefined ? duration : options.duration, 0)

    if (tip.state.isDestroyed || !tip.state.isEnabled) {
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

    tip.options.onShow(tip)

    tip.popper.style.visibility = 'visible'
    tip.state.isVisible = true

    // Prevent a transition if the popper is at the opposite placement
    applyTransitionDuration(
      [tip.popper, popperChildren.tooltip, popperChildren.backdrop],
      0
    )

    mount(() => {
      if (!tip.state.isVisible) {
        return
      }

      if (!hasFollowCursorBehavior()) {
        // FIX: Arrow will sometimes not be positioned correctly. Force another update.
        tip.popperInstance.scheduleUpdate()
      }

      // Set initial position near the cursor
      if (hasFollowCursorBehavior()) {
        tip.popperInstance.disableEventListeners()
        const delay = getValue(tip.options.delay, 0)
        if (lastTriggerEvent) {
          followCursorListener(
            delay && lastMouseMoveEvent ? lastMouseMoveEvent : lastTriggerEvent
          )
        }
      }

      applyTransitionDuration(
        [
          popperChildren.tooltip,
          popperChildren.backdrop,
          popperChildren.backdrop ? popperChildren.content : null
        ],
        duration
      )

      if (popperChildren.backdrop) {
        getComputedStyle(popperChildren.backdrop)[prefix('transform')]
      }

      if (tip.options.interactive) {
        tip.reference.classList.add('tippy-active')
      }

      if (tip.options.sticky) {
        makeSticky()
      }

      setVisibilityState(
        [popperChildren.tooltip, popperChildren.backdrop],
        'visible'
      )

      onTransitionEnd(duration, () => {
        if (!tip.options.updateDuration) {
          popperChildren.tooltip.classList.add('tippy-notransition')
        }

        if (tip.options.interactive) {
          focus(tip.popper)
        }

        tip.reference.setAttribute('aria-describedby', `tippy-${tip.id}`)

        tip.options.onShown(tip)
      })
    })
  }

  function hide(duration) {
    duration = getValue(duration !== undefined ? duration : options.duration, 1)

    if (tip.state.isDestroyed || !tip.state.isEnabled) {
      return
    }

    tip.options.onHide(tip)

    if (!tip.options.updateDuration) {
      popperChildren.tooltip.classList.remove('tippy-notransition')
    }

    if (tip.options.interactive) {
      tip.reference.classList.remove('tippy-active')
    }

    tip.popper.style.visibility = 'hidden'
    tip.state.isVisible = false

    applyTransitionDuration(
      [
        popperChildren.tooltip,
        popperChildren.backdrop,
        popperChildren.backdrop ? popperChildren.content : null
      ],
      duration
    )

    setVisibilityState(
      [popperChildren.tooltip, popperChildren.backdrop],
      'hidden'
    )

    if (tip.options.interactive && tip.options.trigger.indexOf('click') > -1) {
      focus(tip.reference)
    }

    /*
    * This call is deferred because sometimes when the tooltip is still transitioning in but hide()
    * is called before it finishes, the CSS transition won't reverse quickly enough, meaning
    * the CSS transition will finish 1-2 frames later, and onHidden() will run since the JS set it
    * more quickly. It should actually be onShown(). Seems to be something Chrome does, not Safari
    */
    defer(() => {
      onTransitionEnd(duration, () => {
        if (tip.state.isVisible || !tip.options.appendTo.contains(tip.popper)) {
          return
        }

        if (!isPreparingToShow) {
          document.removeEventListener('mousemove', followCursorListener)
          lastMouseMoveEvent = null
        }

        tip.reference.removeAttribute('aria-describedby')

        tip.popperInstance.disableEventListeners()

        tip.options.appendTo.removeChild(tip.popper)

        tip.options.onHidden(tip)
      })
    })
  }

  function destroy(destroyTargetInstances) {
    if (tip.state.isDestroyed) {
      return
    }

    // Ensure the popper is hidden
    if (tip.state.isVisible) {
      hide(0)
    }

    tip.listeners.forEach(({ eventType, handler }) => {
      tip.reference.removeEventListener(eventType, handler)
    })

    delete tip.reference._tippy

    const attributes = ['data-tippy-reference', 'data-tippy-delegate']
    attributes.forEach(attr => {
      tip.reference.removeAttribute(attr)
    })

    if (tip.options.target && destroyTargetInstances) {
      toArray(tip.reference.querySelectorAll(tip.options.target)).forEach(
        child => child._tippy && child._tippy.destroy()
      )
    }

    if (tip.popperInstance) {
      tip.popperInstance.destroy()
    }

    mutationObservers.forEach(observer => {
      observer.disconnect()
    })

    tip.state.isDestroyed = true
  }
}
