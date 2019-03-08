import { h } from '../utils'
import { evaluateProps, validateOptions } from '../../src/props'

describe('evaluateProps', () => {
  it('sets `animateFill` option to false if `arrow` is true', () => {
    const props = { animateFill: true, arrow: true }
    expect(evaluateProps(h(), props)).toEqual({
      animateFill: false,
      arrow: true,
    })
  })

  it('sets `animateFill` option to false if `arrow` is true (data attribute)', () => {
    const ref = h()
    ref.setAttribute('data-tippy-arrow', 'true')
    expect(evaluateProps(ref, { animateFill: true })).toEqual({
      arrow: true,
      animateFill: false,
    })
  })

  it('ignores attributes if `ignoreAttributes: true`', () => {
    const props = { animation: 'scale', ignoreAttributes: true }
    const reference = h()
    reference.setAttribute('data-tippy-animation', 'fade')
    expect(evaluateProps(reference, props)).toEqual({
      animation: 'scale',
      ignoreAttributes: true,
    })
  })

  it('does not ignore attributes if `ignoreAttributes: false`', () => {
    const props = { animation: 'scale', ignoreAttributes: false }
    const reference = h()
    reference.setAttribute('data-tippy-animation', 'fade')
    expect(evaluateProps(reference, props)).toEqual({
      animation: 'fade',
      ignoreAttributes: false,
    })
  })
})

describe('validateOptions', () => {
  it('does nothing if valid options were passed', () => {
    expect(() =>
      validateOptions(
        { arrow: true, arrowType: 'round' },
        { arrow: false, arrowType: 'sharp' },
      ),
    ).not.toThrow()
  })

  it('throws with the correct message if invalid options were passed', () => {
    expect(() =>
      validateOptions({ intractive: true }, { interactive: false }),
    ).toThrow('[tippy]: `intractive` is not a valid option')
  })
})
