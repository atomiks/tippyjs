import {
  createReference,
  createReferenceArray,
  hasTippy,
  cleanDocumentBody,
  withTestOptions
} from '../utils'

import { Defaults } from '../../src/js/defaults'
import { Selectors } from '../../src/js/selectors'
import createTippy from '../../src/js/createTippy'

afterEach(cleanDocumentBody)

describe('createTippy', () => {
  it('returns `null` if the reference is falsy', () => {
    expect(createTippy(false, Defaults)).toBe(null)
  })

  it('returns `null` if the reference already has a tippy instance', () => {
    const reference = createReference()
    reference._tippy = true
    expect(createTippy(reference, Defaults)).toBe(null)
  })

  it('returns the instance with expected properties', () => {
    const tip = createTippy(createReference(), Defaults)
    expect(tip.id).toBeDefined()
    expect(tip.reference).toBeDefined()
    expect(tip.popper).toBeDefined()
    expect(tip.popperInstance).toBeDefined()
    expect(tip.popperChildren).toBeDefined()
    expect(tip.popperInstance).toBeDefined()
    expect(tip.listeners).toBeDefined()
    expect(tip.state).toBeDefined()
    expect(tip.show).toBeDefined()
    expect(tip.hide).toBeDefined()
    expect(tip.enable).toBeDefined()
    expect(tip.disable).toBeDefined()
    expect(tip.destroy).toBeDefined()
  })

  it('increments the `id` on each call with valid arguments', () => {
    const tips = [
      createTippy(createReference(), Defaults),
      createTippy(createReference(), Defaults),
      createTippy(createReference(), Defaults)
    ]
    expect(tips[0].id).toBe(tips[1].id - 1)
    expect(tips[1].id).toBe(tips[2].id - 1)
  })
})

describe('instance.destroy', () => {
  it('sets state.isDestroyed to `true`', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.destroy()
    expect(instance.state.isDestroyed).toBe(true)
  })

  it('deletes the `_tippy` property from the reference', () => {
    const ref = createReference()
    const instance = createTippy(ref, Defaults)
    expect('_tippy' in ref).toBe(true)
    instance.destroy()
    expect('_tippy' in ref).toBe(false)
  })

  it('removes listeners from the reference', () => {
    const ref = createReference()
    const instance = createTippy(ref, { ...Defaults, trigger: 'mouseenter' })
    instance.destroy()
    ref.dispatchEvent(new Event('mouseenter'))
    expect(instance.state.isVisible).toBe(false)
  })

  it('removes `data-tippy-reference` attribute from the reference', () => {
    const ref = createReference()
    const instance = createTippy(ref, Defaults)
    instance.destroy()
    expect(ref.hasAttribute('data-tippy-reference')).toBe(false)
  })
})

describe('instance.show', () => {
  it('changes state.isVisible to `true`', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.destroy()
  })

  it('mounts the popper to the DOM', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.show()
    expect(document.querySelector(Selectors.POPPER)).toBe(instance.popper)
    instance.destroy()
  })

  it('overrides instance.options.duration if supplied an argument', done => {
    const instance = createTippy(createReference({ appendToBody: true }), {
      ...Defaults,
      duration: 100
    })
    instance.show(10)
    setTimeout(() => {
      expect(
        instance.popperChildren.tooltip.style.webkitTransitionDuration
      ).toBe('10ms')
      instance.destroy()
      done()
    }, 20)
  })
})

describe('instance.hide', () => {
  it('changes state.isVisible to false', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.hide()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })

  it('removes the popper element from the DOM after hiding', () => {
    const instance = createTippy(createReference({ appendToBody: true }), {
      ...Defaults
    })
    instance.show(0)
    expect(document.querySelector(Selectors.POPPER)).toBe(instance.popper)
    instance.hide(0)
    setTimeout(() => {
      expect(document.querySelector(Selectors.POPPER)).toBeNull()
      instance.destroy()
      done()
    }, 20)
  })

  it('overrides instance.options.duration if supplied an argument', () => {
    const instance = createTippy(createReference({ appendToBody: true }), {
      ...Defaults,
      duration: 100
    })
    instance.show(0)
    instance.hide(9)
    expect(instance.popperChildren.tooltip.style.webkitTransitionDuration).toBe(
      '9ms'
    )
    instance.destroy()
  })
})

describe('instance.enable', () => {
  it('sets state.isEnabled to `true`', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.enable()
    expect(instance.state.isEnabled).toBe(true)
    instance.destroy()
  })

  it('allows a tippy to be shown', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.enable()
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.destroy()
  })
})

describe('instance.disable', () => {
  it('sets state.isEnabled to `false`', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.disable()
    expect(instance.state.isEnabled).toBe(false)
    instance.destroy()
  })

  it('disallows a tippy to be shown', () => {
    const instance = createTippy(
      createReference({ appendToBody: true }),
      Defaults
    )
    instance.disable()
    instance.show()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })
})
