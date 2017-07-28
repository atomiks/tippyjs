/**
* Determines if a popper is currently visible
* @param {Element} popper
* @return {Boolean}
*/
export default function isVisible(popper) {
  return popper.style.visibility === 'visible'
}
