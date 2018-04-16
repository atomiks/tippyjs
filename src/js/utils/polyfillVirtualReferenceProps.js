/**
 * Polyfills needed props/methods for a virtual reference object
 * NOTE: in v3.0 this will be pure
 * @param {Object} reference
 */
export default function polyfillVirtualReferenceProps(reference) {
  reference.refObj = true
  reference.attributes = reference.attributes || {}
  reference.setAttribute = (key, val) => {
    reference.attributes[key] = val
  }
  reference.getAttribute = key => reference.attributes[key]
  reference.removeAttribute = key => {
    delete reference.attributes[key]
  }
  reference.hasAttribute = key => key in reference.attributes
  reference.addEventListener = () => {}
  reference.removeEventListener = () => {}
  reference.classList = {
    classNames: {},
    add: key => (reference.classList.classNames[key] = true),
    remove: key => {
      delete reference.classList.classNames[key]
      return true
    },
    contains: key => key in reference.classList.classNames
  }
}
