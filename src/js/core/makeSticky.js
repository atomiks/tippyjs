import defer from '../utils/defer'
import prefix from '../utils/prefix'
import isVisible from '../utils/isVisible'

/**
* Updates a popper's position on each animation frame to make it stick to a moving element
* @param {Object} data
*/
export default function makeSticky(data) {
  const {
    popper,
    popperInstance,
    options: {
      stickyDuration
    }
  } = data

  const applyTransitionDuration = () =>
    popper.style[prefix('transitionDuration')] = `${stickyDuration}ms`

  const removeTransitionDuration = () =>
    popper.style[prefix('transitionDuration')] = ''

  const updatePosition = () => {
    popperInstance && popperInstance.scheduleUpdate()

    applyTransitionDuration()

    isVisible(popper)
      ? requestAnimationFrame(updatePosition)
      : removeTransitionDuration()
  }

  // Wait until Popper's position has been updated initially
  defer(updatePosition)
}
