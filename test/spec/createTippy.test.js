import { h, cleanDocumentBody } from '../utils'

import tippy from '../../src'
import { defaultProps } from '../../src/props'
import createTippy from '../../src/createTippy'
import { POPPER_SELECTOR } from '../../src/constants'

jest.useFakeTimers()

tippy.setDefaults({
  duration: 0,
  delay: 0,
})

let instance

afterEach(() => {
  if (instance) {
    instance.destroy()
  }
  cleanDocumentBody()
})

describe('createTippy', () => {
  it('returns `null` if the reference already has a tippy instance', () => {
    const reference = h()
    reference._tippy = true
    expect(createTippy(reference, defaultProps)).toBe(null)
  })

  it('returns the instance with expected properties', () => {
    instance = createTippy(h(), defaultProps)
    expect(instance.id).toBeDefined()
    expect(instance.reference).toBeDefined()
    expect(instance.popper).toBeDefined()
    expect(instance.popperInstance).toBeDefined()
    expect(instance.popperChildren).toBeDefined()
    expect(instance.popperInstance).toBeDefined()
    expect(instance.state).toBeDefined()
    expect(instance.clearDelayTimeouts).toBeDefined()
    expect(instance.set).toBeDefined()
    expect(instance.setContent).toBeDefined()
    expect(instance.show).toBeDefined()
    expect(instance.hide).toBeDefined()
    expect(instance.enable).toBeDefined()
    expect(instance.disable).toBeDefined()
    expect(instance.destroy).toBeDefined()
  })

  it('increments the `id` on each call with valid arguments', () => {
    const instances = [
      createTippy(h(), defaultProps),
      createTippy(h(), defaultProps),
      createTippy(h(), defaultProps),
    ]
    expect(instances[0].id).toBe(instances[1].id - 1)
    expect(instances[1].id).toBe(instances[2].id - 1)
  })

  it('adds correct listeners to the reference element based on `trigger`', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      trigger: 'mouseenter focus click',
    })
    instance.reference.dispatchEvent(new Event('mouseenter'))
    expect(instance.state.isVisible).toBe(true)
    instance.reference.dispatchEvent(new Event('mouseleave'))
    expect(instance.state.isVisible).toBe(false)
    instance.reference.dispatchEvent(new Event('focus'))
    expect(instance.state.isVisible).toBe(true)
    instance.reference.dispatchEvent(new Event('blur'))
    expect(instance.state.isVisible).toBe(false)
    instance.reference.dispatchEvent(new Event('click'))
    expect(instance.state.isVisible).toBe(true)
    instance.reference.dispatchEvent(new Event('click'))
    expect(instance.state.isVisible).toBe(false)
  })
})

describe('instance.destroy', () => {
  it('sets state.isDestroyed to `true`', () => {
    instance = createTippy(h(), defaultProps)
    instance.destroy()
    expect(instance.state.isDestroyed).toBe(true)
  })

  it('deletes the `_tippy` property from the reference', () => {
    const ref = h()
    instance = createTippy(ref, defaultProps)
    expect('_tippy' in ref).toBe(true)
    instance.destroy()
    expect('_tippy' in ref).toBe(false)
  })

  it('removes listeners from the reference', () => {
    const ref = h()
    instance = createTippy(ref, {
      ...defaultProps,
      trigger: 'mouseenter',
    })
    instance.destroy()
    ref.dispatchEvent(new Event('mouseenter'))
    expect(instance.state.isVisible).toBe(false)
  })

  it('does nothing if the instance is already destroyed', () => {
    const ref = h()
    instance = createTippy(ref, defaultProps)
    instance.state.isDestroyed = true
    instance.destroy()
    expect(ref._tippy).toBeDefined()
  })

  it('destroys target instances if `true` is passed as an argument', () => {
    const ref = h()
    const p = document.createElement('p')
    ref.append(p)
    createTippy(ref, { ...defaultProps, target: 'p' })
    p._tippy = createTippy(p, defaultProps)
    expect(p._tippy).toBeDefined()
    ref._tippy.destroy(true)
    expect(p._tippy).toBeUndefined()
  })

  it('still unmounts the tippy if the instance is disabled', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    jest.runAllTimers()
    instance.disable()
    instance.destroy()
    expect(instance.state.isMounted).toBe(false)
  })
})

describe('instance.show', () => {
  it('changes state.isVisible to `true`', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    expect(instance.state.isVisible).toBe(true)
  })

  it('mounts the popper to the DOM', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    jest.runAllTimers()
    expect(document.querySelector(POPPER_SELECTOR)).toBe(instance.popper)
  })

  it('overrides instance.props.duration if supplied an argument', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      duration: 100,
    })
    instance.show(10)
    jest.runAllTimers()
    expect(instance.popperChildren.tooltip.style.transitionDuration).toBe(
      '10ms',
    )
  })

  it('adds .tippy-active class if interactive', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      interactive: true,
    })
    instance.show()
    jest.runAllTimers()
    expect(
      instance.reference.classList.contains('__NAMESPACE_PREFIX__-active'),
    ).toBe(true)
  })

  it('does not show tooltip if the reference has a `disabled` attribute', () => {
    const ref = h()
    ref.setAttribute('disabled', 'disabled')
    instance = createTippy(ref, defaultProps)
    instance.show()
    expect(instance.state.isVisible).toBe(false)
  })
})

