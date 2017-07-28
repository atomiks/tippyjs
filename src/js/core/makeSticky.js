import queueExecution from '../utils/queueExecution'
import prefix from '../utils/prefix'
import isVisible from '../utils/isVisible'

/**
* Updates a popper's position on each animation frame to make it stick to a moving element
* @param {Object} refData
*/
export default function makeSticky(refData) {
  const {
    popper,
    popperInstance,
    settings: {
      stickyDuration
    }
  } = refData

  const applyTransitionDuration = () =>
  popper.style[prefix('transitionDuration')] = `${stickyDuration}ms`

  const removeTransitionDuration = () =>
  popper.style[prefix('transitionDuration')] = ''

  const updatePosition = () => {
    popperInstance && popperInstance.scheduleUpdate()

    applyTransitionDuration()

    isVisible(popper) 
      ? window.requestAnimationFrame(updatePosition)
      : removeTransitionDuration()
  }

  // Wait until Popper's position has been updated initially
  queueExecution(updatePosition)
}
