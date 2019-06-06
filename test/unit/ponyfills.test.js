import { h, IDENTIFIER, cleanDocumentBody } from '../utils'
import { arrayFrom, closestCallback } from '../../src/ponyfills'

afterEach(cleanDocumentBody)

describe('arrayFrom', () => {
  it('converts a NodeList to an array', () => {
    ;[...Array(10)].map(() => h())
    const arr = arrayFrom(document.querySelectorAll(IDENTIFIER))
    expect(Array.isArray(arr)).toBe(true)
  })
})

describe('closestCallback', () => {
  it('works like Element.prototype.closest but uses a callback instead', () => {
    const ref = h('div', { class: 'parent' })
    const child = h('div', { class: 'child' })
    ref.append(child)
    expect(closestCallback(ref, node => node.className === 'parent')).toBe(ref)
    expect(closestCallback(child, node => node.className === 'parent')).toBe(
      ref,
    )
  })
})
