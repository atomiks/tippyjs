/**
 * Sets the visibility state of an element for transition to begin
 * @param {Element[]} els - array of elements
 * @param {String} type - 'visible' or 'hidden'
 */
export default function setVisibilityState(els, type) {
  els.forEach(el => {
    if (!el) return
    el.setAttribute('data-state', type)
  })
}
