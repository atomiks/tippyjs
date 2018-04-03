import Popper from 'popper.js'
import browser from './browser'
import selectors from './selectors'
import {
  getDataAttributeOptions,
  addEventListeners,
  createPopperElement,
  getInnerElements,
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
  resetPopperPosition,
  setContent,
  setAttr
} from './utils'

let idCounter = 1

export default function createTippy(reference, opts) {
  /* ========================= Private props ========================= */
  let mutationObservers = []
  let lastTriggerEvent = {}
  let lastMouseMoveEvent = {}
  let showTimeoutId = 0
  let hideTimeoutId = 0
  let isPreparingToShow = false
  let transitionendListener = () => {}

  /* ========================= Public props ========================= */
  const id = idCounter++

  const options = evaluateOptions(reference, {
    ...opts,
    ...(opts.performance ? {} : getDataAttributeOptions(reference))
  })

  setAttr(reference, options.target ? 'data-tippy-delegate' : 'data-tippy')

  const title = reference.getAttribute('data-title') || options.title

  const listeners = addEventListeners(reference, options, {
    onTrigger,
    onMouseLeave,
    onBlur,
    onDelegateShow,
    onDelegateHide
  })

  const popper = createPopperElement(id, reference, options)

  const state = {
    isEnabled: true,
    isVisible: false,
    isDestroyed: false
  }

  let popperInstance = null

  const tip = {
    reference,
    popper,
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
    createPopperInstance()
    popperInstance.disableEventListeners()
  }

  if (options.showOnInit) {
    enter()
  }

  // Install shortcuts
  reference._tippy = tip
  popper._tippy = tip

  return tip

  /* ========================= Private methods ========================= */
  function followCursorListener(event) {
    const { clientX, clientY } = (lastMouseMoveEvent = event)

    if (!popperInstance) return

    popperInstance.reference = {
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

    popperInstance.scheduleUpdate()
  }

  function createDelegateChildTippy(event) {
    const targetEl = closest(event.target, options.target)
    if (targetEl && !targetEl._tippy) {
      const title = targetEl.getAttribute('data-tippy-title') || options.title
      if (title) {
        createTippy(targetEl, {
          ...options,
          title,
          target: null,
          showOnInit: true
        })
        enter(event)
      }
    }
  }

  function enter(event) {
    clearDelayTimeouts()

    if (state.isVisible) return

    // Is a delegate, create an instance for the child target
    if (options.target) {
      createDelegateChildTippy(event)
      return
    }

    isPreparingToShow = true

    if (options.wait) {
      options.wait(show, event)
      return
    }

    // If the tooltip has a delay, we need to be listening to the mousemove as soon as the trigger
    // event is fired so that it's in the correct position upon mount.
    if (hasFollowCursorBehavior()) {
      const { arrow } = getInnerElements(popper)
      if (arrow) arrow.style.margin = '0'
      document.addEventListener('mousemove', followCursorListener)
    }

    const delay = getValue(options.delay, 0)

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

    if (!state.isVisible) return

    isPreparingToShow = false

    const delay = getValue(options.delay, 1)

    if (delay) {
      hideTimeoutId = setTimeout(() => {
        if (state.isVisible) {
          hide()
        }
      }, delay)
    } else {
      hide()
    }
  }

  function onTrigger(event) {
    if (!state.isEnabled) return

    const shouldStopEvent =
      browser.supportsTouch &&
      browser.usingTouch &&
      ['mouseenter', 'mouseover', 'focus'].indexOf(event.type) > -1

    if (shouldStopEvent && options.touchHold) return

    lastTriggerEvent = event

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      options.hideOnClick !== 'persistent' &&
      state.isVisible
    ) {
      leave()
    } else {
      enter(event)
    }

    // iOS prevents click events from firing
    if (shouldStopEvent && browser.isIOS && reference.click) {
      reference.click()
    }
  }

  function onMouseLeave(event) {
    if (
      ['mouseleave', 'mouseout'].indexOf(event.type) > -1 &&
      browser.supportsTouch &&
      browser.usingTouch &&
      options.touchHold
    )
      return

    if (options.interactive) {
      const onMouseMove = event => {
        const referenceCursorIsOver = closest(event.target, selectors.REFERENCE)
        const cursorIsOverPopper =
          closest(event.target, selectors.POPPER) === popper
        const cursorIsOverReference = referenceCursorIsOver === reference

        if (cursorIsOverPopper || cursorIsOverReference) return

        if (cursorIsOutsideInteractiveBorder(event, popper, options)) {
          document.body.removeEventListener('mouseleave', leave)
          document.removeEventListener('mousemove', onMouseMove)

          leave()
        }
      }

      document.body.addEventListener('mouseleave', hide)
      document.addEventListener('mousemove', onMouseMove)
      return
    }

    leave()
  }

  function onBlur(event) {
    if (event.target !== reference || browser.isUsingTouch) return

    if (options.interactive) {
      if (!event.relatedTarget) return
      if (closest(event.relatedTarget, selectors.POPPER)) return
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
    const { tooltip } = getInnerElements(popper)
    const { popperOptions } = options

    const arrowSelector =
      selectors[options.arrowType === 'round' ? 'ROUND_ARROW' : 'ARROW']
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
        tooltip.style[getPopperPlacement(popper)] = getOffsetDistanceInPx(
          options.distance
        )

        if (arrow && options.arrowTransform) {
          computeArrowTransform(popper, arrow, options.arrowTransform)
        }
      },
      onUpdate() {
        const styles = tooltip.style
        styles.top = ''
        styles.bottom = ''
        styles.left = ''
        styles.right = ''
        styles[getPopperPlacement(popper)] = getOffsetDistanceInPx(
          options.distance
        )

        if (arrow && options.arrowTransform) {
          computeArrowTransform(popper, arrow, options.arrowTransform)
        }
      }
    }

    addMutationObserver({
      target: popper,
      callback: () => {
        popperInstance.update()
      },
      options: {
        childList: true,
        subtree: true,
        characterData: true
      }
    })

    return new Popper(reference, popper, config)
  }

  function mount(onceUpdated) {
    if (!popperInstance) {
      popperInstance = createPopperInstance()
      if (!options.livePlacement) {
        popperInstance.disableEventListeners()
      }
    } else {
      resetPopperPosition(popper)
      popperInstance.scheduleUpdate()
      if (options.livePlacement && !hasFollowCursorBehavior()) {
        popperInstance.enableEventListeners()
      }
    }

    // If the instance previously had followCursor behavior, it will be positioned incorrectly
    // if triggered by `focus` afterwards - update the reference back to the real DOM element
    if (hasFollowCursorBehavior()) {
      const { arrow } = getInnerElements(popper)
      if (arrow) arrow.style.margin = ''
      popperInstance.reference = reference
    }

    updatePopperPosition(popperInstance, onceUpdated, true)

    if (!options.appendTo.contains(popper)) {
      options.appendTo.appendChild(popper)
    }
  }

  function hasFollowCursorBehavior() {
    return (
      options.followCursor &&
      !browser.isUsingTouch &&
      lastTriggerEvent &&
      lastTriggerEvent.type !== 'focus'
    )
  }

  function addMutationObserver({ target, callback, options }) {
    if (!window.MutationObserver) return

    const observer = new MutationObserver(callback)
    observer.observe(target, options)

    mutationObservers.push(observer)
  }

  function makeSticky() {
    const applyTransitionDuration = () => {
      popper.style[prefix('transitionDuration')] = `${options.updateDuration}ms`
    }

    const removeTransitionDuration = () => {
      popper.style[prefix('transitionDuration')] = ''
    }

    const updatePosition = () => {
      if (popperInstance) {
        popperInstance.scheduleUpdate()
      }

      applyTransitionDuration()

      if (state.isVisible) {
        requestAnimationFrame(updatePosition)
      } else {
        removeTransitionDuration()
      }
    }

    defer(updatePosition)
  }

  function onTransitionEnd(duration, callback) {
    // Make callback synchronous if duration is 0
    if (!duration) {
      return callback()
    }

    const { tooltip } = getInnerElements(popper)

    const toggleListeners = (action, listener) => {
      if (!listener) return
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

    toggleListeners('remove', transitionendListener)
    toggleListeners('add', listener)

    transitionendListener = listener
  }

  /* ========================= Public methods ========================= */
  function enable() {
    state.isEnabled = true
  }

  function disable() {
    state.isEnabled = false
  }

  function show(duration) {
    if (state.isDestroyed || !state.isEnabled) return

    const { tooltip, backdrop, content } = getInnerElements(popper)

    // Destroy tooltip if the reference element is no longer on the DOM
    if (!reference.refObj && !document.documentElement.contains(reference)) {
      return destroy()
    }

    setContent(content, options)

    options.onShow(tip)

    duration = getValue(duration !== undefined ? duration : options.duration, 0)

    popper.style.visibility = 'visible'
    state.isVisible = true

    // Prevent a transition if the popper is at the opposite placement
    applyTransitionDuration([popper, tooltip, backdrop], 0)

    mount(() => {
      if (!state.isVisible) return

      if (!hasFollowCursorBehavior()) {
        // FIX: Arrow will sometimes not be positioned correctly. Force another update.
        popperInstance.scheduleUpdate()
      }

      // Set initial position near the cursor
      if (hasFollowCursorBehavior()) {
        popperInstance.disableEventListeners()
        const delay = getValue(options.delay, 0)
        if (lastTriggerEvent) {
          followCursorListener(
            delay && lastMouseMoveEvent ? lastMouseMoveEvent : lastTriggerEvent
          )
        }
      }

      applyTransitionDuration(
        [tooltip, backdrop, backdrop ? content : null],
        duration
      )

      if (backdrop) {
        getComputedStyle(backdrop)[prefix('transform')]
      }

      if (options.interactive) {
        reference.classList.add('tippy-active')
      }

      if (options.sticky) {
        makeSticky()
      }

      setVisibilityState([tooltip, backdrop], 'visible')

      onTransitionEnd(duration, () => {
        if (!options.updateDuration) {
          tooltip.classList.add('tippy-notransition')
        }

        if (options.interactive) {
          focus(popper)
        }

        reference.setAttribute('aria-describedby', `tippy-${id}`)

        options.onShown(tip)
      })
    })
  }

  function hide(duration) {
    if (state.isDestroyed || !state.isEnabled) return

    const { tooltip, backdrop, content } = getInnerElements(popper)

    options.onHide(tip)

    duration = getValue(duration !== undefined ? duration : options.duration, 1)

    if (!options.updateDuration) {
      tooltip.classList.remove('tippy-notransition')
    }

    if (options.interactive) {
      reference.classList.remove('tippy-active')
    }

    popper.style.visibility = 'hidden'
    state.isVisible = false

    applyTransitionDuration(
      [tooltip, backdrop, backdrop ? content : null],
      duration
    )

    setVisibilityState([tooltip, backdrop], 'hidden')

    if (options.interactive && options.trigger.indexOf('click') > -1) {
      focus(reference)
    }

    /*
    * This call is deferred because sometimes when the tooltip is still transitioning in but hide()
    * is called before it finishes, the CSS transition won't reverse quickly enough, meaning
    * the CSS transition will finish 1-2 frames later, and onHidden() will run since the JS set it
    * more quickly. It should actually be onShown(). Seems to be something Chrome does, not Safari
    */
    defer(() => {
      onTransitionEnd(duration, () => {
        if (state.isVisible || !options.appendTo.contains(popper)) return

        if (!isPreparingToShow) {
          document.removeEventListener('mousemove', followCursorListener)
          lastMouseMoveEvent = null
        }

        reference.removeAttribute('aria-describedby')

        popperInstance.disableEventListeners()

        options.appendTo.removeChild(popper)

        options.onHidden(tip)
      })
    })
  }

  function destroy(destroyTargetInstances) {
    if (state.isDestroyed) return

    // Ensure the popper is hidden
    if (state.isVisible) {
      hide(0)
    }

    listeners.forEach(({ eventType, handler }) => {
      reference.removeEventListener(eventType, handler)
    })

    delete reference._tippy

    const attributes = [
      'data-original-title',
      'data-tippy',
      'data-tippy-delegate'
    ]
    attributes.forEach(attr => {
      reference.removeAttribute(attr)
    })

    if (options.target && destroyTargetInstances) {
      toArray(reference.querySelectorAll(options.target)).forEach(
        child => child._tippy && child._tippy.destroy()
      )
    }

    if (popperInstance) {
      popperInstance.destroy()
    }

    mutationObservers.forEach(observer => {
      observer.disconnect()
    })

    state.isDestroyed = true
  }
}
