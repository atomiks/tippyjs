import getPopperPlacement from '../utils/getPopperPlacement'

/**
 * Determines if the mouse's cursor is outside the interactive border
 * @param {MouseEvent} event
 * @param {Element} popper
 * @param {Object} options
 * @return {Boolean}
 */
export default function cursorIsOutsideInteractiveBorder(
  event,
  popper,
  options
) {
  if (!popper.getAttribute('x-placement')) return true

  const { clientX: x, clientY: y } = event
  const { interactiveBorder, distance } = options

  const rect = popper.getBoundingClientRect()
  const placement = getPopperPlacement(popper)
  const borderWithDistance = interactiveBorder + distance

  const exceeds = {
    top: rect.top - y > interactiveBorder,
    bottom: y - rect.bottom > interactiveBorder,
    left: rect.left - x > interactiveBorder,
    right: x - rect.right > interactiveBorder
  }

  switch (placement) {
    case 'top':
      exceeds.top = rect.top - y > borderWithDistance
      break
    case 'bottom':
      exceeds.bottom = y - rect.bottom > borderWithDistance
      break
    case 'left':
      exceeds.left = rect.left - x > borderWithDistance
      break
    case 'right':
      exceeds.right = x - rect.right > borderWithDistance
      break
  }

  return exceeds.top || exceeds.bottom || exceeds.left || exceeds.right
}
