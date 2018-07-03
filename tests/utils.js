import { Browser } from '../src/js/browser'

const BrowserClone = { ...Browser }

export const IDENTIFIER = '__tippy'

export const el = type => document.createElement(type)

export const cleanDocumentBody = () => {
  document.body.innerHTML = ''
}

export const hasTippy = el => !!el._tippy

export const h = (nodeName = 'div', attributes = {}) => {
  const el = document.createElement(nodeName)
  el.className = IDENTIFIER

  for (const attr in attributes) {
    el.setAttribute(attr, attributes[attr])
  }

  document.body.appendChild(el)

  return el
}

export const withTestOptions = options => ({
  lazy: false,
  content: 'content',
  ...options
})

export const resetBrowser = () => {
  for (const key in Browser) {
    Browser[key] = BrowserClone[key]
  }
}
