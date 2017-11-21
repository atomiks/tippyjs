import { selectors, browser } from './globals'

import createFollowCursorListener from './createFollowCursorListener'
import createPopperInstance from './createPopperInstance'

import prefix from '../utils/prefix'

/**
* Appends the popper and creates a popper instance if one does not exist
* Also updates its position if need be and enables event listeners
* @param {Tippy} tippy
*/
export default function mountPopper(tippy) {
  const {
    popper,
    reference,
    options: {
      appendTo,
      followCursor
    }
   } = tippy

  // Already on the DOM
  if (appendTo.contains(popper)) return

  appendTo.appendChild(popper)
  
  if (!tippy.popperInstance) {
    tippy.popperInstance = createPopperInstance(tippy)
  } else {
    tippy.popperInstance.update()
    
    if (!followCursor || browser.usingTouch) {
      tippy.popperInstance.enableEventListeners()
    }
  }

  // Since touch is determined dynamically, followCursor is set on mount
  if (followCursor && !browser.usingTouch) {
    document.addEventListener('mousemove', createFollowCursorListener(tippy))
    tippy.popperInstance.disableEventListeners()
  }
}
