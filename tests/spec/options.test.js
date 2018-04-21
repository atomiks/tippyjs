import {
  createReference,
  createReferenceArray,
  hasTippy,
  cleanDocumentBody,
  withTestOptions,
  el
} from '../utils'

import tippy from '../../src/js/tippy'
import * as Utils from '../../src/js/utils'

afterEach(cleanDocumentBody)

describe('a11y', () => {
  it('false: it does not add `tabindex` attribute if ref is not focusable', () => {
    const ref = createReference()
    tippy(ref, { a11y: false })
    expect(ref.hasAttribute('tabindex')).toBe(false)
  })

  it('true: it does add `tabindex` attribute if ref is not focusable', () => {
    const ref = createReference()
    tippy(ref, { a11y: true })
    expect(ref.getAttribute('tabindex')).toBe('0')
  })

  it('true: it does not add `tabindex` attribute to already-focusable elements', () => {
    const a = el('a')
    a.href = '#'
    tippy(a, { a11y: true })
    expect(a.hasAttribute('tabindex')).toBe(false)
  })
})

describe('allowHTML', () => {
  it('false: it does not allow html content inside tooltip', () => {
    const ref = createReference()
    const { popper } = tippy.one(ref, {
      content: '<strong>content</strong>',
      allowHTML: false
    })
    expect(Utils.getChildren(popper).content.querySelector('strong')).toBeNull()
  })

  it('true: it allows html content inside tooltip', () => {
    const ref = createReference()
    const { popper } = tippy.one(
      ref,
      withTestOptions({
        content: '<strong>content</strong>',
        allowHTML: true
      })
    )
    expect(
      Utils.getChildren(popper).content.querySelector('strong')
    ).not.toBeNull()
  })
})

describe('placement', () => {
  it('is within popper config correctly', () => {
    const ref = createReference()
    const { popperInstance } = tippy.one(
      ref,
      withTestOptions({ placement: 'left-end' })
    )
    expect(popperInstance.options.placement).toBe('left-end')
  })
})

describe('arrow', () => {
  it('true: creates an arrow element child of the popper', () => {
    const ref = createReference()
    const { popper } = tippy.one(ref, { arrow: true })
    expect(Utils.getChildren(popper).arrow).not.toBeNull()
  })

  it('true: disables `animateFill` option', () => {
    const ref = createReference()
    const { options } = tippy.one(ref, { arrow: true })
    expect(options.animateFill).toBe(false)
  })

  it('false: does not create an arrow element child of the popper', () => {
    const ref = createReference()
    const { popper } = tippy.one(ref, { arrow: false })
    expect(Utils.getChildren(popper).arrow).toBeNull()
  })
})

describe('animateFill', () => {
  it('true: sets `data-animatefill` attribute on tooltip', () => {
    const ref = createReference()
    const { popper } = tippy.one(ref, { animateFill: true })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(true)
  })

  it('false: does not set `data-animatefill` attribute on tooltip', () => {
    const ref = createReference()
    const { popper } = tippy.one(ref, { animateFill: false })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(false)
  })
})
