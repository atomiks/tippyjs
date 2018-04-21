import {
  createReference,
  createReferenceArray,
  hasTippy,
  cleanDocumentBody,
  withTestOptions
} from '../utils'

import { Defaults } from '../../src/js/defaults'
import { Selectors } from '../../src/js/selectors'
import tippy from '../../src/js/tippy'

afterEach(cleanDocumentBody)

describe('tippy', () => {
  it('can be called with no arguments without throwing errors', () => {
    tippy()
  })

  it('returns the expected object', () => {
    const tip1 = tippy('__invalidSelector__')
    expect(tip1).toEqual({
      targets: '__invalidSelector__',
      options: Defaults,
      references: [],
      instances: [],
      destroyAll: tip1.destroyAll
    })

    const ref = createReference()
    const tip2 = tippy(ref)
    expect(tip2).toEqual({
      targets: ref,
      options: Defaults,
      references: [ref],
      instances: tip2.instances,
      destroyAll: tip2.destroyAll
    })
  })

  it('merges the default options with the supplied options', () => {
    expect(
      tippy(createReference(), {
        placement: 'bottom-end'
      }).options
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
})

describe('tippy.one', () => {
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

describe('tippy.setDefaults', () => {
  it('changes the default options applied to instances but does not mutate the original', () => {
    const ogDefaults = Defaults
    const newPlacement = 'bottom-end'
    tippy.setDefaults({ placement: newPlacement })
    expect(Defaults.placement).toBe(newPlacement)
    expect(ogDefaults.placement).not.toBe(newPlacement)
  })
})
