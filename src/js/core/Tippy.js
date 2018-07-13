import { selectors, browser } from './globals'

import Popper from 'popper.js'

import tippy from '../tippy'

import updatePopperPosition from '../utils/updatePopperPosition'
import cursorIsOutsideInteractiveBorder from '../utils/cursorIsOutsideInteractiveBorder'
import computeArrowTransform from '../utils/computeArrowTransform'
import getInnerElements from '../utils/getInnerElements'
import getPopperPlacement from '../utils/getPopperPlacement'
import getOffsetDistanceInPx from '../utils/getOffsetDistanceInPx'
import prefix from '../utils/prefix'
import defer from '../utils/defer'
import closest from '../utils/closest'
import getValue from '../utils/getValue'
import setVisibilityState from '../utils/setVisibilityState'
import applyTransitionDuration from '../utils/applyTransitionDuration'
import toArray from '../utils/toArray'
import focus from '../utils/focus'

const key = {}
const store = data => k => k === key && data

export class Tippy {
  constructor(config) {
    for (const key in config) {
      this[key] = config[key]
    }

    this.state = {
      destroyed: false,
      visible: false,
      enabled: true
    }

    this._ = store({
      mutationObservers: []
    })
  }

  /**
   * Enables the tooltip to allow it to show or hide
   * @memberof Tippy
   * @public
   */
  enable() {
    this.state.enabled = true
  }

  /**
   * Disables the tooltip from showing or hiding, but does not destroy it
   * @memberof Tippy
   * @public
   */
  disable() {
    this.state.enabled = false
  }

  /**
   * Shows the tooltip
   * @param {Number} duration in milliseconds
   * @memberof Tippy
   * @public
   */
  show(duration) {
    if (this.state.destroyed || !this.state.enabled) return

    const { popper, reference, options } = this
    const { tooltip, backdrop, content } = getInnerElements(popper)

    // If the `dynamicTitle` option is true, the instance is allowed
    // to be created with an empty title. Make sure that the tooltip
    // content is not empty before showing it
    if (
      options.dynamicTitle &&
      !reference.getAttribute('data-original-title')
    ) {
      return
    }

    // Do not show tooltip if reference contains 'disabled' attribute. FF fix for #221
    if (reference.hasAttribute('disabled')) return

    // Destroy tooltip if the reference element is no longer on the DOM
    if (!reference.refObj && !document.documentElement.contains(reference)) {
      this.destroy()
      return
    }

    options.onShow.call(popper, this)

    duration = getValue(duration !== undefined ? duration : options.duration, 0)

    // Prevent a transition when popper changes position
    applyTransitionDuration([popper, tooltip, backdrop], 0)

    popper.style.visibility = 'visible'
    this.state.visible = true

    _mount.call(this, () => {
      if (!this.state.visible) return

      if (!_hasFollowCursorBehavior.call(this)) {
        // FIX: Arrow will sometimes not be positioned correctly. Force another update.
        this.popperInstance.scheduleUpdate()
      }

      // Set initial position near the cursor
      if (_hasFollowCursorBehavior.call(this)) {
        this.popperInstance.disableEventListeners()
        const delay = getValue(options.delay, 0)
        const lastTriggerEvent = this._(key).lastTriggerEvent
        if (lastTriggerEvent) {
          this._(key).followCursorListener(
            delay && this._(key).lastMouseMoveEvent
              ? this._(key).lastMouseMoveEvent
              : lastTriggerEvent
          )
        }
      }

      // Re-apply transition durations
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
        _makeSticky.call(this)
      }

      setVisibilityState([tooltip, backdrop], 'visible')

      _onTransitionEnd.call(this, duration, () => {
        if (!options.updateDuration) {
          tooltip.classList.add('tippy-notransition')
        }

        if (options.interactive) {
          focus(popper)
        }

        reference.setAttribute('aria-describedby', `tippy-${this.id}`)

        options.onShown.call(popper, this)
      })
    })
  }

  /**
   * Hides the tooltip
   * @param {Number} duration in milliseconds
   * @memberof Tippy
   * @public
   */
  hide(duration) {
    if (this.state.destroyed || !this.state.enabled) return

    const { popper, reference, options } = this
    const { tooltip, backdrop, content } = getInnerElements(popper)

    options.onHide.call(popper, this)

    duration = getValue(duration !== undefined ? duration : options.duration, 1)

    if (!options.updateDuration) {
      tooltip.classList.remove('tippy-notransition')
    }

    if (options.interactive) {
      reference.classList.remove('tippy-active')
    }

    popper.style.visibility = 'hidden'
    this.state.visible = false

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
      _onTransitionEnd.call(this, duration, () => {
        if (this.state.visible || !options.appendTo.contains(popper)) return

        if (!this._(key).isPreparingToShow) {
          document.removeEventListener(
            'mousemove',
            this._(key).followCursorListener
          )
          this._(key).lastMouseMoveEvent = null
        }

        if (this.popperInstance) {
          this.popperInstance.disableEventListeners()
        }

        reference.removeAttribute('aria-describedby')

        options.appendTo.removeChild(popper)

        options.onHidden.call(popper, this)
      })
    })
  }

  /**
   * Destroys the tooltip instance
   * @param {Boolean} destroyTargetInstances - relevant only when destroying delegates
   * @memberof Tippy
   * @public
   */
  destroy(destroyTargetInstances = true) {
    if (this.state.destroyed) return

    // Ensure the popper is hidden
    if (this.state.visible) {
      this.hide(0)
    }

    this.listeners.forEach(listener => {
      this.reference.removeEventListener(listener.event, listener.handler)
    })

    // Restore title
    if (this.title) {
      this.reference.setAttribute('title', this.title)
    }

    delete this.reference._tippy

    const attributes = [
      'data-original-title',
      'data-tippy',
      'data-tippy-delegate'
    ]
    attributes.forEach(attr => {
      this.reference.removeAttribute(attr)
    })

    if (this.options.target && destroyTargetInstances) {
      toArray(this.reference.querySelectorAll(this.options.target)).forEach(
        child => child._tippy && child._tippy.destroy()
      )
    }

    if (this.popperInstance) {
      this.popperInstance.destroy()
    }

    this._(key).mutationObservers.forEach(observer => {
      observer.disconnect()
    })

    this.state.destroyed = true
  }
}

