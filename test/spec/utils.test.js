import { h, cleanDocumentBody, IDENTIFIER } from '../utils'
import { defaultProps } from '../../src/props'
import * as Utils from '../../src/utils'

jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('isBareVirtualElement', () => {
  it('returns true for a plain object', () => {
    expect(Utils.isBareVirtualElement({})).toBe(true)
  })

  it('returns false for other object types', () => {
    expect(Utils.isBareVirtualElement([])).toBe(false)
    expect(Utils.isBareVirtualElement(function() {})).toBe(false)
    expect(Utils.isBareVirtualElement(h('div')))
  })

  it('returns false for primitive values', () => {
    expect(Utils.isBareVirtualElement('')).toBe(false)
    expect(Utils.isBareVirtualElement(Symbol())).toBe(false)
    expect(Utils.isBareVirtualElement(0)).toBe(false)
    expect(Utils.isBareVirtualElement(undefined)).toBe(false)
    expect(Utils.isBareVirtualElement(null)).toBe(false)
    expect(Utils.isBareVirtualElement(true)).toBe(false)
  })
})

describe('getArrayOfElements', () => {
  it('returns an empty array with no arguments', () => {
    expect(Array.isArray(Utils.getArrayOfElements())).toBe(true)
  })

  it('returns the same array if given an array', () => {
    const arr = []
    expect(Utils.getArrayOfElements(arr)).toBe(arr)
  })

  it('returns an array of elements when given a valid selector string', () => {
    ;[...Array(10)].map(() => h())
    const allAreElements = Utils.getArrayOfElements(IDENTIFIER).every(
      value => value instanceof Element,
    )
    expect(allAreElements).toBe(true)
  })

  it('returns an empty array when given an invalid selector string', () => {
    const arr = Utils.getArrayOfElements('😎')
    expect(Array.isArray(arr)).toBe(true)
    expect(arr.length).toBe(0)
  })

  it('returns an array of length 1 if the value is a DOM element', () => {
    const ref = h()
    const arr = Utils.getArrayOfElements(ref)
    expect(arr[0]).toBe(ref)
    expect(arr.length).toBe(1)
  })

  it('returns an array of length 1 if the value is a polyfilled virtual element', () => {
    const ref = { isVirtual: true }
    const arr = Utils.getArrayOfElements(ref)
    expect(arr[0]).toBe(ref)
    expect(arr.length).toBe(1)
  })

  it('returns an array if given a NodeList', () => {
    const ref = h()
    const arr = Utils.getArrayOfElements(
      document.querySelectorAll(`.${IDENTIFIER}`),
    )
    expect(arr[0]).toBe(ref)
    expect(Array.isArray(arr)).toBe(true)
  })

  it('returns an empty array for an invalid selector', () => {
    const arr = Utils.getArrayOfElements('+')
    expect(Array.isArray(arr)).toBe(true)
    expect(arr.length).toBe(0)
  })
})

describe('hasOwnProperty', () => {
  it('works for plain objects', () => {
    expect(Utils.hasOwnProperty({ prop: true }, 'prop')).toBe(true)
    expect(Utils.hasOwnProperty({}, 'toString')).toBe(false)
  })

  it('works for prototypeless objects', () => {
    const o = Object.create(null)
    o.prop = true
    expect(Utils.hasOwnProperty(o, 'prop')).toBe(true)
  })
})

