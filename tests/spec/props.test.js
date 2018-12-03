import { h, hasTippy, cleanDocumentBody, withTestOptions, wait } from '../utils'

import tippy from '../../src/js/index'
import { getChildren } from '../../src/js/popper'
import { evaluateProps, validateOptions } from '../../src/js/props'

describe('evaluateProps', () => {
  it('sets `animateFill` option to false if `arrow` is true', () => {
    const props = { animateFill: true, arrow: true }
    expect(evaluateProps(h(), props)).toEqual({
      animateFill: false,
      arrow: true
    })
  })

  it('sets `props.appendTo` to be the return value of calling it if a function', () => {
    const ref = h()
    const props = {
      appendTo: reference => reference
    }
    expect(evaluateProps(ref, props).appendTo).toBe(ref)
  })

  it('sets `props.content` to be the return value of calling it if a function', () => {
    const ref = h()
    const props = {
      content: reference => reference
    }
    expect(evaluateProps(ref, props).content).toBe(ref)
  })
})

describe('validateOptions', () => {
  it('does nothing if valid options were passed', () => {
    expect(() =>
      validateOptions(
        { arrow: true, arrowType: 'round' },
        { arrow: false, arrowType: 'sharp' }
      )
    ).not.toThrow()
  })

  it('throws with the correct message if invalid options were passed', () => {
    expect(() =>
      validateOptions({ intractive: true }, { interactive: false })
    ).toThrow('[tippy]: `intractive` is not a valid option')
  })
})
