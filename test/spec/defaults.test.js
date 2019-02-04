import { h, cleanDocumentBody, withTestOptions, wait } from '../utils'
import tippy from '../../src/js/index'
import { getChildren } from '../../src/js/popper'

afterEach(cleanDocumentBody)

const HIDE_DELAY = 21

describe('a11y', () => {
  it('false: it does not add `tabindex` attribute if ref is not focusable', () => {
    const ref = h()
    tippy(ref, { a11y: false })
    expect(ref.hasAttribute('tabindex')).toBe(false)
  })

  it('true: it does add `tabindex` attribute if ref is not focusable', () => {
    const ref = h()
    tippy(ref, { a11y: true })
    expect(ref.getAttribute('tabindex')).toBe('0')
  })

  it('true: it does not add `tabindex` attribute to already-focusable elements', () => {
    const a = h('a')
    a.href = '#'
    tippy(a, { a11y: true })
    expect(a.hasAttribute('tabindex')).toBe(false)
  })
})

describe('allowHTML', () => {
  it('false: it does not allow html content inside tooltip', () => {
    const ref = h()
    const { popper } = tippy(ref, {
      content: '<strong>content</strong>',
      allowHTML: false,
    })
    expect(getChildren(popper).content.querySelector('strong')).toBeNull()
  })

  it('true: it allows html content inside tooltip', () => {
    const ref = h()
    const { popper } = tippy(
      ref,
      withTestOptions({
        content: '<strong>content</strong>',
        allowHTML: true,
      }),
    )
    expect(getChildren(popper).content.querySelector('strong')).not.toBeNull()
  })
})

describe('placement', () => {
  it('is within popper config correctly', () => {
    const ref = h()
    const { popperInstance } = tippy(
      ref,
      withTestOptions({ placement: 'left-end' }),
    )
    expect(popperInstance.options.placement).toBe('left-end')
  })
})

describe('arrow', () => {
  it('true: creates an arrow element child of the popper', () => {
    const ref = h()
    const { popper } = tippy(ref, { arrow: true })
    expect(getChildren(popper).arrow).not.toBeNull()
  })

  it('true: disables `animateFill` option', () => {
    const ref = h()
    const { props } = tippy(ref, { arrow: true })
    expect(props.animateFill).toBe(false)
  })

  it('false: does not create an arrow element child of the popper', () => {
    const ref = h()
    const { popper } = tippy(ref, { arrow: false })
    expect(getChildren(popper).arrow).toBeNull()
  })
})

describe('animateFill', () => {
  it('true: sets `data-animatefill` attribute on tooltip', () => {
    const ref = h()
    const { popper } = tippy(ref, { animateFill: true })
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      true,
    )
  })

  it('false: does not set `data-animatefill` attribute on tooltip', () => {
    const ref = h()
    const { popper } = tippy(ref, { animateFill: false })
    expect(getChildren(popper).tooltip.hasAttribute('data-animatefill')).toBe(
      false,
    )
  })
})

describe('animation', () => {
  it('sets the data-animation attribute on the tooltip', () => {
    const animation = 'scale'
    const { tooltip } = tippy(h(), {
      animation,
    }).popperChildren
    expect(tooltip.getAttribute('data-animation')).toBe(animation)
  })
})

describe('delay', () => {
  // NOTE: props.trigger dependency here
  it('number: delays showing the tippy', async () => {
    const delay = 20
    const ref = h()
    const { state } = tippy(ref, {
      trigger: 'mouseenter',
      delay,
    })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
    await wait(delay * 2)
    expect(state.isVisible).toBe(true)
  })

  it('number: delays hiding the tippy', async () => {
    const delay = 20
    const ref = h()
    const { state } = tippy(ref, {
      trigger: 'mouseenter',
      delay,
    })
    ref.dispatchEvent(new Event('mouseenter'))
    await wait(delay * 2)
    ref.dispatchEvent(new Event('mouseleave'))
    expect(state.isVisible).toBe(true)
    await wait(delay * 2)
    expect(state.isVisible).toBe(false)
  })

  it('array: uses the first element as the delay when showing', async () => {
    const delay = [20, 100]
    const ref = h()
    const { state } = tippy(ref, {
      trigger: 'mouseenter',
      delay,
    })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
    await wait(delay[0] * 2)
    expect(state.isVisible).toBe(true)
  })

  it('array: uses the second element as the delay when hiding', async () => {
    const delay = [100, 20]
    const ref = h()
    const { state } = tippy(ref, {
      trigger: 'mouseenter',
      delay,
    })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
    await wait(delay[0] * 2)
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('mouseleave'))
    await wait(delay[1] * 2)
    expect(state.isVisible).toBe(false)
  })
})

