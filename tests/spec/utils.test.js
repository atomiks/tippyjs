import { h, hasTippy, cleanDocumentBody, IDENTIFIER } from '../utils'

import tippy from '../../src/js/tippy'
import { Selectors } from '../../src/js/selectors'
import { Defaults } from '../../src/js/defaults'
import * as Utils from '../../src/js/utils'

afterEach(cleanDocumentBody)

/**
 * There are 3 types of utils:
 * Pure + sync: easiest to test
 * Impure + sync: easy to test
 * Async: hard to test
 */

/** ==================== ✅ Pure sync functions ✅ ==================== **/
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

describe('toArray', () => {
  it('converts a NodeList to an array', () => {
    [...Array(10)].map(() => h())
    const arr = Utils.toArray(document.querySelectorAll(IDENTIFIER))
    expect(Array.isArray(arr)).toBe(true)
  })
})

describe('div', () => {
  it('creates and returns a div element', () => {
    const div = Utils.div()
    expect(div.nodeName).toBe('DIV')
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

describe('elementCanReceiveFocus', () => {
  it('returns true for a[href]', () => {
    const a = h('a')
    a.href = '#'
    expect(Utils.elementCanReceiveFocus(a)).toBe(true)
  })

  it('returns true for area[href]', () => {
    const area = h('area')
    area.href = '#'
    expect(Utils.elementCanReceiveFocus(area)).toBe(true)
  })

  it('returns true for input', () => {
    const input = h('input')
    expect(Utils.elementCanReceiveFocus(input)).toBe(true)
  })

  it('returns true for textarea', () => {
    const textarea = h('textarea')
    expect(Utils.elementCanReceiveFocus(textarea)).toBe(true)
  })

  it('returns true for select', () => {
    const select = h('select')
    expect(Utils.elementCanReceiveFocus(select)).toBe(true)
  })

  it('returns true for iframe', () => {
    const iframe = h('iframe')
    expect(Utils.elementCanReceiveFocus(iframe)).toBe(true)
  })

  it('returns true for [tabindex]', () => {
    const div = h('div')
    div.tabIndex = '0'
    expect(Utils.elementCanReceiveFocus(div)).toBe(true)
  })

  it('returns false for [disabled]', () => {
    const ref = h('div')
    ref.setAttribute('disabled', 'disabled')
    expect(Utils.elementCanReceiveFocus(ref)).toBe(false)
  })

  it('returns false for other elements', () => {
    const other = h('span')
    expect(Utils.elementCanReceiveFocus(other)).toBe(false)
  })

  it('does not throw an error if given a virtual reference', () => {
    const ref = {}
    expect(Utils.elementCanReceiveFocus(ref)).toBe(true)
  })
})

describe('getChildren', () => {
  // NOTE: Utils.createPopperElement() dependency

  it('returns the children of the popper element, default props', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    const children = Utils.getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.backdrop).toBeDefined()
  })

  it('returns the children of the popper element, with arrow', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    const children = Utils.getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.arrow).toBeDefined()
  })

  it('returns the children of the popper element, with round arrow', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      arrow: true,
      arrowType: 'round'
    })
    const children = Utils.getChildren(popper)
    expect(children.tooltip).toBeDefined()
    expect(children.content).toBeDefined()
    expect(children.arrow).toBeDefined()
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

describe('getDataAttributeOptions', () => {
  it('uses data-tippy-content', () => {
    const ref = h()
    ref.setAttribute('data-tippy-content', 'test')
    expect(Utils.getDataAttributeOptions(ref).content).toBe('test')
  })

  it('does not parse data-tippy-content', () => {
    const ref = h()
    ref.setAttribute('data-tippy-content', '[Hello')
    expect(Utils.getDataAttributeOptions(ref).content).toBe('[Hello')
    ref.setAttribute('data-tippy-content', '3333333333333333333333333')
    expect(Utils.getDataAttributeOptions(ref).content).toBe(
      '3333333333333333333333333'
    )
  })

  it('returns the attribute options', () => {
    const ref = h()
    ref.setAttribute('data-tippy-arrowType', 'round')
    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      arrowType: 'round'
    })
  })

  it('correctly parses true & false strings', () => {
    const ref = h()
    ref.setAttribute('data-tippy-interactive', 'true')
    ref.setAttribute('data-tippy-animateFill', 'false')

    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      interactive: true,
      animateFill: false
    })
  })

  it('correctly parses number strings', () => {
    const ref = h()
    ref.setAttribute('data-tippy-delay', '129')
    ref.setAttribute('data-tippy-duration', '111')

    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      delay: 129,
      duration: 111
    })
  })

  it('correctly parses JSON-serializable props', () => {
    const ref = h()
    ref.setAttribute('data-tippy-delay', '[100, 255]')
    ref.setAttribute('data-tippy-duration', '[0, 999]')
    ref.setAttribute('data-tippy-popperOptions', '{ "placement": "right" }')

    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      delay: [100, 255],
      duration: [0, 999],
      popperOptions: { placement: 'right' }
    })
  })

  it('does not break if content begins with [ or {', () => {
    const ref = h()
    ref.setAttribute('data-tippy-content', '[')
    expect(() => Utils.getDataAttributeOptions(ref)).not.toThrow()
    ref.setAttribute('data-tippy-content', '{')
    expect(() => Utils.getDataAttributeOptions(ref)).not.toThrow()
  })
})

