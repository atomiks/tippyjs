import { Store } from './globals'

/**
* Hides all poppers
* @param {Object} exclude - data ref to exclude if needed
*/
export default function hideAllPoppers(exclude) {
  Store.forEach(data => {
    const {
      popper,
      tippyInstance,
      options: {
        appendTo,
        hideOnClick,
        trigger
      }
    } = data

    // Don't hide already hidden ones
    if (!appendTo.contains(popper)) return

    // hideOnClick can have the truthy value of 'persistent', so strict check is needed
    const isHideOnClick = hideOnClick === true || trigger.indexOf('focus') !== -1
    const isNotCurrentRef = !exclude || popper !== exclude.popper

    if (isHideOnClick && isNotCurrentRef) {
      tippyInstance.hide(popper)
    }
  })
}
