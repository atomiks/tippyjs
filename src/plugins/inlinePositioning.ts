import { Instance, LifecycleHooks } from '../types'
import { arrayFrom } from '../utils'
import { getBasePlacement } from '../popper'

// TODO: Work on a "cursor" value so it chooses a rect optimal to the cursor
// position. This will require the `followCursor` plugin's fixes for overflow
// due to using event.clientX/Y values. (normalizedPlacement, getVirtualOffsets)
export default {
  name: 'inlinePositioning',
  defaultValue: true,
  fn(instance: Instance): Partial<LifecycleHooks> {
    const { reference } = instance

    return {
      onHidden(): void {
        instance.popperInstance!.reference = reference
      },
      onTrigger(): void {
        if (!instance.props.inlinePositioning) {
          return
        }

        instance.popperInstance!.reference = {
          // @ts-ignore - awaiting popper.js@1.16.0 release
          referenceNode: reference,
          clientWidth: 0,
          clientHeight: 0,
          getBoundingClientRect(): ClientRect | DOMRect {
            console.log(
              JSON.stringify({
                placement:
                  instance.state.currentPlacement &&
                  getBasePlacement(instance.state.currentPlacement),
                clientRects: arrayFrom(reference.getClientRects()),
                boundingRect: reference.getBoundingClientRect(),
                result: getInlineBoundingClientRect(
                  instance.state.currentPlacement &&
                    getBasePlacement(instance.state.currentPlacement),
                  reference.getBoundingClientRect(),
                  arrayFrom(reference.getClientRects()),
                ),
              }),
            )

            return getInlineBoundingClientRect(
              instance.state.currentPlacement &&
                getBasePlacement(instance.state.currentPlacement),
              reference.getBoundingClientRect(),
              arrayFrom(reference.getClientRects()),
            )
          },
        }
      },
    }
  },
}

export function getInlineBoundingClientRect(
  currentBasePlacement: Instance['state']['currentPlacement'],
  boundingRect: ClientRect,
  clientRects: ClientRect[],
): ClientRect {
  // Not an inline element, or placement is not yet known
  if (clientRects.length < 2 || currentBasePlacement === null) {
    return boundingRect
  }

  let rectToUse: ClientRect

  switch (currentBasePlacement) {
    case 'top':
    case 'bottom': {
      const firstRect = clientRects[0]
      const lastRect = clientRects[clientRects.length - 1]
      const isTop = currentBasePlacement === 'top'

      const top = firstRect.top
      const bottom = lastRect.bottom
      const left = isTop ? firstRect.left : lastRect.left
      const right = isTop ? firstRect.right : lastRect.right
      const width = right - left
      const height = bottom - top

      rectToUse = { top, bottom, left, right, width, height }

      break
    }
    case 'left':
    case 'right': {
      const minLeft = Math.min(...clientRects.map(rects => rects.left))
      const maxRight = Math.max(...clientRects.map(rects => rects.right))
      const measureRects = clientRects.filter(rect =>
        currentBasePlacement === 'left'
          ? rect.left === minLeft
          : rect.right === maxRight,
      )

      const top = measureRects[0].top
      const bottom = measureRects[measureRects.length - 1].bottom
      const left = minLeft
      const right = maxRight
      const width = right - left
      const height = bottom - top

      rectToUse = { top, bottom, left, right, width, height }

      break
    }
    default: {
      rectToUse = boundingRect
    }
  }

  return rectToUse
}
