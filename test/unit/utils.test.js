import { h, cleanDocumentBody, IDENTIFIER } from '../utils'
import { defaultProps } from '../../src/props'
import * as Utils from '../../src/utils'
import tippy from '../../src'

jest.useFakeTimers()

afterEach(cleanDocumentBody)

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

describe('div', () => {
  it('creates and returns a div element', () => {
    const d = Utils.div()
    expect(d.nodeName).toBe('DIV')
  })
})

describe('evaluateProps', () => {
  it('sets `arrow` prop to false if `animateFill` is true', () => {
    const props = { animateFill: true, arrow: true }
    expect(Utils.evaluateProps(h(), props)).toEqual({
      animateFill: true,
      arrow: false,
    })
  })

  it('sets `arrow` prop to false if `animateFill` is true (data attribute)', () => {
    const ref = h()
    ref.setAttribute('data-tippy-arrow', 'true')
    expect(Utils.evaluateProps(ref, { animateFill: true })).toEqual({
      arrow: false,
      animateFill: true,
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

describe('isReferenceElement', () => {
  it('correctly determines if a value is a reference element', () => {
    const instance = tippy(h())
    expect(Utils.isReferenceElement(document.createElement('div'))).toBe(false)
    expect(Utils.isReferenceElement(instance.reference)).toBe(true)
    expect(Utils.isReferenceElement(instance.popper)).toBe(false)
    instance.popper.classList.add('other')
    expect(Utils.isReferenceElement(instance.popper)).toBe(false)
  })
})

describe('preserveInvocation', () => {
  it('should invoke the first function if not the same as second', () => {
    const spy = jest.fn()
    Utils.preserveInvocation(spy, () => {}, ['test'])
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('test')
  })

  it('should not invoke the first function is the same as second', () => {
    const spy = jest.fn()
    Utils.preserveInvocation(spy, spy, ['test'])
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('removeProperties', () => {
  it('deletes unwanted properties', () => {
    expect(Utils.removeProperties({ a: 1, b: 2 }, ['b'])).toEqual({ a: 1 })
  })
})
