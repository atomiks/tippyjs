import { store } from './globals'

import isVisible from '../utils/isVisible'

/**
* Hides all poppers
* @param {Tippy} excludeTippy - tippy to exclude if needed
*/
export default function hideAllPoppers(excludeTippy) {
  store.forEach(tippy => {
    const { popper, options } = tippy
    
    // Don't hide already hidden ones
    if (!isVisible(popper)) return

    // hideOnClick can have the truthy value of 'persistent', so strict check is needed
    const isHideOnClick = (
      options.hideOnClick === true ||
      options.trigger.indexOf('focus') > -1
    )
    const isNotExcludedTippy = !excludeTippy || popper !== excludeTippy.popper

    if (isHideOnClick && isNotExcludedTippy) {
      tippy.hide()
    }
  })
}
