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

export default class Tippy {
  constructor(config) {
    for (const key in config) {
      this[key] = config[key]
    }
    this.state = {
      destroyed: false,
      visible: false,
      enabled: true
    }
  }
  
  /**
   * ------------------------------------------------------------------------
   * Public
   * ------------------------------------------------------------------------
   */
  
  /**
  * Enables the tooltip to allow it to show or hide
  */
  enable() {
    this.state.enabled = true
  }
  
  /**
  * Disables the tooltip from showing or hiding, but does not destroy it
  */
  disable() {
    this.state.enabled = false
  }
  
  /**
  * Shows the tooltip
  * @param {Number} duration in milliseconds
  */
  show(duration) {
    if (this.state.destroyed || !this.state.enabled) return

    const { popper, reference, options } = this
    const { tooltip, backdrop, content } = getInnerElements(popper)

    // Destroy tooltip if the reference element is no longer on the DOM
    if (!reference.refObj && !document.body.contains(reference)) {
      this.destroy()
      return
    }

    options.onShow.call(popper)
    
    duration = getDuration(duration !== undefined ? duration : options.duration, 0)
    
    // Prevent a transition when popper changes position
    applyTransitionDuration([popper, tooltip, backdrop], 0)

    this._mount()

    popper.style.visibility = 'visible'
    this.state.visible = true

    // Wait for popper's position to update by deferring the callback, so
    // that the position update doesn't transition, only the normal animation
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
        this._makeSticky()
      }

      setVisibilityState([tooltip, backdrop], 'visible')
      
