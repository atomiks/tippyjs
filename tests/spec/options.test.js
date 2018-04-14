import createReferenceElement from '../helpers/createReferenceElement'
import createArrayOfReferenceElements from '../helpers/createArrayOfReferenceElements'
import hasTippy from '../helpers/hasTippy'
import cleanDocument from '../helpers/cleanDocument'

import tippy from '../../src/js/tippy'
import { Tippy } from '../../src/js/core/Tippy'
import { selectors } from '../../src/js/core/globals'

const o = options => ({ createPopperInstanceOnInit: true, ...options })

afterEach(cleanDocument)

test('createPopperInstanceOnInit', () => {
  const el = createReferenceElement()
  tippy(el, { createPopperInstanceOnInit: true })
  expect(el._tippy.options.createPopperInstanceOnInit).toBe(true)
  expect(el._tippy.popperInstance).not.toBeNull()
  expect(el._tippy.popperInstance.state.eventsEnabled).toBe(false)
})

test('placement', () => {
  const placements = ['top', 'bottom', 'left', 'right'].reduce(
    (acc, placement) => [...acc, placement, `${placement}-start`, `${placement}-end`],
    []
  )
  placements.forEach(placement => {
    const el = createReferenceElement()
    tippy(el, o({ placement }))
    expect(el._tippy.options.placement).toBe(placement)
    expect(el._tippy.popperInstance.options.placement).toBe(placement)
  })
})

test('trigger', () => {
  const trigger = 'mouseenter focus click'
  let el

  el = createReferenceElement(true)
  tippy(el, o({ trigger }))
  expect(el._tippy.options.trigger).toBe(trigger)
  el.dispatchEvent(new Event('mouseenter'))
  expect(el._tippy.state.visible).toBe(true)

  cleanDocument()

  el = createReferenceElement(true)
  tippy(el, o({ trigger }))
  el.dispatchEvent(new Event('focus'))
  expect(el._tippy.state.visible).toBe(true)

  cleanDocument()

  el = createReferenceElement(true)
  tippy(el, o({ trigger }))
  el.dispatchEvent(new Event('click'))
  expect(el._tippy.state.visible).toBe(true)
})

test('allowTitleHTML', () => {
  const el = createReferenceElement()
  el.title = '<strong>tooltip</strong>'

  tippy(el, { allowTitleHTML: false })
  expect(
    el._tippy.popper.querySelector(selectors.CONTENT).querySelector('strong')
  ).toBeNull()
  el._tippy.destroy()

  tippy(el, { allowTitleHTML: true })
  expect(
    el._tippy.popper.querySelector(selectors.CONTENT).querySelector('strong')
  ).not.toBeNull()
})
