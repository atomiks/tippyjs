import { Browser } from './globals'

import followCursorHandler  from './followCursorHandler'
import createPopperInstance from './createPopperInstance'

import queueExecution from '../utils/queueExecution'
import prefix from '../utils/prefix'

/**
* Appends the popper and creates a popper instance if one does not exist
* Also updates its position if need be and enables event listeners
* @param {Object} refData -  the element/popper reference data
*/
export default function mountPopper(refData) {
  const {
    el,
    popper,
    settings: {
      appendTo,
      followCursor,
      flipDuration
    }
  } = refData

  // Already on the DOM
  if (appendTo.contains(popper)) return

  appendTo.appendChild(popper)

  if (!refData.popperInstance) {
    // Create instance if it hasn't been created yet
    refData.popperInstance = createPopperInstance(refData)

    // Update the popper's position whenever its content changes
    // Not supported in IE10 unless polyfilled
    if (window.MutationObserver) {
      const styles = popper.style
      const observer = new MutationObserver(() => {
        styles[prefix('transitionDuration')] = '0ms'
        refData.popperInstance.update()
        queueExecution(() => {
          styles[prefix('transitionDuration')] = flipDuration + 'ms'
        })
      })
      observer.observe(popper, {
        childList: true,
        subtree: true,
        characterData: true
      })
      refData._mutationObserver = observer
    }

  } else {
    refData.popperInstance.update()

    if (!followCursor || Browser.touch) {
      refData.popperInstance.enableEventListeners()
    }
  }

  // Since touch is determined dynamically, followCursor setting
  // is set on mount
  if (followCursor && !Browser.touch) {
    el.addEventListener('mousemove', followCursorHandler)
    refData.popperInstance.disableEventListeners()
  }
}