/**
 * ------------------------------------------------------------------------
 * Private methods
 * ------------------------------------------------------------------------
 * Standalone functions to be called with the instance's `this` context to make
 * them truly private and not accessible on the prototype
 */

/**
 * Determines if the tooltip instance has followCursor behavior
 * @return {Boolean}
 * @memberof Tippy
 * @private
 */
export function _hasFollowCursorBehavior() {
  const lastTriggerEvent = this._(key).lastTriggerEvent
  return (
    this.options.followCursor &&
    !browser.usingTouch &&
    lastTriggerEvent &&
    lastTriggerEvent.type !== 'focus'
  )
}

/**
 * Creates the Tippy instance for the child target of the delegate container
 * @param {Event} event
 * @memberof Tippy
 * @private
 */
export function _createDelegateChildTippy(event) {
  const targetEl = closest(event.target, this.options.target)
  if (targetEl && !targetEl._tippy) {
    const title = targetEl.getAttribute('title') || this.title
    if (title) {
      targetEl.setAttribute('title', title)
      tippy(targetEl, { ...this.options, target: null })
      _enter.call(targetEl._tippy, event)
    }
  }
}

/**
 * Method used by event listeners to invoke the show method, taking into account delays and
 * the `wait` option
 * @param {Event} event
 * @memberof Tippy
 * @private
 */
