import {
  createReferenceElement,
  createArrayOfReferenceElements,
  hasTippy,
  cleanDocumentBody,
  withPopperInstanceOnInit,
  IDENTIFIER
} from '../utils'

import * as Utils from '../../src/js/utils'

afterEach(cleanDocumentBody)

describe('toArray', () => {
  it('converts a NodeList to an array', () => {
    // NOTE: Side effect here.
    createArrayOfReferenceElements({ appendToBody: true })
    const arr = Utils.toArray(document.querySelectorAll(IDENTIFIER))
    expect(Array.isArray(arr)).toBe(true)
  })
})
