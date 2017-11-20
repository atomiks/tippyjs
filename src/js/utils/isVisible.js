/**
* Determines if an element is currently visible
* @param {Element} el
* @return {Boolean}
*/
export default function isVisible(el) {
  return el.style.visibility === 'visible'
}
