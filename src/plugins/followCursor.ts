import {
  Props,
  PopperElement,
  FollowCursorInstance,
  LifecycleHooks,
  Placement,
} from '../types'
import { includes, closestCallback, useIfDefined } from '../utils'
import { getBasePlacement } from '../popper'
import { currentInput } from '../bindGlobalEventListeners'

export default {
  name: 'followCursor',
  defaultValue: false,
  fn(instance: FollowCursorInstance): Partial<LifecycleHooks> {
    const { reference, popper } = instance

    // Internal state
    let lastMouseMoveEvent: MouseEvent
    let triggerEvent: Event | null = null
    let normalizedPlacement: Placement
    let isInternallySettingControlledProp = false
    let shouldRemoveListener = true

    // These are controlled by this plugin, so we need to store the user's
    // original prop value
    const userProps: Partial<Props> = {}

    function setUserValuesForControlledProps(props: Partial<Props>): void {
      Object.keys(props).forEach((prop): void => {
        userProps[prop] = useIfDefined(props[prop], userProps[prop])
      })
    }

    // Due to `getVirtualOffsets()`, we need to reverse the placement if it's
    // shifted (start -> end, and vice-versa)
    function setNormalizedPlacement(): void {
      const { placement } = userProps

      if (!placement) {
        return
      }

      const shift = placement.split('-')[1]

      normalizedPlacement = (getIsEnabled() && shift
        ? placement.replace(shift, shift === 'start' ? 'end' : 'start')
        : placement) as Placement

      isInternallySettingControlledProp = true
      instance.setProps({ placement: normalizedPlacement })
      isInternallySettingControlledProp = false
    }

    function getIsEnabled(): boolean {
      if (!(triggerEvent instanceof MouseEvent)) {
        return false
      }

      return (
        instance.props.followCursor &&
        !(triggerEvent.clientX === 0 && triggerEvent.clientY === 0)
      )
    }

    function getIsInitialBehavior(): boolean {
      return (
        currentInput.isTouch ||
        (instance.props.followCursor === 'initial' && instance.state.isVisible)
      )
    }

    function resetReference(): void {
      if (instance.popperInstance) {
        instance.popperInstance.reference = reference
      }
    }

    function handleListeners(): void {
      if (!instance.popperInstance) {
        return
      }

      // Popper's scroll listeners make sense for `true` only. TODO: work out
      // how to only listen horizontal scroll for "horizontal" and vertical
      // scroll for "vertical"
      if (instance.props.followCursor !== true || getIsInitialBehavior()) {
        instance.popperInstance.disableEventListeners()
      }
    }

    function triggerLastMouseMove(): void {
      if (getIsEnabled()) {
        onMouseMove(lastMouseMoveEvent)
      }
    }

    function addListener(): void {
      document.addEventListener('mousemove', onMouseMove)
    }

    function removeListener(): void {
      document.removeEventListener('mousemove', onMouseMove)
    }

    function onMouseMove(event: MouseEvent): void {
      const { clientX, clientY } = (lastMouseMoveEvent = event)

      if (!instance.popperInstance || !instance.state.currentPlacement) {
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

      if (getIsInitialBehavior()) {
        removeListener()
      }
    }

    return {
      onCreate(): void {
        setUserValuesForControlledProps(instance.props)
      },
      onPropsUpdated(_, partialProps): void {
        if (!isInternallySettingControlledProp) {
          setUserValuesForControlledProps(partialProps)

          if (partialProps.placement) {
            setNormalizedPlacement()
          }
        }

        // A new placement causes the popperInstance to be recreated
        if (partialProps.placement) {
          handleListeners()
        }

        // Wait for `.update()` to set `instance.state.currentPlacement` to
        // the new placement
        setTimeout(triggerLastMouseMove)
      },
      onMount(): void {
        triggerLastMouseMove()
        handleListeners()
      },
      onTrigger(_, event): void {
        // Tapping on touch devices can trigger `mouseenter` then `focus`
        if (!triggerEvent) {
          triggerEvent = event
        }

        if (event instanceof MouseEvent) {
          lastMouseMoveEvent = event
        }

        // With "initial" behavior, flipping may be incorrect for the first show
        if (getIsInitialBehavior()) {
          isInternallySettingControlledProp = true
          instance.setProps({ flipOnUpdate: true })
          isInternallySettingControlledProp = false
        } else {
          instance.setProps({ flipOnUpdate: userProps.flipOnUpdate })
        }

        setNormalizedPlacement()

        if (getIsEnabled()) {
          // Ignore any trigger events fired immediately after the first one
          // e.g. `focus` can be fired right after `mouseenter` on touch devices
          if (event === triggerEvent) {
            addListener()
          }

          shouldRemoveListener = false
        } else {
          resetReference()
        }
      },
      onUntrigger(): void {
        // If untriggered before showing (`onHidden` will never be invoked)
        if (!instance.state.isVisible) {
          removeListener()
          triggerEvent = null
        }
      },
      onHide(): void {
        shouldRemoveListener = true
      },
      onHidden(): void {
        // If triggered between onHide -> onHidden lifecycles, avoid removing
        // the listener. This can occur with a `delay`
        if (shouldRemoveListener) {
          removeListener()
        }

        triggerEvent = null
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
