import tippy from '../../src'
import enhance from '../../src/extra-props/enhance'
import followCursor from '../../src/extra-props/followCursor'
import withInlinePositioning, {
  getBestRect,
  applyCursorStrategy,
} from '../../src/extra-props/inlinePositioning'
import {
  h,
  cleanDocumentBody,
  enableTouchEnvironment,
  disableTouchEnvironment,
} from '../utils'
import { getBasePlacement } from '../../src/popper'
import { getVirtualOffsets } from '../../src/utils'
import {
  inlineElementClientRects,
  positionSnapshots,
} from './__rect-snapshots__'

tippy.setDefaultProps({
  duration: 0,
  delay: 0,
})

jest.useFakeTimers()

afterEach(cleanDocumentBody)

describe('enhance', () => {
  it('preserves statics', () => {
    const enhancedTippy = enhance(tippy, [followCursor])
    expect(enhancedTippy.defaultProps).toBe(tippy.defaultProps)
    expect(enhancedTippy.currentInput).toBe(tippy.currentInput)
    expect(enhancedTippy.version).toBe(tippy.version)
    expect(enhancedTippy.hideAll).toBe(tippy.hideAll)
    expect(enhancedTippy.setDefaultProps).toBe(tippy.setDefaultProps)
  })
})

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

  it('can be undone via setProps()', () => {
    instance = tippyEnhanced(h(), { followCursor: true, flip: false })
    instance.reference.dispatchEvent(new MouseEvent('mouseenter', { ...first }))
    jest.runAllTimers()
    expect(instance.popperInstance.reference).not.toBe(instance.reference)
    instance.hide()
    instance.setProps({ followCursor: false })
    instance.reference.dispatchEvent(new MouseEvent('mouseenter', { ...first }))
    jest.runAllTimers()
    instance.reference.dispatchEvent(firstMouseMoveEvent)
    expect(instance.popperInstance.reference).toBe(instance.reference)
  })

  it('can be updated via setProps()', () => {
    instance = tippyEnhanced(h(), { followCursor: 'horizontal', flip: false })
    instance.setProps({ followCursor: true })

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

  it('cleans up listener if untriggered before it shows', () => {
    instance = tippyEnhanced(h(), {
      followCursor: true,
      flip: false,
      delay: 1000,
    })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

    jest.advanceTimersByTime(100)

    instance.reference.dispatchEvent(firstMouseMoveEvent)
    instance.reference.dispatchEvent(new MouseEvent('mouseleave'))

    jest.advanceTimersByTime(900)

    instance.reference.dispatchEvent(secondMouseMoveEvent)

    rect = instance.popperInstance.reference.getBoundingClientRect()
  })

  it('should preserve lifecycle hooks', () => {
    const spies = {
      onTrigger: jest.fn(),
      onUntrigger: jest.fn(),
      onMount: jest.fn(),
      onHidden: jest.fn(),
      popperOptions: {
        onCreate: jest.fn(),
      },
    }
    instance = tippyEnhanced(h(), {
      followCursor: true,
      flip: false,
      ...spies,
    })

    const triggerEvent = new MouseEvent('mouseenter', { ...first })
    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

    jest.runAllTimers()

    const untriggerEvent = new MouseEvent('mouseleave')
    instance.reference.dispatchEvent(new MouseEvent('mouseleave'))

    expect(spies.onTrigger).toHaveBeenCalledWith(instance, triggerEvent)
    expect(spies.onUntrigger).toHaveBeenCalledWith(instance, untriggerEvent)
    expect(spies.onMount).toHaveBeenCalledWith(instance)
    expect(spies.onHidden).toHaveBeenCalledWith(instance)
    expect(spies.popperOptions.onCreate).toHaveBeenCalled()
  })

  it('should reset popperInstance.reference if triggered by `focus`', () => {
    instance = tippyEnhanced(h(), {
      followCursor: true,
      flip: false,
      delay: 1000,
    })

    instance.reference.dispatchEvent(new MouseEvent('mouseenter'))

    jest.runAllTimers()

    instance.reference.dispatchEvent(firstMouseMoveEvent)
    instance.reference.dispatchEvent(new MouseEvent('mouseleave'))

    instance.reference.dispatchEvent(secondMouseMoveEvent)

    instance.hide()

    instance.reference.dispatchEvent(new FocusEvent('focus'))

    expect(instance.popperInstance.reference).toBe(instance.reference)
  })
})

