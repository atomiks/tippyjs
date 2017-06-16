import { BROWSER, SELECTORS } from './constants'

import isVisible                        from '../utils/isVisible'
import closest                          from '../utils/closest'
import cursorIsOutsideInteractiveBorder from '../utils/cursorIsOutsideInteractiveBorder'

/**
* Returns relevant listener callbacks for each ref
* @param {Element} el
* @param {Element} popper
* @param {Object} settings
* @return {Object} - relevant listener callback methods
*/
export default function getEventListenerHandlers(el, popper, settings) {

    const {
        position,
        delay,
        duration,
        interactive,
        interactiveBorder,
        distance,
        hideOnClick,
        trigger,
        touchHold
    } = settings

    let showDelay, hideDelay

    const clearTimeouts = () => {
        clearTimeout(showDelay)
        clearTimeout(hideDelay)
    }

    const _show = () => {
        clearTimeouts()

        // Not hidden. For clicking when it also has a `focus` event listener
        if (isVisible(popper)) return

        const _duration = Array.isArray(duration) ? duration[0] : duration
        const _delay = Array.isArray(delay) ? delay[0] : delay

        if (delay) {
            showDelay = setTimeout(() => this.show(popper, _duration), _delay)
        } else {
            this.show(popper, _duration)
        }
    }

    const show = event =>
        this.callbacks.wait ? this.callbacks.wait.call(popper, _show, event) : _show()

    const hide = () => {
        clearTimeouts()

        const _duration = Array.isArray(duration) ? duration[1] : duration
        const _delay = Array.isArray(delay) ? delay[1] : delay

        if (delay) {
            hideDelay = setTimeout(() => this.hide(popper, _duration), _delay)
        } else {
            this.hide(popper, _duration)
        }
    }

    const handleTrigger = event => {

        const touchMouseenter = event.type === 'mouseenter' && BROWSER.supportsTouch && BROWSER.touch
        if (touchMouseenter && touchHold) return

        // Toggle show/hide when clicking click-triggered tooltips
        const isClick = event.type === 'click'
        const isNotPersistent = hideOnClick !== 'persistent'

        isClick && isVisible(popper) && isNotPersistent ? hide() : show(event)

        // Prevent the need to double-tap buttons on iOS
        // iOS does not fire a click event like it should when mouseenter changes page content
        if (touchMouseenter && BROWSER.iOS) {
            el.click()
        }
    }

    const handleMouseleave = event => {

        // Don't fire 'mouseleave', use the 'touchend'
        if (event.type === 'mouseleave' && BROWSER.supportsTouch &&
        BROWSER.touch && touchHold) {
            return
        }

        if (interactive) {
            // Temporarily handle mousemove to check if the mouse left somewhere
            // other than its popper
            const handleMousemove = event => {

                const triggerHide = () => {
                    document.removeEventListener('mouseleave', hide)
                    document.removeEventListener('mousemove', handleMousemove)
                    hide()
                }

                const closestTooltippedEl = closest(event.target, SELECTORS.el)

                const isOverPopper = closest(event.target, SELECTORS.popper) === popper
                const isOverEl = closestTooltippedEl === el
                const isClickTriggered = trigger.indexOf('click') !== -1
                const isOverOtherTooltippedEl = closestTooltippedEl && closestTooltippedEl !== el

                if (isOverOtherTooltippedEl) {
                    return triggerHide()
                }

                if (isOverPopper || isOverEl || isClickTriggered) return

                if (cursorIsOutsideInteractiveBorder(event, popper, settings)) {
                    triggerHide()
                }
            }

            document.addEventListener('mouseleave', hide)
            document.addEventListener('mousemove', handleMousemove)

            return
        }

        // If it's not interactive, just hide it
        hide()
    }

    const handleBlur = event => {
        // Ignore blur on touch devices, if there is no `relatedTarget`, hide
        // If the related target is a popper, ignore
        if (BROWSER.touch) return
        if (!event.relatedTarget) return hide()
        if (closest(event.relatedTarget, SELECTORS.popper)) return

        hide()
    }

    return {
        handleTrigger,
        handleMouseleave,
        handleBlur
    }
}
