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
    onUpdate() {
      const styles = tooltip.style
      styles.top = ''
      styles.bottom = ''
      styles.left = ''
      styles.right = ''
      styles[
        getCorePlacement(popper.getAttribute('x-placement'))
      ] = getOffsetDistanceInPx(distance)
    }
  }

  return new Popper(el, popper, config)
}