export function _enter(event) {
  const { options } = this

  _clearDelayTimeouts.call(this)

  if (this.state.visible) return

  // Is a delegate, create Tippy instance for the child target
  if (options.target) {
    _createDelegateChildTippy.call(this, event)
    return
  }

  this._(key).isPreparingToShow = true

  if (options.wait) {
    options.wait.call(this.popper, this.show.bind(this), event)
    return
  }

  // If the tooltip has a delay, we need to be listening to the mousemove as soon as the trigger
  // event is fired so that it's in the correct position upon mount.
  if (_hasFollowCursorBehavior.call(this)) {
    if (!this._(key).followCursorListener) {
      _setFollowCursorListener.call(this)
    }
    const { arrow } = getInnerElements(this.popper)
    if (arrow) arrow.style.margin = '0'
    document.addEventListener('mousemove', this._(key).followCursorListener)
  }

  const delay = getValue(options.delay, 0)

  if (delay) {
    this._(key).showTimeout = setTimeout(() => {
      this.show()
    }, delay)
  } else {
    this.show()
  }
}

/**
 * Method used by event listeners to invoke the hide method, taking into account delays
 * @memberof Tippy
 * @private
 */
export function _leave() {
  _clearDelayTimeouts.call(this)

  if (!this.state.visible) return

  this._(key).isPreparingToShow = false

  const delay = getValue(this.options.delay, 1)

  if (delay) {
    this._(key).hideTimeout = setTimeout(() => {
      if (this.state.visible) {
        this.hide()
      }
    }, delay)
  } else {
    this.hide()
  }
}

/**
 * Returns relevant listeners for the instance
 * @return {Object} of listeners
 * @memberof Tippy
 * @private
 */
export function _getEventListeners() {
  const onTrigger = event => {
    if (!this.state.enabled) return

    const shouldStopEvent =
      browser.supportsTouch &&
      browser.usingTouch &&
      ['mouseenter', 'mouseover', 'focus'].indexOf(event.type) > -1

    if (shouldStopEvent && this.options.touchHold) return

    this._(key).lastTriggerEvent = event

    // Toggle show/hide when clicking click-triggered tooltips
    if (
      event.type === 'click' &&
      this.options.hideOnClick !== 'persistent' &&
      this.state.visible
    ) {
      _leave.call(this)
    } else {
      _enter.call(this, event)
    }
  }

  const onMouseLeave = event => {
    if (
      ['mouseleave', 'mouseout'].indexOf(event.type) > -1 &&
      browser.supportsTouch &&
      browser.usingTouch &&
      this.options.touchHold
    )
      return

    if (this.options.interactive) {
      const hide = _leave.bind(this)

      const onMouseMove = event => {
        const referenceCursorIsOver = closest(event.target, selectors.REFERENCE)
        const cursorIsOverPopper =
          closest(event.target, selectors.POPPER) === this.popper
        const cursorIsOverReference = referenceCursorIsOver === this.reference

        if (cursorIsOverPopper || cursorIsOverReference) return

        if (
          cursorIsOutsideInteractiveBorder(event, this.popper, this.options)
        ) {
          document.body.removeEventListener('mouseleave', hide)
          document.removeEventListener('mousemove', onMouseMove)

          _leave.call(this, onMouseMove)
        }
      }

      document.body.addEventListener('mouseleave', hide)
      document.addEventListener('mousemove', onMouseMove)
      return
    }

    _leave.call(this)
  }

  const onBlur = event => {
    if (event.target !== this.reference || browser.usingTouch) return

    if (this.options.interactive) {
      if (!event.relatedTarget) return
      if (closest(event.relatedTarget, selectors.POPPER)) return
    }

    _leave.call(this)
  }

  const onDelegateShow = event => {
    if (closest(event.target, this.options.target)) {
      _enter.call(this, event)
    }
  }

  const onDelegateHide = event => {
    if (closest(event.target, this.options.target)) {
      _leave.call(this)
    }
  }

  return {
    onTrigger,
    onMouseLeave,
    onBlur,
    onDelegateShow,
    onDelegateHide
  }
}

/**
 * Creates and returns a new popper instance
 * @return {Popper}
 * @memberof Tippy
 * @private
 */