describe('validateOptions', () => {
  it('does nothing if valid options were passed', () => {
    expect(() =>
      Utils.validateOptions(
        { arrow: true, arrowType: 'round' },
        { arrow: false, arrowType: 'sharp' }
      )
    ).not.toThrow()
  })

  it('throws with the correct message if invalid options were passed', () => {
    expect(() =>
      Utils.validateOptions({ intractive: true }, { interactive: false })
    ).toThrow('[tippy]: `intractive` is not a valid option')
  })
})

describe('polyfillVirtualReferenceProps', () => {
  it('polyfills all needed props/methods', () => {
    const ref = {
      attributes: { title: 'tooltip' }
    }
    const polyfilledRef = Utils.polyfillVirtualReferenceProps(ref)
    polyfilledRef.removeEventListener()
    polyfilledRef.addEventListener()
    polyfilledRef.getAttribute()
    polyfilledRef.removeAttribute()
    polyfilledRef.setAttribute()
    polyfilledRef.hasAttribute()
    polyfilledRef.classList.add()
    polyfilledRef.classList.remove()
    polyfilledRef.classList.contains()
  })
})

describe('matches', () => {
  it('works like Element.prototype.matches: default', () => {
    const ref = h('div', { class: 'test' })
    expect(Utils.matches.call(h('table'), 'table')).toBe(true)
    expect(Utils.matches.call(ref, '.test')).toBe(true)
  })
})

describe('closest', () => {
  it('works like Element.prototype.closest', () => {
    const ref = h('div', { class: 'parent' })
    const child = h('div', { class: 'child' })
    ref.appendChild(child)
    expect(Utils.closest(ref, '.parent')).toBe(ref)
    expect(Utils.closest(child, '.parent')).toBe(ref)
  })

  it('works when Element.prototype.closest is undefined', () => {
    const cache = Element.prototype.closest
    Element.prototype.closest = undefined
    const ref = h('div', { class: 'parent' })
    const child = h('div', { class: 'child' })
    ref.append(child)
    expect(Utils.closest(ref, '.parent')).toBe(ref)
    expect(Utils.closest(child, '.parent')).toBe(ref)
    Element.prototype.closest = cache
  })
})

describe('closestCallback', () => {
  it('works like Element.prototype.closest but uses a callback instead', () => {
    const ref = h('div', { class: 'parent' })
    const child = h('div', { class: 'child' })
    ref.append(child)
    expect(
      Utils.closestCallback(ref, node => node.className === 'parent')
    ).toBe(ref)
    expect(
      Utils.closestCallback(child, node => node.className === 'parent')
    ).toBe(ref)
  })
})

describe('createArrowElement', () => {
  it('returns a sharp arrow by default', () => {
    const arrow = Utils.createArrowElement()
    expect(arrow.matches(Selectors.ARROW)).toBe(true)
  })

  it('returns a round arrow if "round" is passed as argument', () => {
    const roundArrow = Utils.createArrowElement('round')
    expect(roundArrow.matches(Selectors.ROUND_ARROW)).toBe(true)
  })
})

