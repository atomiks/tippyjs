import createReferenceElement from '../helpers/createReferenceElement'
import createArrayOfReferenceElements from '../helpers/createArrayOfReferenceElements'
import hasTippy from '../helpers/hasTippy'
import cleanDocument from '../helpers/cleanDocument'

import tippy from '../../src/js/tippy'
import { Tippy } from '../../src/js/core/Tippy'
import { selectors } from '../../src/js/core/globals'

const o = options => ({ createPopperInstanceOnInit: true, ...options })

afterEach(cleanDocument)

describe('createPopperInstanceOnInit', () => {
  test('creates the popper instance on init if `true`', () => {
    const tip = tippy.one(createReferenceElement(), {
      createPopperInstanceOnInit: true
    })
    expect(tip.options.createPopperInstanceOnInit).toBe(true)
    expect(tip.popperInstance).not.toBeNull()
  })

  test('does not create the popper instance if `false`', () => {
    const tip = tippy.one(createReferenceElement(), {
      createPopperInstanceOnInit: false
    })
    expect(tip.options.createPopperInstanceOnInit).toBe(false)
    expect(tip.popperInstance).toBeNull()
  })

  test('popper event listeners are disabled on init if `true`', () => {
    const tip = tippy.one(createReferenceElement(), {
      createPopperInstanceOnInit: true
    })
    expect(tip.popperInstance.state.eventsEnabled).toBe(false)
  })
})

describe('placement', () => {
  test('placement is in popperInstance options', () => {
    const tip = tippy.one(createReferenceElement(), o({ placement: 'left' }))
    expect(tip.popperInstance.options.placement).toBe('left')
  })
})

describe('trigger', () => {
  test('mouseenter', () => {
    const tip = tippy.one(
      createReferenceElement(true),
      o({
        trigger: 'mouseenter'
      })
    )
    tip.reference.dispatchEvent(new Event('mouseenter'))
    expect(tip.state.visible).toBe(true)
    tip.reference.dispatchEvent(new Event('mouseleave'))
    expect(tip.state.visible).toBe(false)
    cleanDocument()
  })

  test('focus', () => {
    const tip = tippy.one(
      createReferenceElement(true),
      o({
        trigger: 'focus'
      })
    )
    tip.reference.dispatchEvent(new Event('focus'))
    expect(tip.state.visible).toBe(true)
    tip.reference.dispatchEvent(new Event('blur'))
    expect(tip.state.visible).toBe(false)
    cleanDocument()
  })

  test('click', () => {
    const tip = tippy.one(
      createReferenceElement(true),
      o({
        trigger: 'click'
      })
    )
    tip.reference.dispatchEvent(new Event('click'))
    expect(tip.state.visible).toBe(true)
    tip.reference.dispatchEvent(new Event('click'))
    expect(tip.state.visible).toBe(false)
    cleanDocument()
  })
})

describe('allowTitleHTML', () => {
  test('injects HTML if `true`', () => {
    const el = createReferenceElement()
    el.title = '<strong>tooltip</strong>'
    const tip = tippy.one(el, { allowTitleHTML: true })
    expect(
      tip.popper.querySelector(selectors.CONTENT).querySelector('strong')
    ).not.toBeNull()
  })

  test('injects textContent if `false`', () => {
    const el = createReferenceElement()
    el.title = '<strong>tooltip</strong>'
    const tip = tippy.one(el, { allowTitleHTML: false })
    expect(
      tip.popper.querySelector(selectors.CONTENT).querySelector('strong')
    ).toBeNull()
  })
})

describe('arrow', () => {
  test('creates an arrow element if `true`', () => {
    const tip = tippy.one(createReferenceElement(), {
      arrow: true
    })
    expect(tip.popper.querySelector(selectors.ARROW)).not.toBeNull()
  })

  test('does not create an arrow element if `false`', () => {
    const tip = tippy.one(createReferenceElement(), {
      arrow: false
    })
    expect(tip.popper.querySelector(selectors.ARROW)).toBeNull()
  })

  test('disables the `animateFill` option if `true`', () => {
    const tip = tippy.one(createReferenceElement(), {
      arrow: true
    })
    expect(tip.options.animateFill).toBe(false)
  })
})

describe('animateFill', () => {
  test('sets the `data-animatefill` attribute on the tooltip element if `true`', () => {
    const tip = tippy.one(createReferenceElement(), {
      animateFill: true
    })
    expect(
      tip.popper
        .querySelector(selectors.TOOLTIP)
        .hasAttribute('data-animatefill')
    ).toBe(true)
  })

  test('does not set the `data-animatefill` attribute on the tooltip element if `false`', () => {
    const tip = tippy.one(createReferenceElement(), {
      animateFill: false
    })
    expect(
      tip.popper
        .querySelector(selectors.TOOLTIP)
        .hasAttribute('data-animatefill')
    ).toBe(false)
  })
})
