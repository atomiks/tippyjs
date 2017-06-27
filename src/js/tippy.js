import {
    Browser,
    Store,
    Selectors,
    Defaults
} from './core/globals'

import init from './core/init'

/* Utility functions */
import queueExecution          from './utils/queueExecution'
import prefix                  from './utils/prefix'
import find                    from './utils/find'
import findIndex               from './utils/findIndex'
import removeTitle             from './utils/removeTitle'
import elementIsInViewport     from './utils/elementIsInViewport'
import triggerReflow           from './utils/triggerReflow'
import modifyClassList         from './utils/modifyClassList'
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
* @param {String|Element} selector
* @param {Object} settings (optional) - the object of settings to be applied to the instance
*/
class Tippy {
    constructor(selector, settings = {}) {

        // Use default browser tooltip on unsupported browsers
        if ( ! Browser.SUPPORTED) return

        // DOM is presumably mostly ready (for document.body) by instantiation time
        init()

        this.state = {
            destroyed: false
        }

        this.selector = selector

        this.settings = Object.assign({}, Defaults, settings)

        this.callbacks = {
            wait: settings.wait,
            show: settings.show || noop,
            shown: settings.shown || noop,
            hide: settings.hide || noop,
            hidden: settings.hidden || noop
        }

        this.store = createTooltips.call(this, getArrayOfElements(selector))
        Store.push.apply(Store, this.store)
    }

    /**
    * Returns the reference element's popper element reference
    * @param {Element} el
    * @return {Element}
    */
    getPopperElement(el) {
        try {
            return find(this.store, ref => ref.el === el).popper
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
            return find(this.store, ref => ref.popper === popper).el
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
        return find(this.store, ref => ref.el === x || ref.popper === x)
    }

    /**
    * Shows a popper
    * @param {Element} popper
    * @param {Number} customDuration (optional)
    */
    show(popper, customDuration) {
        if (this.state.destroyed) return

        this.callbacks.show.call(popper)

        const ref = find(this.store, ref => ref.popper === popper)
        const tooltip = popper.querySelector(Selectors.TOOLTIP)
        const circle = popper.querySelector(Selectors.CIRCLE)
        const content = popper.querySelector(Selectors.CONTENT)

        const {
            el,
            settings: {
                appendTo,
                sticky,
                interactive,
                followCursor,
                flipDuration,
                duration
            }
        } = ref

        const _duration = customDuration !== undefined
                        ? customDuration
                        : Array.isArray(duration) ? duration[0] : duration

        // Remove transition duration (prevent a transition when popper changes position)
        applyTransitionDuration([popper, tooltip, circle], 0)

        mountPopper(ref)

        popper.style.visibility = 'visible'
        popper.setAttribute('aria-hidden', 'false')

        // Wait for popper to update position and alter x-placement
        queueExecution(() => {
            if ( ! isVisible(popper)) return

            // Sometimes the arrow will not be in the correct position,
            // force another update
            if ( ! followCursor || Browser.touch) {
                ref.popperInstance.update()
            }

            // Re-apply transition durations
            applyTransitionDuration([tooltip, circle], _duration, true)
            if ( ! followCursor || Browser.touch) {
                applyTransitionDuration([popper], flipDuration, true)
            }

            // Make content fade out a bit faster than the tooltip if `animateFill`
            if (circle) content.style.opacity = 1

            // Interactive tooltips receive a class of 'active'
            interactive && el.classList.add('active')

            // Update popper's position on every animation frame
            sticky && makeSticky(ref)

            // Repaint/reflow is required for CSS transition when appending
            triggerReflow(tooltip, circle)

            modifyClassList([tooltip, circle], list => {
                list.contains('tippy-notransition') && list.remove('tippy-notransition')
                list.remove('leave')
                list.add('enter')
            })

            // Wait for transitions to complete
            onTransitionEnd(ref, _duration, () => {
                if ( ! isVisible(popper) || ref._onShownFired) return

                // Focus interactive tooltips only
                interactive && popper.focus()

                // Remove transitions from tooltip
                tooltip.classList.add('tippy-notransition')

                // Prevents shown() from firing more than once from early transition cancellations
                ref._onShownFired = true

                this.callbacks.shown.call(popper)
            })
        })
    }

    /**
    * Hides a popper
    * @param {Element} popper
    * @param {Number} customDuration (optional)
    */
    hide(popper, customDuration) {
        if (this.state.destroyed) return

        this.callbacks.hide.call(popper)

        const ref = find(this.store, ref => ref.popper === popper)
        const tooltip = popper.querySelector(Selectors.TOOLTIP)
        const circle = popper.querySelector(Selectors.CIRCLE)
        const content = popper.querySelector(Selectors.CONTENT)

        const {
            el,
            settings: {
                appendTo,
                sticky,
                interactive,
                followCursor,
                html,
                trigger,
                duration
            }
        } = ref

        const _duration = customDuration !== undefined
                        ? customDuration
                        : Array.isArray(duration) ? duration[1] : duration

        ref._onShownFired = false
        interactive && el.classList.remove('active')

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
        if (html && trigger.indexOf('click') !== -1 && elementIsInViewport(el)) {
            el.focus()
        }

        // Wait for transitions to complete
        onTransitionEnd(ref, _duration, () => {
            if (isVisible(popper) || ! appendTo.contains(popper)) return

            el.removeEventListener('mousemove', followCursorHandler)

            ref.popperInstance.disableEventListeners()

            appendTo.removeChild(popper)

            this.callbacks.hidden.call(popper)
        })
    }

    /**
    * Updates a popper with new content
    * @param {Element} popper
    */
    update(popper) {
        if (this.state.destroyed) return

        const ref = find(this.store, ref => ref.popper === popper)
        const content = popper.querySelector(Selectors.CONTENT)
        const { el, settings: { html } } = ref

        if (html instanceof Element) {
            console.warn('Aborted: update() should not be used if `html` is a DOM element')
            return
        }

        content.innerHTML = html ? document.getElementById(html.replace('#', '')).innerHTML
                                 : el.getAttribute('title') || el.getAttribute('data-original-title')

        if (!html) removeTitle(el)
    }

    /**
    * Destroys a popper
    * @param {Element} popper
    * @param {Boolean} _isLast - private param used by destroyAll to optimize
    */
    destroy(popper, _isLast) {
        if (this.state.destroyed) return

        const ref = find(this.store, ref => ref.popper === popper)
        const { el, popperInstance, listeners } = ref

        // Ensure the popper is hidden
        if (isVisible(popper)) {
            this.hide(popper, 0)
        }

        // Remove Tippy-only event listeners from tooltipped element
        listeners.forEach(listener => el.removeEventListener(listener.event, listener.handler))

        // Restore original title
        el.setAttribute('title', el.getAttribute('data-original-title'))

        el.removeAttribute('data-original-title')
        el.removeAttribute('data-tooltipped')
        el.removeAttribute('aria-describedby')

        popperInstance && popperInstance.destroy()

        // Remove from store
        Store.splice(findIndex(Store, ref => ref.popper === popper), 1)

        // Ensure filter is called only once
        if (_isLast === undefined || _isLast) {
            this.store = Store.filter(ref => ref.tippyInstance === this)
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

function tippy(selector, settings) {
    return new Tippy(selector, settings)
}

tippy.Browser = Browser
tippy.Defaults = Defaults
tippy.disableDynamicInputDetection = () => Browser.dynamicInputDetection = false
tippy.enableDynamicInputDetection = () => Browser.dynamicInputDetection = true

export default tippy
