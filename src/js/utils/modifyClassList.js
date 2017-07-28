/**
* Modifies elements' class lists
* @param {Element[]} els - Array of elements
* @param {Function} callback
*/
export default function modifyClassList(els, callback) {
  els.forEach(el => {
    if (!el) return
    callback(el.classList)
  })
}
