import tippy from '../../src'
import followCursor from '../../src/extra-props/followCursor'
import {
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
          props: { triggerTarget: mockTarget },
          state: { currentPlacement: 'auto' },
        }),
      ).toBe('getBoundingClientRect')
      // Only 1 rect
      expect(
        getBestRect({
          props: { triggerTarget: singleRectTarget },
          state: { currentPlacement: 'auto' },
        }),
      ).toBe('getBoundingClientRect')
    })

    it('"top" placement', () => {
      const received = getBestRect({
        props: { triggerTarget: mockTarget },
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
        props: { triggerTarget: mockTarget },
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
        props: { triggerTarget: mockTarget },
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
        props: { triggerTarget: mockTarget },
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

      applyCursorStrategy(instance, 'cursorRect')

      ref.dispatchEvent(event)
      expect(spy).toHaveBeenCalledWith(instance, event)

      instance.hide()

      const newSpy = jest.fn()
      instance.setProps({ onTrigger: newSpy })
      instance.reference.dispatchEvent(event)
      expect(newSpy).toHaveBeenCalledWith(instance, event)
    })

    it('"cursorRect": should choose the correct rect', () => {
      const ref = h()
      ref.getClientRects = mockTarget.getClientRects
      const instance = tippy(ref, { triggerTarget: ref })

      applyCursorStrategy(instance, 'cursorRect')

      for (let i = 0; i < rects.length; i++) {
        ref.dispatchEvent(createMouseEnterEvent(i))
        expect(ref.getBoundingClientRect()).toBe(rects[i])
      }
    })

    it('"cursorPoint": chooses correct rect and includes axis variation', () => {
      const placements = ['top', 'bottom', 'left', 'right']

      placements.forEach(placement => {
        const ref = h()
        ref.getClientRects = mockTarget.getClientRects
        const instance = tippy(ref, { placement, triggerTarget: ref })

        applyCursorStrategy(instance, 'cursorPoint')

        for (let i = 0; i < rects.length; i++) {
          const event = createMouseEnterEvent(i)
          ref.dispatchEvent(event)
          expect(ref.getBoundingClientRect()).toEqual({
            ...rects[i],
            width: 0,
            height: 0,
            ...(['top', 'bottom'].includes(placement) && {
              left: event.clientX,
              right: event.clientX,
            }),
            ...(['left', 'right'].includes(placement) && {
              top: event.clientY,
              bottom: event.clientY,
            }),
          })
        }
      })
    })

    it('restores original getBoundingClientRect for `focus` trigger', () => {
      const ref = h()
      const originalGetBoundingClientRect = ref.getBoundingClientRect
      ref.getClientRects = mockTarget.getClientRects
      const instance = tippy(ref, { triggerTarget: ref })

      applyCursorStrategy(instance, 'cursorRect')

      ref.dispatchEvent(new FocusEvent('focus'))

      expect(ref.getBoundingClientRect).toBe(originalGetBoundingClientRect)
    })
  })
})