describe('inlinePositioning', () => {
  const rects = [
    {
      width: 37.25,
      height: 18,
      top: 116.875,
      right: 441.125,
      bottom: 134.875,
      left: 403.875,
    },
    {
      width: 231.859375,
      height: 18,
      top: 134.875,
      right: 451.859375,
      bottom: 152.875,
      left: 220,
    },
    {
      width: 231.6875,
      height: 18,
      top: 152.875,
      right: 451.6875,
      bottom: 170.875,
      left: 220,
    },
    {
      width: 151.203125,
      height: 18,
      top: 170.875,
      right: 371.203125,
      bottom: 188.875,
      left: 220,
    },
  ]

  const mockTarget = {
    getBoundingClientRect() {
      return 'getBoundingClientRect'
    },
    getClientRects() {
      return rects
    },
  }

  const singleRectTarget = { ...mockTarget }
  singleRectTarget.getClientRects = () => rects.slice(0, 1)

  describe('getBestRect', () => {
    it('default / non-applicable cases', () => {
      // non-real placement
      expect(
        getBestRect({
          reference: mockTarget,
          state: { currentPlacement: 'auto' },
        }),
      ).toBe('getBoundingClientRect')
      // Only 1 rect
      expect(
        getBestRect({
          reference: singleRectTarget,
          state: { currentPlacement: 'auto' },
        }),
      ).toBe('getBoundingClientRect')
    })

    it('"top" placement', () => {
      const received = getBestRect({
        reference: mockTarget,
        state: { currentPlacement: 'top' },
      })

      const rects = mockTarget.getClientRects()
      const first = rects[0]

      const expected = {
        ...first,
        height: first.bottom - first.top,
      }

      expect(received).toEqual(expected)
    })

    it('"bottom" placement', () => {
      const received = getBestRect({
        reference: mockTarget,
        state: { currentPlacement: 'bottom' },
      })

      const rects = mockTarget.getClientRects()
      const last = rects[rects.length - 1]

      const expected = {
        ...last,
        height: last.bottom - last.top,
      }

      expect(received).toEqual(expected)
    })

    it('"left" placement', () => {
      const received = getBestRect({
        reference: mockTarget,
        state: { currentPlacement: 'left' },
      })

      const rects = mockTarget.getClientRects()

      const expected = {
        top: rects[1].top,
        right: Math.round(rects[1].right),
        bottom: rects[rects.length - 1].bottom,
        left: Math.round(rects[1].left),
      }

      expected.width = expected.right - expected.left
      expected.height = expected.bottom - expected.top

      expect(received).toEqual(expected)
    })

    it('"right" placement', () => {
      const received = getBestRect({
        reference: mockTarget,
        state: { currentPlacement: 'right' },
      })

      const rects = mockTarget.getClientRects()

      const expected = {
        top: rects[1].top,
        right: Math.round(rects[1].right),
        bottom: rects[2].bottom,
        left: Math.round(rects[1].left),
      }

      expected.width = expected.right - expected.left
      expected.height = expected.bottom - expected.top

      expect(received).toEqual(expected)
    })
  })

  describe('applyCursorStrategy', () => {
    const createMouseEnterEvent = index =>
      new MouseEvent('mouseenter', {
        clientX: rects[index].left + 1,
        clientY: rects[index].top + 1,
      })

    it('should preserve `onTrigger` invocation', () => {
      const spy = jest.fn()
      const event = createMouseEnterEvent(0)

      const ref = h()
      ref.getClientRects = mockTarget.getClientRects
      const instance = tippy(ref, { triggerTarget: ref, onTrigger: spy })

      applyCursorStrategy(instance, 'cursor')

      ref.dispatchEvent(event)
      expect(spy).toHaveBeenCalledWith(instance, event)

      instance.hide()

      const newSpy = jest.fn()
      instance.setProps({ onTrigger: newSpy })
      instance.reference.dispatchEvent(event)
      expect(newSpy).toHaveBeenCalledWith(instance, event)
    })

    it('"cursor": should choose optimal rect based on cursor point', () => {
      const enhancedTippy = withInlinePositioning(tippy)
      positionSnapshots.forEach(({ placement, rect, coords }) => {
        const ref = h()
        ref.getClientRects = () => inlineElementClientRects
        const instance = enhancedTippy(ref, {
          placement,
          inlinePositioning: 'cursor',
        })
        const { x, y } = coords
        const event = new MouseEvent('mouseenter', { clientX: x, clientY: y })
        ref.dispatchEvent(event)
        jest.runAllTimers()
        expect(
          instance.popperInstance.reference.getBoundingClientRect(),
        ).toEqual(rect)
        instance.destroy()
      })
    })

    it('uses `getBestRect()` for `focus` trigger', () => {
      const ref = h()
      const instance = withInlinePositioning(tippy)(ref, {
        inlinePositioning: 'cursor',
      })

      ref.dispatchEvent(new FocusEvent('focus'))

      jest.runAllTimers()

      expect(instance.popperInstance.reference.getBoundingClientRect()).toEqual(
        getBestRect(instance),
      )
    })
  })

  describe('inlinePositioning', () => {
    const enhancedTippy = withInlinePositioning(tippy)

    it('false: should not change instance.popperInstance.reference', () => {
      const instance = enhancedTippy(h(), { inlinePositioning: false })
      instance.reference.dispatchEvent(new MouseEvent('mouseenter'))
      jest.runAllTimers()
      expect(instance.popperInstance.reference).toBe(instance.reference)
    })

    it('true: uses `getBestRect()` by default', () => {
      const instance = enhancedTippy(h(), { inlinePositioning: true })
      instance.reference.dispatchEvent(new MouseEvent('mouseenter'))
      jest.runAllTimers()
      expect(instance.popperInstance.reference.getBoundingClientRect()).toEqual(
        getBestRect(instance),
      )
    })

    it('preserves `onTrigger` lifecycle hook', () => {
      const spy = jest.fn()
      const newSpy = jest.fn()
      const instance = enhancedTippy(h(), {
        inlinePositioning: true,
        onTrigger: spy,
      })
      const event = new MouseEvent('mouseenter')
      instance.reference.dispatchEvent(event)
      jest.runAllTimers()
      expect(spy).toHaveBeenCalledWith(instance, event)
      instance.hide()
      instance.setProps({ onTrigger: newSpy })
      instance.reference.dispatchEvent(event)
      jest.runAllTimers()
      expect(newSpy).toHaveBeenCalledWith(instance, event)
    })
  })
})