describe('createBackdropElement', () => {
  it('returns a backdrop element', () => {
    const arrow = Utils.createBackdropElement()
    expect(arrow.matches(Selectors.BACKDROP)).toBe(true)
    expect(arrow.getAttribute('data-state')).toBe('hidden')
  })
})

describe('createPopperElement', () => {
  // NOTE: Selectors dependency here
  it('returns an element', () => {
    expect(Utils.createPopperElement(1, Defaults) instanceof Element).toBe(true)
  })

  it('always creates a tooltip element child', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    expect(Utils.getChildren(popper).tooltip).not.toBe(null)
  })

  it('sets the `id` property correctly', () => {
    const id = 1829
    const popper = Utils.createPopperElement(id, Defaults)
    expect(popper.id).toBe(`tippy-${id}`)
  })

  it('sets the `role` attribute correctly', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    expect(popper.getAttribute('role')).toBe('tooltip')
  })

  it('sets the className property correctly', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    expect(popper.matches(Selectors.POPPER)).toBe(true)
  })

  it('does not create an arrow element if props.arrow is false', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: false })
    expect(popper.querySelector(Selectors.ARROW)).toBe(null)
  })

  it('creates an arrow element if props.arrow is true', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    expect(popper.querySelector(Selectors.ARROW)).not.toBe(null)
  })

  it('does not create a backdrop element if props.animateFill is false', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      animateFill: false
    })
    expect(popper.querySelector(Selectors.BACKDROP)).toBe(null)
  })

  it('sets `[data-animatefill]` on the tooltip element if props.animateFill is true', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      animateFill: true
    })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(true)
  })

  it('sets `[data-interactive]` on the tooltip if props.interactive is true', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      interactive: true
    })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-interactive')
    ).toBe(true)
  })

  it('sets the correct data-* attributes on the tooltip based on props', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      size: 'large',
      animation: 'scale'
    })
    expect(Utils.getChildren(popper).tooltip.getAttribute('data-size')).toBe(
      'large'
    )
    expect(
      Utils.getChildren(popper).tooltip.getAttribute('data-animation')
    ).toBe('scale')
  })

  it('sets the correct theme class names on the tooltip based on props', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      theme: 'red firetruck'
    })
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('red-theme')
    ).toBe(true)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('firetruck-theme')
    ).toBe(true)
  })

  it('adds a `focusout` listener to hide the popper when the relatedTarget is outside', () => {
    const randEl = document.createElement('button')
    document.body.append(randEl)
    const instance = tippy.one(h())
    instance.show(0)
    expect(instance.state.isVisible).toBe(true)
    instance.popper.dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: randEl })
    )
    expect(instance.state.isVisible).toBe(false)
  })
})

describe('transformAxisBasedOnPlacement', () => {
  it('uses the original axis if the placement is vertical', () => {
    const isVertical = true
    expect(Utils.transformAxisBasedOnPlacement('X', isVertical)).toBe('X')
    expect(Utils.transformAxisBasedOnPlacement('Y', isVertical)).toBe('Y')
  })

  it('uses the opposite axis if the placement is not vertical', () => {
    const isVertical = false
    expect(Utils.transformAxisBasedOnPlacement('X', isVertical)).toBe('Y')
    expect(Utils.transformAxisBasedOnPlacement('Y', isVertical)).toBe('X')
  })

  it('returns an empty string for no arguments', () => {
    expect(Utils.transformAxisBasedOnPlacement()).toBe('')
  })
})

