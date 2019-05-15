import { h, hasTippy, cleanDocumentBody } from '../utils'
import { defaultProps } from '../../src/props'
import tippy, { autoInit } from '../../src'

afterEach(cleanDocumentBody)

describe('tippy', () => {
  it('can be called with no arguments without throwing errors', () => {
    tippy()
  })

  it('returns the expected object', () => {
    expect(typeof tippy(h())).toBe('object')
    expect(Array.isArray(tippy([h(), h()]))).toBe(true)
  })

  it('merges the default props with the supplied options', () => {
    expect(
      tippy(h(), {
        placement: 'bottom-end',
      }).props,
    ).toEqual({
      ...defaultProps,
      placement: 'bottom-end',
    })
  })

  it('warns if invalid option(s) are supplied', () => {
    const spy = jest.spyOn(console, 'warn')
    tippy(h(), {
      placement: 'top',
      _someInvalidOption: true,
    })
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('handles falsy reference', () => {
    tippy([null])
  })
})

describe('tippy.setDefaults()', () => {
  it('changes the default props applied to instances', () => {
    const newPlacement = 'bottom-end'
    tippy.setDefaults({ placement: newPlacement })
    expect(defaultProps.placement).toBe(newPlacement)
  })
})

describe('auto-init', () => {
  it('adds a tooltip if "data-tippy" attribute is truthy', () => {
    const reference = document.createElement('div')
    reference.setAttribute('data-tippy', 'tooltip')
    document.body.append(reference)
    autoInit()
    expect(hasTippy(reference)).toBe(true)
  })

  it('does not add tooltip if "data-tippy" attribute is falsy', () => {
    const reference = document.createElement('div')
    reference.setAttribute('data-tippy', '')
    document.body.append(reference)
    autoInit()
    expect(hasTippy(reference)).toBe(false)
  })
})
