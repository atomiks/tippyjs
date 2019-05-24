import {
  onDocumentMouseMove,
  onDocumentTouchStart,
} from '../src/bindGlobalEventListeners'

export const IDENTIFIER = '__tippy'

export const el = type => document.createElement(type)

export function cleanDocumentBody() {
  document.body.innerHTML = ''
}

export function hasTippy(el) {
  return !!el._tippy
}

export function h(nodeName = 'div', attributes = {}) {
  const el = document.createElement(nodeName)
  el.className = IDENTIFIER

  for (const attr in attributes) {
    el.setAttribute(attr, attributes[attr])
  }

  document.body.appendChild(el)

  return el
}

export const withTestProps = props => ({
  lazy: false,
  content: 'content',
  ...props,
})

export function enableTouchEnvironment() {
  window.ontouchstart = true
  onDocumentTouchStart()
}

export function disableTouchEnvironment() {
  delete window.ontouchstart
  onDocumentMouseMove()
  onDocumentMouseMove()
}
