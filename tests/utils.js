import { Browser } from '../src/js/browser'

const BrowserClone = { ...Browser }

export const IDENTIFIER = '__tippy'

export const el = type => document.createElement(type)

export const cleanDocumentBody = () => {
  document.body.innerHTML = ''
}

export const hasTippy = el => !!el._tippy

export const createReference = ({ appendToBody } = {}) => {
  const el = document.createElement('div')
  el.className = IDENTIFIER

  if (appendToBody) {
    document.body.appendChild(el)
  }

  return el
}

export const createReferenceArray = ({ appendToBody } = {}) => {
  return [...Array(10)].map(() => createReference({ appendToBody }))
}

export const withTestOptions = options => ({
  createPopperInstanceOnInit: true,
  content: 'content',
  ...options
})

export const resetBrowser = () => {
  for (const key in Browser) {
    Browser[key] = BrowserClone[key]
  }
}
