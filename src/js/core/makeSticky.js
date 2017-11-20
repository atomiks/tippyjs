import defer from '../utils/defer'
import prefix from '../utils/prefix'
import isVisible from '../utils/isVisible'

/**
* Updates a popper's position on each animation frame to make it stick to a moving element
* @param {Tippy} tippy
*/
export default function makeSticky(tippy) {
  const applyTransitionDuration = () => {
    tippy.popper.style[prefix('transitionDuration')] = `${ tippy.options.updateDuration }ms`
  }

  const removeTransitionDuration = () => {
    tippy.popper.style[prefix('transitionDuration')] = ''
  }

  const updatePosition = () => {
    tippy.popperInstance && tippy.popperInstance.scheduleUpdate()

    applyTransitionDuration()

    isVisible(tippy.popper)
      ? requestAnimationFrame(updatePosition)
      : removeTransitionDuration()
  }

  // Wait until Popper's position has been updated initially
  defer(updatePosition)
}
