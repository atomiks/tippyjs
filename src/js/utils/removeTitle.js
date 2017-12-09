/**
 * Removes the title from an element, setting `data-original-title`
 * appropriately
 * @param {Element} el
 */
export default function removeTitle(el) {
  const title = el.getAttribute('title')
  // Only set `data-original-title` attr if there is a title
  if (title) {
    el.setAttribute('data-original-title', title)
  }
  el.removeAttribute('title')
}