describe('transformNumbersBasedOnPlacement', () => {
  const fn = Utils.transformNumbersBasedOnPlacement
  const TOP = [true, false]
  const BOTTOM = [true, true]
  const LEFT = [false, false]
  const RIGHT = [false, true]

  describe('translate', () => {
    // multi axis
    it('multi axis: placement = top', () => {
      expect(fn('translate', [9, 3], ...TOP)).toEqual('9px, 3px')
    })

    it('multi axis: placement = bottom', () => {
      expect(fn('translate', [9, 3], ...BOTTOM)).toEqual('9px, -3px')
    })

    it('multi axis: placement = left', () => {
      expect(fn('translate', [9, 3], ...LEFT)).toEqual('3px, 9px')
    })

    it('multi axis: placement = right', () => {
      expect(fn('translate', [9, 3], ...RIGHT)).toEqual('-3px, 9px')
    })

    // single axis
    it('single axis: placement = top', () => {
      expect(fn('translate', [9], ...TOP)).toEqual('9px')
    })

    it('single axis: placement = bottom', () => {
      expect(fn('translate', [9], ...BOTTOM)).toEqual('-9px')
    })

    it('single axis: placement = left', () => {
      expect(fn('translate', [9], ...LEFT)).toEqual('9px')
    })

    it('single axis: placement = right', () => {
      expect(fn('translate', [9], ...RIGHT)).toEqual('-9px')
    })
  })

  describe('scale', () => {
    // multi axis
    it('multi axis: placement = top', () => {
      expect(fn('scale', [9, 3], ...TOP)).toEqual('9, 3')
    })

    it('multi axis: placement = bottom', () => {
      expect(fn('scale', [9, 3], ...BOTTOM)).toEqual('9, 3')
    })

    it('multi axis: placement = left', () => {
      expect(fn('scale', [9, 3], ...LEFT)).toEqual('3, 9')
    })

    it('multi axis: placement = right', () => {
      expect(fn('scale', [9, 3], ...RIGHT)).toEqual('3, 9')
    })

    // single axis
    it('single axis: placement = top', () => {
      expect(fn('scale', [9], ...TOP)).toEqual('9')
    })

    it('single axis: placement = bottom', () => {
      expect(fn('scale', [9], ...BOTTOM)).toEqual('9')
    })

    it('single axis: placement = left', () => {
      expect(fn('scale', [9], ...LEFT)).toEqual('9')
    })

    it('single axis: placement = right', () => {
      expect(fn('scale', [9], ...RIGHT)).toEqual('9')
    })
  })
})

describe('getTransformAxis', () => {
  const fn = Utils.getTransformAxis

  it('returns the X axis correctly for translate', () => {
    expect(fn('translateX(2px)', 'translate')).toBe('X')
    expect(fn('translateX(2px) scaleY(5)', 'translate')).toBe('X')
    expect(fn('scaleY(5) translateX(2px)', 'translate')).toBe('X')
  })

  it('returns the X axis correctly for scale', () => {
    expect(fn('scaleX(2)', 'scale')).toBe('X')
    expect(fn('scaleX(2) translateY(2px)', 'scale')).toBe('X')
    expect(fn('translateY(2px) scaleX(2)', 'scale')).toBe('X')
  })

  it('returns the Y axis correctly for translate', () => {
    expect(fn('translateY(2px)', 'translate')).toBe('Y')
    expect(fn('scaleX(2) translateY(2px)', 'translate')).toBe('Y')
    expect(fn('translateY(2px) scaleX(2)', 'translate')).toBe('Y')
  })

  it('returns the Y axis correctly for scale', () => {
    expect(fn('scaleY(2)', 'scale')).toBe('Y')
    expect(fn('translateX(2px) scaleY(2)', 'scale')).toBe('Y')
    expect(fn('scaleY(2) translateX(2px)', 'scale')).toBe('Y')
  })
})

describe('getTransformNumbers', () => {
  const fn = Utils.getTransformNumbers
  const RE = Utils.TRANSFORM_NUMBER_RE

  it('returns the correct numbers for translate: single axis (X)', () => {
    expect(fn('translateX(-5px)', RE.translate)).toEqual([-5])
  })

  it('returns the correct numbers for translate: single axis (Y)', () => {
    expect(fn('translateY(84px)', RE.translate)).toEqual([84])
  })

  it('returns the correct numbers for translate: multi axis', () => {
    expect(fn('translate(24px, 82px)', RE.translate)).toEqual([24, 82])
  })

  it('returns the correct numbers for scale: single axis (X)', () => {
    expect(fn('scaleX(-2)', RE.scale)).toEqual([-2])
  })

  it('returns the correct numbers for scale: single axis (Y)', () => {
    expect(fn('scaleY(3)', RE.scale)).toEqual([3])
  })

  it('returns the correct numbers for scale: multi axis', () => {
    expect(fn('scale(2, 5)', RE.scale)).toEqual([2, 5])
  })
})

