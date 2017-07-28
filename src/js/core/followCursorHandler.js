import { Store, Selectors } from './globals'

import getCorePlacement from '../utils/getCorePlacement'
import find             from '../utils/find'
import prefix           from '../utils/prefix'
import closest          from '../utils/closest'

/**
* Mousemove event listener callback method for follow cursor setting
* @param {MouseEvent} e
*/
export default function followCursorHandler(e) {
  const refData = find(Store, refData => refData.el === this)

  const {
    popper,
    settings: {
      offset
    }
  } = refData

  const position = getCorePlacement(popper.getAttribute('x-placement'))
  const halfPopperWidth = Math.round(popper.offsetWidth / 2)
  const halfPopperHeight = Math.round(popper.offsetHeight / 2)
  const viewportPadding = 5
  const pageWidth = document.documentElement.offsetWidth || document.body.offsetWidth

  const { pageX, pageY } = e

  let x, y

  switch (position) {
    case 'top':
      x = pageX - halfPopperWidth + offset
      y = pageY - 2.25 * halfPopperHeight
      break
    case 'left':
      x = pageX - ( 2 * halfPopperWidth ) - 10
      y = pageY - halfPopperHeight + offset
      break
    case 'right':
      x = pageX + halfPopperHeight
      y = pageY - halfPopperHeight + offset
      break
    case 'bottom':
      x = pageX - halfPopperWidth + offset
      y = pageY + halfPopperHeight/1.5
      break
  }

  const isRightOverflowing = pageX + viewportPadding + halfPopperWidth + offset > pageWidth
  const isLeftOverflowing = pageX - viewportPadding - halfPopperWidth + offset < 0

  // Prevent left/right overflow
  if (position === 'top' || position === 'bottom') {
    if (isRightOverflowing) {
      x = pageWidth - viewportPadding - ( 2 * halfPopperWidth)
    }

    if (isLeftOverflowing) {
      x = viewportPadding
    }
  }

  popper.style[prefix('transform')] = `translate3d(${x}px, ${y}px, 0)`
}
