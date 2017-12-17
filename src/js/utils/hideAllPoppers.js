import { selectors } from '../core/globals'

/**
 * Hides all poppers
 * @param {Tippy} excludeTippy - tippy to exclude if needed
 */
export default function hideAllPoppers(excludeTippy) {
  const poppers = [].slice.call(document.querySelectorAll(selectors.POPPER))

  poppers.forEach(popper => {
    const tippy = popper._tippy

    if (
      (tippy.options.hideOnClick === true || tippy.options.trigger.indexOf('focus') > -1) &&
      (!excludeTippy || popper !== excludeTippy.popper)
    ) {
      tippy.hide()
    }
  })
}
