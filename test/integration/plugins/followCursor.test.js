import {
  h,
  cleanDocumentBody,
  enableTouchEnvironment,
  disableTouchEnvironment,
  setTestDefaultProps,
} from '../../utils'

import { createTippyWithPlugins } from '../../../src'
import followCursor, {
  getVirtualOffsets,
} from '../../../src/plugins/followCursor'
import { getBasePlacement } from '../../../src/popper'

setTestDefaultProps()
jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('followCursor', () => {
  const tippy = createTippyWithPlugins([followCursor])

  // NOTE: Jest's simulated window dimensions are 1024 x 768. These values
  // should be within that
  const mouseenter = new MouseEvent('mouseenter', { clientX: 1, clientY: 1 })
  const mouseleave = new MouseEvent('mouseleave', { clientX: 1, clientY: 1 })

  const first = { clientX: 317, clientY: 119 }
  const second = { clientX: 240, clientY: 500 }

  const firstMouseMoveEvent = new MouseEvent('mousemove', {
    ...first,
    bubbles: true,
  })
  const secondMouseMoveEvent = new MouseEvent('mousemove', {
    ...second,
    bubbles: true,
  })

  const placements = ['top', 'bottom', 'left', 'right']

  let rect
  let instance

  afterEach(() => {
    instance.destroy()
  })

  function matches(receivedRect) {
    const isVerticalPlacement = ['top', 'bottom'].includes(
      getBasePlacement(instance.state.currentPlacement),
    )
    const { x, y } = getVirtualOffsets(instance.popper, isVerticalPlacement)

    expect(rect.left).toBe(receivedRect.left - x)
    expect(rect.right).toBe(receivedRect.right + x)
    expect(rect.top).toBe(receivedRect.top - y)
    expect(rect.bottom).toBe(receivedRect.bottom + y)
  }

  it('true: follows both axes', () => {
    placements.forEach(placement => {
      instance = tippy(h(), { followCursor: true, placement })

      instance.reference.dispatchEvent(mouseenter)

      jest.runAllTimers()

      instance.reference.dispatchEvent(firstMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      })

      instance.reference.dispatchEvent(secondMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: second.clientY,
        bottom: second.clientY,
        left: second.clientX,
        right: second.clientX,
      })
    })
  })

  it('"horizontal": follows x-axis', () => {
    placements.forEach(placement => {
      instance = tippy(h(), {
        followCursor: 'horizontal',
        placement,
      })
      const referenceRect = instance.reference.getBoundingClientRect()

      instance.reference.dispatchEvent(mouseenter)

      jest.runAllTimers()

      instance.reference.dispatchEvent(firstMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()

      matches({
        top: referenceRect.top,
        bottom: referenceRect.bottom,
        left: first.clientX,
        right: first.clientX,
      })

      instance.reference.dispatchEvent(secondMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: referenceRect.top,
        bottom: referenceRect.bottom,
        left: second.clientX,
        right: second.clientX,
      })
    })
  })

  it('"vertical": follows y-axis', () => {
    placements.forEach(placement => {
      instance = tippy(h(), { followCursor: 'vertical', placement })
      const referenceRect = instance.reference.getBoundingClientRect()

      instance.reference.dispatchEvent(mouseenter)

      jest.runAllTimers()

      instance.reference.dispatchEvent(firstMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: referenceRect.left,
        right: referenceRect.right,
      })

      instance.reference.dispatchEvent(secondMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: second.clientY,
        bottom: second.clientY,
        left: referenceRect.left,
        right: referenceRect.right,
      })
    })
  })

  it('"initial": only follows once', () => {
    placements.forEach(placement => {
      instance = tippy(h(), { followCursor: 'initial', placement })

      // lastMouseMove event is used in this case
      instance.reference.dispatchEvent(
        new MouseEvent('mouseenter', { ...first }),
      )

      jest.runAllTimers()

      instance.reference.dispatchEvent(firstMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      })

      instance.reference.dispatchEvent(secondMouseMoveEvent)
      rect = instance.popperInstance.reference.getBoundingClientRect()
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      })
    })
  })

  it('is at correct position after a delay', () => {
    instance = tippy(h(), { followCursor: true, delay: 100 })

    instance.reference.dispatchEvent(mouseenter)

    jest.runAllTimers()

    instance.reference.dispatchEvent(firstMouseMoveEvent)

    jest.advanceTimersByTime(100)

    rect = instance.popperInstance.reference.getBoundingClientRect()
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    })
  })

  it('is at correct position after a content update', () => {
    instance = tippy(h(), { followCursor: true })

    instance.reference.dispatchEvent(mouseenter)

    jest.runAllTimers()

    instance.reference.dispatchEvent(firstMouseMoveEvent)

    rect = instance.popperInstance.reference.getBoundingClientRect()
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    })

    instance.setContent('x')

    jest.runAllTimers()

    rect = instance.popperInstance.reference.getBoundingClientRect()
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    })
  })

  it('does not continue to follow if interactive: true and cursor is over popper', () => {
    instance = tippy(h(), {
      followCursor: 'horizontal',
      interactive: true,
    })

    instance.reference.dispatchEvent(mouseenter)

    jest.runAllTimers()

    instance.reference.dispatchEvent(firstMouseMoveEvent)

    const referenceRect = instance.reference.getBoundingClientRect()
    rect = instance.popperInstance.reference.getBoundingClientRect()

    instance.reference.dispatchEvent(secondMouseMoveEvent)

    matches({
      top: referenceRect.top,
      bottom: referenceRect.bottom,
      left: first.clientX,
      right: first.clientX,
    })
  })

  it('touch device behavior is "initial"', () => {
    enableTouchEnvironment()

    instance = tippy(h(), { followCursor: true, flip: false })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter', { ...first }))

    jest.runAllTimers()

    instance.reference.dispatchEvent(firstMouseMoveEvent)
    rect = instance.popperInstance.reference.getBoundingClientRect()
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    })

    instance.reference.dispatchEvent(secondMouseMoveEvent)
    rect = instance.popperInstance.reference.getBoundingClientRect()
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    })

    disableTouchEnvironment()
  })

  it('cleans up listener if untriggered before it shows', () => {
    instance = tippy(h(), {
      followCursor: true,
      flip: false,
      delay: 1000,
    })

    instance.reference.dispatchEvent(mouseenter)

    jest.advanceTimersByTime(100)

    instance.reference.dispatchEvent(firstMouseMoveEvent)
    instance.reference.dispatchEvent(new MouseEvent('mouseleave'))

    jest.advanceTimersByTime(900)

    instance.reference.dispatchEvent(secondMouseMoveEvent)

    rect = instance.popperInstance.reference.getBoundingClientRect()
  })

  it('should reset popperInstance.reference if triggered by `focus`', () => {
    instance = tippy(h(), {
      followCursor: true,
      flip: false,
      delay: 1000,
    })

    instance.reference.dispatchEvent(mouseenter)

    jest.runAllTimers()

    instance.reference.dispatchEvent(firstMouseMoveEvent)
    instance.reference.dispatchEvent(new MouseEvent('mouseleave'))

    instance.reference.dispatchEvent(secondMouseMoveEvent)

    instance.hide()

    instance.reference.dispatchEvent(new FocusEvent('focus'))

    expect(instance.popperInstance.reference).toBe(instance.reference)
  })

  it('"initial": does not update if triggered again while still visible', () => {
    instance = tippy(h(), {
      followCursor: 'initial',
    })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter', { ...first }))

    jest.runAllTimers()

    instance.reference.dispatchEvent(secondMouseMoveEvent)

    rect = instance.popperInstance.reference.getBoundingClientRect()

    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    })
  })

  it('sets normalizedPlacement for shifted placements correctly', () => {
    instance = tippy(h(), {
      placement: 'top-start',
      followCursor: true,
    })

    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.props.placement).toBe('top-end')

    instance.setProps({ placement: 'left-end' })

    expect(instance.props.placement).toBe('left-start')

    instance.setProps({ followCursor: false })

    instance.reference.dispatchEvent(mouseleave)
    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.props.placement).toBe('left-end')
  })

  it('is disabled if MouseEvent.{clientX,clientY} are 0', () => {
    instance = tippy(h(), {
      followCursor: true,
    })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))
    jest.runAllTimers()

    expect(instance.popperInstance.reference).toBe(instance.reference)
  })

  it('enables listeners for `true`', () => {
    instance = tippy(h(), {
      followCursor: true,
    })

    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.popperInstance.state.eventsEnabled).toBe(true)
  })

  it('enables listeners for `false`', () => {
    instance = tippy(h(), {
      followCursor: false,
    })

    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.popperInstance.state.eventsEnabled).toBe(true)
  })

  it('disables listeners for "initial"', () => {
    instance = tippy(h(), {
      followCursor: 'initial',
    })

    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.popperInstance.state.eventsEnabled).toBe(false)
  })

  it('disables listeners for "horizontal"', () => {
    instance = tippy(h(), {
      followCursor: 'horizontal',
    })

    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.popperInstance.state.eventsEnabled).toBe(false)
  })

  it('disables listeners for "vertical"', () => {
    instance = tippy(h(), {
      followCursor: 'vertical',
    })

    instance.reference.dispatchEvent(mouseenter)
    jest.runAllTimers()

    expect(instance.popperInstance.state.eventsEnabled).toBe(false)
  })
})
