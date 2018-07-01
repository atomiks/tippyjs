import {
  createReference,
  createReferenceArray,
  hasTippy,
  cleanDocumentBody
} from '../utils'

import { Defaults } from '../../src/js/defaults'
import { Selectors } from '../../src/js/selectors'
import tippy, { autoInit } from '../../src/js/tippy'

afterEach(cleanDocumentBody)

describe('tippy', () => {
  it('can be called with no arguments without throwing errors', () => {
    tippy()
  })

  it('returns the expected object', () => {
    const tip1 = tippy('__invalidSelector__')
    expect(tip1).toEqual({
      targets: '__invalidSelector__',
      props: Defaults,
      references: [],
      instances: [],
      destroyAll: tip1.destroyAll
    })

    const ref = createReference()
    const tip2 = tippy(ref)
    expect(tip2).toEqual({
      targets: ref,
      props: Defaults,
      references: [ref],
      instances: tip2.instances,
      destroyAll: tip2.destroyAll
    })
  })

  it('merges the default props with the supplied options', () => {
    expect(
      tippy(createReference(), {
        placement: 'bottom-end'
      }).props
    ).toEqual({
      ...Defaults,
      placement: 'bottom-end'
    })
  })

  it('throws an error if invalid option(s) are supplied', () => {
    expect(() => {
      tippy(createReference(), {
        placement: 'top',
        _someInvalidOption: true
      })
    }).toThrow()

    expect(() => {
      tippy(createReference(), {
        placement: 'top'
      })
    }).not.toThrow()
  })

  it('tippy().destroyAll() destroys all instances and frees memory', () => {
    const tipCollection = tippy(createReference())
    const instance = tipCollection.instances[0]
    tipCollection.destroyAll()
    expect(tipCollection.instances).toEqual([])
    expect(instance.state.isDestroyed).toBe(true)
  })

  it('polyfills a plain object as the virtual positioning reference', () => {
    const ref = tippy({}).references[0]
    expect(ref.isVirtual).toBe(true)
    expect(ref.classList).toBeDefined()
    expect(ref.attributes).toBeDefined()
    expect(typeof ref.addEventListener).toBe('function')
    expect(typeof ref.removeEventListener).toBe('function')
    expect(typeof ref.setAttribute).toBe('function')
    expect(typeof ref.removeAttribute).toBe('function')
    expect(typeof ref.getAttribute).toBe('function')
    expect(typeof ref.hasAttribute).toBe('function')
    expect(typeof ref.classList.add).toBe('function')
    expect(typeof ref.classList.remove).toBe('function')
    expect(typeof ref.classList.contains).toBe('function')
  })

  it('does not add duplicate tooltips', () => {
    const ref = createReference()
    tippy(ref)
    expect(tippy(ref).instances.length).toBe(0)
  })
})

describe('tippy.one()', () => {
  it('returns the instance directly', () => {
    expect(tippy.one(createReference()).id).toBeDefined()
  })

  it('only creates a single tooltip, even if multiple references are passed', () => {
    const refs = createReferenceArray()
    tippy.one(refs)
    expect(refs[0]._tippy).toBeDefined()
    expect(refs.slice(1).filter(ref => ref._tippy).length).toBe(0)
  })
})

describe('tippy.setDefaults()', () => {
  it('changes the default props applied to instances but does not mutate the original', () => {
    const ogDefaults = Defaults
    const newPlacement = 'bottom-end'
    tippy.setDefaults({ placement: newPlacement })
    expect(Defaults.placement).toBe(newPlacement)
    expect(ogDefaults.placement).not.toBe(newPlacement)
  })
})

describe('tippy.disableAnimations()', () => {
  it('disables animation-related props', () => {
    const ogDefaults = Defaults
    tippy.disableAnimations()
    expect(Defaults.animateFill).toBe(false)
    expect(Defaults.updateDuration).toBe(0)
    expect(Defaults.duration).toBe(0)
  })
})

describe('auto-init', () => {
  it('adds a tooltip if "data-tippy" attribute is truthy', () => {
    const reference = document.createElement('div')
    reference.setAttribute('data-tippy', 'tooltip')
    document.body.append(reference)
    autoInit()
    expect(hasTippy(reference)).toBe(true)
  })

  it('does not add tooltip if "data-tippy" attribute is falsy', () => {
    const reference = document.createElement('div')
    reference.setAttribute('data-tippy', '')
    document.body.append(reference)
    autoInit()
    expect(hasTippy(reference)).toBe(false)
  })
})
