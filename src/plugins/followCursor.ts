import {
  Instance,
  Props,
  Placement,
  PopperElement,
  FollowCursorProps,
  LifecycleHooks,
} from '../types'
import { includes, closestCallback, useIfDefined } from '../utils'
import { getBasePlacement } from '../popper'
import { currentInput } from '../bindGlobalEventListeners'
import Popper from 'popper.js'

interface ExtendedInstance extends Instance {
  props: Props & FollowCursorProps
}

export default {
  name: 'followCursor',
  defaultValue: false,
  fn(instance: ExtendedInstance): Partial<LifecycleHooks> {
    const { reference, popper } = instance

    // Internal state
    let lastMouseMoveEvent: MouseEvent
    let firstTriggerEventType: string | null = null
    let isPopperInstanceCreated = false
    let normalizedPlacement: Placement
    let shouldBypassSetPropsHook = false

    // These are controlled by this plugin, so we need to store the user's
    // original prop value
    let placement: Props['placement']
    let flipOnUpdate: Props['flipOnUpdate']

    function setPrivateProps(props: Partial<Props>): void {
      placement = useIfDefined(props.placement, placement)
      flipOnUpdate = useIfDefined(props.flipOnUpdate, flipOnUpdate)
    }

    // Due to `getVirtualOffsets()`, we need to reverse the placement if it's
    // shifted (start -> end, and vice-versa)
    function setNormalizedPlacement(): void {
      const shift = placement.split('-')[1]

      normalizedPlacement = (instance.props.followCursor && shift
        ? placement.replace(shift, shift === 'start' ? 'end' : 'start')
        : placement) as Placement

      shouldBypassSetPropsHook = true
      instance.setProps({ placement: normalizedPlacement })
      shouldBypassSetPropsHook = false
    }

    function resetReference(): void {
      if (instance.popperInstance) {
        instance.popperInstance.reference = reference
      }
    }

    function addListener(): void {
      document.addEventListener('mousemove', onMouseMove)
    }

    function removeListener(): void {
      document.removeEventListener('mousemove', onMouseMove)
    }

    function onMouseMove(event: MouseEvent): void {
      if (firstTriggerEventType === 'focus' || !event) {
        return
      }

      const { clientX, clientY } = (lastMouseMoveEvent = event)

      if (
        !instance.props.followCursor ||
        !instance.popperInstance ||
        !isPopperInstanceCreated
      ) {
        return
      }

      // If the instance is interactive, avoid updating the position unless it's
      // over the reference element
      const isCursorOverReference = closestCallback(
        event.target as Element,
        (el: Element): boolean => el === reference,
      )

      const rect = reference.getBoundingClientRect()
      const { followCursor } = instance.props
      const isHorizontal = followCursor === 'horizontal'
      const isVertical = followCursor === 'vertical'
      const isVerticalPlacement = includes(
        ['top', 'bottom'],
        getBasePlacement(instance.state.currentPlacement),
      )

      // The virtual reference needs some size to prevent itself from overflowing
      const { size, x, y } = getVirtualOffsets(popper, isVerticalPlacement)

      if (isCursorOverReference || !instance.props.interactive) {
        instance.popperInstance.reference = {
          // These `client` values don't get used by Popper.js if they are 0
          clientWidth: 0,
          clientHeight: 0,
          // This will exist in next Popper.js feature release to fix #532
          // @ts-ignore
          referenceNode: reference,
          getBoundingClientRect: (): DOMRect | ClientRect => ({
            width: isVerticalPlacement ? size : 0,
            height: isVerticalPlacement ? 0 : size,
            top: (isHorizontal ? rect.top : clientY) - y,
            bottom: (isHorizontal ? rect.bottom : clientY) + y,
            left: (isVertical ? rect.left : clientX) - x,
            right: (isVertical ? rect.right : clientX) + x,
          }),
        }

        instance.popperInstance.update()
      }

      // "initial" behavior
      if (
        currentInput.isTouch ||
        (instance.props.followCursor === 'initial' && instance.state.isVisible)
      ) {
        removeListener()
      }
    }

    return {
      onCreate(): void {
        setPrivateProps(instance.props)
        setNormalizedPlacement()

        const { popperOptions } = instance.props

        instance.setProps({
          popperOptions: {
            ...popperOptions,
            // Technically we should try and preserve `onCreate` if `.setProps()`
            // is called after the instance is created, but before the
            // popperInstance is created, but this correctness seems extremely
            // unlikely to be needed
            onCreate(data: Popper.Data): void {
              if (popperOptions && popperOptions.onCreate) {
                popperOptions.onCreate(data)
              }

              isPopperInstanceCreated = true
            },
          },
        })
      },
      onPropsUpdated(_, partialProps): void {
        if (!shouldBypassSetPropsHook) {
          setPrivateProps(partialProps)

          if (partialProps.placement !== placement) {
            setNormalizedPlacement()
          }
        }

        onMouseMove(lastMouseMoveEvent)

        if (!instance.props.followCursor) {
          resetReference()
        }
      },
      onMount(): void {
        // Popper's scroll listeners make sense for `true`, where the cursor
        // follows both axes. TODO: somehow keep scroll listeners for vertical
        // scrolling for "vertical", and horizontal scrolling for "horizontal".
        if (
          // Touch devices always emulate "initial"
          currentInput.isTouch ||
          (firstTriggerEventType !== 'focus' &&
            instance.props.followCursor !== true)
        ) {
          instance.popperInstance!.disableEventListeners()
        }

        onMouseMove(lastMouseMoveEvent)
      },
      onTrigger(_, event): void {
        // Tapping on touch devices can trigger `mouseenter` then `focus`
        if (!firstTriggerEventType) {
          firstTriggerEventType = event.type
        }

        if (event instanceof MouseEvent) {
          lastMouseMoveEvent = event
        }

        if (firstTriggerEventType === 'focus') {
          resetReference()
        }

        if (
          instance.props.followCursor &&
          firstTriggerEventType !== 'focus' &&
          // Touch devices can add two listeners due to `mouseenter` + `focus`
          !(event.type === 'focus' && currentInput.isTouch) &&
          !(
            instance.state.isMounted &&
            instance.props.followCursor === 'initial'
          )
        ) {
          // Force `flipOnUpdate: true` in followCursor mode, as it's better UX
          // and works better with initial flips
          instance.setProps({ flipOnUpdate: true })
          addListener()
        } else {
          instance.setProps({ flipOnUpdate })
        }
      },
      onUntrigger(): void {
        // The listener gets added in `onTrigger()`, but due to potential delay(s)
        // the instance made be untriggered before it shows. `onHidden()` will
        // therefore never be invoked.
        if (!instance.state.isVisible) {
          removeListener()
        }

        firstTriggerEventType = null
      },
      onHidden(): void {
        // If scheduled to show before unmounting (e.g. delay: [500, 0]), the
        // listener should not be removed
        if (!instance.state.isScheduledToShow) {
          removeListener()
        }

        instance.popperInstance!.options.placement = normalizedPlacement
      },
    }
  },
}

export function getVirtualOffsets(
  popper: PopperElement,
  isVerticalPlacement: boolean,
): {
  size: number
  x: number
  y: number
} {
  const size = isVerticalPlacement ? popper.offsetWidth : popper.offsetHeight

  return {
    size,
    x: isVerticalPlacement ? size : 0,
    y: isVerticalPlacement ? 0 : size,
  }
}