describe('getOffsetDistanceInPx', () => {
  const DISTANCE_IN_CSS = 10

  it('returns 0px by default', () => {
    expect(
      Utils.getOffsetDistanceInPx(Defaults.distance, DISTANCE_IN_CSS)
    ).toBe('0px')
  })

  it('returns -10px if the distance is 20', () => {
    expect(Utils.getOffsetDistanceInPx(20, DISTANCE_IN_CSS)).toBe('-10px')
  })

  it('returns 5px if the distance is 5', () => {
    expect(Utils.getOffsetDistanceInPx(5, DISTANCE_IN_CSS)).toBe('5px')
  })

  it('returns 18px if the distance is -8', () => {
    expect(Utils.getOffsetDistanceInPx(-8, DISTANCE_IN_CSS)).toBe('18px')
  })
})

describe('getPopperPlacement', () => {
  it('returns the base value without shifting', () => {
    const allPlacements = ['top', 'bottom', 'left', 'right'].reduce(
      (acc, basePlacement) => [
        ...acc,
        `${basePlacement}-start`,
        `${basePlacement}-end`
      ]
    )

    allPlacements.forEach(placement => {
      const popper = h('div')
      popper.setAttribute('x-placement', placement)
      expect(Utils.getPopperPlacement(popper).endsWith('-start')).toBe(false)
      expect(Utils.getPopperPlacement(popper).endsWith('-end')).toBe(false)
    })
  })

  it('returns an empty string if there is no placement', () => {
    const popper = h('div')
    expect(Utils.getPopperPlacement(popper)).toBe('')
  })
})

describe('evaluateProps', () => {
  it('sets `animateFill` option to false if `arrow` is true', () => {
    const props = { animateFill: true, arrow: true }
    expect(Utils.evaluateProps(h(), props)).toEqual({
      animateFill: false,
      arrow: true
    })
  })

  it('sets `props.appendTo` to be the return value of calling it if a function', () => {
    const ref = h()
    const props = {
      appendTo: reference => reference
    }
    expect(Utils.evaluateProps(ref, props).appendTo).toBe(ref)
  })

  it('sets `props.content` to be the return value of calling it if a function', () => {
    const ref = h()
    const props = {
      content: reference => reference
    }
    expect(Utils.evaluateProps(ref, props).content).toBe(ref)
  })
})

/** ==================== 🔥 Impure sync functions 🔥 ==================== **/
describe('addInteractive', () => {
  it('adds interactive attributes', () => {
    const popper = Utils.div()
    const tooltip = Utils.div()
    Utils.addInteractive(popper, tooltip)
    expect(popper.getAttribute('tabindex')).toBe('-1')
    expect(tooltip.hasAttribute('data-interactive')).toBe(true)
  })
})

describe('removeInteractive', () => {
  it('removes interactive attributes', () => {
    const popper = Utils.div()
    const tooltip = Utils.div()
    Utils.addInteractive(popper, tooltip)
    Utils.removeInteractive(popper, tooltip)
    expect(popper.getAttribute('tabindex')).toBe(null)
    expect(tooltip.hasAttribute('data-interactive')).toBe(false)
  })
})

describe('addInertia', () => {
  it('adds inertia attribute', () => {
    const tooltip = Utils.div()
    Utils.addInertia(tooltip)
    expect(tooltip.hasAttribute('data-inertia')).toBe(true)
  })
})

describe('removeInertia', () => {
  it('removes inertia attribute', () => {
    const tooltip = Utils.div()
    Utils.addInertia(tooltip)
    Utils.removeInertia(tooltip)
    expect(tooltip.hasAttribute('data-ineria')).toBe(false)
  })
})

