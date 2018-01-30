/**
 * Focuses an element while preventing a scroll jump if it's not entirely within the viewport
 * @param {Element} el
 */
export default function focus(el) {
  const x = window.scrollX || window.pageXOffset
  const y = window.scrollY || window.pageYOffset
  el.focus()
  scroll(x, y)
}
