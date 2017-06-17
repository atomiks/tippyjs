import { Browser } from './globals'

import followCursorHandler  from './followCursorHandler'
import createPopperInstance from './createPopperInstance'

/**
* Appends the popper and creates a popper instance if one does not exist
* Also updates its position if need be and enables event listeners
* @param {Object} ref -  the element/popper reference
*/
export default function mountPopper(ref) {

    const {
        el,
        popper,
        settings: {
            appendTo,
            followCursor
        }
    } = ref

    // Already on the DOM
    if (appendTo.contains(popper)) return

    appendTo.appendChild(popper)

    if ( ! ref.popperInstance) {
        // Create instance if it hasn't been created yet
        ref.popperInstance = createPopperInstance(ref)

    } else {
        ref.popperInstance.update()

        if ( ! followCursor || Browser.touch) {
            ref.popperInstance.enableEventListeners()
        }
    }

    // Since touch is determined dynamically, followCursor setting
    // is set on mount
   if (followCursor && ! Browser.touch) {
       el.addEventListener('mousemove', followCursorHandler)
       ref.popperInstance.disableEventListeners()
   }
}
