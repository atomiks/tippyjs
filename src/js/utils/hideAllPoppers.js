import { selectors } from '../core/globals'

/**
 * Hides all poppers
 * @param {Tippy} excludeTippy - tippy to exclude if needed
 */
export default function hideAllPoppers(excludeTippy) {
  const poppers = [].slice.call(document.querySelectorAll(selectors.POPPER))

  poppers.forEach(popper => {
    const tippy = popper._reference._tippy
    const { options } = tippy

    if (
      (options.hideOnClick === true || options.trigger.indexOf('focus') > -1) &&
      (!excludeTippy || popper !== excludeTippy.popper)
    ) {
      tippy.hide()
    }
  })
}
