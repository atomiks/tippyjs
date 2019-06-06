import { h, hasTippy, cleanDocumentBody } from '../utils'
import { defaultProps } from '../../src/props'
import { POPPER_SELECTOR } from '../../src/constants'
import tippy, { autoInit } from '../../src'

jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('tippy', () => {
  it('returns the expected object', () => {
    expect(typeof tippy(h())).toBe('object')
    expect(Array.isArray(tippy([h(), h()]))).toBe(true)
  })

  it('merges the default props with the supplied props', () => {
    expect(
      tippy(h(), {
        placement: 'bottom-end',
      }).props,
    ).toEqual({
      ...defaultProps,
      placement: 'bottom-end',
    })
  })

  it('warns if invalid props(s) are supplied', () => {
    const spy = jest.spyOn(console, 'warn')
    tippy(h(), {
      placement: 'top',
      _someInvalidProp: true,
    })
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('handles falsy reference in an array', () => {
    tippy([null, false, 0, undefined])
  })

  it('throws if passed falsy Target type', () => {
    expect(() => tippy(null)).toThrow()
    expect(() => tippy(undefined)).toThrow()
    expect(() => tippy(false)).toThrow()
    expect(() => tippy(0)).toThrow()
    expect(() => tippy(NaN)).toThrow()
    expect(() => tippy('')).toThrow()
  })

  it('warns if passed a single content element for many different references', () => {
    const spy = jest.spyOn(console, 'warn')
    const targets = [h(), h()]
    tippy(targets, { content: document.createElement('div') })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] ' +
        '`tippy()` was passed a targets argument that will create more than ' +
        'one tippy instance, but only a single element was supplied as the ' +
        '`content` prop. This means the content will only be appended to the ' +
        'last tippy element of the list. Instead, use a function that ' +
        'returns a cloned version of the element instead, or pass the ' +
        '.innerHTML of the element.',
    )
    spy.mockRestore()
  })
})

describe('tippy.setDefaultProps()', () => {
  it('changes the default props applied to instances', () => {
    const newPlacement = 'bottom-end'
    tippy.setDefaultProps({ placement: newPlacement })
    expect(defaultProps.placement).toBe(newPlacement)
  })

  it('is validated', () => {
    const spy = jest.spyOn(console, 'warn')
    tippy.setDefaultProps({ showOnInit: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] ' +
        'The `showOnInit` prop was renamed to `showOnCreate` in v5.',
    )
    spy.mockRestore()
  })
})

describe('tippy.hideAll()', () => {
  it('hides all tippys on the document, ignoring `hideOnClick`', () => {
    const props = { showOnCreate: true, hideOnClick: false }
    const instances = [...Array(3)].map(() => tippy(h(), props))
    jest.runAllTimers()
    tippy.hideAll()
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(false)
    })
  })

  it('respects `duration` option', () => {
    const props = { showOnCreate: true, duration: 100 }
    const instances = [...Array(3)].map(() => tippy(h(), props))
    jest.runAllTimers()
    tippy.hideAll({ duration: 0 })
    instances.forEach(instance => {
      expect(instance.state.isMounted).toBe(false)
    })
  })

  it('respects `exclude` option', () => {
    const props = { showOnCreate: true }
    const instances = [...Array(3)].map(() => tippy(h(), props))
    jest.runAllTimers()
    tippy.hideAll({ exclude: instances[0] })
    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(
        instance === instances[0] ? true : false,
      )
    })
  })

  it('respects `exclude` option as type ReferenceElement for multiple tippys', () => {
    const props = { showOnCreate: true, multiple: true }
    const ref = h()
    tippy(ref, props)
    tippy(ref, props)
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
      '[tippy.js WARNING] `tippy.group()` was removed in v5 and replaced ' +
        'with `createSingleton()`. Read more here: ' +
        'https://atomiks.github.io/tippyjs/addons#singleton',
    )
    spy.mockRestore()
  })
})

describe('tippy.setDefaults()', () => {
  it('should warn', () => {
    const spy = jest.spyOn(console, 'warn')
    tippy.setDefaults({})
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy.setDefaults()` was renamed to ' +
        '`tippy.setDefaultProps()` in v5.',
    )
    spy.mockRestore()
  })
})

describe('tippy.defaults', () => {
  it('should warn', () => {
    const spy = jest.spyOn(console, 'warn')
    tippy.defaults
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `tippy.defaults` property was renamed to ' +
        '`tippy.defaultProps` in v5.',
    )
    spy.mockRestore()
  })
})
