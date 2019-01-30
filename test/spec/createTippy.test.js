import { h, cleanDocumentBody, wait } from '../utils'

import Defaults from '../../src/js/defaults'
import Selectors from '../../src/js/selectors'
import createTippy from '../../src/js/createTippy'

afterEach(cleanDocumentBody)

describe('createTippy', () => {
  it('returns `null` if the reference already has a tippy instance', () => {
    const reference = h()
    reference._tippy = true
    expect(createTippy(reference, Defaults)).toBe(null)
  })

  it('returns the instance with expected properties', () => {
    const tip = createTippy(h(), Defaults)
    expect(tip.id).toBeDefined()
    expect(tip.reference).toBeDefined()
    expect(tip.popper).toBeDefined()
    expect(tip.popperInstance).toBeDefined()
    expect(tip.popperChildren).toBeDefined()
    expect(tip.popperInstance).toBeDefined()
    expect(tip.state).toBeDefined()
    expect(tip.clearDelayTimeouts).toBeDefined()
    expect(tip.set).toBeDefined()
    expect(tip.setContent).toBeDefined()
    expect(tip.show).toBeDefined()
    expect(tip.hide).toBeDefined()
    expect(tip.enable).toBeDefined()
    expect(tip.disable).toBeDefined()
    expect(tip.destroy).toBeDefined()
  })

  it('increments the `id` on each call with valid arguments', () => {
    const tips = [
      createTippy(h(), Defaults),
      createTippy(h(), Defaults),
      createTippy(h(), Defaults),
    ]
    expect(tips[0].id).toBe(tips[1].id - 1)
    expect(tips[1].id).toBe(tips[2].id - 1)
  })

  it('adds correct listeners to the reference element based on `trigger`', async done => {
    // Note that hide delay is 20ms by default
    const HIDE_DELAY = 21
    const instance = createTippy(h(), {
      ...Defaults,
      trigger: 'mouseenter focus click',
    })
    instance.reference.dispatchEvent(new Event('mouseenter'))
    expect(instance.state.isVisible).toBe(true)
    instance.reference.dispatchEvent(new Event('mouseleave'))
    await wait(HIDE_DELAY)
    expect(instance.state.isVisible).toBe(false)

    instance.reference.dispatchEvent(new Event('focus'))
    expect(instance.state.isVisible).toBe(true)
    instance.reference.dispatchEvent(new Event('blur'))
    await wait(HIDE_DELAY)
    expect(instance.state.isVisible).toBe(false)

    instance.reference.dispatchEvent(new Event('click'))
    expect(instance.state.isVisible).toBe(true)
    instance.reference.dispatchEvent(new Event('click'))
    await wait(HIDE_DELAY)
    expect(instance.state.isVisible).toBe(false)

    done()
  })
})

describe('instance.destroy', () => {
  it('sets state.isDestroyed to `true`', () => {
    const instance = createTippy(h(), Defaults)
    instance.destroy()
    expect(instance.state.isDestroyed).toBe(true)
  })

  it('deletes the `_tippy` property from the reference', () => {
    const ref = h()
    const instance = createTippy(ref, Defaults)
    expect('_tippy' in ref).toBe(true)
    instance.destroy()
    expect('_tippy' in ref).toBe(false)
  })

  it('removes listeners from the reference', () => {
    const ref = h()
    const instance = createTippy(ref, { ...Defaults, trigger: 'mouseenter' })
    instance.destroy()
    ref.dispatchEvent(new Event('mouseenter'))
    expect(instance.state.isVisible).toBe(false)
  })

  it('does nothing if the instance is already destroyed', () => {
    const ref = h()
    const instance = createTippy(ref, Defaults)
    instance.state.isDestroyed = true
    instance.destroy()
    expect(ref._tippy).toBeDefined()
  })

  it('destroys target instances if `true` is passed as an argument', () => {
    const ref = h()
    const p = document.createElement('p')
    ref.append(p)
    const instance = createTippy(ref, { ...Defaults, target: 'p' })
    p._tippy = createTippy(p, Defaults)
    expect(p._tippy).toBeDefined()
    ref._tippy.destroy(true)
    expect(p._tippy).toBeUndefined()
  })
})

