import Popper from 'popper.js'
import { Defaults } from './defaults'
import { Browser } from './browser'
import { Selectors } from './selectors'
import {
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
  isCursorOutsideInteractiveBorder,
  applyTransitionDuration,
  prefix,
  setVisibilityState,
  evaluateProps,
  defer,
  setAttr,
  toArray
} from './utils'

let idCounter = 1

export default function createTippy(reference, collectionProps) {
  if (!reference) {
    throw Error('[tippy]: reference does not exist')
  }

  /* ========================= 🔒 Private members 🔒 ========================= */
  let mutationObservers = []
  let lastTriggerEvent = {}
  let lastMouseMoveEvent = {}
  let showTimeoutId = 0
  let hideTimeoutId = 0
  let isPreparingToShow = false
  let transitionEndListener = () => {}

  /* ========================= 🔑 Public members 🔑 ========================= */
  const props = evaluateProps(reference, collectionProps)

  // If the reference shouldn't have multiple tippys, return null early
  if (!props.multiple && reference._tippy) {
    return null
  }

  const id = idCounter++

  const listeners = addEventListeners(reference, props, {
    onTrigger,
    onMouseLeave,
    onBlur,
    onDelegateShow,
    onDelegateHide
  })

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
    id,
    reference,
    popper,
    popperChildren,
    popperInstance,
    props,
    listeners,
    state,
    set,
    show,
    hide,
    enable,
    disable,
    destroy
  }

  if (props.createPopperInstanceOnInit) {
    tip.popperInstance = createPopperInstance()
    tip.popperInstance.disableEventListeners()
  }

  if (props.showOnInit) {
    enter()
  }

  // Ensure the reference element can receive focus (and is not a delegate)
  if (props.a11y && !props.target && !elementCanReceiveFocus(reference)) {
    setAttr(reference, 'tabindex', '0')
  }

  // Highlight the element as having an active tippy instance with a `data` attribute
  setAttr(
    reference,
    props.target ? 'data-tippy-delegate' : 'data-tippy-reference'
  )

  // Install shortcuts
  reference._tippy = tip
  popper._tippy = tip

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
    if (tip.props.target) {
      createDelegateChildTippy(event)
      return
    }

    isPreparingToShow = true

    if (tip.props.wait) {
      tip.props.wait(show, event)
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

    const delay = getValue(tip.props.delay, 0)

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

    const delay = getValue(tip.props.delay, 1)

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

  function set(partialprops) {
    const newprops = evaluateProps(tip.reference, {
      ...tip.props,
      ...partialprops
    })

    const { isVisible } = tip.state

    if (isVisible && tip.props.appendTo.contains(tip.popper)) {
      tip.props.appendTo.removeChild(tip.popper)
    }

    tip.popper = createPopperElement(tip.id, newprops)
    tip.popper._tippy = tip
    tip.popperChildren = getChildren(tip.popper)
    tip.popperInstance && (tip.popperInstance.popper = tip.popper)
    tip.props = newprops

    if (isVisible) {
      show(0)
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

    if (shouldStopEvent && tip.props.touchHold) {
      return
    }

    lastTriggerEvent = event

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      tip.props.hideOnClick !== 'persistent' &&
      tip.state.isVisible
    ) {
      leave()
    } else {
      enter(event)
    }
  }

  function onMouseLeave(event) {
    if (
      ['mouseleave', 'mouseout'].indexOf(event.type) > -1 &&
      Browser.supportsTouch &&
      Browser.isUsingTouch &&
      tip.props.touchHold
    ) {
      return
    }

    if (tip.props.interactive) {
      const onMouseMove = event => {
        const referenceCursorIsOver = closest(event.target, Selectors.REFERENCE)
        const cursorIsOverPopper =
          closest(event.target, Selectors.POPPER) === tip.popper
        const cursorIsOverReference = referenceCursorIsOver === tip.reference

        if (cursorIsOverPopper || cursorIsOverReference) {
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

    if (tip.props.interactive) {
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
    if (closest(event.target, tip.props.target)) {
      enter(event)
    }
  }

  function onDelegateHide(event) {
    if (closest(event.target, tip.props.target)) {
      leave()
    }
  }

  function clearDelayTimeouts() {
    clearTimeout(showTimeoutId)
    clearTimeout(hideTimeoutId)
  }

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

    // If content within the popper changes, its dimensions will also change,
    // thus causing it to be placed incorrectly. It should update BEFORE
    // the next animation frame (i.e. not `scheduleUpdate`), otherwise there
    // will be a 1 frame flash where it jumps
    addMutationObserver({
      target: tip.popper,
      callback: () => {
        tip.popperInstance.update()
      },
      props: {
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
      if (!tip.props.livePlacement) {
        tip.popperInstance.disableEventListeners()
      }
    } else {
      tip.popperInstance.scheduleUpdate()
      if (tip.props.livePlacement && !hasFollowCursorBehavior()) {
        tip.popperInstance.enableEventListeners()
      }
    }

    // If the instance previously had followCursor behavior, it will be positioned incorrectly
    // if triggered by `focus` afterwards - update the reference back to the real DOM element
    if (hasFollowCursorBehavior()) {
      if (tip.popperChildren.arrow) {
        tip.popperChildren.arrow.style.margin = ''
      }
      tip.popperInstance.reference = tip.reference
    }

    updatePopperPosition(tip.popperInstance, onceUpdated, true)

    if (!tip.props.appendTo.contains(tip.popper)) {
      tip.props.appendTo.appendChild(tip.popper)
    }
  }

  function hasFollowCursorBehavior() {
    return (
      tip.props.followCursor &&
      !Browser.isUsingTouch &&
      lastTriggerEvent &&
      lastTriggerEvent.type !== 'focus'
    )
  }

  function addMutationObserver({ target, callback, props }) {
    if (!window.MutationObserver) {
      return
    }

    const observer = new MutationObserver(callback)
    observer.observe(target, props)

    mutationObservers.push(observer)
  }

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

    const { tooltip } = tip.popperChildren

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

  function show(duration = getValue(tip.props.duration, 0)) {
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
        // FIX: Arrow will sometimes not be positioned correctly. Force another update.
        tip.popperInstance.scheduleUpdate()
      }

      // Set initial position near the cursor
      if (hasFollowCursorBehavior()) {
        tip.popperInstance.disableEventListeners()
        const delay = getValue(tip.props.delay, 0)
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

      if (tip.popperChildren.backdrop) {
        getComputedStyle(tip.popperChildren.backdrop)[prefix('transform')]
      }

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

      onTransitionEnd(duration, () => {
        if (!tip.props.updateDuration) {
          tip.popperChildren.tooltip.classList.add('tippy-notransition')
        }

        if (tip.props.interactive) {
          focus(tip.popper)
        }

        setAttr(tip.reference, 'aria-describedby', `tippy-${tip.id}`)

        tip.props.onShown(tip)
      })
    })
  }

  function hide(duration = getValue(tip.props.duration, 1)) {
    if (tip.state.isDestroyed || !tip.state.isEnabled) {
      return
    }

    tip.props.onHide(tip)

    if (!tip.props.updateDuration) {
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

    if (tip.props.interactive && tip.props.trigger.indexOf('click') > -1) {
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
        if (tip.state.isVisible || !tip.props.appendTo.contains(tip.popper)) {
          return
        }

        if (!isPreparingToShow) {
          document.removeEventListener('mousemove', followCursorListener)
          lastMouseMoveEvent = null
        }

        tip.reference.removeAttribute('aria-describedby')

        tip.popperInstance.disableEventListeners()

        tip.props.appendTo.removeChild(tip.popper)

        tip.props.onHidden(tip)
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

    if (tip.props.target && destroyTargetInstances) {
      toArray(tip.reference.querySelectorAll(tip.props.target)).forEach(
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
