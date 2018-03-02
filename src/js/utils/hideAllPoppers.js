import { selectors } from '../core/globals'
import toArray from './toArray'

/**
 * Hides all poppers
 * @param {Tippy} excludeTippy - tippy to exclude if needed
 */
export default function hideAllPoppers(excludeTippy) {
  const poppers = toArray(document.querySelectorAll(selectors.POPPER))

  poppers.forEach(popper => {
    const tippy = popper._tippy
    if (!tippy) return

    const { options } = tippy

    if (
      (options.hideOnClick === true || options.trigger.indexOf('focus') > -1) &&
      (!excludeTippy || popper !== excludeTippy.popper)
    ) {
      tippy.hide()
    }
  })
}
