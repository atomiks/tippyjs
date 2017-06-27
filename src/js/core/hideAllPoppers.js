import { Store } from './globals'

/**
* Hides all poppers
* @param {Object} exclude - reference to exclude if needed
*/
export default function hideAllPoppers(exclude) {
    Store.forEach(ref => {
        const {
            popper,
            tippyInstance,
            settings: {
                appendTo,
                hideOnClick,
                trigger
            }
        } = ref

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
