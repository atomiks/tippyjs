import { Store } from './globals'

import getCorePlacement from '../utils/getCorePlacement'
import find             from '../utils/find'
import prefix           from '../utils/prefix'

/**
* Mousemove event listener callback method for follow cursor setting
* @param {MouseEvent} e
*/
export default function followCursorHandler(e) {
    const ref = find(Store, ref => ref.el === this)
    const { popper } = ref

    const position = getCorePlacement(popper.getAttribute('x-placement'))
    const halfPopperWidth = Math.round( popper.offsetWidth / 2 )
    const halfPopperHeight = Math.round( popper.offsetHeight / 2 )
    const viewportPadding = 5
    const pageWidth = document.documentElement.offsetWidth || document.body.offsetWidth

    const { pageX, pageY } = e

    let x, y

    switch (position) {
        case 'top':
            x = pageX - halfPopperWidth
            y = pageY - 2.5 * halfPopperHeight
            break
        case 'left':
            x = pageX - ( 2 * halfPopperWidth ) - 15
            y = pageY - halfPopperHeight
            break
        case 'right':
            x = pageX + halfPopperHeight
            y = pageY - halfPopperHeight
            break
        case 'bottom':
            x = pageX - halfPopperWidth
            y = pageY + halfPopperHeight/1.5
            break
    }

    const isRightOverflowing = pageX + viewportPadding + halfPopperWidth > pageWidth
    const isLeftOverflowing = pageX - viewportPadding - halfPopperWidth < 0

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