describe('getValue', () => {
  it('returns the value if not an array', () => {
    expect(Utils.getValue('unique', 0)).toBe('unique')
    expect(Utils.getValue('unique', 1)).toBe('unique')
    expect(Utils.getValue(true, 1)).toBe(true)
  })

  it('returns the value at the specified index if an array', () => {
    expect(Utils.getValue([-100, -200], 0)).toBe(-100)
    expect(Utils.getValue([-100, -200], 1)).toBe(-200)
    expect(Utils.getValue(['x', 'y'], 0)).toBe('x')
    expect(Utils.getValue(['x', 'y'], 1)).toBe('y')
  })

  it('uses the default duration if the value is null', () => {
    expect(Utils.getValue([null, 5], 0, defaultProps.duration[0])).toBe(
      defaultProps.duration[0],
    )
    expect(Utils.getValue([5, null], 1, defaultProps.duration[1])).toBe(
      defaultProps.duration[1],
    )
    expect(Utils.getValue([null, 5], 0, defaultProps.delay)).toBe(
      defaultProps.delay,
    )
    expect(Utils.getValue([5, null], 1, defaultProps.delay)).toBe(
      defaultProps.delay,
    )
  })

  it('uses the default duration if the value is undefined', () => {
    expect(Utils.getValue([undefined, 5], 0, defaultProps.duration[0])).toBe(
      defaultProps.duration[0],
    )
    expect(Utils.getValue([5, undefined], 1, defaultProps.duration[1])).toBe(
      defaultProps.duration[1],
    )
    expect(Utils.getValue([undefined, 5], 0, defaultProps.delay)).toBe(
      defaultProps.delay,
    )
    expect(Utils.getValue([5, undefined], 1, defaultProps.delay)).toBe(
      defaultProps.delay,
    )
  })
})