describe('content', () => {
  it('works with plain string', () => {
    const { content } = tippy(h(), {
      content: 'tooltip',
    }).popperChildren
    expect(content.textContent).toBe('tooltip')
  })

  it('works with HTML string', () => {
    const { content } = tippy(h(), {
      content: '<strong>tooltip</strong>',
    }).popperChildren
    expect(content.querySelector('strong')).not.toBeNull()
  })

  it('works with an HTML element', () => {
    const el = document.createElement('div')
    const { content } = tippy(h(), {
      content: el,
    }).popperChildren
    expect(content.firstElementChild).toBe(el)
  })
})

describe('trigger', () => {
  it('default: many triggers', async () => {
    const ref = h()
    const { state } = tippy(ref)
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('mouseleave'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
    ref.dispatchEvent(new Event('focus'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('blur'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })

  it('mouseenter', async () => {
    const ref = h()
    const { state } = tippy(ref, { trigger: 'mouseenter' })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('mouseleave'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })

  it('focus', async () => {
    const ref = h()
    const { state } = tippy(ref, { trigger: 'focus' })
    ref.dispatchEvent(new Event('focus'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('blur'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })

  it('click', async () => {
    const ref = h()
    const { state } = tippy(ref, { trigger: 'click' })
    ref.dispatchEvent(new Event('click'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('click'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })
})

describe('interactive', () => {
  it('true: prevents a tippy from hiding when clicked', () => {
    const tip = tippy(h(), {
      interactive: true,
    })
    tip.show()
    tip.popperChildren.tooltip.dispatchEvent(new Event('click'))
    expect(tip.state.isVisible).toBe(true)
  })

  it('false: tippy is hidden when clicked', async () => {
    const tip = tippy(h(), {
      interactive: false,
    })
    tip.show()
    tip.popperChildren.tooltip.dispatchEvent(
      new Event('click', { bubbles: true }),
    )
    await wait(HIDE_DELAY)
    expect(tip.state.isVisible).toBe(false)
  })
})

describe('arrowType', () => {
  it('sharp: is CSS triangle', () => {
    const { popperChildren } = tippy(h(), {
      arrow: true,
      arrowType: 'sharp',
    })
    expect(popperChildren.arrow.matches('.tippy-arrow')).toBe(true)
  })

  it('round: is an SVG', () => {
    const { popperChildren } = tippy(h(), {
      arrow: true,
      arrowType: 'round',
    })
    expect(popperChildren.arrow.matches('.tippy-roundarrow')).toBe(true)
  })
})

describe('theme', () => {
  it('adds themes to the tooltip class list', () => {
    const {
      popperChildren: { tooltip },
    } = tippy(h(), {
      theme: 'this is a test',
    })
    expect(tooltip.classList.contains('this-theme')).toBe(true)
    expect(tooltip.classList.contains('is-theme')).toBe(true)
    expect(tooltip.classList.contains('a-theme')).toBe(true)
    expect(tooltip.classList.contains('test-theme')).toBe(true)
  })
})

describe('role', () => {
  it('sets "role" attribute to popper element', () => {
    const { popper: a } = tippy(h(), { role: 'menu' })
    expect(a.getAttribute('role')).toBe('menu')
    const { popper: b } = tippy(h(), { role: null })
    expect(b.hasAttribute('role')).toBe(false)
  })

  it('is updated correctly by .set()', () => {
    const instance = tippy(h(), { role: 'tooltip' })
    instance.set({ role: 'menu' })
    expect(instance.popper.getAttribute('role')).toBe('menu')
    instance.set({ role: null })
    expect(instance.popper.hasAttribute('role')).toBe(false)
  })
})

describe('flip', () => {
  it('true: sets flip to enabled in the popperInstance', () => {
    const { popperInstance } = tippy(h(), withTestOptions({ flip: true }))
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      true,
    )
  })

  it('false: sets flip to disabled in the popperInstance', () => {
    const { popperInstance } = tippy(h(), withTestOptions({ flip: false }))
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      false,
    )
  })
})

describe('flipBehavior', () => {
  it('sets the value in the popperInstance', () => {
    const { popperInstance } = tippy(
      h(),
      withTestOptions({ flipBehavior: ['top', 'bottom', 'left'] }),
    )
    expect(
      popperInstance.modifiers.find(m => m.name === 'flip').behavior,
    ).toEqual(['top', 'bottom', 'left'])
  })
})

describe('ignoreAttributes', () => {
  it('false: looks at data-tippy-* options', () => {
    const { props } = tippy(h('div', { 'data-tippy-arrow': true }), {
      ignoreAttributes: false,
    })
    expect(props.arrow).toBe(true)
  })

  it('true: ignores data-tippy-* options', () => {
    const { props } = tippy(h('div', { 'data-tippy-arrow': true }), {
      ignoreAttributes: true,
    })
    expect(props.arrow).toBe(false)
  })
})

describe('inertia', () => {
  it('true: adds a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: { tooltip },
    } = tippy(h(), { inertia: true })
    expect(tooltip.hasAttribute('data-inertia')).toBe(true)
  })

  it('false: does not add a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: { tooltip },
    } = tippy(h(), { inertia: false })
    expect(tooltip.hasAttribute('data-inertia')).toBe(false)
  })
})

describe('multiple', () => {
  it('true: allows multiple tippys to be created on a single reference', () => {
    const ref = h()
    expect(
      [...Array(5)].map(() => tippy(ref, { multiple: true })).filter(Boolean)
        .length,
    ).toBe(5)
  })

  it('false: does not allow multiple tippys to be created on a single reference', () => {
    const ref = h()
    expect(
      [...Array(5)].map(() => tippy(ref, { multiple: false })).filter(Boolean)
        .length,
    ).toBe(1)
  })
})

describe('zIndex', () => {
  it('sets the z-index CSS property on the popper', () => {
    const { popper } = tippy(h(), { zIndex: 82190 })
    expect(popper.style.zIndex).toBe('82190')
  })
})

describe('followCursor', () => {
  it('follows the mouse cursor', () => {
    const instance = tippy(h(), { followCursor: true })
    instance.show(0)
    document.dispatchEvent(
      new Event('mousemove', {
        clientX: 55,
        clientY: 55,
      }),
    )
  })
})

describe('target', () => {
  // !
})

describe('onShow', () => {
  it('is called on show, passed the instance as an argument', () => {
    const spy = jest.fn()
    const instance = tippy(h(), { onShow: spy })
    instance.show()
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })

  it('prevents the the tooltip from showing if it returns `false`', () => {
    const instance = tippy(h(), { onShow: () => false })
    instance.show()
    expect(instance.state.isVisible).toBe(false)
  })
})

describe('onMount', () => {
  it('is called once the tooltip is mounted to the DOM', done => {
    const instance = tippy(h(), {
      onMount: tip => {
        expect(tip).toBe(instance)
        expect(document.documentElement.contains(tip.popper)).toBe(true)
        done()
      },
      duration: 0,
    })
    instance.show()
  })
})

describe('onShown', () => {
  it('is called on transition end of show, passed the instance as an argument', async () => {
    const spy = jest.fn()
    const instance = tippy(h(), { onShown: spy, duration: 0 })
    instance.show()
    await wait(1)
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })
})

describe('onHide', () => {
  it('is called on hide, passed the instance as an argument', () => {
    const spy = jest.fn()
    const instance = tippy(h(), { onHide: spy })
    instance.hide()
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })

  it('prevents the the tooltip from hiding if it returns `false`', () => {
    const instance = tippy(h(), { onHide: () => false })
    instance.show()
    instance.hide()
    expect(instance.state.isVisible).toBe(true)
  })
})

describe('onHidden', () => {
  it('is called on transition end of hide, passed the instance as an argument', async () => {
    const spy = jest.fn()
    const instance = tippy(h(), { onHidden: spy, duration: 0 })
    instance.show()
    instance.hide()
    await wait(1)
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })
})

describe('wait', () => {
  it('waits until the user manually shows the tooltip', () => {
    const ref = h()
    const wait = jest.fn()
    const tip = tippy(ref, { wait })
    ref.dispatchEvent(new MouseEvent('mouseenter'))
    expect(typeof wait.mock.calls[0][0].show).toBe('function')
    expect(typeof wait.mock.calls[0][1].type).toBe('string')
    expect(tip.state.isVisible).toBe(false)
  })
})

describe('popperOptions', () => {
  it('top level', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      popperOptions: {
        anything: true,
      },
    })
    expect(popperInstance.options.anything).toBe(true)
  })

  it('modifiers', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          preventOverflow: {
            escapeWithReference: true,
          },
        },
      },
    })
    expect(
      popperInstance.options.modifiers.preventOverflow.escapeWithReference,
    ).toBe(true)
  })

  it('modifiers.preventOverflow', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          preventOverflow: {
            test: true,
          },
        },
      },
    })
    expect(popperInstance.options.modifiers.preventOverflow.test).toBe(true)
  })

  it('modifiers.arrow', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          arrow: {
            test: true,
          },
        },
      },
    })
    expect(popperInstance.options.modifiers.arrow.test).toBe(true)
  })

  it('modifiers.flip', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          flip: {
            test: true,
          },
        },
      },
    })
    expect(popperInstance.options.modifiers.flip.test).toBe(true)
  })

  it('modifiers.offset', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          offset: {
            test: true,
          },
        },
      },
    })
    expect(popperInstance.options.modifiers.offset.test).toBe(true)
  })
})

