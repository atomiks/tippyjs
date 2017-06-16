import {
    BROWSER,
    STORE,
    SELECTORS,
    DEFAULT_SETTINGS
} from './core/constants'

import init from './core/init'

/* Utility functions */
import queueExecution          from './utils/queueExecution'
import prefix                  from './utils/prefix'
import find                    from './utils/find'
import removeTitle             from './utils/removeTitle'
import elementIsInViewport     from './utils/elementIsInViewport'
import triggerReflow           from './utils/triggerReflow'
import modifyClassList         from './utils/modifyClassList'
import applyTransitionDuration from './utils/applyTransitionDuration'
import isVisible               from './utils/isVisible'
import noop                    from './utils/noop'

/* Core library functions */
import followCursorHandler              from './core/followCursorHandler'
import getArrayOfElementsFromSelector   from './core/getArrayOfElementsFromSelector'
import onTransitionEnd                  from './core/onTransitionEnd'
import mountPopper                      from './core/mountPopper'
import makeSticky                       from './core/makeSticky'
import createTooltips                   from './core/createTooltips'

/**
* @param {String|Element} selector
* @param {Object} settings (optional) - the object of settings to be applied to the instance
*/
class Tippy {
    constructor(selector, settings = {}) {

        // Use default browser tooltip on unsupported browsers
        if ( ! BROWSER.supported) return

        // DOM is presumably mostly ready (for document.body) by instantiation time
        init()

        this.state = {
            destroyed: false
        }

        this.selector = selector

        this.settings = Object.assign({}, DEFAULT_SETTINGS, settings)

        this.callbacks = {
            wait: settings.wait,
            show: settings.show || noop,
            shown: settings.shown || noop,
            hide: settings.hide || noop,
            hidden: settings.hidden || noop
        }

        createTooltips.call(this, getArrayOfElementsFromSelector(selector))
    }

    /**
    * Returns the reference element's popper element
    * @param {Element} el
    * @return {Element}
    */
    getPopperElement(el) {
        try {
            return find(STORE.filter(ref => ref.tippyInstance === this), ref => ref.el === el).popper
        } catch (e) {
            console.error('[getPopperElement]: Element passed as the argument does not exist in the instance')
        }
    }

    /**
    * Returns a popper's element reference
    * @param {Element} popper
    * @return {Element}
    */
    getReferenceElement(popper) {
        try {
            return find(STORE.filter(ref => ref.tippyInstance === this), ref => ref.popper === popper).el
        } catch (e) {
            console.error('[getReferenceElement]: Popper passed as the argument does not exist in the instance')
        }
    }

    /**
    * Returns the reference data object from either the reference element or popper element
    * @param {Element} x (tooltipped element or popper)
    * @return {Object}
    */
    getReferenceData(x) {
        return find(STORE, ref => ref.el === x || ref.popper === x)
    }

    /**
    * Shows a popper
    * @param {Element} popper
    * @param {Number} duration (optional)
    */
    show(popper, duration = this.settings.duration) {
        if (this.state.destroyed) return

        this.callbacks.show.call(popper)

        const ref = find(STORE, ref => ref.popper === popper)
        const tooltip = popper.querySelector(SELECTORS.tooltip)
        const circle = popper.querySelector(SELECTORS.circle)

        const {
            el,
            settings: {
                appendTo,
                sticky,
                interactive,
                followCursor,
                flipDuration
            }
        } = ref

        // Remove transition duration (prevent a transition when popper changes posiiton)
        applyTransitionDuration([popper, tooltip, circle], 0, true)

        mountPopper(ref)

        popper.style.visibility = 'visible'
        popper.setAttribute('aria-hidden', 'false')

        // Wait for popper to update position and alter x-placement
        queueExecution(() => {
            if ( ! isVisible(popper)) return

            // Sometimes the arrow will not be in the correct position,
            // force another update
            if ( ! followCursor) {
                ref.popperInstance.update()
            }

            // Re-apply transition durations
            applyTransitionDuration([tooltip, circle], duration, true)
            if ( ! followCursor) {
                applyTransitionDuration([popper], flipDuration, true)
            }

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
            onTransitionEnd(ref, duration, () => {
                if ( ! isVisible(popper) || ref.onShownFired) return

                // Focus interactive tooltips only
                interactive && popper.focus()

                // Remove transitions from tooltip
                tooltip.classList.add('tippy-notransition')

                // Prevents shown() from firing more than once from early transition cancellations
                ref.onShownFired = true

                this.callbacks.shown.call(popper)
            })
        })
    }

    /**
    * Hides a popper
    * @param {Element} popper
    * @param {Number} duration (optional)
    */
    hide(popper, duration = this.settings.duration) {
        if (this.state.destroyed) return

        this.callbacks.hide.call(popper)

        const ref = find(STORE, ref => ref.popper === popper)
        const tooltip = popper.querySelector(SELECTORS.tooltip)
        const circle = popper.querySelector(SELECTORS.circle)
        const content = popper.querySelector(SELECTORS.content)

        const {
            el,
            settings: {
                appendTo,
                sticky,
                interactive,
                followCursor,
                html,
                trigger
            }
        } = ref

        ref.onShownFired = false
        interactive && el.classList.remove('active')

        popper.style.visibility = 'hidden'
        popper.setAttribute('aria-hidden', 'true')

        // Use same duration as show if an array is not specified
        if ( ! Array.isArray(duration)) {
            duration = parseInt(tooltip.style[prefix('transitionDuration')])
        }

        applyTransitionDuration([tooltip, circle], duration)

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
        onTransitionEnd(ref, duration, () => {
            if (isVisible(popper) || ! appendTo.contains(popper)) return

            el.removeEventListener('mousemove', followCursorHandler)
            ref.popperInstance.disableEventListeners()

            appendTo.removeChild(popper)

            this.callbacks.hidden.call(popper)
        })
    }

    /**
    * Destroys a popper
    * @param {Element} popper
    */
    destroy(popper) {
        if (this.state.destroyed) return

        const ref = find(STORE, ref => ref.popper === popper)
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

        // Remove from storage
        STORE.splice(STORE.map(ref => ref.popper).indexOf(popper), 1)
    }

    /**
    * Updates a popper with new content
    * @param {Element} popper
    */
    update(popper) {
        if (this.state.destroyed) return

        const ref = find(STORE, ref => ref.popper === popper)
        const content = popper.querySelector(SELECTORS.content)
        const { el, settings: { html } } = ref

        if (html) {
            content.innerHTML = (html instanceof Element)
                                ? html.innerHTML
                                : document.getElementById(html.replace('#', '')).innerHTML
        } else {
            content.innerHTML = el.getAttribute('title') || el.getAttribute('data-original-title')
            removeTitle(el)
        }
    }

    destroyAll() {
        if (this.state.destroyed) return

        STORE.filter(ref => ref.tippyInstance === this).forEach(ref => {
            this.destroy(ref.popper)
        })

        this.state.destroyed = true
    }
}

function tippy(selector, settings) {
    return new Tippy(selector, settings)
}

tippy.version = '1.0.0'
tippy.browser = BROWSER
tippy.defaultSettings = DEFAULT_SETTINGS

export default tippy