describe('instance.hide', () => {
  it('changes state.isVisible to false', () => {
    instance = createTippy(h(), defaultProps)
    instance.hide()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })

  it('removes the popper element from the DOM after hiding', () => {
    instance = createTippy(h(), {
      ...defaultProps,
    })
    instance.show(0)
    jest.runAllTimers()
    expect(document.querySelector(POPPER_SELECTOR)).toBe(instance.popper)
    instance.hide(0)
    jest.runAllTimers()
    expect(document.querySelector(POPPER_SELECTOR)).toBeNull()
  })

  it('overrides instance.props.duration if supplied an argument', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      duration: 100,
    })
    instance.show(0)
    jest.runAllTimers()
    instance.hide(9)
    expect(instance.popperChildren.tooltip.style.transitionDuration).toBe('9ms')
    instance.destroy()
  })
})

describe('instance.enable', () => {
  it('sets state.isEnabled to `true`', () => {
    instance = createTippy(h(), defaultProps)
    instance.enable()
    expect(instance.state.isEnabled).toBe(true)
    instance.destroy()
  })

  it('allows a tippy to be shown', () => {
    instance = createTippy(h(), defaultProps)
    instance.enable()
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.destroy()
  })
})

describe('instance.disable', () => {
  it('sets state.isEnabled to `false`', () => {
    instance = createTippy(h(), defaultProps)
    instance.disable()
    expect(instance.state.isEnabled).toBe(false)
    instance.destroy()
  })

  it('disallows a tippy to be shown', () => {
    instance = createTippy(h(), defaultProps)
    instance.disable()
    instance.show()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })
})

describe('instance.set', () => {
  it('sets the new props by merging them with the current instance', () => {
    instance = createTippy(h(), defaultProps)
    expect(instance.props.arrow).toBe(defaultProps.arrow)
    expect(instance.props.duration).toBe(defaultProps.duration)
    instance.set({ arrow: !defaultProps.arrow, duration: 82 })
    expect(instance.props.arrow).toBe(!defaultProps.arrow)
    expect(instance.props.duration).toBe(82)
  })

  it('redraws the tooltip by creating a new popper element', () => {
    instance = createTippy(h(), defaultProps)
    expect(
      instance.popper.querySelector('.__NAMESPACE_PREFIX__-arrow'),
    ).toBeNull()
    instance.set({ arrow: true })
    expect(
      instance.popper.querySelector('.__NAMESPACE_PREFIX__-arrow'),
    ).not.toBeNull()
  })

  it('popperChildren property is updated to reflect the new popper element', () => {
    instance = createTippy(h(), defaultProps)
    expect(instance.popperChildren.arrow).toBeNull()
    instance.set({ arrow: true })
    expect(instance.popperChildren.arrow).not.toBeNull()
  })

  it('popperInstance popper is updated to the new popper', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      lazy: false,
    })
    instance.set({ arrow: true })
    expect(instance.popperInstance.popper).toBe(instance.popper)
  })

  it('popper._tippy is defined with the correct instance', () => {
    instance = createTippy(h(), defaultProps)
    instance.set({ arrow: true })
    expect(instance.popper._tippy).toBe(instance)
  })

  it('changing `trigger` or `touchHold` changes listeners', () => {
    const ref = h()
    instance = createTippy(ref, defaultProps)
    instance.set({ trigger: 'click' })
    ref.dispatchEvent(new Event('mouseenter'))
    expect(instance.state.isVisible).toBe(false)
    ref.dispatchEvent(new Event('click'))
    expect(instance.state.isVisible).toBe(true)
  })

  it('avoids creating a new popperInstance if new props are identical', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    const previousPopperInstance = instance.popperInstance
    instance.set(defaultProps)
    expect(instance.popperInstance).toBe(previousPopperInstance)
  })

  it('creates a new popperInstance if one of the props has changed', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    const previousPopperInstance = instance.popperInstance
    instance.set({ ...defaultProps, placement: 'bottom' })
    expect(instance.popperInstance).not.toBe(previousPopperInstance)
  })
})

describe('instance.setContent', () => {
  it('works like set({ content: newContent })', () => {
    instance = createTippy(h(), defaultProps)
    const content = 'Hello!'
    instance.setContent(content)
    expect(instance.props.content).toBe(content)
    expect(instance.popperChildren.content.textContent).toBe(content)
    const div = document.createElement('div')
    instance.setContent(div)
    expect(instance.props.content).toBe(div)
    expect(instance.popperChildren.content.firstElementChild).toBe(div)
  })
})

describe('instance.state', () => {
  it('isEnabled', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.state.isEnabled = false
    instance.hide()
    expect(instance.state.isVisible).toBe(true)
    instance.state.isEnabled = true
    instance.hide()
    expect(instance.state.isVisible).toBe(false)
    instance.state.isEnabled = false
    instance.show()
    expect(instance.state.isVisible).toBe(false)
  })

  it('isVisible', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    expect(instance.state.isVisible).toBe(true)
    instance.hide()
    expect(instance.state.isVisible).toBe(false)
  })

  it('isShown', () => {
    instance = createTippy(h(), defaultProps)
    instance.show()
    expect(instance.state.isShown).toBe(false)
    jest.runAllTimers()
    expect(instance.state.isShown).toBe(true)
    instance.hide()
    expect(instance.state.isShown).toBe(false)
  })
})
