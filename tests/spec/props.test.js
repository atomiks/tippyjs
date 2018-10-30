import { h, hasTippy, cleanDocumentBody, withTestOptions, wait } from '../utils'

import tippy from '../../src/js/tippy'
import * as Utils from '../../src/js/utils'

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
    const { popper } = tippy.one(ref, {
      content: '<strong>content</strong>',
      allowHTML: false
    })
    expect(Utils.getChildren(popper).content.querySelector('strong')).toBeNull()
  })

  it('true: it allows html content inside tooltip', () => {
    const ref = h()
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
    const ref = h()
    const { popperInstance } = tippy.one(
      ref,
      withTestOptions({ placement: 'left-end' })
    )
    expect(popperInstance.options.placement).toBe('left-end')
  })
})

describe('arrow', () => {
  it('true: creates an arrow element child of the popper', () => {
    const ref = h()
    const { popper } = tippy.one(ref, { arrow: true })
    expect(Utils.getChildren(popper).arrow).not.toBeNull()
  })

  it('true: disables `animateFill` option', () => {
    const ref = h()
    const { props } = tippy.one(ref, { arrow: true })
    expect(props.animateFill).toBe(false)
  })

  it('false: does not create an arrow element child of the popper', () => {
    const ref = h()
    const { popper } = tippy.one(ref, { arrow: false })
    expect(Utils.getChildren(popper).arrow).toBeNull()
  })
})

describe('arrowTransform', () => {
  it('sets the transform property on the arrow element', () => {
    const {
      popperChildren: { arrow },
      popperInstance
    } = tippy.one(h(), {
      lazy: false,
      arrow: true,
      arrowTransform: 'translateX(5px) scale(2)'
    })

    popperInstance.options.onCreate()
    expect(arrow.style.transform).toBe('translateX(5px) scale(2)')
  })
})

describe('animateFill', () => {
  it('true: sets `data-animatefill` attribute on tooltip', () => {
    const ref = h()
    const { popper } = tippy.one(ref, { animateFill: true })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(true)
  })

  it('false: does not set `data-animatefill` attribute on tooltip', () => {
    const ref = h()
    const { popper } = tippy.one(ref, { animateFill: false })
    expect(
      Utils.getChildren(popper).tooltip.hasAttribute('data-animatefill')
    ).toBe(false)
  })
})

describe('animation', () => {
  it('sets the data-animation attribute on the tooltip', () => {
    const animation = 'scale'
    const { tooltip } = tippy.one(h(), {
      animation
    }).popperChildren
    expect(tooltip.getAttribute('data-animation')).toBe(animation)
  })
})

describe('delay', () => {
  // NOTE: props.trigger dependency here
  it('number: delays showing the tippy', async () => {
    const delay = 20
    const ref = h()
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
    })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
    await wait(delay * 2)
    expect(state.isVisible).toBe(true)
  })

  it('number: delays hiding the tippy', async () => {
    const delay = 20
    const ref = h()
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
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
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
    })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(false)
    await wait(delay[0] * 2)
    expect(state.isVisible).toBe(true)
  })

  it('array: uses the second element as the delay when hiding', async () => {
    const delay = [100, 20]
    const ref = h()
    const { state } = tippy.one(ref, {
      trigger: 'mouseenter',
      delay
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
    const { content } = tippy.one(h(), {
      content: 'tooltip'
    }).popperChildren
    expect(content.textContent).toBe('tooltip')
  })

  it('works with HTML string', () => {
    const { content } = tippy.one(h(), {
      content: '<strong>tooltip</strong>'
    }).popperChildren
    expect(content.querySelector('strong')).not.toBeNull()
  })

  it('works with an HTML element', () => {
    const el = document.createElement('div')
    const { content } = tippy.one(h(), {
      content: el
    }).popperChildren
    expect(content.firstElementChild).toBe(el)
  })
})

