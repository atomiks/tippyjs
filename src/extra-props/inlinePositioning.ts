import { Instance, Targets, Props, Tippy } from '../types'
import { arrayFrom } from '../ponyfills'
import {
  includes,
  getVirtualOffsets,
  isRealElement,
  hasOwnProperty,
} from '../utils'
import { getBasePlacement } from '../popper'

interface ExtendedProps extends Props {
  inlinePositioning: boolean | 'cursorRect' | 'cursorPoint'
}

type TippyCallWrapper = (
  targets: Targets,
  optionalProps?: Partial<ExtendedProps>,
) => Instance | Instance[]

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

      const newInstances = instances.map(
        ({ reference, props, destroy }): Instance => {
          destroy()

          const newInstance = tippy(document.createElement('div'), {
            ...props,
            triggerTarget: reference,
          }) as Instance

          let undo = (): void => {}

          function apply() {
            undo()

            if (typeof inlinePositioning === 'string') {
              undo = applyCursorStrategy(newInstance, inlinePositioning)
            } else {
              newInstance.reference.getBoundingClientRect = ():
                | ClientRect
                | DOMRect => getBestRect(newInstance)
            }
          }

          apply()

          const originalSetProps = newInstance.setProps
          newInstance.setProps = (
            partialProps: Partial<ExtendedProps>,
          ): void => {
            if (hasOwnProperty(partialProps, 'inlinePositioning')) {
              if (partialProps.inlinePositioning) {
                apply()
              } else {
                undo()
              }
            }

            originalSetProps(partialProps)
          }

          return newInstance
        },
      )

      return isRealElement(targets) ? newInstances[0] : newInstances
    }

    return returnValue
  }
}

function getBestRect(instance: Instance): ClientRect | DOMRect {
  const target = instance.props.triggerTarget as Element
  const rects = target.getClientRects()

  const basePlacement = getBasePlacement(instance.state.currentPlacement)

  let top
  let right
  let bottom
  let left

  // Not an inline element that spans 2 or more rows
  if (rects.length < 2) {
    return target.getBoundingClientRect()
  }

  switch (basePlacement) {
    case 'top':
    case 'bottom': {
      const firstRect = rects[0]
      const lastRect = rects[rects.length - 1]
      const isTop = basePlacement === 'top'

      top = firstRect.top
      bottom = lastRect.bottom
      left = isTop ? firstRect.left : lastRect.left
      right = isTop ? firstRect.right : lastRect.right

      break
    }
    case 'left':
    case 'right': {
      const rectsArr = arrayFrom(rects)

      // The values are rounded because the rects are displayed via whole pixels
      // e.g. 140.1 and 139.9 are aligned the same
      const lefts = rectsArr.map(rects => Math.round(rects.left))
      const rights = rectsArr.map(rects => Math.round(rects.right))
      const minLeft = Math.min(...lefts)
      const maxRight = Math.max(...rights)

      const measureRects = rectsArr.filter(rect =>
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
      return target.getBoundingClientRect()
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

function applyCursorStrategy(
  instance: Instance,
  type: 'cursorRect' | 'cursorPoint',
): () => void {
  const target = instance.props.triggerTarget as Element

  let originalGetBoundingClientRect = target.getBoundingClientRect
  let onTrigger = instance.props.onTrigger

  instance.setProps({
    onTrigger(_, event) {
      if (onTrigger && onTrigger !== instance.props.onTrigger) {
        onTrigger(_, event)
      }

      const rects = arrayFrom(target.getClientRects())

      if (event instanceof MouseEvent) {
        // We need to choose which rect to use. Check which rect
        // the cursor landed on.
        let index = -1
        rects.forEach((rect, i) => {
          if (
            event.clientY >= Math.floor(rect.top) &&
            event.clientY <= Math.ceil(rect.bottom) &&
            event.clientX >= Math.floor(rect.left) &&
            event.clientX <= Math.ceil(rect.right)
          ) {
            index = i
          }
        })

        instance.reference.getBoundingClientRect = (): ClientRect | DOMRect => {
          if (type === 'cursorPoint') {
            const rect = target.getClientRects()[index]

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
          } else {
            return target.getClientRects()[index]
          }
        }
      } else {
        instance.reference.getBoundingClientRect = originalGetBoundingClientRect
      }
    },
  })

  const originalSetProps = instance.setProps
  instance.setProps = (props: Partial<ExtendedProps>): void => {
    if (props.onTrigger) {
      onTrigger = props.onTrigger
      delete props.onTrigger
    }

    originalSetProps(props)
  }

  return (): void => {
    instance.setProps = originalSetProps
    originalSetProps({ onTrigger })
  }
}