export function _createPopperInstance() {
  const { popper, reference, options } = this
  const { tooltip } = getInnerElements(popper)
  const popperOptions = options.popperOptions

  const arrowSelector =
    options.arrowType === 'round' ? selectors.ROUND_ARROW : selectors.ARROW
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

  _addMutationObserver.call(this, {
    target: popper,
    callback: () => {
      this.popperInstance.update()
    },
    options: {
      childList: true,
      subtree: true,
      characterData: true
    }
  })

  return new Popper(reference, popper, config)
}

/**
 * Appends the popper element to the DOM, updating or creating the popper instance
 * @param {Function} callback
 * @memberof Tippy
 * @private
 */
export function _mount(callback) {
  const { options } = this

  if (!this.popperInstance) {
    this.popperInstance = _createPopperInstance.call(this)
    if (!options.livePlacement) {
      this.popperInstance.disableEventListeners()
    }
  } else {
    this.popperInstance.scheduleUpdate()
    if (options.livePlacement && !_hasFollowCursorBehavior.call(this)) {
      this.popperInstance.enableEventListeners()
    }
  }

  // If the instance previously had followCursor behavior, it will be positioned incorrectly
  // if triggered by `focus` afterwards - update the reference back to the real DOM element
  if (!_hasFollowCursorBehavior.call(this)) {
    const { arrow } = getInnerElements(this.popper)
    if (arrow) arrow.style.margin = ''
    this.popperInstance.reference = this.reference
  }

  updatePopperPosition(this.popperInstance, callback, true)

  if (!options.appendTo.contains(this.popper)) {
    options.appendTo.appendChild(this.popper)
  }
}

/**
 * Clears the show and hide delay timeouts
 * @memberof Tippy
 * @private
 */
export function _clearDelayTimeouts() {
  const { showTimeout, hideTimeout } = this._(key)
  clearTimeout(showTimeout)
  clearTimeout(hideTimeout)
}

/**
 * Sets the mousemove event listener function for `followCursor` option
 * @memberof Tippy
 * @private
 */
export function _setFollowCursorListener() {
  this._(key).followCursorListener = event => {
    const { clientX, clientY } = (this._(key).lastMouseMoveEvent = event)

    if (!this.popperInstance) return

    this.popperInstance.reference = {
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

    this.popperInstance.scheduleUpdate()
  }
}

/**
 * Updates the popper's position on each animation frame
 * @memberof Tippy
 * @private
 */
export function _makeSticky() {
  const applyTransitionDuration = () => {
    this.popper.style[prefix('transitionDuration')] = `${
      this.options.updateDuration
    }ms`
  }

  const removeTransitionDuration = () => {
    this.popper.style[prefix('transitionDuration')] = ''
  }

  const updatePosition = () => {
    if (this.popperInstance) {
      this.popperInstance.update()
    }

    applyTransitionDuration()

    if (this.state.visible) {
      requestAnimationFrame(updatePosition)
    } else {
      removeTransitionDuration()
    }
  }

  updatePosition()
}

/**
 * Adds a mutation observer to an element and stores it in the instance
 * @param {Object}
 * @memberof Tippy
 * @private
 */
export function _addMutationObserver({ target, callback, options }) {
  if (!window.MutationObserver) return

  const observer = new MutationObserver(callback)
  observer.observe(target, options)

  this._(key).mutationObservers.push(observer)
}

/**
 * Fires the callback functions once the CSS transition ends for `show` and `hide` methods
 * @param {Number} duration
 * @param {Function} callback - callback function to fire once transition completes
 * @memberof Tippy
 * @private
 */
export function _onTransitionEnd(duration, callback) {
  // Make callback synchronous if duration is 0
  if (!duration) {
    return callback()
  }

  const { tooltip } = getInnerElements(this.popper)

  const toggleListeners = (action, listener) => {
    if (!listener) return
    tooltip[action + 'EventListener'](
      'transition' in document.body.style
        ? 'transitionend'
        : 'webkitTransitionEnd',
      listener
    )
  }

  const listener = e => {
    if (e.target === tooltip) {
      toggleListeners('remove', listener)
      callback()
    }
  }

  toggleListeners('remove', this._(key).transitionendListener)
  toggleListeners('add', listener)

  this._(key).transitionendListener = listener
}
