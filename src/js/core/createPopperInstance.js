import Popper from 'popper.js'

import defer                 from '../utils/defer'
import prefix                from '../utils/prefix'
import getCorePlacement      from '../utils/getCorePlacement'
import getInnerElements      from '../utils/getInnerElements'
import getOffsetDistanceInPx from '../utils/getOffsetDistanceInPx'

/**
* Creates a new popper instance
* @param {Object} data
* @return {Object} - the popper instance
*/
export default function createPopperInstance(data) {
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
      arrowStyle
    }
  } = data

  const { tooltip } = getInnerElements(popper)

  const config = {
    placement,
    ...(popperOptions || {}),
    modifiers: {
      ...(popperOptions ? popperOptions.modifiers : {}),
      arrow: {
        element: arrowStyle === 'round' ? '[x-roundarrow]' : '[x-arrow]',
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

  // Update the popper's position whenever its content changes
  // Not supported in IE10 unless polyfilled
  if (window.MutationObserver) {
    const styles = popper.style

    const observer = new MutationObserver(() => {
      styles[prefix('transitionDuration')] = '0ms'
      data.popperInstance.update()
      defer(() => {
        styles[prefix('transitionDuration')] = updateDuration + 'ms'
      })
    })

    observer.observe(popper, {
      childList: true,
      subtree: true,
      characterData: true
    })

    data._mutationObservers.push(observer)
  }

  return new Popper(reference, popper, config)
}
