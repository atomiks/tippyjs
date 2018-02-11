import prefix from './prefix'

/**
 * Resets a popper's position to fix https://github.com/FezVrasta/popper.js/issues/251
 * @param {Element} popper
 */
export default function resetPopperPosition(popper) {
  const styles = popper.style
  styles[prefix('transform')] = null
  styles.top = null
  styles.left = null
}
