import singleton from '../../src/addons/singleton'
import delegate from '../../src/addons/delegate'
import tippy from '../../src'
import { h, cleanDocumentBody } from '../utils'

tippy.setDefaults({
  duration: 0,
  delay: 0,
})

jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('singleton', () => {
  it('shows when a tippy instance reference is triggered', () => {
    const refs = [h(), h()]
    const singletonInstance = singleton(tippy(refs))
    refs[0].dispatchEvent(new MouseEvent('mouseenter'), { bubbles: true })
    jest.runAllTimers()
    expect(singletonInstance.state.isVisible).toBe(true)
  })

  it('does not show the original tippy instance', () => {
    const refs = [h(), h()]
    singleton(tippy(refs))
    refs[0].dispatchEvent(new MouseEvent('mouseenter'), { bubbles: true })
    jest.runAllTimers()
    expect(refs[0]._tippy.state.isVisible).toBe(false)
  })

  it('uses the relevant tippy instance props', () => {
    const configs = [{ arrow: true }, { duration: 1000 }]
    const instances = configs.map(options => tippy(h(), options))
    const singletonInstance = singleton(instances)
    instances[0].reference.dispatchEvent(new MouseEvent('mouseenter'), {
      bubbles: true,
    })
    expect(singletonInstance.props.arrow).toBe(true)
    instances[0].reference.dispatchEvent(new MouseEvent('mouseleave'), {
      bubbles: true,
    })
    instances[1].reference.dispatchEvent(new MouseEvent('mouseenter'), {
      bubbles: true,
    })
    expect(singletonInstance.props.duration).toBe(1000)
  })

  it('uses `delay` correctly', () => {
    const refs = [h(), h()]
    const singletonInstance = singleton(tippy(refs), { delay: 1000 })
    refs[0].dispatchEvent(new MouseEvent('mouseenter'), { bubbles: true })
    jest.advanceTimersByTime(999)
    expect(singletonInstance.state.isVisible).toBe(false)
    jest.advanceTimersByTime(1000)
    expect(singletonInstance.state.isVisible).toBe(true)
    refs[0].dispatchEvent(new MouseEvent('mouseleave'), { bubbles: true })
    jest.advanceTimersByTime(999)
    expect(singletonInstance.state.isVisible).toBe(true)
    jest.advanceTimersByTime(1000)
    expect(singletonInstance.state.isVisible).toBe(false)
  })

  it('preserves original `onShow`, `onTrigger`, and `onUntrigger` options', () => {
    const options = {
      onShow: jest.fn(),
      onTrigger: jest.fn(),
      onUntrigger: jest.fn(),
    }
    const triggerEvent = new MouseEvent('mouseenter', { bubbles: true })
    const untriggerEvent = new MouseEvent('mouseleave', { bubbles: true })
    const refs = [h(), h()]
    const ref = refs[0]
    singleton(tippy(refs, options))
    ref.dispatchEvent(triggerEvent)
    ref.dispatchEvent(untriggerEvent)
    expect(options.onShow).toHaveBeenCalledWith(ref._tippy)
    expect(options.onTrigger).toHaveBeenCalledWith(ref._tippy, triggerEvent)
    expect(options.onUntrigger).toHaveBeenCalledWith(ref._tippy, untriggerEvent)
  })

  it('allows `onShow`, `onTrigger`, and `onUntrigger` to be updated', () => {
    const options = {
      onShow: jest.fn(),
      onTrigger: jest.fn(),
      onUntrigger: jest.fn(),
    }
    const triggerEvent = new MouseEvent('mouseenter', { bubbles: true })
    const untriggerEvent = new MouseEvent('mouseleave', { bubbles: true })
    const refs = [h(), h()]
    const ref = refs[0]
    singleton(tippy(refs, options))
    ref.dispatchEvent(triggerEvent)
    ref.dispatchEvent(untriggerEvent)
    expect(options.onShow).toHaveBeenCalledWith(ref._tippy)
    expect(options.onTrigger).toHaveBeenCalledWith(ref._tippy, triggerEvent)
    expect(options.onUntrigger).toHaveBeenCalledWith(ref._tippy, untriggerEvent)
  })

  it('throws if not passed an array', () => {
    expect(() => {
      singleton(null)
    }).toThrow(
      '[tippy.js ERROR] First argument to `singleton()` must ' +
        'be an array of tippy instances. The passed value was `' +
        null +
        '`',
    )
  })

  it('throws if passed a single instance', () => {
    expect(() => {
      singleton(tippy(h()))
    }).toThrow(
      '[tippy.js ERROR] First argument to `singleton()` must ' +
        'be an *array* of tippy instances. The passed value was a ' +
        '*single* tippy instance.',
    )
  })

  it('does not prevent updating `onShow`, `onTrigger`, and `onUntrigger`', () => {
    const instances = tippy([h()])
    singleton(instances)
    const onShowSpy = jest.fn()
    const onTriggerSpy = jest.fn()
    const onUntriggerSpy = jest.fn()
    const [instance] = instances
    instance.set({
      onShow: onShowSpy,
      onTrigger: onTriggerSpy,
      onUntrigger: onUntriggerSpy,
    })
    instance.reference.dispatchEvent(new Event('mouseenter'))
    expect(onTriggerSpy).toHaveBeenCalled()
    expect(onShowSpy).toHaveBeenCalled()
    instance.reference.dispatchEvent(new Event('mouseleave'))
    expect(onUntriggerSpy).toHaveBeenCalled()
    // And re-uses the same if not updated
    instance.set({})
    instance.reference.dispatchEvent(new Event('mouseenter'))
    expect(onTriggerSpy).toHaveBeenCalled()
    expect(onShowSpy).toHaveBeenCalled()
    instance.reference.dispatchEvent(new Event('mouseleave'))
    expect(onUntriggerSpy).toHaveBeenCalled()
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
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
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
    document.body.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    jest.runAllTimers()
    expect(instance.state.isVisible).toBe(false)
    instance.destroy()
  })

  it('ignores if delegate target is falsy', () => {
    delegate(null, { target: 'button' })
  })

  it('throws if passed falsy `target` option', () => {
    const message =
      '[tippy.js ERROR] You must specify a `target` option ' +
      'indicating the CSS selector string matching the target elements ' +
      'that should receive a tippy.'
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

  it('can destroy child instances if passed `true` as an argument', () => {
    const button = h('button')
    const instance = delegate(document.body, { target: 'button' })
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    instance.destroy(true)
    expect(button._tippy).toBeUndefined()
  })
})
