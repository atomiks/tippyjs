/**
* Removes the title from the tooltipped element
* @param {Element} el
*/
export default function removeTitle(el) {
  const title = el.getAttribute('title')
  el.setAttribute('data-original-title', title || 'html')
  el.removeAttribute('title')
}
