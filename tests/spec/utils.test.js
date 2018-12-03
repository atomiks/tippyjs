import { h, hasTippy, cleanDocumentBody, IDENTIFIER } from '../utils'

import tippy from '../../src/js/index'
import Defaults from '../../src/js/defaults'
import Selectors from '../../src/js/selectors'
import * as Utils from '../../src/js/utils'

afterEach(cleanDocumentBody)

describe('isPlainObject', () => {
  it('returns true for a plain object', () => {
    expect(Utils.isPlainObject({})).toBe(true)
  })

  it('returns false for other object types', () => {
    expect(Utils.isPlainObject([])).toBe(false)
    expect(Utils.isPlainObject(function() {})).toBe(false)
    expect(Utils.isPlainObject(h('div')))
  })

  it('returns false for primitive values', () => {
    expect(Utils.isPlainObject('')).toBe(false)
    expect(Utils.isPlainObject(Symbol())).toBe(false)
    expect(Utils.isPlainObject(0)).toBe(false)
    expect(Utils.isPlainObject(undefined)).toBe(false)
    expect(Utils.isPlainObject(null)).toBe(false)
    expect(Utils.isPlainObject(true)).toBe(false)
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
    [...Array(10)].map(() => h())
    const allAreElements = Utils.getArrayOfElements(IDENTIFIER).every(
      value => value instanceof Element
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

  it('returns an array of length 1 if the value is a plain object', () => {
    const ref = {}
    const arr = Utils.getArrayOfElements(ref)
    expect(arr[0]).toBe(ref)
    expect(arr.length).toBe(1)
  })

  it('returns an array if given a NodeList', () => {
    const ref = h()
    const arr = Utils.getArrayOfElements(
      document.querySelectorAll(`.${IDENTIFIER}`)
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

describe('isNumeric', () => {
  it('returns true for a number', () => {
    expect(Utils.isNumeric(1)).toBe(true)
  })

  it('returns true for a number-like string', () => {
    expect(Utils.isNumeric('1')).toBe(true)
    expect(Utils.isNumeric('1e10')).toBe(true)
    expect(Utils.isNumeric('1287')).toBe(true)
    expect(Utils.isNumeric('-50')).toBe(true)
  })

  it('returns false for a non-number-like string', () => {
    expect(Utils.isNumeric('true')).toBe(false)
    expect(Utils.isNumeric('null')).toBe(false)
    expect(Utils.isNumeric('!0')).toBe(false)
    expect(Utils.isNumeric('[1, 0]')).toBe(false)
    expect(Utils.isNumeric('_')).toBe(false)
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
    expect(Utils.getValue([null, 5], 0, Defaults.duration[0])).toBe(
      Defaults.duration[0]
    )
    expect(Utils.getValue([5, null], 1, Defaults.duration[1])).toBe(
      Defaults.duration[1]
    )
    expect(Utils.getValue([null, 5], 0, Defaults.delay)).toBe(Defaults.delay)
    expect(Utils.getValue([5, null], 1, Defaults.delay)).toBe(Defaults.delay)
  })

  it('uses the default duration if the value is undefined', () => {
    expect(Utils.getValue([, 5], 0, Defaults.duration[0])).toBe(
      Defaults.duration[0]
    )
    expect(Utils.getValue([5], 1, Defaults.duration[1])).toBe(
      Defaults.duration[1]
    )
    expect(Utils.getValue([, 5], 0, Defaults.delay)).toBe(Defaults.delay)
    expect(Utils.getValue([5], 1, Defaults.delay)).toBe(Defaults.delay)
  })
})

describe('defer', () => {
  it('waits until call stack has cleared', done => {
    const fn = jest.fn()
    Utils.defer(fn)
    expect(fn.mock.calls.length).toBe(0)
    setTimeout(() => {
      expect(fn.mock.calls.length).toBe(1)
      done()
    }, 1)
  })
})

describe('debounce', () => {
  it('works as expected', done => {
    const fn = jest.fn()
    const debouncedFn = Utils.debounce(fn, 50)
    debouncedFn()
    expect(fn.mock.calls.length).toBe(0)
    setTimeout(() => {
      expect(fn.mock.calls.length).toBe(0)
      debouncedFn()
      setTimeout(() => {
        expect(fn.mock.calls.length).toBe(0)
        setTimeout(() => {
          expect(fn.mock.calls.length).toBe(1)
          done()
        }, 51)
      }, 20)
    }, 40)
  })
})

describe('focus', () => {
  it('focuses an element', () => {
    const el = document.createElement('button') // can receive focus
    Utils.focus(el)
    expect(el).toBe(document.activeElement)
  })
})
