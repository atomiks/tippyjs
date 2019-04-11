import { h, cleanDocumentBody } from '../utils'
import {
  getDataAttributeOptions,
  polyfillElementPrototypeProperties,
} from '../../src/reference'

afterEach(cleanDocumentBody)

describe('getDataAttributeOptions', () => {
  it('uses data-tippy-content', () => {
    const ref = h()
    ref.setAttribute('data-tippy-content', 'test')
    expect(getDataAttributeOptions(ref).content).toBe('test')
  })

  it('does not parse data-tippy-content', () => {
    const ref = h()
    ref.setAttribute('data-tippy-content', '[Hello')
    expect(getDataAttributeOptions(ref).content).toBe('[Hello')
    ref.setAttribute('data-tippy-content', '3333333333333333333333333')
    expect(getDataAttributeOptions(ref).content).toBe(
      '3333333333333333333333333',
    )
  })

  it('returns the attribute options', () => {
    const ref = h()
    ref.setAttribute('data-tippy-arrowType', 'round')
    expect(getDataAttributeOptions(ref)).toEqual({
      arrowType: 'round',
    })
  })

  it('correctly parses true & false strings', () => {
    const ref = h()
    ref.setAttribute('data-tippy-interactive', 'true')
    ref.setAttribute('data-tippy-animateFill', 'false')

    expect(getDataAttributeOptions(ref)).toEqual({
      interactive: true,
      animateFill: false,
    })
  })

  it('correctly parses number strings', () => {
    const ref = h()
    ref.setAttribute('data-tippy-delay', '129')
    ref.setAttribute('data-tippy-duration', '111')

    expect(getDataAttributeOptions(ref)).toEqual({
      delay: 129,
      duration: 111,
    })
  })

  it('correctly parses JSON-serializable props', () => {
    const ref = h()
    ref.setAttribute('data-tippy-delay', '[100, 255]')
    ref.setAttribute('data-tippy-duration', '[0, 999]')
    ref.setAttribute('data-tippy-popperOptions', '{ "placement": "right" }')

    expect(getDataAttributeOptions(ref)).toEqual({
      delay: [100, 255],
      duration: [0, 999],
      popperOptions: { placement: 'right' },
    })
  })

  it('does not break if content begins with [ or {', () => {
    const ref = h()
    ref.setAttribute('data-tippy-content', '[')
    expect(() => getDataAttributeOptions(ref)).not.toThrow()
    ref.setAttribute('data-tippy-content', '{')
    expect(() => getDataAttributeOptions(ref)).not.toThrow()
  })
})

describe('polyfillElementPrototypeProperties', () => {
  it('polyfills all needed props/methods', () => {
    const ref = {}
    polyfillElementPrototypeProperties(ref)
    ref.removeEventListener()
    ref.addEventListener()
    ref.getAttribute()
    ref.removeAttribute()
    ref.setAttribute()
    ref.hasAttribute()
    ref.classList.add()
    ref.classList.remove()
    ref.classList.contains()
  })
})
