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

/**
 * NOTE! If an element is not on the DOM, calling show() will destroy the tooltip.
 * Use { appendToBody: true } as the argument to createReference().
 */

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
    const { props } = tippy.one(ref, { arrow: true })
    expect(props.animateFill).toBe(false)
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

describe('animation', () => {
  it('sets the data-animation attribute on the tooltip', () => {
    const animation = 'scale'
    const { tooltip } = tippy.one(createReference(), {
      animation
    }).popperChildren
    expect(tooltip.getAttribute('data-animation')).toBe(animation)
  })
})

describe('delay', () => {
  // NOTE: props.trigger dependency here
  it('number: delays showing the tippy', done => {
    const delay = 20
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
    })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
    setTimeout(() => {
      expect(state.isVisible).toBe(true)
      done()
    }, delay * 2)
  })

  it('number: delays hiding the tippy', done => {
    const delay = 20
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
    })

    ref.dispatchEvent(new Event('mouseenter'))

    setTimeout(() => {
      ref.dispatchEvent(new Event('mouseleave'))
      expect(state.isVisible).toBe(true)
      setTimeout(() => {
        expect(state.isVisible).toBe(false)
        done()
      }, delay * 2)
    }, delay * 2)
  })

  it('array: uses the first element as the delay when showing', () => {
    const delay = [20, 100]
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
    })

    ref.dispatchEvent(new Event('mouseenter'))

    expect(state.isVisible).toBe(false)

    setTimeout(() => {
      expect(state.isVisible).toBe(true)
      done()
    }, delay[0] * 2)
  })

  it('array: uses the second element as the delay when hiding', () => {
    const delay = [100, 20]
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
    })

    ref.dispatchEvent(new Event('mouseenter'))

    expect(state.isVisible).toBe(false)

    setTimeout(() => {
      expect(state.isVisible).toBe(true)
      setTimeout(() => {
        expect(state.isVisible).toBe(false)
        done()
      }, delay[1] * 2)
    }, delay[0] * 2)
  })
})

describe('content', () => {
  it('works with plain string', () => {
    const { content } = tippy.one(createReference(), {
      content: 'tooltip'
    }).popperChildren
    expect(content.textContent).toBe('tooltip')
  })

  it('works with HTML string', () => {
    const { content } = tippy.one(createReference(), {
      content: '<strong>tooltip</strong>'
    }).popperChildren
    expect(content.querySelector('strong')).not.toBeNull()
  })

  it('works with an HTML element', () => {
    const el = document.createElement('div')
    const { content } = tippy.one(createReference(), {
      content: el
    }).popperChildren
    expect(content.firstElementChild).toBe(el)
  })
})

describe('trigger', () => {
  it('default: many triggers', () => {
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref)
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('mouseleave'))
    expect(state.isVisible).toBe(false)
    ref.dispatchEvent(new Event('focus'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('blur'))
    expect(state.isVisible).toBe(false)
  })

  it('mouseenter', () => {
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, { trigger: 'mouseenter' })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('mouseleave'))
    expect(state.isVisible).toBe(false)
    ref.dispatchEvent(new Event('focus'))
    expect(state.isVisible).toBe(false)
  })

  it('focus', () => {
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, { trigger: 'focus' })
    ref.dispatchEvent(new Event('focus'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('blur'))
    expect(state.isVisible).toBe(false)
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
  })

  it('click', () => {
    const ref = createReference({ appendToBody: true })
    const { state } = tippy.one(ref, { trigger: 'click' })
    ref.dispatchEvent(new Event('click'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('click'))
    expect(state.isVisible).toBe(false)
  })
})

describe('interactive', () => {
  it('true: prevents a tippy from hiding when clicked', () => {
    const tip = tippy.one(createReference({ appendToBody: true }), {
      interactive: true
    })
    tip.show()
    tip.popperChildren.tooltip.dispatchEvent(new Event('click'))
    expect(tip.state.isVisible).toBe(true)
  })

  it('false: tippy is hidden when clicked', () => {
    const tip = tippy.one(createReference({ appendToBody: true }), {
      interactive: true
    })
    tip.show()
    tip.popperChildren.tooltip.dispatchEvent(new Event('click'))
    setTimeout(() => {
      expect(tip.state.isVisible).toBe(false)
    })
  })
})

describe('arrowType', () => {
  it('sharp: is CSS triangle', () => {
    const { popperChildren } = tippy.one(createReference(), {
      arrow: true,
      arrowType: 'sharp'
    })
    expect(popperChildren.arrow.matches('.tippy-arrow')).toBe(true)
  })

  it('round: is an SVG', () => {
    const { popperChildren } = tippy.one(createReference(), {
      arrow: true,
      arrowType: 'round'
    })
    expect(popperChildren.arrow.matches('.tippy-roundarrow')).toBe(true)
  })
})

describe('theme', () => {
  it('adds themes to the tooltip class list', () => {
    const {
      popperChildren: { tooltip }
    } = tippy.one(createReference(), {
      theme: 'this is a test'
    })
    expect(tooltip.classList.contains('this-theme')).toBe(true)
    expect(tooltip.classList.contains('is-theme')).toBe(true)
    expect(tooltip.classList.contains('a-theme')).toBe(true)
    expect(tooltip.classList.contains('test-theme')).toBe(true)
  })
})

describe('flip', () => {
  it('true: sets flip to enabled in the popperInstance', () => {
    const { popperInstance } = tippy.one(
      createReference(),
      withTestOptions({ flip: true })
    )
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      true
    )
  })

  it('false: sets flip to disabled in the popperInstance', () => {
    const { popperInstance } = tippy.one(
      createReference(),
      withTestOptions({ flip: false })
    )
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      false
    )
  })
})

describe('inertia', () => {
  it('true: adds a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: { tooltip }
    } = tippy.one(createReference(), { inertia: true })
    expect(tooltip.hasAttribute('data-inertia')).toBe(true)
  })

  it('false: does not add a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: { tooltip }
    } = tippy.one(createReference(), { inertia: false })
    expect(tooltip.hasAttribute('data-inertia')).toBe(false)
  })
})
