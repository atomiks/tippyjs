import { browser, store, defaults } from './core/globals'

import init from './core/init'

/* Utility functions */
import defer                   from './utils/defer'
import prefix                  from './utils/prefix'
import find                    from './utils/find'
import findIndex               from './utils/findIndex'
import removeTitle             from './utils/removeTitle'
import elementIsInViewport     from './utils/elementIsInViewport'
import triggerReflow           from './utils/triggerReflow'
import modifyClassList         from './utils/modifyClassList'
import getInnerElements        from './utils/getInnerElements'
import applyTransitionDuration from './utils/applyTransitionDuration'
import isVisible               from './utils/isVisible'
import noop                    from './utils/noop'

/* Core library functions */
import followCursorHandler from './core/followCursorHandler'
import getArrayOfElements  from './core/getArrayOfElements'
import onTransitionEnd     from './core/onTransitionEnd'
import mountPopper         from './core/mountPopper'
import makeSticky          from './core/makeSticky'
import createTooltips      from './core/createTooltips'

/**
* @param {String|Element|Element[]} selector
* @param {Object} options (optional) - the object of options to be applied to the instance
*/
class Tippy {
  constructor(selector, options = {}) {
    // Use default browser tooltip on unsupported browsers
    if (!browser.supported) return

    init()

    this.state = {
      destroyed: false
    }

    this.selector = selector

    this.options = { ...defaults, ...options }

    this.callbacks = {
      wait: options.wait,
      show: options.onShow || noop,
      shown: options.onShown || noop,
      hide: options.onHide || noop,
      hidden: options.onHidden || noop
    }

    this.store = createTooltips.call(this, getArrayOfElements(selector))
    store.push.apply(store, this.store)
  }

  /**
  * Returns the reference element's popper element
  * @param {Element} el
  * @return {Element}
  */
  getPopperElement(reference) {
    try {
      return find(this.store, data => data.reference === reference).popper
    } catch (e) {
      console.error('[getPopperElement]: Element passed as the argument does not exist in the instance')
    }
  }

  /**
  * Returns a popper's reference element
  * @param {Element} popper
  * @return {Element}
  */
  getReferenceElement(popper) {
    try {
      return find(this.store, data => data.popper === popper).reference
    } catch (e) {
      console.error('[getReferenceElement]: Popper passed as the argument does not exist in the instance')
    }
  }

  /**
  * Returns the reference data object from either the reference element or popper element
  * @param {Element} x (reference element or popper)
  * @return {Object}
  */
  getReferenceData(x) {
    return find(this.store, data => data.reference === x || data.popper === x)
  }

  /**
  * Shows a popper
  * @param {Element} popper
  * @param {Number} customDuration (optional)
  */
  show(popper, customDuration) {
    if (this.state.destroyed) return

    const data = find(this.store, data => data.popper === popper)
    const { tooltip, circle, content } = getInnerElements(popper)

    // Destroy tooltip if the reference element is no longer on the DOM
    if (!document.body.contains(data.reference)) {
      this.destroy(popper)
      return
    }

    this.callbacks.show.call(popper)

    const {
      reference,
      options: {
        appendTo,
        sticky,
        interactive,
        followCursor,
        flipDuration,
        duration,
        dynamicTitle
      }
    } = data

    if (dynamicTitle) {
      const title = reference.getAttribute('title')
      if (title) {
        content.innerHTML = title
        removeTitle(reference)
      }
    }

    const _duration = customDuration !== undefined
      ? customDuration
      : Array.isArray(duration) ? duration[0] : duration

    // Prevent a transition when popper changes position
    applyTransitionDuration([popper, tooltip, circle], 0)

    mountPopper(data)

    popper.style.visibility = 'visible'
    popper.setAttribute('aria-hidden', 'false')

    // Wait for popper's position to update
    defer(() => {
      // Sometimes the arrow will not be in the correct position, force another update
      if (!followCursor || browser.usingTouch) {
        data.popperInstance.update()
        applyTransitionDuration([popper], flipDuration)
      }

      // Re-apply transition durations
      applyTransitionDuration([tooltip, circle], _duration)

      // Make content fade out a bit faster than the tooltip if `animateFill`
      if (circle) content.style.opacity = 1

      // Interactive tooltips receive a class of 'active'
      interactive && reference.classList.add('active')

      // Update popper's position on every animation frame
      sticky && makeSticky(data)

      // Repaint/reflow is required for CSS transition when appending
      triggerReflow(tooltip, circle)

      modifyClassList([tooltip, circle], list => {
        list.contains('tippy-notransition') && list.remove('tippy-notransition')
        list.remove('leave')
        list.add('enter')
      })

      // Wait for transitions to complete
      onTransitionEnd(data, _duration, () => {
        if (!isVisible(popper) || data._onShownFired) return

        // Focus interactive tooltips only
        interactive && popper.focus()
        // Remove transitions from tooltip
        tooltip.classList.add('tippy-notransition')
        // Prevents shown() from firing more than once from early transition cancellations
        data._onShownFired = true

        this.callbacks.shown.call(popper)
      })
    })
  }

