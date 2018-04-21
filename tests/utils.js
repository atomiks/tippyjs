export const IDENTIFIER = '__tippy'

export const cleanDocumentBody = () => {
  document.body.innerHTML = ''
}

export const hasTippy = el => el.hasAttribute('data-tippy')

export const createReferenceElement = ({ appendToBody }) => {
  const el = document.createElement('div')
  el.className = IDENTIFIER
  el.title = IDENTIFIER
  el._selector = `.${IDENTIFIER}`

  if (appendToBody) {
    document.body.appendChild(el)
  }

  return el
}

export const createArrayOfReferenceElements = ({ appendToBody }) => {
  return Array(10)
    .fill()
    .map(() => createReferenceElement({ appendToBody }))
}

export const withPopperInstanceOnInit = options => ({
  createPopperInstanceOnInit: true,
  ...options
})
