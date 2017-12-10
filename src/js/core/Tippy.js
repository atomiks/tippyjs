import { selectors, browser } from './globals'

import Popper from 'popper.js'

import cursorIsOutsideInteractiveBorder from '../utils/cursorIsOutsideInteractiveBorder'
import computeArrowTransform from '../utils/computeArrowTransform'
import elementIsInViewport from '../utils/elementIsInViewport'
import getInnerElements from '../utils/getInnerElements'
import getPopperPlacement from '../utils/getPopperPlacement'
import getOffsetDistanceInPx from '../utils/getOffsetDistanceInPx'
import prefix from '../utils/prefix'
import defer from '../utils/defer'
import closest from '../utils/closest'
import getDuration from '../utils/getDuration'
import setVisibilityState from '../utils/setVisibilityState'
import findIndex from '../utils/findIndex'
import applyTransitionDuration from '../utils/applyTransitionDuration'

class Tippy {
  constructor(config) {
    for (const key in config) {
      this[key] = config[key]
    }

    this.state = {
      destroyed: false,
      visible: false,
      enabled: true,
    }

    this._internal = {
      mutationObservers: [],
    }
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

    // Destroy tooltip if the reference element is no longer on the DOM
    if (!reference.refObj && !document.documentElement.contains(reference)) {
      this.destroy()
      return
    }

    options.onShow.call(popper)

    duration = getDuration(duration !== undefined ? duration : options.duration, 0)

    // Prevent a transition when popper changes position
    applyTransitionDuration([popper, tooltip, backdrop], 0)

    _mount.call(this)

    popper.style.visibility = 'visible'
    this.state.visible = true

    // Popper#update is async, requiring us to defer this code. Popper 2.0 will make it sync.
    defer(() => {
      // ~20ms can elapse before this defer callback is run, so the hide() method
      // may have been invoked -- check if the popper is still visible and cancel
      // this callback if not
      if (!this.state.visible) return

      if (!options.followCursor || browser.usingTouch) {
        this.popperInstance.update()
        applyTransitionDuration([popper], options.updateDuration)
      }

      // Re-apply transition durations
      applyTransitionDuration([tooltip, backdrop, backdrop ? content : null], duration)

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
          popper.focus()
        }

        options.onShown.call(popper)
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

    options.onHide.call(popper)

    duration = getDuration(duration !== undefined ? duration : options.duration, 1)

    if (!options.updateDuration) {
      tooltip.classList.remove('tippy-notransition')
    }

    if (options.interactive) {
      reference.classList.remove('tippy-active')
    }

    popper.style.visibility = 'hidden'
    this.state.visible = false

    applyTransitionDuration([tooltip, backdrop, backdrop ? content : null], duration)

    setVisibilityState([tooltip, backdrop], 'hidden')

    if (
      options.interactive &&
      options.trigger.indexOf('click') > -1 &&
      elementIsInViewport(reference)
    ) {
      reference.focus()
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

        this.popperInstance.disableEventListeners()
        document.removeEventListener('mousemove', this._internal.followCursorListener)
        options.appendTo.removeChild(popper)
        options.onHidden.call(popper)
      })
    })
  }

  /**
   * Destroys the tooltip
   * @memberof Tippy
   * @public
   */
  destroy() {
    if (this.state.destroyed) return

    // Ensure the popper is hidden
    if (this.state.visible) {
      this.hide(0)
    }

    this.listeners.forEach(listener => {
      this.reference.removeEventListener(listener.event, listener.handler)
    })

    // Restore title
    this.reference.setAttribute('title', this.reference.getAttribute('data-original-title'))

    delete this.reference._tippy
    ;['data-original-title', 'data-tippy', 'aria-describedby'].forEach(attr => {
      this.reference.removeAttribute(attr)
    })

    if (this.popperInstance) {
      this.popperInstance.destroy()
    }

    this._internal.mutationObservers.forEach(observer => {
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
 * Method used by event listeners to invoke the show method, taking into account delays and
 * the `wait` option
 * @param {Event} event
 * @memberof Tippy
 * @private
 */
function _enter(event) {
  _clearDelayTimeouts.call(this)

  if (this.state.visible) return

  if (this.options.wait) {
    this.options.wait.call(this.popper, this.show.bind(this), event)
    return
  }

  const delay = Array.isArray(this.options.delay) ? this.options.delay[0] : this.options.delay

  if (delay) {
    this._internal.showTimeout = setTimeout(() => {
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
function _leave() {
  _clearDelayTimeouts.call(this)

  if (!this.state.visible) return

  const delay = Array.isArray(this.options.delay) ? this.options.delay[1] : this.options.delay

  if (delay) {
    this._internal.hideTimeout = setTimeout(() => {
      if (!this.state.visible) return
      this.hide()
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
function _getEventListeners() {
  const handleTrigger = event => {
    if (this.state.disabled) return

    const shouldStopEvent =
      browser.supportsTouch &&
      browser.usingTouch &&
      (event.type === 'mouseenter' || event.type === 'focus')

    if (shouldStopEvent && this.options.touchHold) return

    this._internal.lastTriggerEvent = event

    // Toggle show/hide when clicking click-triggered tooltips
    if (event.type === 'click' && this.options.hideOnClick !== 'persistent' && this.state.visible) {
      _leave.call(this)
    } else {
      _enter.call(this, event)
    }

    // iOS prevents click events from firing
    if (shouldStopEvent && browser.iOS && this.reference.click) {
      this.reference.click()
    }
  }

  const handleMouseleave = event => {
    if (
      event.type === 'mouseleave' &&
      browser.supportsTouch &&
      browser.usingTouch &&
      this.options.touchHold
    )
      return

    if (this.options.interactive) {
      const hide = _leave.bind(this)

      // Temporarily handle mousemove to check if the mouse left somewhere other than the popper
      const handleMousemove = event => {
        const referenceCursorIsOver = closest(event.target, selectors.REFERENCE)
        const cursorIsOverPopper = closest(event.target, selectors.POPPER) === this.popper
        const cursorIsOverReference = referenceCursorIsOver === this.reference

        if (cursorIsOverPopper || cursorIsOverReference) return

        if (cursorIsOutsideInteractiveBorder(event, this.popper, this.options)) {
          document.body.removeEventListener('mouseleave', hide)
          document.removeEventListener('mousemove', handleMousemove)
          _leave.call(this)
        }
      }
      document.body.addEventListener('mouseleave', hide)
      document.addEventListener('mousemove', handleMousemove)
      return
    }

    _leave.call(this)
  }

  const handleBlur = event => {
    if (!event.relatedTarget || browser.usingTouch) return
    if (closest(event.relatedTarget, selectors.POPPER)) return
    _leave.call(this)
  }

  return {
    handleTrigger,
    handleMouseleave,
    handleBlur,
  }
}

/**
 * Creates and returns a new popper instance
 * @return {Popper}
 * @memberof Tippy
 * @private
 */
function _createPopperInstance() {
  const { popper, reference, options } = this
  const { tooltip } = getInnerElements(popper)
  const popperOptions = options.popperOptions

  const arrowSelector = options.arrowType === 'round' ? selectors.ROUND_ARROW : selectors.ARROW
  const arrow = tooltip.querySelector(arrowSelector)

  const config = {
    placement: options.placement,
    ...(popperOptions || {}),
    modifiers: {
      ...(popperOptions ? popperOptions.modifiers : {}),
      arrow: {
        element: arrowSelector,
        ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.arrow : {}),
      },
      flip: {
        enabled: options.flip,
        padding: options.distance + 5 /* 5px from viewport boundary */,
        behavior: options.flipBehavior,
        ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {}),
      },
      offset: {
        offset: options.offset,
        ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {}),
      },
    },
    onCreate() {
      tooltip.style[getPopperPlacement(popper)] = getOffsetDistanceInPx(options.distance)

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
      styles[getPopperPlacement(popper)] = getOffsetDistanceInPx(options.distance)

      if (arrow && options.arrowTransform) {
        computeArrowTransform(popper, arrow, options.arrowTransform)
      }
    },
  }

  _addMutationObserver.call(this, {
    target: popper,
    callback: () => {
      const styles = popper.style
      styles[prefix('transitionDuration')] = '0ms'
      this.popperInstance.update()
      defer(() => {
        styles[prefix('transitionDuration')] = options.updateDuration + 'ms'
      })
    },
    options: {
      childList: true,
      subtree: true,
      characterData: true,
    },
  })

  return new Popper(reference, popper, config)
}

/**
 * Appends the popper element to the DOM
 * @memberof Tippy
 * @private
 */
function _mount() {
  const { popper } = this

  if (this.options.appendTo.contains(popper)) return
  this.options.appendTo.appendChild(popper)

  if (!this.popperInstance) {
    this.popperInstance = _createPopperInstance.call(this)
  } else {
    popper.style[prefix('transform')] = null
    this.popperInstance.update()

    if (!this.options.followCursor || browser.usingTouch) {
      this.popperInstance.enableEventListeners()
    }
  }

  // Since touch is determined dynamically, followCursor is set on mount
  if (this.options.followCursor && !browser.usingTouch) {
    if (!this._internal.followCursorListener) {
      _setFollowCursorListener.call(this)
    }
    document.addEventListener('mousemove', this._internal.followCursorListener)
    this.popperInstance.disableEventListeners()
    defer(() => {
      this._internal.followCursorListener(this._internal.lastTriggerEvent)
    })
  }
}

/**
 * Clears the show and hide delay timeouts
 * @memberof Tippy
 * @private
 */
function _clearDelayTimeouts() {
  clearTimeout(this._internal.showTimeout)
  clearTimeout(this._internal.hideTimeout)
}

/**
 * Sets a mousemove event listener function for `followCursor` option
 * @return {Function} the event listener
 * @memberof Tippy
 * @private
 */
function _setFollowCursorListener() {
  this._internal.followCursorListener = e => {
    // Ignore if the tooltip was triggered by `focus`
    if (this._internal.lastTriggerEvent && this._internal.lastTriggerEvent.type === 'focus') return

    const { popper, options: { offset } } = this

    const placement = getPopperPlacement(popper)
    const halfPopperWidth = Math.round(popper.offsetWidth / 2)
    const halfPopperHeight = Math.round(popper.offsetHeight / 2)
    const viewportPadding = 5
    const pageWidth = document.documentElement.offsetWidth || document.body.offsetWidth

    const { pageX, pageY } = e

    let x, y

    switch (placement) {
      case 'top':
        x = pageX - halfPopperWidth + offset
        y = pageY - 2 * halfPopperHeight
        break
      case 'bottom':
        x = pageX - halfPopperWidth + offset
        y = pageY + 10
        break
      case 'left':
        x = pageX - 2 * halfPopperWidth
        y = pageY - halfPopperHeight + offset
        break
      case 'right':
        x = pageX + 5
        y = pageY - halfPopperHeight + offset
        break
    }

    const isRightOverflowing = pageX + viewportPadding + halfPopperWidth + offset > pageWidth
    const isLeftOverflowing = pageX - viewportPadding - halfPopperWidth + offset < 0

    // Prevent left/right overflow
    if (placement === 'top' || placement === 'bottom') {
      if (isRightOverflowing) {
        x = pageWidth - viewportPadding - 2 * halfPopperWidth
      }

      if (isLeftOverflowing) {
        x = viewportPadding
      }
    }

    popper.style[prefix('transform')] = `translate3d(${x}px, ${y}px, 0)`
  }
}

/**
 * Updates the popper's position on each animation frame
 * @memberof Tippy
 * @private
 */
function _makeSticky() {
  const applyTransitionDuration = () => {
    this.popper.style[prefix('transitionDuration')] = `${this.options.updateDuration}ms`
  }

  const removeTransitionDuration = () => {
    this.popper.style[prefix('transitionDuration')] = ''
  }

  const updatePosition = () => {
    if (this.popperInstance) {
      this.popperInstance.scheduleUpdate()
    }

    applyTransitionDuration()

    if (this.state.visible) {
      requestAnimationFrame(updatePosition)
    } else {
      removeTransitionDuration()
    }
  }

  // Wait until the popper's position has been updated initially
  defer(updatePosition)
}

/**
 * Adds a mutation observer to an element and stores it in the instance
 * @param {Object}
 * @memberof Tippy
 * @private
 */
function _addMutationObserver({ target, callback, options }) {
  if (!window.MutationObserver) return

  const observer = new MutationObserver(callback)
  observer.observe(target, options)
  this._internal.mutationObservers.push(observer)
}

/**
 * Fires the callback functions once the CSS transition ends for `show` and `hide` methods
 * @param {Number} duration
 * @param {Function} callback - callback function to fire once transition completes
 * @memberof Tippy
 * @private
 */
function _onTransitionEnd(duration, callback) {
  // Make callback synchronous if duration is 0
  if (!duration) {
    return callback()
  }

  const { tooltip } = getInnerElements(this.popper)

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

  toggleListeners('remove', this._internal.transitionendListener)
  toggleListeners('add', listener)

  this._internal.transitionendListener = listener
}

export {
  Tippy,
  _enter,
  _leave,
  _mount,
  _getEventListeners,
  _createPopperInstance,
  _addMutationObserver,
  _onTransitionEnd,
  _makeSticky,
  _setFollowCursorListener,
  _clearDelayTimeouts,
}
