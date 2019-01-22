import Defaults from '../../src/js/defaults'
import computeArrowTransform, * as Utils from '../../src/js/deprecated_computeArrowTransform'
import { createPopperElement, getChildren } from '../../src/js/popper'

describe('transformAxisBasedOnPlacement', () => {
  it('uses the original axis if the placement is vertical', () => {
    const isVertical = true
    expect(Utils.transformAxisBasedOnPlacement('X', isVertical)).toBe('X')
    expect(Utils.transformAxisBasedOnPlacement('Y', isVertical)).toBe('Y')
  })

  it('uses the opposite axis if the placement is not vertical', () => {
    const isVertical = false
    expect(Utils.transformAxisBasedOnPlacement('X', isVertical)).toBe('Y')
    expect(Utils.transformAxisBasedOnPlacement('Y', isVertical)).toBe('X')
  })

  it('returns an empty string for no arguments', () => {
    expect(Utils.transformAxisBasedOnPlacement()).toBe('')
  })
})

describe('transformNumbersBasedOnPlacement', () => {
  const fn = Utils.transformNumbersBasedOnPlacement
  const TOP = [true, false]
  const BOTTOM = [true, true]
  const LEFT = [false, false]
  const RIGHT = [false, true]

  describe('translate', () => {
    // multi axis
    it('multi axis: placement = top', () => {
      expect(fn('translate', [9, 3], ...TOP)).toEqual('9px, 3px')
    })

    it('multi axis: placement = bottom', () => {
      expect(fn('translate', [9, 3], ...BOTTOM)).toEqual('9px, -3px')
    })

    it('multi axis: placement = left', () => {
      expect(fn('translate', [9, 3], ...LEFT)).toEqual('3px, 9px')
    })

    it('multi axis: placement = right', () => {
      expect(fn('translate', [9, 3], ...RIGHT)).toEqual('-3px, 9px')
    })

    // single axis
    it('single axis: placement = top', () => {
      expect(fn('translate', [9], ...TOP)).toEqual('9px')
    })

    it('single axis: placement = bottom', () => {
      expect(fn('translate', [9], ...BOTTOM)).toEqual('-9px')
    })

    it('single axis: placement = left', () => {
      expect(fn('translate', [9], ...LEFT)).toEqual('9px')
    })

    it('single axis: placement = right', () => {
      expect(fn('translate', [9], ...RIGHT)).toEqual('-9px')
    })
  })

  describe('scale', () => {
    // multi axis
    it('multi axis: placement = top', () => {
      expect(fn('scale', [9, 3], ...TOP)).toEqual('9, 3')
    })

    it('multi axis: placement = bottom', () => {
      expect(fn('scale', [9, 3], ...BOTTOM)).toEqual('9, 3')
    })

    it('multi axis: placement = left', () => {
      expect(fn('scale', [9, 3], ...LEFT)).toEqual('3, 9')
    })

    it('multi axis: placement = right', () => {
      expect(fn('scale', [9, 3], ...RIGHT)).toEqual('3, 9')
    })

    // single axis
    it('single axis: placement = top', () => {
      expect(fn('scale', [9], ...TOP)).toEqual('9')
    })

    it('single axis: placement = bottom', () => {
      expect(fn('scale', [9], ...BOTTOM)).toEqual('9')
    })

    it('single axis: placement = left', () => {
      expect(fn('scale', [9], ...LEFT)).toEqual('9')
    })

    it('single axis: placement = right', () => {
      expect(fn('scale', [9], ...RIGHT)).toEqual('9')
    })
  })
})

describe('getTransformAxis', () => {
  const fn = Utils.getTransformAxis

  it('returns the X axis correctly for translate', () => {
    expect(fn('translateX(2px)', 'translate')).toBe('X')
    expect(fn('translateX(2px) scaleY(5)', 'translate')).toBe('X')
    expect(fn('scaleY(5) translateX(2px)', 'translate')).toBe('X')
  })

  it('returns the X axis correctly for scale', () => {
    expect(fn('scaleX(2)', 'scale')).toBe('X')
    expect(fn('scaleX(2) translateY(2px)', 'scale')).toBe('X')
    expect(fn('translateY(2px) scaleX(2)', 'scale')).toBe('X')
  })

  it('returns the Y axis correctly for translate', () => {
    expect(fn('translateY(2px)', 'translate')).toBe('Y')
    expect(fn('scaleX(2) translateY(2px)', 'translate')).toBe('Y')
    expect(fn('translateY(2px) scaleX(2)', 'translate')).toBe('Y')
  })

  it('returns the Y axis correctly for scale', () => {
    expect(fn('scaleY(2)', 'scale')).toBe('Y')
    expect(fn('translateX(2px) scaleY(2)', 'scale')).toBe('Y')
    expect(fn('scaleY(2) translateX(2px)', 'scale')).toBe('Y')
  })
})

describe('getTransformNumbers', () => {
  const fn = Utils.getTransformNumbers
  const RE = Utils.TRANSFORM_NUMBER_RE

  it('returns the correct numbers for translate: single axis (X)', () => {
    expect(fn('translateX(-5px)', RE.translate)).toEqual([-5])
  })

  it('returns the correct numbers for translate: single axis (Y)', () => {
    expect(fn('translateY(84px)', RE.translate)).toEqual([84])
  })

  it('returns the correct numbers for translate: multi axis', () => {
    expect(fn('translate(24px, 82px)', RE.translate)).toEqual([24, 82])
  })

  it('returns the correct numbers for scale: single axis (X)', () => {
    expect(fn('scaleX(-2)', RE.scale)).toEqual([-2])
  })

  it('returns the correct numbers for scale: single axis (Y)', () => {
    expect(fn('scaleY(3)', RE.scale)).toEqual([3])
  })

  it('returns the correct numbers for scale: multi axis', () => {
    expect(fn('scale(2, 5)', RE.scale)).toEqual([2, 5])
  })
})

describe('computeArrowTransform', () => {
  it('placement = top', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'top')
    const { arrow } = getChildren(popper)
    computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })

  it('placement = bottom', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'bottom')
    const { arrow } = getChildren(popper)
    computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })

  it('placement = left', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'bottom')
    const { arrow } = getChildren(popper)
    computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })

  it('placement = right', () => {
    const popper = createPopperElement(1, { ...Defaults, arrow: true })
    popper.setAttribute('x-placement', 'bottom')
    const { arrow } = getChildren(popper)
    computeArrowTransform(arrow, 'scale(5, 10)')
    expect(arrow.style.transform).toBe('scale(5, 10)')
  })
})
