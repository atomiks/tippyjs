import { h, IDENTIFIER, cleanDocumentBody } from '../utils'
import {
  arrayFrom,
  closest,
  closestCallback,
  matches,
} from '../../src/ponyfills'

afterEach(cleanDocumentBody)

describe('arrayFrom', () => {
  it('converts a NodeList to an array', () => {
    ;[...Array(10)].map(() => h())
    const arr = arrayFrom(document.querySelectorAll(IDENTIFIER))
    expect(Array.isArray(arr)).toBe(true)
  })
})

describe('matches', () => {
  it('works like Element.prototype.matches: default', () => {
    const ref = h('div', { class: 'test' })
    expect(matches.call(h('table'), 'table')).toBe(true)
    expect(matches.call(ref, '.test')).toBe(true)
  })
})

describe('closest', () => {
  it('works like Element.prototype.closest', () => {
    const ref = h('div', { class: 'parent' })
    const child = h('div', { class: 'child' })
    ref.appendChild(child)
    expect(closest(ref, '.parent')).toBe(ref)
    expect(closest(child, '.parent')).toBe(ref)
  })

  it('works when Element.prototype.closest is undefined', () => {
    const cache = Element.prototype.closest
    Element.prototype.closest = undefined
    const ref = h('div', { class: 'parent' })
    const child = h('div', { class: 'child' })
    ref.append(child)
    expect(closest(ref, '.parent')).toBe(ref)
    expect(closest(child, '.parent')).toBe(ref)
    Element.prototype.closest = cache
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