describe('debounce', () => {
  it('works as expected', () => {
    const fn = jest.fn()
    const debouncedFn = Utils.debounce(fn, 50)
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(40)
    expect(fn).toHaveBeenCalledTimes(0)
    debouncedFn()
    jest.advanceTimersByTime(40)
    expect(fn).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(10)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('is called with arguments', () => {
    const fn = jest.fn()
    const ms = 50
    const debouncedFn = Utils.debounce(fn, ms)
    debouncedFn('string')
    jest.advanceTimersByTime(ms)
    expect(fn).toHaveBeenCalledWith('string')
  })

  it('does not wrap with new function if ms = 0', () => {
    const fn = jest.fn()
    const debouncedFn = Utils.debounce(fn, 0)
    expect(debouncedFn).toBe(fn)
  })
})

describe('getModifier', () => {
  it('returns an object nested in `modifiers` object without errors', () => {
    expect(Utils.getModifier({}, 'flip')).toBe(undefined)
    expect(Utils.getModifier({ modifiers: {} }, 'flip')).toBe(undefined)
    expect(
      Utils.getModifier(
        {
          modifiers: {
            flip: {
              enabled: true,
            },
          },
        },
        'flip',
      ),
    ).toEqual({ enabled: true })
  })
})

describe('includes', () => {
  it('includes(string, string)', () => {
    expect(Utils.includes('test', 'es')).toBe(true)
    expect(Utils.includes('$128', '$12')).toBe(true)
    expect(Utils.includes('test', 'tesst')).toBe(false)
    expect(Utils.includes('$128', '$$')).toBe(false)
  })

  it('includes(Array, string)', () => {
    expect(Utils.includes(['test', 'other'], 'other')).toBe(true)
    expect(Utils.includes(['test', 'other'], 'test')).toBe(true)
    expect(Utils.includes(['test', 'other'], 'othr')).toBe(false)
    expect(Utils.includes(['test', 'other'], 'tst')).toBe(false)
  })
})

describe('setFlipModifierEnabled', () => {
  it('sets it correctly', () => {
    const modifiers = [{ name: 'x' }, { name: 'flip', enabled: true }]
    Utils.setFlipModifierEnabled(modifiers, false)
    expect(modifiers[1].enabled).toBe(false)
    Utils.setFlipModifierEnabled(modifiers, true)
    expect(modifiers[1].enabled).toBe(true)
  })
})

describe('canReceiveFocus', () => {
  it('returns true for a[href]', () => {
    const a = h('a')
    a.href = '#'
    expect(Utils.canReceiveFocus(a)).toBe(true)
  })

  it('returns true for area[href]', () => {
    const area = h('area')
    area.href = '#'
    expect(Utils.canReceiveFocus(area)).toBe(true)
  })

  it('returns true for input', () => {
    const input = h('input')
    expect(Utils.canReceiveFocus(input)).toBe(true)
  })

  it('returns true for textarea', () => {
    const textarea = h('textarea')
    expect(Utils.canReceiveFocus(textarea)).toBe(true)
  })

  it('returns true for select', () => {
    const select = h('select')
    expect(Utils.canReceiveFocus(select)).toBe(true)
  })

  it('returns true for iframe', () => {
    const iframe = h('iframe')
    expect(Utils.canReceiveFocus(iframe)).toBe(true)
  })

  it('returns true for [tabindex]', () => {
    const div = h('div')
    div.tabIndex = '0'
    expect(Utils.canReceiveFocus(div)).toBe(true)
  })

  it('returns false for [disabled]', () => {
    const ref = h('div')
    ref.setAttribute('disabled', 'disabled')
    expect(Utils.canReceiveFocus(ref)).toBe(false)
  })

  it('returns false for other elements', () => {
    const other = h('span')
    expect(Utils.canReceiveFocus(other)).toBe(false)
  })

  it('does not throw an error if given a virtual reference', () => {
    const ref = {}
    expect(Utils.canReceiveFocus(ref)).toBe(true)
  })
})

describe('div', () => {
  it('creates and returns a div element', () => {
    const d = Utils.div()
    expect(d.nodeName).toBe('DIV')
  })
})

describe('evaluateProps', () => {
  it('sets `animateFill` option to false if `arrow` is true', () => {
    const props = { animateFill: true, arrow: true }
    expect(Utils.evaluateProps(h(), props)).toEqual({
      animateFill: false,
      arrow: true,
    })
  })

  it('sets `animateFill` option to false if `arrow` is true (data attribute)', () => {
    const ref = h()
    ref.setAttribute('data-tippy-arrow', 'true')
    expect(Utils.evaluateProps(ref, { animateFill: true })).toEqual({
      arrow: true,
      animateFill: false,
    })
  })

  it('ignores attributes if `ignoreAttributes: true`', () => {
    const props = { animation: 'scale', ignoreAttributes: true }
    const reference = h()
    reference.setAttribute('data-tippy-animation', 'fade')
    expect(Utils.evaluateProps(reference, props)).toEqual({
      animation: 'scale',
      ignoreAttributes: true,
    })
  })

  it('does not ignore attributes if `ignoreAttributes: false`', () => {
    const props = { animation: 'scale', ignoreAttributes: false }
    const reference = h()
    reference.setAttribute('data-tippy-animation', 'fade')
    expect(Utils.evaluateProps(reference, props)).toEqual({
      animation: 'fade',
      ignoreAttributes: false,
    })
  })
})

describe('validateOptions', () => {
  it('does nothing if valid options were passed', () => {
    expect(() =>
      Utils.validateOptions(
        { arrow: true, arrowType: 'round' },
        { arrow: false, arrowType: 'sharp' },
      ),
    ).not.toThrow()
  })

  it('throws with the correct message if invalid options were passed', () => {
    expect(() =>
      Utils.validateOptions({ intractive: true }, { interactive: false }),
    ).toThrow('[tippy]: `intractive` is not a valid option')
  })
})

describe('setTransitionDuration', () => {
  it('sets the `transition-duration` property on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()]
    Utils.setTransitionDuration(els, 1298)
    expect(els[0].style.transitionDuration).toBe('1298ms')
    expect(els[1].style.transitionDuration).toBe('1298ms')
    expect(els[3].style.transitionDuration).toBe('1298ms')
  })
})

describe('setVisibilityState', () => {
  it('sets the `data-state` attribute on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()]
    Utils.setVisibilityState(els, 'visible')
    expect(els[0].getAttribute('data-state')).toBe('visible')
    expect(els[1].getAttribute('data-state')).toBe('visible')
    expect(els[3].getAttribute('data-state')).toBe('visible')
    Utils.setVisibilityState(els, 'hidden')
    expect(els[0].getAttribute('data-state')).toBe('hidden')
    expect(els[1].getAttribute('data-state')).toBe('hidden')
    expect(els[3].getAttribute('data-state')).toBe('hidden')
  })
})