describe('maxWidth', () => {
  it('adds the value to tooltip.style.maxWidth', () => {
    const pxTip = tippy(h(), { maxWidth: '100px' })
    expect(pxTip.popperChildren.tooltip.style.maxWidth).toBe('100px')
    const remTip = tippy(h(), { maxWidth: '100rem' })
    expect(remTip.popperChildren.tooltip.style.maxWidth).toBe('100rem')
  })

  it('auto-adds "px" to a number', () => {
    const numTip = tippy(h(), { maxWidth: 100 })
    expect(numTip.popperChildren.tooltip.style.maxWidth).toBe('100px')
  })
})

describe('aria', () => {
  it('sets the correct attribute on the reference', async () => {
    const ref = h()
    const tip = tippy(ref, { aria: 'labelledby', duration: 0 })
    tip.show()
    await wait(1)
    expect(ref.getAttribute('aria-labelledby')).toBe(tip.popper.id)
  })

  it('removes the attribute on hide', async () => {
    const ref = h()
    const tip = tippy(ref, { aria: 'labelledby', duration: 0 })
    tip.show()
    await wait(1)
    tip.hide()
    expect(ref.getAttribute('aria-labelledby')).toBe(null)
  })

  it('does not set attribute for falsy/null value', async () => {
    const ref = h()
    const tip = tippy(ref, { aria: null, duration: 0 })
    tip.show()
    await wait(1)
    expect(ref.getAttribute('aria-null')).toBe(null)
    expect(ref.getAttribute('aria-describedby')).toBe(null)
  })
})

describe('boundary', () => {
  it('sets the `boundariesElement` property in popperInstance', () => {
    const { popperInstance } = tippy(h(), {
      lazy: false,
      boundary: 'example',
    })
    expect(
      popperInstance.options.modifiers.preventOverflow.boundariesElement,
    ).toBe('example')
  })
})