describe('updatePopperElement', () => {
  it('sets new zIndex', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    Utils.updatePopperElement(popper, Defaults, {
      ...Defaults,
      zIndex: 213
    })
    expect(popper.style.zIndex).toBe('213')
  })

  it('updates size and animation attributes', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    Utils.updatePopperElement(popper, Defaults, {
      ...Defaults,
      size: 'large',
      animation: 'scale'
    })
    expect(Utils.getChildren(popper).tooltip.getAttribute('data-size')).toBe(
      'large'
    )
    expect(
      Utils.getChildren(popper).tooltip.getAttribute('data-animation')
    ).toBe('scale')
  })

  it('sets new content', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    Utils.updatePopperElement(popper, Defaults, {
      ...Defaults,
      content: 'hello'
    })
    expect(Utils.getChildren(popper).content.textContent).toBe('hello')
    Utils.updatePopperElement(popper, Defaults, {
      ...Defaults,
      content: '<strong>hello</strong>'
    })
    expect(Utils.getChildren(popper).content.querySelector('strong')).not.toBe(
      null
    )
  })

  it('sets new backdrop element', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    Utils.updatePopperElement(popper, Defaults, {
      ...Defaults,
      animateFill: false
    })
    expect(popper.querySelector(Selectors.BACKDROP)).toBe(null)
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(false)
    Utils.updatePopperElement(
      popper,
      { ...Defaults, animateFill: false },
      {
        ...Defaults,
        animateFill: true
      }
    )
    expect(popper.querySelector(Selectors.BACKDROP)).not.toBe(null)
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(true)
  })

  it('sets new arrow element', () => {
    {
      const popper = Utils.createPopperElement(1, Defaults)
      Utils.updatePopperElement(popper, Defaults, {
        ...Defaults,
        arrow: true
      })
      expect(popper.querySelector(Selectors.ARROW)).not.toBe(null)
    }

    {
      const props = { ...Defaults, arrow: true }
      const popper = Utils.createPopperElement(1, props)
      Utils.updatePopperElement(popper, props, {
        ...Defaults,
        arrow: false
      })
      expect(popper.querySelector(Selectors.ARROW)).toBe(null)
    }
  })

  it('sets new arrow element type', () => {
    {
      const popper = Utils.createPopperElement(1, Defaults)
      Utils.updatePopperElement(popper, Defaults, {
        ...Defaults,
        arrow: true,
        arrowType: 'round'
      })
      expect(popper.querySelector(Selectors.ARROW)).toBe(null)
      expect(popper.querySelector(Selectors.ROUND_ARROW)).not.toBe(null)
    }

    {
      const props = { ...Defaults, arrowType: 'round', arrow: true }
      const popper = Utils.createPopperElement(1, props)
      const newProps = { ...Defaults, arrowType: 'sharp', arrow: true }
      Utils.updatePopperElement(popper, props, newProps)
      expect(popper.querySelector(Selectors.ARROW)).not.toBe(null)
      expect(popper.querySelector(Selectors.ROUND_ARROW)).toBe(null)
      Utils.updatePopperElement(popper, newProps, Defaults)
      expect(popper.querySelector(Selectors.ARROW)).toBe(null)
      expect(popper.querySelector(Selectors.ROUND_ARROW)).toBe(null)
    }
  })

  it('sets interactive attribute', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    const newProps = {
      ...Defaults,
      interactive: true
    }
    Utils.updatePopperElement(popper, Defaults, newProps)
    expect(popper.getAttribute('tabindex')).toBe('-1')
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-interactive')
    ).toBe(true)
    Utils.updatePopperElement(popper, newProps, {
      ...newProps,
      interactive: false
    })
    expect(popper.getAttribute('tabindex')).toBe(null)
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-interactive')
    ).toBe(false)
  })

  it('sets inertia attribute', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    const newProps = {
      ...Defaults,
      inertia: true
    }
    Utils.updatePopperElement(popper, Defaults, newProps)
    expect(Utils.getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(
      true
    )
    Utils.updatePopperElement(popper, newProps, {
      ...newProps,
      inertia: false
    })
    expect(Utils.getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(
      false
    )
  })

  it('sets new theme', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    const newProps = {
      ...Defaults,
      theme: 'my custom themes'
    }
    Utils.updatePopperElement(popper, Defaults, newProps)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('my-theme')
    ).toBe(true)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('custom-theme')
    ).toBe(true)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('themes-theme')
    ).toBe(true)
    Utils.updatePopperElement(popper, newProps, {
      ...newProps,
      theme: 'other'
    })
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('my-theme')
    ).toBe(false)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('custom-theme')
    ).toBe(false)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('themes-theme')
    ).toBe(false)
    expect(
      Utils.getChildren(popper).tooltip.classList.contains('other-theme')
    ).toBe(true)
  })
})

