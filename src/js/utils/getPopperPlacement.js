/**
 * Returns the core placement ('top', 'bottom', 'left', 'right') of a popper
 * @param {Element} popper
 * @return {String}
 */
export default function getPopperPlacement(popper) {
  return popper.getAttribute('x-placement').replace(/-.+/, '')
}