describe('trigger', () => {
  it('default: many triggers', async () => {
    const ref = h()
    const { state } = tippy.one(ref)
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
    const { state } = tippy.one(ref, { trigger: 'mouseenter' })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('mouseleave'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })

  it('focus', async () => {
    const ref = h()
    const { state } = tippy.one(ref, { trigger: 'focus' })
    ref.dispatchEvent(new Event('focus'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('blur'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })

  it('click', async () => {
    const ref = h()
    const { state } = tippy.one(ref, { trigger: 'click' })
    ref.dispatchEvent(new Event('click'))
    expect(state.isVisible).toBe(true)
    ref.dispatchEvent(new Event('click'))
    await wait(HIDE_DELAY)
    expect(state.isVisible).toBe(false)
  })
})

describe('interactive', () => {
  it('true: prevents a tippy from hiding when clicked', () => {
    const tip = tippy.one(h(), {
      interactive: true
    })
    tip.show()
    tip.popperChildren.tooltip.dispatchEvent(new Event('click'))
    expect(tip.state.isVisible).toBe(true)
  })

  it('false: tippy is hidden when clicked', async () => {
    const tip = tippy.one(h(), {
      interactive: false
    })
    tip.show()
    tip.popperChildren.tooltip.dispatchEvent(
      new Event('click', { bubbles: true })
    )
    await wait(HIDE_DELAY)
    expect(tip.state.isVisible).toBe(false)
  })
})

describe('arrowType', () => {
  it('sharp: is CSS triangle', () => {
    const { popperChildren } = tippy.one(h(), {
      arrow: true,
      arrowType: 'sharp'
    })
    expect(popperChildren.arrow.matches('.tippy-arrow')).toBe(true)
  })

  it('round: is an SVG', () => {
    const { popperChildren } = tippy.one(h(), {
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
    } = tippy.one(h(), {
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
    const { popperInstance } = tippy.one(h(), withTestOptions({ flip: true }))
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      true
    )
  })

  it('false: sets flip to disabled in the popperInstance', () => {
    const { popperInstance } = tippy.one(h(), withTestOptions({ flip: false }))
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      false
    )
  })
})

describe('flipBehavior', () => {
  it('sets the value in the popperInstance', () => {
    const { popperInstance } = tippy.one(
      h(),
      withTestOptions({ flipBehavior: ['top', 'bottom', 'left'] })
    )
    expect(
      popperInstance.modifiers.find(m => m.name === 'flip').behavior
    ).toEqual(['top', 'bottom', 'left'])
  })
})

describe('performance', () => {
  it('false: looks at data-tippy-* options', () => {
    const { props } = tippy.one(h('div', { 'data-tippy-arrow': true }), {
      performance: false
    })
    expect(props.arrow).toBe(true)
  })

  it('true: ignores data-tippy-* options', () => {
    const { props } = tippy.one(h('div', { 'data-tippy-arrow': true }), {
      performance: true
    })
    expect(props.arrow).toBe(false)
  })
})

describe('inertia', () => {
  it('true: adds a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: { tooltip }
    } = tippy.one(h(), { inertia: true })
    expect(tooltip.hasAttribute('data-inertia')).toBe(true)
  })

  it('false: does not add a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: { tooltip }
    } = tippy.one(h(), { inertia: false })
    expect(tooltip.hasAttribute('data-inertia')).toBe(false)
  })
})

describe('multiple', () => {
  it('true: allows multiple tippys to be created on a single reference', () => {
    const ref = h()
    expect(
      [...Array(5)]
        .map(() => tippy.one(ref, { multiple: true }))
        .filter(Boolean).length
    ).toBe(5)
  })

  it('false: does not allow multiple tippys to be created on a single reference', () => {
    const ref = h()
    expect(
      [...Array(5)]
        .map(() => tippy.one(ref, { multiple: false }))
        .filter(Boolean).length
    ).toBe(1)
  })
})

describe('zIndex', () => {
  it('sets the z-index CSS property on the popper', () => {
    const { popper } = tippy.one(h(), { zIndex: 82190 })
    expect(popper.style.zIndex).toBe('82190')
  })
})

describe('followCursor', () => {
  it('follows the mouse cursor', () => {
    const instance = tippy.one(h(), { followCursor: true })
    instance.show(0)
    document.dispatchEvent(
      new Event('mousemove', {
        clientX: 55,
        clientY: 55
      })
    )
  })
})

describe('target', () => {
  // !
})

describe('onShow', () => {
  it('is called on show, passed the instance as an argument', () => {
    const spy = jest.fn()
    const instance = tippy.one(h(), { onShow: spy })
    instance.show()
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })

  it('prevents the the tooltip from showing if it returns `false`', () => {
    const instance = tippy.one(h(), { onShow: () => false })
    instance.show()
    expect(instance.state.isVisible).toBe(false)
  })
})

describe('onMount', () => {
  it('is called once the tooltip is mounted to the DOM', done => {
    const instance = tippy.one(h(), {
      onMount: tip => {
        expect(tip).toBe(instance)
        expect(document.documentElement.contains(tip.popper)).toBe(true)
        done()
      },
      duration: 0
    })
    instance.show()
  })
})

describe('onShown', () => {
  it('is called on transition end of show, passed the instance as an argument', async () => {
    const spy = jest.fn()
    const instance = tippy.one(h(), { onShown: spy, duration: 0 })
    instance.show()
    await wait(1)
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })
})

describe('onHide', () => {
  it('is called on hide, passed the instance as an argument', () => {
    const spy = jest.fn()
    const instance = tippy.one(h(), { onHide: spy })
    instance.hide()
    expect(spy.mock.calls.length).toBe(1)
    expect(spy).toBeCalledWith(instance)
  })

  it('prevents the the tooltip from hiding if it returns `false`', () => {
    const instance = tippy.one(h(), { onHide: () => false })
    instance.show()
    instance.hide()
    expect(instance.state.isVisible).toBe(true)
  })
})

describe('onHidden', () => {
  it('is called on transition end of hide, passed the instance as an argument', async () => {
    const spy = jest.fn()
    const instance = tippy.one(h(), { onHidden: spy, duration: 0 })
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
    const tip = tippy.one(ref, { wait })
    ref.dispatchEvent(new MouseEvent('mouseenter'))
    expect(typeof wait.mock.calls[0][0].show).toBe('function')
    expect(typeof wait.mock.calls[0][1].type).toBe('string')
    expect(tip.state.isVisible).toBe(false)
  })
})

describe('popperOptions', () => {
  it('top level', () => {
    const { popperInstance } = tippy.one(h(), {
      lazy: false,
      popperOptions: {
        anything: true
      }
    })
    expect(popperInstance.options.anything).toBe(true)
  })

  it('modifiers', () => {
    const { popperInstance } = tippy.one(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          preventOverflow: {
            escapeWithReference: true
          }
        }
      }
    })
    expect(
      popperInstance.options.modifiers.preventOverflow.escapeWithReference
    ).toBe(true)
  })

  it('modifiers.arrow', () => {
    const { popperInstance } = tippy.one(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          arrow: {
            test: true
          }
        }
      }
    })
    expect(popperInstance.options.modifiers.arrow.test).toBe(true)
  })

  it('modifiers.flip', () => {
    const { popperInstance } = tippy.one(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          flip: {
            test: true
          }
        }
      }
    })
    expect(popperInstance.options.modifiers.flip.test).toBe(true)
  })

  it('modifiers.offset', () => {
    const { popperInstance } = tippy.one(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          offset: {
            test: true
          }
        }
      }
    })
    expect(popperInstance.options.modifiers.offset.test).toBe(true)
  })
})