  /**
  * Hides a popper
  * @param {Element} popper
  * @param {Number} customDuration (optional)
  */
  hide(popper = this.store[0].popper, customDuration) {
    if (this.state.destroyed) return

    this.callbacks.hide.call(popper)

    const data = find(this.store, data => data.popper === popper)
    const { tooltip, circle, content } = getInnerElements(popper)

    const {
      reference,
      options: {
        appendTo,
        sticky,
        interactive,
        followCursor,
        html,
        trigger,
        duration
      }
    } = data

    const _duration = customDuration !== undefined
      ? customDuration
      : Array.isArray(duration) ? duration[1] : duration

    data._onShownFired = false
    interactive && reference.classList.remove('active')

    popper.style.visibility = 'hidden'
    popper.setAttribute('aria-hidden', 'true')

    applyTransitionDuration([tooltip, circle, circle ? content : null], _duration)

    if (circle) content.style.opacity = 0

    modifyClassList([tooltip, circle], list => {
      list.contains('tippy-tooltip') && list.remove('tippy-notransition')
      list.remove('enter')
      list.add('leave')
    })

    // Re-focus click-triggered html elements
    // and the tooltipped element IS in the viewport (otherwise it causes unsightly scrolling
    // if the tooltip is closed and the element isn't in the viewport anymore)
    if (html && trigger.indexOf('click') !== -1 && elementIsInViewport(reference)) {
      reference.focus()
    }

    // Wait for transitions to complete
    onTransitionEnd(data, _duration, () => {
      // `isVisible` is not completely reliable to determine if we shouldn't
      // run the hidden callback, we need to check the computed opacity style.
      // This prevents glitchy behavior of the transition when quickly showing
      // and hiding a tooltip.
      if (
        isVisible(popper) ||
        !appendTo.contains(popper) ||
        getComputedStyle(tooltip).opacity === '1'
      ) return

      reference.removeEventListener('mousemove', followCursorHandler)
      data.popperInstance.disableEventListeners()
      appendTo.removeChild(popper)

      this.callbacks.hidden.call(popper)
    })
  }

  /**
  * Updates a popper with new content
  * @param {Element} popper
  */
  update(popper = this.store[0].popper) {
    if (this.state.destroyed) return

    const data = find(this.store, data => data.popper === popper)

    const { content } = getInnerElements(popper)

    const {
      reference,
      options: {
        html
      }
    } = data

    if (html instanceof Element) {
      console.warn('Aborted: update() should not be used if `html` is a DOM element')
      return
    }

    content.innerHTML = html
      ? document.getElementById(html.replace('#', '')).innerHTML
      : reference.getAttribute('title') || reference.getAttribute('data-original-title')

    if (!html) removeTitle(reference)
  }

  /**
  * Destroys a popper
  * @param {Element} popper
  * @param {Boolean} _isLast - private param used by destroyAll to optimize
  */
  destroy(popper = this.store[0].popper, _isLast) {
    if (this.state.destroyed) return

    const data = find(this.store, data => data.popper === popper)

    const {
      reference,
      popperInstance,
      listeners,
      _mutationObserver
    } = data

    // Ensure the popper is hidden
    if (isVisible(popper)) {
      this.hide(popper, 0)
    }

    // Remove Tippy-only event listeners from tooltipped element
    listeners.forEach(listener => reference.removeEventListener(listener.event, listener.handler))

    // Restore original title
    reference.setAttribute('title', reference.getAttribute('data-original-title'))

    reference.removeAttribute('data-original-title')
    reference.removeAttribute('data-tooltipped')
    reference.removeAttribute('aria-describedby')

    popperInstance && popperInstance.destroy()
    _mutationObserver && _mutationObserver.disconnect()

    // Remove from store
    store.splice(findIndex(store, data => data.popper === popper), 1)

    // Ensure filter is called only once
    if (_isLast === undefined || _isLast) {
      this.store = store.filter(data => data.tippyInstance === this)
    }
  }

  /**
  * Destroys all tooltips created by the instance
  */
  destroyAll() {
    if (this.state.destroyed) return

    const storeLength = this.store.length

    this.store.forEach(({popper}, index) => {
      this.destroy(popper, index === storeLength - 1)
    })

    this.store = null
    this.state.destroyed = true
  }
}

function tippy(selector, options) {
  return new Tippy(selector, options)
}

tippy.browser = browser
tippy.defaults = defaults
tippy.disableDynamicInputDetection = () => browser.dynamicInputDetection = false
tippy.enableDynamicInputDetection = () => browser.dynamicInputDetection = true

export default tippy
