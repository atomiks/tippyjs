import createReferenceElement from './createReferenceElement'

export default (append = false) =>
  Array(10)
    .fill()
    .map(() => createReferenceElement(append))
