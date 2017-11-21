import { selectors } from './globals'

import getPopperPlacement from '../utils/getPopperPlacement'
import find from '../utils/find'
import prefix from '../utils/prefix'
import closest from '../utils/closest'

/**
* Creates a mousemove event listener function for `followCursor` option
* @param {Tippy} tippy
* @return {Function} the event listener
*/
export default function createFollowCursorListener(tippy) {
  const listener = e => {
    if (tippy._lastTriggerEvent === 'focus') return
    
    const {
      popper,
      options: {
        offset
      }
    } = tippy

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
  
  tippy._followCursorListener = listener
  
  return listener
}
