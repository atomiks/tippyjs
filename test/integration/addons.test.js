import { h, cleanDocumentBody, MOUSEENTER, MOUSELEAVE, CLICK } from '../utils'

import createSingleton from '../../src/addons/createSingleton'
import delegate from '../../src/addons/delegate'
import tippy from '../../src'

tippy.setDefaultProps({ duration: 0, delay: 0 })
jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('createSingleton', () => {
  it('shows when a tippy instance reference is triggered', () => {
    const refs = [h(), h()]
    const singletonInstance = createSingleton(tippy(refs))

    refs[0].dispatchEvent(MOUSEENTER)

    jest.runAllTimers()

    expect(singletonInstance.state.isVisible).toBe(true)
  })

  it('does not visibly show the original tippy element (opacity of 0)', () => {
    const refs = [h(), h()]
    const firstRef = refs[0]

    createSingleton(tippy(refs))

    firstRef.dispatchEvent(MOUSEENTER)

    jest.runAllTimers()

    expect(firstRef._tippy.state.isVisible).toBe(true)
    expect(firstRef._tippy.popper.style.opacity).toBe('0')
  })

  it('uses the relevant tippy instance props', () => {
    const configs = [{ arrow: true }, { duration: 1000 }]
    const instances = configs.map(props => tippy(h(), props))
    const singletonInstance = createSingleton(instances)

    instances[0].reference.dispatchEvent(MOUSEENTER)

    expect(singletonInstance.props.arrow).toBe(true)

    instances[0].reference.dispatchEvent(MOUSELEAVE)
    instances[1].reference.dispatchEvent(MOUSEENTER)

    expect(singletonInstance.props.duration).toBe(1000)
  })

  it('uses `delay: number` correctly', () => {
    const refs = [h(), h()]
    const singletonInstance = createSingleton(tippy(refs), { delay: 1000 })
    const firstRef = refs[0]

    firstRef.dispatchEvent(MOUSEENTER)
    jest.advanceTimersByTime(999)

    expect(singletonInstance.state.isVisible).toBe(false)

    jest.advanceTimersByTime(1)

    expect(singletonInstance.state.isVisible).toBe(true)

    firstRef.dispatchEvent(MOUSELEAVE)
    jest.advanceTimersByTime(999)

    expect(singletonInstance.state.isVisible).toBe(true)

    jest.advanceTimersByTime(1)

    expect(singletonInstance.state.isVisible).toBe(false)
  })

  it('uses `delay: [number, number]` correctly', () => {
    const refs = [h(), h()]
    const singletonInstance = createSingleton(tippy(refs), {
      delay: [500, 1000],
    })
    const firstRef = refs[0]

    firstRef.dispatchEvent(MOUSEENTER)
    jest.advanceTimersByTime(499)

    expect(singletonInstance.state.isVisible).toBe(false)

    jest.advanceTimersByTime(1)

    expect(singletonInstance.state.isVisible).toBe(true)

    firstRef.dispatchEvent(MOUSELEAVE)
    jest.advanceTimersByTime(999)

    expect(singletonInstance.state.isVisible).toBe(true)

    jest.advanceTimersByTime(1)

    expect(singletonInstance.state.isVisible).toBe(false)
  })

  it('preserves original `onTrigger`, and `onUntrigger` props', () => {
    const props = { onTrigger: jest.fn(), onUntrigger: jest.fn() }
    const triggerEvent = MOUSEENTER
    const untriggerEvent = MOUSELEAVE
    const refs = [h(), h()]
    const ref = refs[0]

    createSingleton(tippy(refs, props))

    ref.dispatchEvent(triggerEvent)
    ref.dispatchEvent(untriggerEvent)

    expect(props.onTrigger).toHaveBeenCalledWith(ref._tippy, triggerEvent)
    expect(props.onUntrigger).toHaveBeenCalledWith(ref._tippy, untriggerEvent)
  })

  it('throws if not passed an array', () => {
    expect(() => {
      createSingleton(null)
    }).toThrow(
      'First argument to `createSingleton()` must ' +
        'be an array of tippy instances. The passed value was `' +
        null +
        '`',
    )
  })

  it('throws if passed a single instance', () => {
    expect(() => {
      createSingleton(tippy(h()))
    }).toThrow(
      'First argument to `createSingleton()` must ' +
        'be an *array* of tippy instances. The passed value was a ' +
        '*single* tippy instance.',
    )
  })

  it('throws if any passed instance is part of an existing singleton', () => {
    expect(() => {
      const instances = tippy([h(), h()])
      createSingleton(instances)
      createSingleton(instances)
    }).toThrow(
      'The passed tippy instance(s) are already part of an ' +
        'existing singleton instance. Make sure you destroy the previous ' +
        'singleton before calling `createSingleton()` again.',
    )
  })

  it('does not throw if any passed instance is not part of an existing singleton', () => {
    expect(() => {
      const instances = tippy([h(), h()])
      const singleton = createSingleton(instances)
      singleton.destroy()
      createSingleton(instances)
    }).not.toThrow()
  })

  it('does not prevent updating `onTrigger`, and `onUntrigger`', () => {
    const instances = tippy([h()])
    const instance = instances[0]
    const onTriggerSpy = jest.fn()
    const onUntriggerSpy = jest.fn()

    createSingleton(instances)

    instance.setProps({
      onTrigger: onTriggerSpy,
      onUntrigger: onUntriggerSpy,
    })

    instance.reference.dispatchEvent(MOUSEENTER)

    expect(onTriggerSpy).toHaveBeenCalled()

    instance.reference.dispatchEvent(MOUSELEAVE)

    expect(onUntriggerSpy).toHaveBeenCalled()

    // And re-uses the same if not updated
    instance.setProps({})
    instance.reference.dispatchEvent(MOUSEENTER)

    expect(onTriggerSpy).toHaveBeenCalled()

    instance.reference.dispatchEvent(MOUSELEAVE)

    expect(onUntriggerSpy).toHaveBeenCalled()
  })

  it('can update the `delay` option', () => {
    const refs = [h(), h()]
    const singletonInstance = createSingleton(tippy(refs), { delay: 1000 })
    const firstRef = refs[0]

    singletonInstance.setProps({ delay: 500 })

    firstRef.dispatchEvent(MOUSEENTER)
    jest.advanceTimersByTime(499)

    expect(singletonInstance.state.isVisible).toBe(false)

    jest.advanceTimersByTime(1)

    expect(singletonInstance.state.isVisible).toBe(true)

    firstRef.dispatchEvent(MOUSELEAVE)
    jest.advanceTimersByTime(499)

    expect(singletonInstance.state.isVisible).toBe(true)

    jest.advanceTimersByTime(1)

    expect(singletonInstance.state.isVisible).toBe(false)
  })

  it('destroys the passed instances by default', () => {
    const tippyInstances = tippy([h(), h()])
    const singletonInstance = createSingleton(tippyInstances)
    singletonInstance.destroy()
    tippyInstances.forEach(instance => {
      expect(instance.state.isDestroyed).toBe(true)
    })
  })

  it('does not destroy the passed instances if passed `false`', () => {
    const tippyInstances = tippy([h(), h()])
    const singletonInstance = createSingleton(tippyInstances)
    singletonInstance.destroy(false)
    tippyInstances.forEach(instance => {
      expect(instance.state.isDestroyed).toBe(false)
    })
  })

  it('does not throw maximum call stack error due to stale lifecycle hooks', () => {
    const tippyInstances = tippy([h(), h()])
    const instance = tippyInstances[0]
    const singletonInstance = createSingleton(tippyInstances)

    singletonInstance.destroy(false)

    createSingleton(tippyInstances)

    instance.reference.dispatchEvent(MOUSEENTER)

    expect(instance.state.isVisible).toBe(true)
  })

  it('restores original state when destroyed', () => {
    const tippyInstances = tippy([h(), h()])
    const prevInstanceProps = tippyInstances.map(instance => instance.props)
    const singletonInstance = createSingleton(tippyInstances)
    singletonInstance.destroy(false)
    tippyInstances.forEach((instance, i) => {
      const { props } = instance
      expect({ ...props, ...prevInstanceProps[i] }).toEqual(props)
    })
  })
})

