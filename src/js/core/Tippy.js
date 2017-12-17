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
import matches from '../utils/matches'
import closest from '../utils/closest'
import getDuration from '../utils/getDuration'
import setVisibilityState from '../utils/setVisibilityState'
import find from '../utils/find'
import findIndex from '../utils/findIndex'
import applyTransitionDuration from '../utils/applyTransitionDuration'
import isChildOfTarget from '../utils/isChildOfTarget'

export default (() => {
  const key = {}
  const store = data => k => k === key && data

  class Tippy {
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
      duration = getDuration(
        duration !== undefined ? duration : options.duration,
        0
      )

      // Destroy tooltip if the reference element is no longer on the DOM
      if (!reference.refObj && !document.documentElement.contains(reference)) {
        this.destroy()
        return
      }

      // Prevent a transition when popper changes position
      applyTransitionDuration([popper, tooltip, backdrop], 0)

      popper.style.visibility = 'visible'
      this.state.visible = true

      _mount.call(this, () => {
        // ~20ms can elapse before this defer callback is run, so the hide() method
        // may have been invoked -- check if the popper is still visible and cancel
        // this callback if not
        if (!this.state.visible) return

        if (!options.followCursor || browser.usingTouch) {
          this.popperInstance.scheduleUpdate()
          applyTransitionDuration([popper], options.updateDuration)
        }

        // Set initial position near the cursor
        if (options.followCursor && !browser.usingTouch) {
          this.popperInstance.disableEventListeners()
          const delay = Array.isArray(options.delay)
            ? options.delay[0]
            : options.delay
          if (this._(key).lastTriggerEvent) {
            this._(key).followCursorListener(
              delay && this._(key).lastMouseMoveEvent
                ? this._(key).lastMouseMoveEvent
                : this._(key).lastTriggerEvent
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
            popper.focus()
          }

          options.onShown.call(popper)
        })
      })
      
      options.onShow.call(popper)
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
      duration = getDuration(
        duration !== undefined ? duration : options.duration,
        1
      )

      options.onHide.call(popper)

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

          if (!this._(key).isPreparingToShow) {
            document.removeEventListener(
              'mousemove',
              this._(key).followCursorListener
            )
            this._(key).lastMouseMoveEvent = null
          }

          this.popperInstance.disableEventListeners()
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
      this.reference.setAttribute(
        'title',
        this.reference.getAttribute('data-original-title')
      )

      delete this.reference._tippy
      ;['data-original-title', 'data-tippy', 'aria-describedby'].forEach(
        attr => {
          this.reference.removeAttribute(attr)
        }
      )

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
   * Method used by event listeners to invoke the show method, taking into account delays and
   * the `wait` option
   * @param {Event} event
   * @memberof Tippy
   * @private
   */
  function _enter(event) {
    _clearDelayTimeouts.call(this)

    if (this.state.visible) {
      if (
        this.options.target &&
        event.target !== this.popperInstance.reference
      ) {
        // Since we're using event delegation, there's only one tooltip... we need to ensure
        // that we hide the current one to move it to the new reference
        this.hide()
      } else {
        return
      }
    }

    this._(key).isPreparingToShow = true

    if (this.options.wait) {
      this.options.wait.call(this.popper, this.show.bind(this), event)
      return
    }

    // If the tooltip has a delay, we need to be listening to the mousemove as soon as the trigger
    // event is fired so that it's in the correct position upon mount.
    if (this.options.followCursor && !browser.usingTouch) {
      if (!this._(key).followCursorListener) {
        _setFollowCursorListener.call(this)
      }
      document.addEventListener('mousemove', this._(key).followCursorListener)
    }

    const delay = Array.isArray(this.options.delay)
      ? this.options.delay[0]
      : this.options.delay

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
  function _leave() {
    _clearDelayTimeouts.call(this)

    if (!this.state.visible) return

    this._(key).isPreparingToShow = false

    const delay = Array.isArray(this.options.delay)
      ? this.options.delay[1]
      : this.options.delay

    if (delay) {
      this._(key).hideTimeout = setTimeout(() => {
        if (!this.state.visible) return
        this.hide()
      }, delay)
    } else {
      this.hide()
    }
  }

  /**
   * Event listener for each `trigger` event
   * @memberof Tippy
   * @private
   */
  function _handleTrigger(event) {
    if (!this.state.enabled) return

    const shouldStopEvent =
      browser.supportsTouch &&
      browser.usingTouch &&
      (event.type === 'mouseenter' || event.type === 'focus')

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

    // iOS prevents click events from firing
    if (shouldStopEvent && browser.iOS && this.reference.click) {
      this.reference.click()
    }
  }

  /**
   * Opposite event listener for `mouseenter`
   * @memberof Tippy
   * @private
   */
  function _handleMouseLeave(event) {
    if (
      event.type === 'mouseleave' &&
      browser.supportsTouch &&
      browser.usingTouch &&
      this.options.touchHold
    )
      return

    if (this.options.interactive) {
      const fallbackElement = document.createElement('div')
      const hide = _leave.bind(this)

      // Temporarily handle mousemove to check if the mouse left somewhere other than the popper
      const handleMouseMove = event => {
        this._(key).cursorIsInteracting = true

        const referenceCursorIsOver = this.options.target
          ? closest(event.target, this.options.target)
          : closest(event.target, selectors.REFERENCE)

        const cursorIsOverPopper =
          closest(event.target, selectors.POPPER) === this.popper

        const cursorIsOverReference = this.options.target
          ? matches.call(
              referenceCursorIsOver || fallbackElement,
              this.options.target
            )
          : referenceCursorIsOver === this.reference

        if (cursorIsOverPopper || cursorIsOverReference) return

        if (
          cursorIsOutsideInteractiveBorder(event, this.popper, this.options)
        ) {
          this._(key).cursorIsInteracting = false

          document.body.removeEventListener('mouseleave', hide)
          document.removeEventListener('mousemove', handleMouseMove)

          _leave.call(this)
        }
      }
      document.body.addEventListener('mouseleave', hide)
      document.addEventListener('mousemove', handleMouseMove)
      return
    }

    _leave.call(this)
  }

  /**
   * Opposite event listener for `focus`
   * @memberof Tippy
   * @private
   */
  function _handleBlur(event) {
    if (!event.relatedTarget || browser.usingTouch) return
    if (closest(event.relatedTarget, selectors.POPPER)) return

    _leave.call(this)
  }

  /**
   * Handles the `mouseover`/`focusin` event delegation
   * @memberof Tippy
   * @private
   */
  function _handleDelegateShow(event) {
    const currentElement = closest(event.target, this.options.target)

    const isMouseOver = event.type === 'mouseover'
    const isInteracting = this._(key).cursorIsInteracting
    const isChild = isChildOfTarget(
      event.relatedTarget || event.toElement,
      this.options.target
    )
    const isSameElement = currentElement === this._(key).previousElement

    if ((isMouseOver && isInteracting) || (isChild && isSameElement)) return

    this._(key).previousElement = currentElement
    this._(key).isSameElement = isSameElement

    if (currentElement && event.target !== this.reference) {
      _handleTrigger.call(this, event)
    }
  }

  /**
   * Handles the `mouseout`/`focusout` event delegation
   * @memberof Tippy
   * @private
   */
  function _handleDelegateHide(event) {
    const isMouseOut = event.type === 'mouseout'
    const isChild = isChildOfTarget(
      event.relatedTarget || event.toElement,
      this.options.target
    )

    if (isMouseOut && isChild) return

    if (closest(event.target, this.options.target)) {
      _handleMouseLeave.call(this, event)
    }
  }

  /**
   * Returns relevant listeners for the instance
   * @return {Object} of listeners
   * @memberof Tippy
   * @private
   */
  function _getEventListeners() {
    return {
      handleTrigger: _handleTrigger.bind(this),
      handleMouseLeave: _handleMouseLeave.bind(this),
      handleBlur: _handleBlur.bind(this),
      handleDelegateShow: _handleDelegateShow.bind(this),
      handleDelegateHide: _handleDelegateHide.bind(this)
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
        const styles = popper.style
        styles[prefix('transitionDuration')] = null

        const _onUpdate = this.popperInstance.options.onUpdate
        this.popperInstance.options.onUpdate = () => {
          this.popper.offsetHeight
          styles[prefix('transitionDuration')] = options.updateDuration + 'ms'
          this.popperInstance.options.onUpdate = _onUpdate
        }

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
  function _mount(callback) {
    if (!this.popperInstance) {
      this.popperInstance = _createPopperInstance.call(this)
    } else {
      this.popper.style[prefix('transform')] = null
      this.popperInstance.scheduleUpdate()

      if (!this.options.followCursor || browser.usingTouch) {
        this.popperInstance.enableEventListeners()
      }
    }
    
    if (this.options.target) {
      const newReference = closest(
        this._(key).lastTriggerEvent.target,
        this.options.target
      )
      this.popperInstance.reference = newReference
      this.popper._reference = newReference
    }

    const _onCreate = this.popperInstance.options.onCreate
    const _onUpdate = this.popperInstance.options.onUpdate

    this.popperInstance.options.onCreate = this.popperInstance.options.onUpdate = () => {
      this.popper.offsetHeight // we need to cause document reflow
      callback()
      this.popperInstance.options.onUpdate = _onUpdate
      this.popperInstance.options.onCreate = _onCreate
    }

    if (
      (this._(key).isSameElement && this.options.target) ||
      !this.options.appendTo.contains(this.popper)
    ) {
      this.options.appendTo.appendChild(this.popper)
    }
  }

  /**
   * Clears the show and hide delay timeouts
   * @memberof Tippy
   * @private
   */
  function _clearDelayTimeouts() {
    const { showTimeout, hideTimeout } = this._(key)
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  /**
   * Sets the mousemove event listener function for `followCursor` option
   * @memberof Tippy
   * @private
   */
  function _setFollowCursorListener() {
    this._(key).followCursorListener = event => {
      // Ignore if the tooltip was triggered by `focus`
      if (
        this._(key).lastTriggerEvent &&
        this._(key).lastTriggerEvent.type === 'focus'
      )
        return

      this._(key).lastMouseMoveEvent = event

      // Expensive operations, but their dimensions can change freely
      const pageWidth =
        document.documentElement.offsetWidth || document.body.offsetWidth
      const halfPopperWidth = Math.round(this.popper.offsetWidth / 2)
      const halfPopperHeight = Math.round(this.popper.offsetHeight / 2)
      const offset = this.options.offset
      const { pageX, pageY } = event
      const PADDING = 5

      let placement = this.options.placement.replace(/-.+/, '')
      if (this.popper.getAttribute('x-placement')) {
        placement = getPopperPlacement(this.popper)
      }

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

      const isRightOverflowing =
        pageX + PADDING + halfPopperWidth + offset > pageWidth
      const isLeftOverflowing = pageX - PADDING - halfPopperWidth + offset < 0

      // Prevent left/right overflow
      if (placement === 'top' || placement === 'bottom') {
        if (isRightOverflowing) {
          x = pageWidth - PADDING - 2 * halfPopperWidth
        }

        if (isLeftOverflowing) {
          x = PADDING
        }
      }

      this.popper.style[prefix('transform')] = `translate3d(${x}px, ${y}px, 0)`
    }
  }

  /**
   * Updates the popper's position on each animation frame
   * @memberof Tippy
   * @private
   */
  function _makeSticky() {
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

    this._(key).mutationObservers.push(observer)
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

    toggleListeners('remove', this._(key).transitionendListener)
    toggleListeners('add', listener)

    this._(key).transitionendListener = listener
  }

  return {
    Tippy,
    _getEventListeners,
    _addMutationObserver,
    _createPopperInstance,
    _onTransitionEnd
  }
})()
