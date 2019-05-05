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

  it('throws an error if invalid option(s) are supplied', () => {
    expect(() => {
      tippy(h(), {
        placement: 'top',
        _someInvalidOption: true,
      })
    }).toThrow()

    expect(() => {
      tippy(h(), {
        placement: 'top',
      })
    }).not.toThrow()
  })

  it('handles falsy reference', () => {
    tippy([null])
  })

  it('polyfills a plain object as the virtual positioning reference', () => {
    const ref = tippy({}).reference
    expect(ref.isVirtual).toBe(true)
    expect(ref.classList).toBeDefined()
    expect(ref.attributes).toBeDefined()
    expect(typeof ref.addEventListener).toBe('function')
    expect(typeof ref.removeEventListener).toBe('function')
    expect(typeof ref.setAttribute).toBe('function')
    expect(typeof ref.removeAttribute).toBe('function')
    expect(typeof ref.getAttribute).toBe('function')
    expect(typeof ref.hasAttribute).toBe('function')
    expect(typeof ref.classList.add).toBe('function')
    expect(typeof ref.classList.remove).toBe('function')
    expect(typeof ref.classList.contains).toBe('function')
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