describe('injectCSS', () => {
  it('injects a string of css styles into the document `head`', () => {
    const styles = 'body { color: red; }'
    expect(document.head.querySelector('style')).toBe(null)
    Utils.injectCSS(styles)
    const styleNode = document.head.querySelector('style')
    expect(styleNode).toBeTruthy()
    expect(styleNode.textContent).toBe(styles)
    styleNode.remove()
  })
})

describe('computeArrowTransform', () => {
  it('placement = top', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'top')
    const { arrow } = Utils.getChildren(popper)
    Utils.computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })

  it('placement = bottom', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'bottom')
    const { arrow } = Utils.getChildren(popper)
    Utils.computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })

  it('placement = left', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'bottom')
    const { arrow } = Utils.getChildren(popper)
    Utils.computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })

  it('placement = right', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'bottom')
    const { arrow } = Utils.getChildren(popper)
    Utils.computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
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

describe('setContent', () => {
  it('sets textContent of an element if `props.allowHTML` is `false`', () => {
    const ref = h()
    const content = 'some content'
    Utils.setContent(ref, {
      allowHTML: false,
      content
    })
    expect(ref.textContent).toBe(content)
    expect(ref.querySelector('strong')).toBe(null)
  })

  it('sets innerHTML of an element if `props.allowHTML` is `true`', () => {
    const ref = h()
    const content = '<strong>some content</strong>'
    Utils.setContent(ref, {
      allowHTML: true,
      content
    })
    expect(ref.querySelector('strong')).not.toBe(null)
  })
})

describe('applyTransitionDuration', () => {
  it('sets the `transition-duration` property on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()]
    Utils.applyTransitionDuration(els, 1298)
    expect(els[0].style.transitionDuration).toBe('1298ms')
    expect(els[1].style.transitionDuration).toBe('1298ms')
    expect(els[3].style.transitionDuration).toBe('1298ms')
  })
})

describe('setInnerHTML', () => {
  it('sets the innerHTML of an element with a string', () => {
    const ref = h()
    Utils.setInnerHTML(ref, '<strong></strong>')
    expect(ref.querySelector('strong')).not.toBe(null)
  })

  it('sets the innerHTML of an element with an element', () => {
    const ref = h()
    const div = document.createElement('div')
    div.innerHTML = '<strong></strong>'
    Utils.setInnerHTML(ref, div)
    expect(ref.querySelector('strong')).not.toBe(null)
  })
})

