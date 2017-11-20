import Popper from 'popper.js'

import computeArrowTransform from './computeArrowTransform'

import defer from '../utils/defer'
import prefix from '../utils/prefix'
import isVisible from '../utils/isVisible'
import getPopperPlacement from '../utils/getPopperPlacement'
import getInnerElements from '../utils/getInnerElements'
import getOffsetDistanceInPx from '../utils/getOffsetDistanceInPx'
import addMutationObserver from '../utils/addMutationObserver'

import { selectors } from './globals'

/**
* Creates a new popper instance
* @param {Tippy} tippy
* @return {Popper}
*/
export default function createPopperInstance(tippy) {
  const {
    reference,
    popper,
    options: {
      placement,
      popperOptions,
      offset,
      distance,
      updateDuration,
      flip,
      flipBehavior,
      arrowType,
      arrowTransform
    }
  } = tippy

  const { tooltip } = getInnerElements(popper)
  
  const arrowSelector = arrowType === 'round'
    ? selectors.ROUND_ARROW
    : selectors.ARROW
  const arrow = tooltip.querySelector(arrowSelector)
    
  const config = {
    placement,
    ...(popperOptions || {}),
    modifiers: {
      ...(popperOptions ? popperOptions.modifiers : {}),
      arrow: {
        element: arrowSelector,
        ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.arrow : {})
      },
      flip: {
        enabled: flip,
        padding: distance + 5 /* 5px from viewport boundary */,
        behavior: flipBehavior,
        ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.flip : {})
      },
      offset: {
        offset,
        ...(popperOptions && popperOptions.modifiers ? popperOptions.modifiers.offset : {})
      }
    },
    onCreate() {
      tooltip.style[getPopperPlacement(popper)] = getOffsetDistanceInPx(distance)
      
      if (arrow && arrowTransform) {
        computeArrowTransform(popper, arrow, arrowTransform)
      }
    },
    onUpdate() {
      const styles = tooltip.style
      styles.top = ''
      styles.bottom = ''
      styles.left = ''
      styles.right = ''
      styles[getPopperPlacement(popper)] = getOffsetDistanceInPx(distance)
      
      if (arrow && arrowTransform) {
        computeArrowTransform(popper, arrow, arrowTransform)
      }
    }
  }
  
  addMutationObserver({
    tippy,
    target: popper,
    callback() {
      const styles = popper.style
      styles[prefix('transitionDuration')] = '0ms'
      tippy.popperInstance.update()
      defer(() => {
        styles[prefix('transitionDuration')] = updateDuration + 'ms'
      })
    },
    options: {
      childList: true,
      subtree: true,
      characterData: true
    }
  })

  return new Popper(reference, popper, config)
}
