/**
 * Determines if an element is visible in the viewport
 * @param {Element} el
 * @return {Boolean}
 */
export default function elementIsInViewport(el) {
  const rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
