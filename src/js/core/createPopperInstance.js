import Popper from 'popper.js'

import { Selectors } from './globals'

import getCorePlacement from '../utils/getCorePlacement'
import getOffsetDistanceInPx from '../utils/getOffsetDistanceInPx'
import prefix from '../utils/prefix'

/**
* Creates a new popper instance
* @param {Object} refData
* @return {Object} - the popper instance
*/
export default function createPopperInstance(refData) {

    const {
        el,
        popper,
        settings: {
            position,
            popperOptions,
            offset,
            distance,
            flipDuration
        }
    } = refData

    const tooltip = popper.querySelector(Selectors.TOOLTIP)
    let flipped

    const config = {
        placement: position,
        ...(popperOptions || {}),
        modifiers: {
            ...(popperOptions ? popperOptions.modifiers : {}),
            flip: {
                padding: distance + 5 /* 5px from viewport boundary */,
                ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {})
            },
            offset: {
                offset,
                ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {})
            }
        },
        onUpdate(data) {
            tooltip.style.top = ''
            tooltip.style.bottom = ''
            tooltip.style.left = ''
            tooltip.style.right = ''
            tooltip.style[
                getCorePlacement(popper.getAttribute('x-placement'))
            ] = getOffsetDistanceInPx(distance)
        }
    }

    return new Popper(el, popper, config)
}
