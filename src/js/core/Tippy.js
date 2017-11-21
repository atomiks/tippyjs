import { browser } from './globals'

import mountPopper from './mountPopper'
import makeSticky from './makeSticky'
import onTransitionEnd from './onTransitionEnd'

import elementIsInViewport from '../utils/elementIsInViewport'
import getInnerElements from '../utils/getInnerElements'
import defer from '../utils/defer'
import getDuration from '../utils/getDuration'
import setVisibilityState from '../utils/setVisibilityState'
import findIndex from '../utils/findIndex'
import isVisible from '../utils/isVisible'
import applyTransitionDuration from '../utils/applyTransitionDuration'

export default class Tippy {
  constructor(config) {
    for (const prop in config) {
      this[prop] = config[prop]
    }
    this.state = {
      destroyed: false
    }
  }
  
  /**
  * Shows the tooltip
  * @param {Number} duration in milliseconds
  */
  show(duration) {
    if (this.state.destroyed) return

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

    mountPopper(this)

    popper.style.visibility = 'visible'
    popper.setAttribute('aria-hidden', 'false')

    // Wait for popper's position to update by deferring the callback, so
    // that the position update doesn't transition, only the normal animation
    defer(() => {
      // ~20ms can elapse before this defer callback is run, so the hide() method
      // may have been invoked -- check if the popper is still visible and cancel
      // this callback if not
      if (!isVisible(popper)) return

      if (!options.followCursor) {
        // The arrow is sometimes not in the correct position, so another update after mount is required
        // May be a bug with Popper.js
        this.popperInstance.update()
        applyTransitionDuration([popper], options.updateDuration)
      }

      // Re-apply transition durations
      applyTransitionDuration([tooltip, backdrop], duration)

      // Make content fade out a bit faster than the tooltip if `animateFill` is true
      if (backdrop) {
        content.style.opacity = 1
      }

      if (options.interactive) {
        reference.classList.add('tippy-active')
      }
      
      if (options.sticky) {
        makeSticky(this)
      }

      setVisibilityState([tooltip, backdrop], 'visible')

      onTransitionEnd(this, duration, () => {
        if (isVisible(popper)) {
          options.interactive && popper.focus()
          options.onShown.call(popper)
        }
      })
    })
  }
  
  /**
  * Hides the tooltip
  * @param {Number} duration in milliseconds
  */
  hide(duration) {
    if (this.state.destroyed) return

    const { popper, reference, options } = this
    const { tooltip, backdrop, content } = getInnerElements(popper)
    
    options.onHide.call(popper)

    duration = getDuration(duration !== undefined ? duration : options.duration, 1)
    
    if (options.interactive) {
      reference.classList.remove('tippy-active')
    }

    popper.style.visibility = 'hidden'
    popper.setAttribute('aria-hidden', 'true')

    applyTransitionDuration([tooltip, backdrop, backdrop ? content : null], duration)

    if (backdrop) {
      content.style.opacity = 0
    }

    setVisibilityState([tooltip, backdrop], 'hidden')
    
    if (
      options.interactive &&
      options.trigger.indexOf('click') > -1 &&
      elementIsInViewport(reference)
    ) {
      reference.focus()
    }

    onTransitionEnd(this, duration, () => {
      // `isVisible` is not completely reliable to determine if we shouldn't
      // run the hidden callback, we need to check the computed opacity style.
      // This prevents glitchy behavior of the transition when quickly showing
      // and hiding a tooltip.
      if (
        !isVisible(popper) &&
        options.appendTo.contains(popper) &&
        getComputedStyle(tooltip).opacity !== '1'
      ) {
        document.removeEventListener('mousemove', this._followCursorListener)
        this.popperInstance.disableEventListeners()
        options.appendTo.removeChild(popper)
        
        options.onHidden.call(popper)
      }
    })
  }
  
  /**
  * Destroys the tooltip
  */
  destroy() {
    if (this.state.destroyed) return

    // Ensure the popper is hidden
    if (isVisible(this.popper)) {
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
}
