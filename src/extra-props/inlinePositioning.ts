import { Instance, Targets, Props, Tippy, TippyCallWrapper } from '../types'
import {
  includes,
  getVirtualOffsets,
  hasOwnProperty,
  arrayFrom,
  preserveInvocation,
  removeProperties,
} from '../utils'
import { getBasePlacement } from '../popper'
import { warnWhen } from '../validation'

interface ExtendedProps extends Props {
  inlinePositioning: boolean | 'cursor'
}

export default function withInlinePositioning(tippy: Tippy): TippyCallWrapper {
  return (
    targets: Targets,
    optionalProps?: Partial<ExtendedProps>,
  ): Instance | Instance[] => {
    const { inlinePositioning, ...props } = {
      inlinePositioning: false,
      ...optionalProps,
    }

    const returnValue = tippy(targets, props)

    if (inlinePositioning) {
      const instances = ([] as Instance[]).concat(returnValue)

      instances.forEach(
        (instance: Instance): void => {
          const virtualReference = document.createElement('div')

          let onTrigger = instance.props.onTrigger

          instance.setProps({
            onTrigger(instance, event) {
              preserveInvocation(onTrigger, instance.props.onTrigger, [
                instance,
                event,
              ])

              instance.popperInstance!.reference = virtualReference
            },
          })

          if (inlinePositioning === 'cursor') {
            applyCursorStrategy(instance)
          } else {
            virtualReference.getBoundingClientRect = (): ClientRect | DOMRect =>
              getBestRect(instance)
          }

          const originalSetProps = instance.setProps
          instance.setProps = (partialProps: Partial<ExtendedProps>): void => {
            // Making this prop fully dynamic is difficult and buggy, and it's
            // very unlikely the user will need to dynamically update it anyway.
            // Just warn.
            if (__DEV__) {
              warnWhen(
                hasOwnProperty(partialProps, 'inlinePositioning'),
                'Cannot change `inlinePositioning` prop. Destroy this ' +
                  'instance and create a new instance instead.',
              )
            }

            onTrigger = partialProps.onTrigger || onTrigger

            originalSetProps(removeProperties(partialProps, ['onTrigger']))
          }
        },
      )
    }

    return returnValue
  }
}

export function getBestRect(instance: Instance): ClientRect | DOMRect {
  const { reference } = instance
  const rects = reference.getClientRects()

  const basePlacement = getBasePlacement(instance.state.currentPlacement)

  let top
  let right
  let bottom
  let left

  // Not an inline element that spans 2 or more rows
  if (rects.length < 2) {
    return reference.getBoundingClientRect()
  }

  const firstRect = rects[0]
  const lastRect = rects[rects.length - 1]

  switch (basePlacement) {
    case 'top': {
      top = firstRect.top
      bottom = firstRect.bottom
      left = firstRect.left
      right = firstRect.right

      break
    }
    case 'bottom': {
      top = lastRect.top
      bottom = lastRect.bottom
      left = lastRect.left
      right = lastRect.right

      break
    }
    case 'left':
    case 'right': {
      const rectsArr = arrayFrom(rects)

      // The values are rounded because the rects are displayed via whole pixels
      // e.g. 140.1 and 139.9 are aligned the same
      const lefts = rectsArr.map((rects): number => Math.round(rects.left))
      const rights = rectsArr.map((rects): number => Math.round(rects.right))
      const minLeft = Math.min(...lefts)
      const maxRight = Math.max(...rights)

      const measureRects = rectsArr.filter(
        (rect): boolean =>
          basePlacement === 'left'
            ? Math.round(rect.left) === minLeft
            : Math.round(rect.right) === maxRight,
      )

      top = measureRects[0].top
      bottom = measureRects[measureRects.length - 1].bottom
      left = minLeft
      right = maxRight

      break
    }
    default: {
      return reference.getBoundingClientRect()
    }
  }

  return {
    width: right - left,
    height: bottom - top,
    top,
    right,
    bottom,
    left,
  }
}

export function applyCursorStrategy(instance: Instance): void {
  const { reference } = instance

  let onTrigger = instance.props.onTrigger

  instance.setProps({
    onTrigger(instance, event): void {
      preserveInvocation(onTrigger, instance.props.onTrigger, [instance, event])

      const rects = arrayFrom(reference.getClientRects())
      const basePlacement = getBasePlacement(instance.state.currentPlacement)

      if (event instanceof MouseEvent) {
        // We need to choose which rect to use. Check which rect
        // the cursor landed on.
        let index = -1
        rects.forEach(
          (rect, i): void => {
            const isVerticalPlacement = includes(
              ['top', 'bottom'],
              basePlacement,
            )

            const isWithinHorizontalBounds =
              event.clientX >= Math.floor(rect.left) &&
              event.clientX <= Math.ceil(rect.right)

            const isWithinAllBounds =
              isWithinHorizontalBounds &&
              event.clientY >= Math.floor(rect.top) &&
              event.clientY <= Math.ceil(rect.bottom)

            if (isVerticalPlacement) {
              if (
                isWithinHorizontalBounds &&
                ((basePlacement === 'top' && index === -1) ||
                  basePlacement === 'bottom')
              ) {
                index = i
              }
            } else if (
              isWithinAllBounds &&
              ((basePlacement === 'left' && index === -1) ||
                basePlacement === 'right')
            ) {
              index = i
            }
          },
        )

        instance.popperInstance!.reference.getBoundingClientRect = ():
          | ClientRect
          | DOMRect => {
          const rect = reference.getClientRects()[index]

          const isVerticalPlacement = includes(
            ['top', 'bottom'],
            getBasePlacement(instance.state.currentPlacement),
          )

          const { size, x, y } = getVirtualOffsets(
            instance,
            isVerticalPlacement,
          )

          const baseRect = {
            width: isVerticalPlacement ? size : 0,
            height: isVerticalPlacement ? 0 : size,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
          }

          return isVerticalPlacement
            ? {
                ...baseRect,
                left: event.clientX - x,
                right: event.clientX + x,
              }
            : {
                ...baseRect,
                top: event.clientY - y,
                bottom: event.clientY + y,
              }
        }
      } else {
        // Fallback to `getBestRect` since "cursor" coords don't apply to
        // non-MouseEvents
        instance.popperInstance!.reference.getBoundingClientRect = ():
          | ClientRect
          | DOMRect => getBestRect(instance)
      }
    },
  })

  const originalSetProps = instance.setProps
  instance.setProps = (partialProps: Partial<ExtendedProps>): void => {
    onTrigger = partialProps.onTrigger || onTrigger

    originalSetProps(removeProperties(partialProps, ['onTrigger']))
  }
}