describe('isCursorOutsideInteractiveBorder', () => {
  const options = { interactiveBorder: 5, distance: 10 }
  const popperRect = { top: 100, left: 100, right: 110, bottom: 110 }

  it('no popper placement returns true', () => {
    expect(Utils.isCursorOutsideInteractiveBorder(null, {}, {}, {})).toBe(true)
  })

  // TOP: bounded by x(95, 115) and y(95, 115)
  it('PLACEMENT=top: inside', () => {
    const mockEvents = [
      { clientX: 95, clientY: 95 },
      { clientX: 115, clientY: 115 },
      { clientX: 115, clientY: 95 },
      { clientX: 95, clientY: 115 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'top',
          popperRect,
          coords,
          options
        )
      ).toBe(false)
    })
  })

  // TOP: bounded by x(95, 115) and y(95, 115)
  it('PLACEMENT=top: outside', () => {
    const mockEvents = [
      { clientX: 94, clientY: 84 },
      { clientX: 94, clientY: 126 },
      { clientX: 100, clientY: 84 },
      { clientX: 100, clientY: 126 },
      { clientX: 94, clientY: 100 },
      { clientX: 116, clientY: 100 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'top',
          popperRect,
          coords,
          options
        )
      ).toBe(true)
    })
  })

  // BOTTOM: bounded by x(95, 115) and y(95, 125])
  it('PLACEMENT=bottom: inside', () => {
    const mockEvents = [
      { clientX: 95, clientY: 95 },
      { clientX: 115, clientY: 125 },
      { clientX: 115, clientY: 125 },
      { clientX: 95, clientY: 125 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'bottom',
          popperRect,
          coords,
          options
        )
      ).toBe(false)
    })
  })

  // BOTTOM: bounded by x(95, 115) and y(95, 125)
  it('PLACEMENT=bottom: outside', () => {
    const mockEvents = [
      { clientX: 94, clientY: 94 },
      { clientX: 94, clientY: 126 },
      { clientX: 100, clientY: 94 },
      { clientX: 100, clientY: 126 },
      { clientX: 94, clientY: 100 },
      { clientX: 116, clientY: 100 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'bottom',
          popperRect,
          coords,
          options
        )
      ).toBe(true)
    })
  })

  // LEFT: bounded by x(85, 115) and y(95, 115)
  it('PLACEMENT=left: inside', () => {
    const mockEvents = [
      { clientX: 85, clientY: 95 },
      { clientX: 115, clientY: 95 },
      { clientX: 85, clientY: 115 },
      { clientX: 115, clientY: 115 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'left',
          popperRect,
          coords,
          options
        )
      ).toBe(false)
    })
  })

  // LEFT: bounded by x(85, 115) and y(95, 115)
  it('PLACEMENT=left: outside', () => {
    const mockEvents = [
      { clientX: 84, clientY: 94 },
      { clientX: 84, clientY: 116 },
      { clientX: 100, clientY: 94 },
      { clientX: 100, clientY: 116 },
      { clientX: 84, clientY: 100 },
      { clientX: 116, clientY: 100 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'left',
          popperRect,
          coords,
          options
        )
      ).toBe(true)
    })
  })

  // RIGHT: bounded by x(95, 125) and y(95, 115)
  it('PLACEMENT=right: inside', () => {
    const mockEvents = [
      { clientX: 95, clientY: 95 },
      { clientX: 125, clientY: 95 },
      { clientX: 95, clientY: 115 },
      { clientX: 125, clientY: 115 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'right',
          popperRect,
          coords,
          options
        )
      ).toBe(false)
    })
  })

  // RIGHT: bounded by x(95, 125) and y(95, 115)
  it('PLACEMENT=right: outside', () => {
    const mockEvents = [
      { clientX: 94, clientY: 94 },
      { clientX: 94, clientY: 126 },
      { clientX: 100, clientY: 94 },
      { clientX: 100, clientY: 126 },
      { clientX: 94, clientY: 100 },
      { clientX: 126, clientY: 100 }
    ]

    mockEvents.forEach(coords => {
      expect(
        Utils.isCursorOutsideInteractiveBorder(
          'right',
          popperRect,
          coords,
          options
        )
      ).toBe(true)
    })
  })
})

/** ==================== 😱 Async functions or tests 😱 ==================== **/
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

describe('afterPopperPositionUpdates', () => {
  it('is called by popper if not already updated', done => {
    const tip = tippy.one(h(), { lazy: false })
    // popper calls scheduleUpdate() on init
    const fn = jest.fn()
    Utils.afterPopperPositionUpdates(tip.popperInstance, fn)
    setTimeout(() => {
      expect(fn.mock.calls.length).toBe(1)
      done()
    }, 20)
  })

  it('is not called by popper if already updated', done => {
    const tip = tippy.one(h(), { lazy: false })
    const fn = jest.fn()
    // popper calls scheduleUpdate() on init
    setTimeout(() => {
      const fn = jest.fn()
      Utils.afterPopperPositionUpdates(tip.popperInstance, fn, true)
      setTimeout(() => {
        expect(fn.mock.calls.length).toBe(0)
        done()
      }, 20)
    }, 20)
  })
})

describe('focus', () => {
  it('focuses an element', () => {
    const el = document.createElement('button') // can receive focus
    Utils.focus(el)
    expect(el).toBe(document.activeElement)
  })
})

describe('hideAllPoppers', () => {
  it('hides all poppers on the document', done => {
    const tip = tippy([...Array(10)].map(() => h()), {
      duration: 0
    })
    tip.instances.forEach(i => i.show(0))
    expect(document.querySelectorAll(Selectors.POPPER).length > 0).toBe(true)
    Utils.hideAllPoppers()
    setTimeout(() => {
      expect(document.querySelectorAll(Selectors.POPPER).length).toBe(0)
      done()
    })
  })
})