      this._onTransitionEnd(duration, () => {
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
      this._onTransitionEnd(duration, () => {
        if (this.state.visible || !options.appendTo.contains(popper)) return

        this.popperInstance.disableEventListeners()
        document.removeEventListener('mousemove', this._followCursorListener)
        options.appendTo.removeChild(popper)
        options.onHidden.call(popper)
      })
    })
  }
  
  /**
  * Destroys the tooltip
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

    ;[
      'data-original-title',
      'data-tippy',
      'aria-describedby'
    ].forEach(attr => {
      this.reference.removeAttribute(attr)
    })

    if (this.popperInstance) {
      this.popperInstance.destroy()
    }

    this._mutationObservers.forEach(observer => {
      observer.disconnect()
    })
    
    this.state.destroyed = true
  }
  
  /**
   * ------------------------------------------------------------------------
   * Private
   * ------------------------------------------------------------------------
   */

   /**
   * Returns relevant listeners for the instance
   * @return {Object} of listeners
   */
  _getEventListeners() {
    const { popper, reference, options } = this

    let showDelay, hideDelay

    const clearTimeouts = () => {
      clearTimeout(showDelay)
      clearTimeout(hideDelay)
    }

    const _show = () => {
      clearTimeouts()

      if (this.state.visible) return

      const _delay = Array.isArray(options.delay) ? options.delay[0] : options.delay
      if (options.delay) {
        showDelay = setTimeout(() => this.show(), _delay)
      } else {
        this.show()
      }
    }

    const show = event => {
      if (options.wait) {
        options.wait.call(popper, _show, event)
      } else {
        _show()
      }
    }

    const hide = () => {
      clearTimeouts()
      
      if (!this.state.visible) return

      const _delay = Array.isArray(options.delay) ? options.delay[1] : options.delay
      if (options.delay) {
        hideDelay = setTimeout(() => {
          if (!this.state.visible) return
          this.hide()
        }, _delay)
      } else {
        this.hide()
      }
    }

    const handleTrigger = event => {
      if (this.state.disabled) return
      
      const shouldStopEvent = (
        browser.supportsTouch &&
        browser.usingTouch &&
        (
          event.type === 'mouseenter' ||
          event.type === 'focus'
        )
      )

      if (shouldStopEvent && options.touchHold) return
      
      this._lastTriggerEvent = event.type
      
      // Toggle show/hide when clicking click-triggered tooltips
      if (event.type === 'click' && options.hideOnClick !== 'persistent' && this.state.visible) {
        hide()
      } else {
        show(event)
      }
      
      // Set initial positioning near cursor (document mousemove may not fire)
      if (options.followCursor && !browser.usingTouch) {
        this._followCursorListener(event)
      }
      
      // iOS prevents click events from firing
      if (shouldStopEvent && browser.iOS && reference.click) {
        reference.click()
      }
    }

    const handleMouseleave = event => {
      if (
        event.type === 'mouseleave' &&
        browser.supportsTouch &&
        browser.usingTouch &&
        options.touchHold
      ) return

      if (options.interactive) {
        // Temporarily handle mousemove to check if the mouse left somewhere other than the popper
        const handleMousemove = event => {
          const referenceCursorIsOver = closest(event.target, selectors.REFERENCE)
          const cursorIsOverPopper = closest(event.target, selectors.POPPER) === popper
          const cursorIsOverReference = referenceCursorIsOver === reference

          if (cursorIsOverPopper || cursorIsOverReference) return

          if (cursorIsOutsideInteractiveBorder(event, popper, options)) {
            document.body.removeEventListener('mouseleave', hide)
            document.removeEventListener('mousemove', handleMousemove)
            hide()
          }
        }
        document.body.addEventListener('mouseleave', hide)
        document.addEventListener('mousemove', handleMousemove)
        return
      }

      hide()
    }

    const handleBlur = event => {
      if (!event.relatedTarget || browser.usingTouch) return
      if (closest(event.relatedTarget, selectors.POPPER)) return
      hide()
    }

    return {
      handleTrigger,
      handleMouseleave,
      handleBlur
    }
  }
  
  /**
  * Creates and returns a new popper instance
  * @return {Popper}
  */
  _createPopperInstance() {
    const { popper, reference, options } = this
    const { tooltip } = getInnerElements(popper)
    const popperOptions = options.popperOptions
    
    const arrowSelector = options.arrowType === 'round'
      ? selectors.ROUND_ARROW
      : selectors.ARROW
    const arrow = tooltip.querySelector(arrowSelector)
      
    const config = {
      placement: options.placement,
      ...(popperOptions || {}),
      modifiers: {
        ...(popperOptions ? popperOptions.modifiers : {}),
        arrow: {
          element: arrowSelector,
          ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.arrow : {})
        },
        flip: {
          enabled: options.flip,
          padding: options.distance + 5 /* 5px from viewport boundary */,
          behavior: options.flipBehavior,
          ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {})
        },
        offset: {
          offset: options.offset,
          ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {})
        }
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
      }
    }
    
    this._addMutationObserver({
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
        characterData: true
      }
    })

    return new Popper(reference, popper, config)
  }
  
  /**
  * Appends the popper element to the DOM
  */
  _mount() {
    const { popper, reference, options } = this
    
    if (options.appendTo.contains(popper)) return
    options.appendTo.appendChild(popper)
    
    if (!this.popperInstance) {
      this.popperInstance = this._createPopperInstance()
    } else {
      popper.style[prefix('transform')] = null
      this.popperInstance.update()
      
      if (!options.followCursor || browser.usingTouch) {
        this.popperInstance.enableEventListeners()
      }
    }
    
    // Since touch is determined dynamically, followCursor is set on mount
    if (options.followCursor && !browser.usingTouch) {
      if (!this._followCursorListener) {
        this._setFollowCursorListener()
      }
      document.addEventListener('mousemove', this._followCursorListener)
      this.popperInstance.disableEventListeners()
    }
  }
  
  /**
  * Sets a mousemove event listener function for `followCursor` option
  * @return {Function} the event listener
  */
  _setFollowCursorListener() {
    this._followCursorListener = e => {
      if (this._lastTriggerEvent === 'focus') return
      
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
  */
  _makeSticky() {
    const applyTransitionDuration = () => {
      this.popper.style[prefix('transitionDuration')] = `${ this.options.updateDuration }ms`
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
  * Fires the callback functions once the CSS transition ends for `show` and `hide` methods
  * @param {Number} duration
  * @param {Function} callback - callback function to fire once transition completes
  */
  _onTransitionEnd(duration, callback) {
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
    
    toggleListeners('remove', this._transitionendListener)
    toggleListeners('add', listener)
    
    this._transitionendListener = listener
  }
  
  /**
  * Adds a mutation observer to an element and stores it in the instance
  * @param {Object}
  */
  _addMutationObserver({ target, callback, options }) {
    if (!window.MutationObserver) return
    
    const observer = new MutationObserver(callback)
    observer.observe(target, options)
    this._mutationObservers.push(observer)
  }
}
