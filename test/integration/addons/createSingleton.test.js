import {
  h,
  cleanDocumentBody,
  MOUSEENTER,
  MOUSELEAVE,
  setTestDefaultProps,
} from '../../utils'

import createSingleton from '../../../src/addons/createSingleton'
import tippy from '../../../src'
import { clean } from '../../../src/validation'

setTestDefaultProps()
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

  it('does not show the original tippy element', () => {
    const refs = [h(), h()]
    const firstRef = refs[0]

    createSingleton(tippy(refs))

    firstRef.dispatchEvent(MOUSEENTER)

    jest.runAllTimers()

    expect(firstRef._tippy.state.isVisible).toBe(false)
  })

  it('uses the relevant tippy instance content', () => {
    const configs = [{ content: 'hi' }, { content: 'bye' }]
    const instances = configs.map(props => tippy(h(), props))
    const singletonInstance = createSingleton(instances)

    instances[0].reference.dispatchEvent(MOUSEENTER)

    expect(singletonInstance.props.content).toBe('hi')

    instances[0].reference.dispatchEvent(MOUSELEAVE)
    instances[1].reference.dispatchEvent(MOUSEENTER)

    expect(singletonInstance.props.content).toBe('bye')
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

  it('throws if not passed an array', () => {
    expect(() => {
      createSingleton(null)
    }).toThrow(
      clean(`The first argument passed to createSingleton() must be an array of tippy
      instances.

      The passed value was: ${null}`),
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

  it('preserves `onTrigger`, `onDestroy`, and `onAfterUpdate` calls', () => {
    const instances = tippy([h()])

    const onTriggerSpy = jest.fn()
    const onDestroySpy = jest.fn()
    const onAfterUpdateSpy = jest.fn()

    const singleton = createSingleton(instances, {
      onTrigger: onTriggerSpy,
      onDestroy: onDestroySpy,
      onAfterUpdate: onAfterUpdateSpy,
    })

    instances[0].reference.dispatchEvent(MOUSEENTER)

    expect(onTriggerSpy).toHaveBeenCalled()

    singleton.setProps({})

    expect(onAfterUpdateSpy).toHaveBeenCalled()

    singleton.destroy()

    expect(onDestroySpy).toHaveBeenCalled()
  })

  it('allows updates to `onTrigger`, `onDestroy`, and `onAfterUpdate`', () => {
    const instances = tippy([h()])

    const onTriggerSpy = jest.fn()
    const onDestroySpy = jest.fn()
    const onAfterUpdateSpy = jest.fn()

    const singleton = createSingleton(instances)

    singleton.setProps({
      onTrigger: onTriggerSpy,
      onDestroy: onDestroySpy,
      onAfterUpdate: onAfterUpdateSpy,
    })

    instances[0].reference.dispatchEvent(MOUSEENTER)

    expect(onTriggerSpy).toHaveBeenCalled()

    singleton.setProps({})

    expect(onAfterUpdateSpy).toHaveBeenCalled()

    singleton.destroy()

    expect(onDestroySpy).toHaveBeenCalled()
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

    jest.runAllTimers()
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

  it('handles aria attribute correctly', () => {
    const tippyInstances = tippy([h(), h()])
    const singletonInstance = createSingleton(tippyInstances, { delay: 100 })

    const id = singletonInstance.popperChildren.tooltip.id
    const { reference: firstReference } = tippyInstances[0]
    const { reference: secondReference } = tippyInstances[1]

    firstReference.dispatchEvent(MOUSEENTER)
    jest.runAllTimers()

    expect(firstReference.getAttribute('aria-describedby')).toBe(id)

    firstReference.dispatchEvent(MOUSELEAVE)
    secondReference.dispatchEvent(MOUSEENTER)

    expect(firstReference.getAttribute('aria-describedby')).toBe(null)
    expect(secondReference.getAttribute('aria-describedby')).toBe(id)

    singletonInstance.setProps({ aria: null })

    secondReference.dispatchEvent(MOUSELEAVE)
    firstReference.dispatchEvent(MOUSEENTER)

    expect(firstReference.getAttribute('aria-describedby')).toBe(null)
    expect(secondReference.getAttribute('aria-describedby')).toBe(null)
  })

  it('specifying lifecycle hook does not override internal hooks', () => {
    const refs = [h(), h()]
    const singletonInstance = createSingleton(tippy(refs), {
      onTrigger() {},
    })

    refs[0].dispatchEvent(MOUSEENTER)
    jest.runAllTimers()

    expect(singletonInstance.popperInstance.reference.referenceNode).toBe(
      refs[0],
    )
  })
})
