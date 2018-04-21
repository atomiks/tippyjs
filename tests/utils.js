import Selectors from '../src/js/selectors'

export const IDENTIFIER = '__tippy'

export const el = type => document.createElement(type)

export const cleanDocumentBody = () => {
  document.body.innerHTML = ''
}

export const hasTippy = el => el.hasAttribute('data-tippy')

export const createReference = ({ appendToBody } = {}) => {
  const el = document.createElement('div')
  el.className = IDENTIFIER

  if (appendToBody) {
    document.body.appendChild(el)
  }

  return el
}

export const createReferenceArray = ({ appendToBody } = {}) => {
  return Array(10)
    .fill()
    .map(() => createReference({ appendToBody }))
}

export const withTestOptions = options => ({
  createPopperInstanceOnInit: true,
  content: 'content',
  ...options
})