describe('delegate', () => {
  it('creates an instance for the child target', () => {
    const button = h('button')
    const instance = delegate(document.body, { target: 'button' })

    expect(button._tippy).toBeUndefined()

    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(button._tippy).toBeDefined()

    instance.destroy()
  })

  it('works with `trigger: click`', () => {
    const button = h('button')
    const instance = delegate(document.body, {
      target: 'button',
      trigger: 'click',
    })

    expect(button._tippy).toBeUndefined()

    button.dispatchEvent(CLICK)

    expect(button._tippy).toBeDefined()

    instance.destroy()
  })

  it('handles an array of delegate targets', () => {
    const refs = [h(), h()]

    refs.forEach(ref => ref.append(document.createElement('button')))

    const instances = delegate(refs, { target: 'button' })
    const button = refs[0].querySelector('button')

    expect(button._tippy).toBeUndefined()

    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(button._tippy).toBeDefined()

    instances.forEach(instance => instance.destroy())
  })

  it('does not show its own tippy', () => {
    const instance = delegate(document.body, { target: 'button' })

    document.body.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    document.body.dispatchEvent(MOUSEENTER)

    jest.runAllTimers()

    expect(instance.state.isVisible).toBe(false)

    instance.destroy()
  })

  it('throws if delegate target is falsy', () => {
    expect(() => delegate(null, { target: 'button' })).toThrow()
  })

  it('throws if passed falsy `target` prop', () => {
    const message =
      'You must specify a `target` prop indicating the CSS ' +
      'selector string matching the target elements that should receive a ' +
      'tippy.'
    expect(() => {
      delegate(document.body)
    }).toThrow(message)
    expect(() => {
      delegate(document.body, { target: '' })
    }).toThrow(message)
  })

  it('can be destroyed', () => {
    const button = h('button')
    const instance = delegate(document.body, { target: 'button' })

    instance.destroy()
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(button._tippy).toBeUndefined()
  })

  it('destroys child instances by default too', () => {
    const button = h('button')
    const instance = delegate(document.body, { target: 'button' })

    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    instance.destroy()

    expect(button._tippy).toBeUndefined()
  })

  it('does not destroy child instances if passed `false`', () => {
    const button = h('button')
    const instance = delegate(document.body, { target: 'button' })

    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    instance.destroy(false)

    expect(button._tippy).toBeDefined()
  })
})
