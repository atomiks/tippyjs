import { h, hasTippy, cleanDocumentBody } from '../utils'
import { defaultProps } from '../../src/props'
import { POPPER_SELECTOR } from '../../src/constants'
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

  it('returns null if passed a falsy Target type', () => {
    expect(tippy(null)).toBe(null)
    expect(tippy(undefined)).toBe(null)
    expect(tippy(false)).toBe(null)
    expect(tippy(0)).toBe(null)
    expect(tippy('')).toBe(null)
  })
})

describe('tippy.setDefaults()', () => {
  it('changes the default props applied to instances', () => {
    const newPlacement = 'bottom-end'
    tippy.setDefaults({ placement: newPlacement })
    expect(defaultProps.placement).toBe(newPlacement)
  })
})

describe('tippy.hideAll()', () => {
  it('hides all tippys on the document, ignoring `hideOnClick`', () => {
    const options = { showOnInit: true, hideOnClick: false }
    const instances = [...Array(3)].map(() => tippy(h(), options))
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(true)
    })
    tippy.hideAll()
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(false)
    })
  })

  it('respects `duration` option', () => {
    const options = { showOnInit: true, duration: 100 }
    const instances = [...Array(3)].map(() => tippy(h(), options))
    tippy.hideAll({ duration: 0 })
    instances.forEach(instance => {
      expect(instance.state.isMounted).toBe(false)
    })
  })

  it('respects `exclude` option', () => {
    const options = { showOnInit: true }
    const instances = [...Array(3)].map(() => tippy(h(), options))
    tippy.hideAll({ exclude: instances[0] })
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(
        instance === instances[0] ? true : false,
      )
    })
  })

  it('respects `exclude` option as type ReferenceElement for multiple tippys', () => {
    const options = { showOnInit: true, multiple: true }
    const ref = h()
    tippy(ref, options)
    tippy(ref, options)
    tippy.hideAll({ exclude: ref })
    const instances = [...document.querySelectorAll(POPPER_SELECTOR)].map(
      popper => popper._tippy,
    )
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(true)
    })
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

describe('tippy.group()', () => {
  it('should warn', () => {
    const spy = jest.spyOn(console, 'warn')
    tippy.group()
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy.group()` was removed in v5 and replaced by ' +
        '`singleton()`. Read more: ' +
        'https://atomiks.github.io/tippyjs/singleton/',
    )
  })
})
