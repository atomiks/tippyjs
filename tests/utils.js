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

export const wait = ms => new Promise(res => setTimeout(res, ms))
