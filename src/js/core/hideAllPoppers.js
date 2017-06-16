import { STORE } from './constants'

/**
* Hides all poppers
* @param {Object} currentRef
*/
export default function hideAllPoppers(currentRef) {

    STORE.forEach(ref => {

        const {
            popper,
            tippyInstance,
            settings: {
                appendTo,
                hideOnClick,
                hideDuration,
                trigger
            }
        } = ref

        // Don't hide already hidden ones
        if (!appendTo.contains(popper)) return

        // hideOnClick can have the truthy value of 'persistent', so strict check is needed
        const isHideOnClick = hideOnClick === true || trigger.indexOf('focus') !== -1
        const isNotCurrentRef = !currentRef || popper !== currentRef.popper

        if (isHideOnClick && isNotCurrentRef) {
            tippyInstance.hide(popper, hideDuration)
        }
    })
}
