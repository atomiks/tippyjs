import { BROWSER, STORE, SELECTORS, DEFAULT_SETTINGS } from './constants'

import hideAllPoppers from './hideAllPoppers'

import closest from '../utils/closest'
import find    from '../utils/find'

/**
* To run a single time, once DOM is presumed to be ready
* @return {Boolean} whether the function has run or not
*/
export default function init() {

    if (init.done) return false
    init.done = true

    if ( ! BROWSER.supportsTouch) {
        // For Microsoft Surface
        if (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            BROWSER.touch = true
        }
    }

    document.addEventListener('touchstart', function touchHandler() {
        BROWSER.touch = true

        if (BROWSER.iOS) {
            document.body.classList.add('tippy-touch')
        }

        document.removeEventListener('touchstart', touchHandler)
    })

    // Handle clicks anywhere on the document
    document.addEventListener('click', event => {

        // Simulated events dispatched on the document
        if (!(event.target instanceof Element)) {
            return hideAllPoppers()
        }

        const el = closest(event.target, SELECTORS.el)
        const popper = closest(event.target, SELECTORS.popper)

        if (popper) {
            const ref = find(STORE, ref => ref.popper === popper)
            const { settings: { interactive } } = ref
            if (interactive) return
        }

        if (el) {
            const ref = find(STORE, ref => ref.el === el)
            const { popper, settings: { hideOnClick, multiple, trigger } } = ref

            // Hide all poppers except the one belonging to the element that was clicked IF
            // `multiple` is false AND they are a touch user, OR
            // `multiple` is false AND it's triggered by a click
            if ((!multiple && BROWSER.touch) || (!multiple && trigger.indexOf('click') !== -1)) {
                return hideAllPoppers(ref)
            }

            // If hideOnClick is not strictly true or triggered by a click don't hide poppers
            if (hideOnClick !== true || trigger.indexOf('click') !== -1) return
        }

        // Don't trigger a hide for tippy controllers, and don't needlessly run loop
        if (closest(event.target, SELECTORS.controller) ||
            !document.querySelector(SELECTORS.popper)
        ) return

        hideAllPoppers()
    })

    // If the script is in <head>, document.body is null, so it's set in the
    // init function
    DEFAULT_SETTINGS.appendTo = document.body

    return true
}
