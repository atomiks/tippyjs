import {
  el,
  createReference,
  createReferenceArray,
  hasTippy,
  cleanDocumentBody,
  withPopperInstanceOnInit,
  IDENTIFIER
} from '../utils'

import { Selectors } from '../../src/js/Selectors'
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
    expect(Utils.isPlainObject(el('div')))
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
    // NOTE: side effect here
    createReferenceArray({ appendToBody: true })
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
    // NOTE: side effect here
    createReferenceArray({ appendToBody: true })
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
    const ref = createReference()
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
    const a = el('a')
    a.href = '#'
    expect(Utils.elementCanReceiveFocus(a)).toBe(true)
  })

  it('returns true for area[href]', () => {
    const area = el('area')
    area.href = '#'
    expect(Utils.elementCanReceiveFocus(area)).toBe(true)
  })

  it('returns true for input', () => {
    const input = el('input')
    expect(Utils.elementCanReceiveFocus(input)).toBe(true)
  })

  it('returns true for textarea', () => {
    const textarea = el('textarea')
    expect(Utils.elementCanReceiveFocus(textarea)).toBe(true)
  })

  it('returns true for select', () => {
    const select = el('select')
    expect(Utils.elementCanReceiveFocus(select)).toBe(true)
  })

  it('returns true for iframe', () => {
    const iframe = el('iframe')
    expect(Utils.elementCanReceiveFocus(iframe)).toBe(true)
  })

  it('returns true for [tabindex]', () => {
    const div = el('div')
    div.tabIndex = '0'
    expect(Utils.elementCanReceiveFocus(div)).toBe(true)
  })

  it('returns false for [disabled]', () => {
    const disabled = el('div')
    el.disabled = ''
    expect(Utils.elementCanReceiveFocus(disabled)).toBe(false)
  })

  it('returns false for other elements', () => {
    const other = el('span')
    expect(Utils.elementCanReceiveFocus(other)).toBe(false)
  })
})

describe('getChildren', () => {
  // NOTE: Utils.createPopperElement() dependency

  it('returns the children of the popper element, default options', () => {
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
})

describe('getDataAttributeOptions', () => {
  it('returns the attribute options', () => {
    const ref = createReference()
    ref.setAttribute('data-tippy-arrowType', 'round')
    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      arrowType: 'round'
    })
  })

  it('correctly parses true & false strings', () => {
    const ref = createReference()
    ref.setAttribute('data-tippy-interactive', 'true')
    ref.setAttribute('data-tippy-animateFill', 'false')

    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      interactive: true,
      animateFill: false
    })
  })

  it('correctly parses number strings', () => {
    const ref = createReference()
    ref.setAttribute('data-tippy-delay', '129')
    ref.setAttribute('data-tippy-duration', '111')

    expect(Utils.getDataAttributeOptions(ref)).toEqual({
      delay: 129,
      duration: 111
    })
  })

  it('correctly parses arrays', () => {
    const ref = createReference()
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
    const ref = createReference()
    expect(Utils.matches.call(el('table'), 'table')).toBe(true)
    expect(Utils.matches.call(ref, `.${ref.className}`)).toBe(true)
  })
})

