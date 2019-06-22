import tippy from '../../src'
import followCursor from '../../src/extra-props/followCursor'
import {
  h,
  cleanDocumentBody,
  enableTouchEnvironment,
  disableTouchEnvironment,
} from '../utils'
import { getBasePlacement } from '../../src/popper'
import { getVirtualOffsets } from '../../src/utils'

tippy.setDefaultProps({
  duration: 0,
  delay: 0,
})

jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('followCursor', () => {
  // NOTE: Jest's simulated window dimensions are 1024 x 768. These values
  // should be within that
  const first = { clientX: 317, clientY: 119 }
  const second = { clientX: 240, clientY: 500 }
  const tippyEnhanced = followCursor(tippy)

  const firstMouseMoveEvent = new MouseEvent('mousemove', {
    ...first,
    bubbles: true,
  })
  const secondMouseMoveEvent = new MouseEvent('mousemove', {
    ...second,
    bubbles: true,
  })

  let rect
  let instance

  afterEach(() => {
    instance.destroy()
  })

  function matches(receivedRect) {
    const isVerticalPlacement = ['top', 'bottom'].includes(
      getBasePlacement(instance.popper.getAttribute('x-placement')),
    )
    const { x, y } = getVirtualOffsets(instance, isVerticalPlacement)

    expect(rect.left).toBe(receivedRect.left - x)
    expect(rect.right).toBe(receivedRect.right + x)
    expect(rect.top).toBe(receivedRect.top - y)
    expect(rect.bottom).toBe(receivedRect.bottom + y)
  }

  it('true: follows both axes', () => {
    instance = tippyEnhanced(h(), { followCursor: true })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

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

  it('"horizontal": follows x-axis', () => {
    instance = tippyEnhanced(h(), { followCursor: 'horizontal' })
    const referenceRect = instance.reference.getBoundingClientRect()

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

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

  it('"vertical": follows y-axis', () => {
    instance = tippyEnhanced(h(), { followCursor: 'vertical' })
    const referenceRect = instance.reference.getBoundingClientRect()

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

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

  it('"initial": only follows once', () => {
    instance = tippyEnhanced(h(), { followCursor: 'initial' })

    // lastMouseMove event is used in this case
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
  })

  it('is at correct position after a delay', () => {
    instance = tippyEnhanced(h(), { followCursor: true, delay: 100 })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

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
    instance = tippyEnhanced(h(), { followCursor: true })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

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
    instance = tippyEnhanced(h(), {
      followCursor: 'horizontal',
      interactive: true,
    })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

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

    instance = tippyEnhanced(h(), { followCursor: true, flip: false })

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
})
