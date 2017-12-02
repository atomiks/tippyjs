import { selectors, browser } from './globals'

import createFollowCursorListener from './createFollowCursorListener'
import createPopperInstance from './createPopperInstance'

import prefix from '../utils/prefix'
import find from '../utils/find'
import getPopperPlacement from '../utils/getPopperPlacement'
import defer from '../utils/defer'

/**
* Appends the popper and creates a popper instance if one does not exist
* Also updates its position if need be and enables event listeners
* @param {Tippy} tippy
*/
export default function mountPopper(tippy) {
  const { popper, reference, options } = tippy
  let { popperInstance } = tippy

  // Already on the DOM
  if (options.appendTo.contains(popper)) return
  options.appendTo.appendChild(popper)
  
  if (!popperInstance) {
    popperInstance = tippy.popperInstance = createPopperInstance(tippy)
  } else {
    popper.style[prefix('transform')] = null
    popperInstance.update()
    
    if (!options.followCursor || browser.usingTouch) {
      popperInstance.enableEventListeners()
    }
  }
  
  // Since touch is determined dynamically, followCursor is set on mount
  if (options.followCursor && !browser.usingTouch) {
    document.addEventListener('mousemove', createFollowCursorListener(tippy))
    popperInstance.disableEventListeners()
  }
}