describe('closest', () => {
  it('works like Element.prototype.closest', () => {
    const ref = createReference()
    const child = el('div')
    ref.appendChild(child)
    expect(Utils.closest(ref, `.${ref.className}`)).toBe(ref)
    expect(Utils.closest(child, `.${ref.className}`)).toBe(ref)
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

  it('does not create an arrow element if options.arrow is false', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: false })
    expect(popper.querySelector(Selectors.ARROW)).toBeNull()
  })

  it('creates an arrow element if options.arrow is true', () => {
    const popper = Utils.createPopperElement(1, { ...Defaults, arrow: true })
    expect(popper.querySelector(Selectors.ARROW)).not.toBeNull()
  })

  it('does not create a backdrop element if options.animateFill is false', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      animateFill: false
    })
    expect(popper.querySelector(Selectors.BACKDROP)).toBeNull()
  })

  it('sets `[data-animatefill]` on the tooltip element if options.animateFill is true', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      animateFill: true
    })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(true)
  })

  it('sets `[data-interactive]` on the tooltip if options.interactive is true', () => {
    const popper = Utils.createPopperElement(1, {
      ...Defaults,
      interactive: true
    })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-interactive')
    ).toBe(true)
  })

  it('sets the correct data-* attributes on the tooltip based on options', () => {
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

  it('sets the correct theme class names on the tooltip based on options', () => {
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

/** ==================== 🔥 Impure sync functions 🔥 ==================== **/
describe('setAttr', () => {
  it('sets an attribute with a default value of "" on an element', () => {
    const ref = createReference()
    const attr = 'data-some-attribute'
    Utils.setAttr(ref, attr)
    expect(ref.getAttribute(attr)).toBe('')
  })

  it('sets an attribute with a value if supplied on an element', () => {
    const ref = createReference()
    const attr = 'data-some-attribute'
    const value = 'some value'
    Utils.setAttr(ref, attr, value)
    expect(ref.getAttribute(attr)).toBe(value)
  })
})

describe('setContent', () => {
  it('sets textContent of an element if `options.allowHTML` is `false`', () => {
    const ref = createReference()
    const content = 'some content'
    Utils.setContent(ref, {
      allowHTML: false,
      content
    })
    expect(ref.textContent).toBe(content)
    expect(ref.querySelector('strong')).toBeNull()
  })

  it('sets innerHTML of an element if `options.allowHTML` is `true`', () => {
    const ref = createReference()
    const content = '<strong>some content</strong>'
    Utils.setContent(ref, {
      allowHTML: true,
      content
    })
    expect(ref.querySelector('strong')).not.toBeNull()
  })
})

describe('applyTransitionDuration', () => {})

describe('setInnerHTML', () => {})

/** ==================== 😱 Async functions or tests 😱 ==================== **/
describe('focus', () => {
  /* Cannot be tested by JSDOM */
})

describe('addEventListeners', () => {
  // NOTE: options.trigger dependency here

  let trigger = ''

  beforeEach(() => {
    trigger = ''
  })

  const mockHandlers = {
    onTrigger(event) {
      trigger = event.type
    },
    onMouseLeave() {
      trigger = 'mouseleave'
    },
    onBlur() {
      trigger = 'blur'
    },
    onDelegateShow() {},
    onDelegateHide() {}
  }

  it('returns a listeners array', () => {
    const ref = createReference()
    const listeners = Utils.addEventListeners(ref, Defaults, mockHandlers)
    expect(Array.isArray(listeners)).toBe(true)
    expect(listeners[0].eventType).toBeDefined()
    expect(listeners[0].handler).toBeDefined()
  })

  it('returns the correct listeners array given the `trigger` option', () => {
    const ref = createReference()
    const listeners = Utils.addEventListeners(
      ref,
      { ...Defaults, trigger: 'mouseenter focus' },
      mockHandlers
    )
    expect(listeners[0].eventType).toBe('mouseenter')
    expect(listeners[0].handler).toBe(mockHandlers.onTrigger)
    expect(listeners[1].eventType).toBe('mouseleave')
    expect(listeners[1].handler).toBe(mockHandlers.onMouseLeave)
    expect(listeners[2].eventType).toBe('focus')
    expect(listeners[2].handler).toBe(mockHandlers.onTrigger)
    expect(listeners[3].eventType).toBe('blur')
    expect(listeners[3].handler).toBe(mockHandlers.onBlur)
  })

  it('adds correct `mouseenter` trigger events', () => {
    const ref = createReference()
    Utils.addEventListeners(
      ref,
      { ...Defaults, trigger: 'mouseenter' },
      mockHandlers
    )
    ref.dispatchEvent(new Event('mouseenter'))
    expect(trigger).toBe('mouseenter')
    ref.dispatchEvent(new Event('mouseleave'))
    expect(trigger).toBe('mouseleave')
  })

  it('adds correct `focus` trigger events', () => {
    const ref = createReference()
    Utils.addEventListeners(
      ref,
      { ...Defaults, trigger: 'focus' },
      mockHandlers
    )
    ref.dispatchEvent(new Event('focus'))
    expect(trigger).toBe('focus')
    ref.dispatchEvent(new Event('blur'))
    expect(trigger).toBe('blur')
  })

  it('adds correct `click` trigger events', () => {
    const ref = createReference()
    Utils.addEventListeners(
      ref,
      { ...Defaults, trigger: 'click' },
      mockHandlers
    )
    ref.dispatchEvent(new Event('click'))
    expect(trigger).toBe('click')
  })

  it('adds correct all trigger events when each is separated by string', () => {
    const ref = createReference()
    Utils.addEventListeners(
      ref,
      { ...Defaults, trigger: 'mouseenter focus click' },
      mockHandlers
    )
    ref.dispatchEvent(new Event('click'))
    expect(trigger).toBe('click')
    ref.dispatchEvent(new Event('focus'))
    expect(trigger).toBe('focus')
    ref.dispatchEvent(new Event('mouseenter'))
    expect(trigger).toBe('mouseenter')
  })

  it('returns an empty array and adds no listeners if options.trigger is `manual`', () => {
    const ref = createReference()
    Utils.addEventListeners(
      ref,
      { ...Defaults, trigger: 'manual' },
      mockHandlers
    )
    ref.dispatchEvent(new Event('mouseenter'))
    ref.dispatchEvent(new Event('focus'))
    ref.dispatchEvent(new Event('click'))
    expect(trigger).toBe('')
  })
})

describe('hideAllPoppers', () => {
  // NOTE: option.showOnInit dependency here
  it('hides all poppers on the document', () => {})
})
