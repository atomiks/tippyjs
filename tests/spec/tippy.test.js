/**
 * Here we test the exposed window.tippy module to make sure everything works correctly.
 */
import createReferenceElement from '../helpers/createReferenceElement'
import createArrayOfReferenceElements from '../helpers/createArrayOfReferenceElements'
import hasTippy from '../helpers/hasTippy'
import cleanDocument from '../helpers/cleanDocument'

import { browser, selectors } from '../../src/js/core/globals'
import defaults from '../../src/js/core/defaults'
import tippy from '../../src/js/tippy'
import { Tippy } from '../../src/js/core/Tippy'

afterEach(cleanDocument)

test('tippy() without arguments throws no errors', () => {
  expect(tippy()).toBeTruthy()
})

test('tippy() returns an object with expected keys', () => {
  const keys = ['selector', 'options', 'tooltips', 'destroyAll']
  expect(Object.keys(tippy()).every(key => keys.includes(key))).toBe(true)
})

test('tippy().selector is the first argument', () => {
  expect(tippy(null).selector).toBe(null)
  expect(tippy(this).selector).toBe(this)
  expect(tippy(1).selector).toBe(1)
})

test('tippy().options is the merger of the defaults and supplied options', () => {
  const options = { placement: true, trigger: 'manual' }
  const merged = tippy(null, options).options
  expect(merged.placement).toBe(options.placement)
  expect(merged.trigger).toBe(options.trigger)
  merged.placement = defaults.placement
  merged.trigger = defaults.trigger
  expect(Object.keys(merged).every(key => defaults[key] === merged[key])).toBe(
    true
  )
})

test('tippy().tooltips is an array of Tippy instances', () => {
  expect(
    tippy(createArrayOfReferenceElements()).tooltips.every(
      t => t instanceof Tippy
    )
  ).toBe(true)
})

test('tippy().destroyAll destroys all Tippy instances and frees up memory', () => {
  const tip = tippy(createArrayOfReferenceElements())
  tip.destroyAll()
  expect(tip.tooltips.length).toBe(0)
})

test('tippy.defaults refers to the default options object', () => {
  expect(tippy.defaults).toBe(defaults)
})

test('tippy.browser refers to the browser object', () => {
  expect(tippy.browser).toBe(browser)
})

test('tippy(String) creates a tooltip for elements on the document which match the selector', () => {
  const el = createReferenceElement(true)
  tippy(el._selector)
  expect(document.querySelector(el._selector).title).not.toBe('TOOLTIP')
})

test('tippy(Element) creates a tooltip for the supplied element', () => {
  const el = createReferenceElement()
  tippy(el)
  expect(hasTippy(el)).toBe(true)
})

test('tippy(NodeList) creates tooltips for each node', () => {
  const els = createArrayOfReferenceElements(true)
  const nodeList = document.querySelectorAll(els[0]._selector)
  tippy(nodeList)
  expect(els.every(el => hasTippy(el))).toBe(true)
})

test('tippy(Element[]) creates tooltips for each element', () => {
  const els = createArrayOfReferenceElements()
  tippy(els)
  expect(els.every(el => hasTippy(el))).toBe(true)
})

test('tippy(Object) modifies the input value as the ref obj selector', () => {
  const ref = {}
  tippy(ref)
  expect(ref.refObj).toBe(true)
})

test('tippy(Object) tooltip is shown without errors', () => {
  tippy
    .one({
      attributes: {
        title: 'TOOLTIP'
      }
    })
    .show()
})

test('tippy.disableAnimations() sets all animation/transition-related defaults to 0/false', () => {
  const clone = { ...defaults }
  tippy.disableAnimations()
  expect(defaults.duration).toBe(0)
  expect(defaults.updateDuration).toBe(0)
  expect(defaults.animateFill).toBe(false)
  defaults.duration = clone.duration
  defaults.updateDuration = clone.updateDuration
  defaults.animateFill = clone.animateFill
})

test('tippy.one() returns the instance directly', () => {
  const instance = tippy.one(createReferenceElement())
  expect(instance.id).toBeDefined()
})
