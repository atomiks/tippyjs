import createReferenceElement from '../helpers/createReferenceElement'
import createArrayOfReferenceElements from '../helpers/createArrayOfReferenceElements'
import hasTippy from '../helpers/hasTippy'
import cleanDocument from '../helpers/cleanDocument'

import tippy from '../../src/js/tippy'
import { Tippy } from '../../src/js/core/Tippy'

afterEach(cleanDocument)

test('Tippy has the expected methods', () => {
  const t = new Tippy()
  const methodKeys = ['show', 'hide', 'enable', 'disable', 'destroy']
  expect(methodKeys.every(key => typeof t[key] === 'function')).toBe(true)
})

test('Tippy instances get attached to reference elements', () => {
  const el = createReferenceElement()
  tippy(el)
  expect(el._tippy instanceof Tippy).toBe(true)
})

test('Tippy is filled with any properties in the object supplied to it', () => {
  const t = new Tippy({
    id: 1,
    otherKey: 'string'
  })
  expect(t.id).toBe(1)
  expect(t.otherKey).toBe('string')
})

test('Tippy#state is initialized correctly', () => {
  const t = new Tippy()
  expect(t.state).toEqual({
    destroyed: false,
    enabled: true,
    visible: false
  })
})

test('Tippy#disable sets the state to `enabled: false`', () => {
  const t = new Tippy()
  t.disable()
  expect(t.state.enabled).toBe(false)
})

test('Tippy#enable sets the state to `enabled: true`', () => {
  const t = new Tippy()
  t.state.enabled = null
  t.enable()
  expect(t.state.enabled).toBe(true)
})

test('Tippy#show shows a tooltip', () => {
  const el = createReferenceElement(true)
  tippy(el)
  el._tippy.show()
  expect(el._tippy.state.visible).toBe(true)
})

test('Tippy#hide hides a tooltip', () => {
  const el = createReferenceElement(true)
  tippy(el)
  el._tippy.show()
  el._tippy.hide()
  expect(el._tippy.state.visible).toBe(false)
})

test('Tippy#destroy destroys a tooltip fully', () => {
  const el = createReferenceElement()
  tippy(el)
  const t = el._tippy
  t.destroy()
  expect(t.state.destroyed).toBe(true)
  expect(el._tippy).toBeUndefined()
  expect(hasTippy(el)).toBe(false)
  expect(el.title).toBe('TOOLTIP')
})