describe('instance.show', () => {
  it('changes state.isVisible to `true`', () => {
    const instance = createTippy(h(), Defaults)
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.destroy()
  })

  it('mounts the popper to the DOM', () => {
    const instance = createTippy(h(), Defaults)
    instance.show()
    expect(document.querySelector(Selectors.POPPER)).toBe(instance.popper)
    instance.destroy()
  })

  it('overrides instance.props.duration if supplied an argument', done => {
    const instance = createTippy(h(), {
      ...Defaults,
      duration: 100,
    })
    instance.show(10)
    setTimeout(() => {
      expect(instance.popperChildren.tooltip.style.transitionDuration).toBe(
        '10ms',
      )
      instance.destroy()
      done()
    }, 20)
  })

  it('adds .tippy-active class if interactive', done => {
    const instance = createTippy(h(), {
      ...Defaults,
      interactive: true,
    })
    instance.show()
    setTimeout(() => {
      expect(instance.reference.classList.contains('tippy-active')).toBe(true)
      done()
    })
  })

  it('does not show tooltip if the reference has a `disabled` attribute', () => {
    const ref = h()
    ref.setAttribute('disabled', 'disabled')
    const instance = createTippy(ref, Defaults)
    instance.show()
    expect(instance.state.isVisible).toBe(false)
  })
})

describe('instance.hide', () => {
  it('changes state.isVisible to false', () => {
    const instance = createTippy(h(), Defaults)
    instance.hide()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })

  it('removes the popper element from the DOM after hiding', () => {
    const instance = createTippy(h(), {
      ...Defaults,
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

  it('overrides instance.props.duration if supplied an argument', () => {
    const instance = createTippy(h(), {
      ...Defaults,
      duration: 100,
    })
    instance.show(0)
    instance.hide(9)
    expect(instance.popperChildren.tooltip.style.transitionDuration).toBe('9ms')
    instance.destroy()
  })
})

describe('instance.enable', () => {
  it('sets state.isEnabled to `true`', () => {
    const instance = createTippy(h(), Defaults)
    instance.enable()
    expect(instance.state.isEnabled).toBe(true)
    instance.destroy()
  })

  it('allows a tippy to be shown', () => {
    const instance = createTippy(h(), Defaults)
    instance.enable()
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.destroy()
  })
})

describe('instance.disable', () => {
  it('sets state.isEnabled to `false`', () => {
    const instance = createTippy(h(), Defaults)
    instance.disable()
    expect(instance.state.isEnabled).toBe(false)
    instance.destroy()
  })

  it('disallows a tippy to be shown', () => {
    const instance = createTippy(h(), Defaults)
    instance.disable()
    instance.show()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })
})

describe('instance.set', () => {
  it('sets the new props by merging them with the current instance', () => {
    const instance = createTippy(h(), Defaults)
    expect(instance.props.arrow).toBe(Defaults.arrow)
    expect(instance.props.duration).toBe(Defaults.duration)
    instance.set({ arrow: !Defaults.arrow, duration: 82 })
    expect(instance.props.arrow).toBe(!Defaults.arrow)
    expect(instance.props.duration).toBe(82)
  })

  it('redraws the tooltip by creating a new popper element', () => {
    const instance = createTippy(h(), Defaults)
    expect(instance.popper.querySelector('.tippy-arrow')).toBeNull()
    instance.set({ arrow: true })
    expect(instance.popper.querySelector('.tippy-arrow')).not.toBeNull()
  })

  it('popperChildren property is updated to reflect the new popper element', () => {
    const instance = createTippy(h(), Defaults)
    expect(instance.popperChildren.arrow).toBeNull()
    instance.set({ arrow: true })
    expect(instance.popperChildren.arrow).not.toBeNull()
  })

  it('popperInstance popper is updated to the new popper', () => {
    const instance = createTippy(h(), {
      ...Defaults,
      lazy: false,
    })
    instance.set({ arrow: true })
    expect(instance.popperInstance.popper).toBe(instance.popper)
  })

  it('popper._tippy is defined with the correct instance', () => {
    const instance = createTippy(h(), Defaults)
    instance.set({ arrow: true })
    expect(instance.popper._tippy).toBe(instance)
  })
})

describe('instance.setContent', () => {
  it('works like set({ content: newContent })', () => {
    const instance = createTippy(h(), Defaults)
    const content = 'Hello!'
    instance.setContent(content)
    expect(instance.props.content).toBe(content)
  })
})
