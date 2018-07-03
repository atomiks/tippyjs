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
    ;[...Array(10)].map(() => h())
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
    ;[...Array(10)].map(() => h())
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
})

describe('getDataAttributeOptions', () => {
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

  it('correctly parses arrays', () => {
    const ref = h()
    ref.setAttribute('data-tippy-delay', '[100, 255]')
    ref.setAttribute('data-tippy-duration', '[0, 999]')

    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      delay: [100, 255],
      duration: [0, 999]
    })
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
  it('works like Element.prototype.matches', () => {
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

describe('createPopperElement', () => {
  // NOTE: Selectors dependency here
  it('returns an element', () => {
    expect(Utils.createPopperElement(1, Defaults) instanceof Element).toBe(true)
  })

  it('always creates a tooltip element child', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    expect(Utils.getChildren(popper).tooltip).not.toBeNull()
  })

  it('sets the `id` property correctly', () => {
    const id = 1829
    const popper = Utils.createPopperElement(id, Defaults)
    expect(popper.id).toBe(`tippy-${id}`)
  })

  it('sets the `role` property correctly', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    expect(popper.role).toBe('tooltip')
  })

  it('sets the className property correctly', () => {
    const popper = Utils.createPopperElement(1, Defaults)
    expect(popper.matches(Selectors.POPPER)).toBe(true)
  })

  it('does not create an arrow element if props.arrow is false', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: false })
    expect(popper.querySelector(Selectors.ARROW)).toBeNull()
  })

  it('creates an arrow element if props.arrow is true', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    expect(popper.querySelector(Selectors.ARROW)).not.toBeNull()
  })

  it('does not create a backdrop element if props.animateFill is false', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      animateFill: false
    })
    expect(popper.querySelector(Selectors.BACKDROP)).toBeNull()
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
describe('injectCSS', () => {
  it('injects a string of css styles into the document `head`', () => {
    const styles = `body { color: red; }`
    expect(document.head.querySelector('style')).toBeNull()
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

describe('prefix', () => {
  /* JSDOM support is limited here... need to use fallbacks */
  it('returns the same value if the CSS property is supported', () => {
    const prefixedTransform = Utils.prefix('transform')
    expect(
      prefixedTransform === 'transform' ||
        prefixedTransform === 'webkitTransform'
    ).toBe(true)

    const prefixedTransitionDuration = Utils.prefix('transitionDuration')
    expect(
      prefixedTransitionDuration === 'transitionDuration' ||
        prefixedTransitionDuration === 'webkitTransitionDuration'
    ).toBe(true)
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

describe('setAttr', () => {
  it('sets an attribute with a default value of "" on an element', () => {
    const ref = h()
    const attr = 'data-some-attribute'
    Utils.setAttr(ref, attr)
    expect(ref.getAttribute(attr)).toBe('')
  })

  it('sets an attribute with a value if supplied on an element', () => {
    const ref = h()
    const attr = 'data-some-attribute'
    const value = 'some value'
    Utils.setAttr(ref, attr, value)
    expect(ref.getAttribute(attr)).toBe(value)
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
    expect(ref.querySelector('strong')).toBeNull()
  })

  it('sets innerHTML of an element if `props.allowHTML` is `true`', () => {
    const ref = h()
    const content = '<strong>some content</strong>'
    Utils.setContent(ref, {
      allowHTML: true,
      content
    })
    expect(ref.querySelector('strong')).not.toBeNull()
  })
})

describe('applyTransitionDuration', () => {
  /* JSDOM only supports `webkit-` properties */
  it('sets the `transition-duration` property on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()]
    Utils.applyTransitionDuration(els, 1298)
    expect(els[0].style.webkitTransitionDuration).toBe('1298ms')
    expect(els[1].style.webkitTransitionDuration).toBe('1298ms')
    expect(els[3].style.webkitTransitionDuration).toBe('1298ms')
  })
})

describe('setInnerHTML', () => {
  it('sets the innerHTML of an element', () => {
    const ref = h()
    Utils.setInnerHTML(ref, '<strong></strong>')
    expect(ref.querySelector('strong')).not.toBeNull()
  })
})

describe('isCursorOutsideInteractiveBorder', () => {
  const options = { interactiveBorder: 5, distance: 10 }
  const popperRect = { top: 100, left: 100, right: 110, bottom: 110 }

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
describe('updatePopperPosition', () => {
  /* Difficult to test */
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
