import {
  Instance,
  Targets,
  Props,
  Tippy,
  TippyCallWrapper,
  Placement,
  PopperElement,
} from '../types'
import {
  includes,
  preserveInvocation,
  removeProperties,
  closestCallback,
} from '../utils'
import { getBasePlacement } from '../popper'
import { currentInput } from '../bindGlobalEventListeners'
import Popper from 'popper.js'

export default function followCursor(tippy: Tippy): TippyCallWrapper {
  return (
    targets: Targets,
    optionalProps?: Partial<Props>,
  ): Instance | Instance[] => {
    return tippy(targets, {
      ...optionalProps,
      onCreate(instance): void {
        preserveInvocation(
          optionalProps && optionalProps.onCreate,
          instance.props.onCreate,
          [instance],
        )

        if (__DEV__) {
          instance.__extraProps!.followCursor = true
        }

        if (instance.props.followCursor) {
          applyFollowCursor(instance)
        }
      },
    })
  }
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

function applyFollowCursor(instance: Instance): void {
  const { reference } = instance
  const originalSetProps = instance.setProps

  let lastMouseMoveEvent: MouseEvent
  let isPopperInstanceCreated = false
  let wasTriggeredByFocus = false

  function addListener(): void {
    document.addEventListener('mousemove', onMouseMove)
  }

  function removeListener(): void {
    document.removeEventListener('mousemove', onMouseMove)
  }

  function onMouseMove(event: MouseEvent): void {
    if (wasTriggeredByFocus || !event) {
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
    const { followCursor } = instance.props as Props
    const isHorizontal = followCursor === 'horizontal'
    const isVertical = followCursor === 'vertical'
    const isVerticalPlacement = includes(
      ['top', 'bottom'],
      getBasePlacement(instance.state.currentPlacement),
    )

    // The virtual reference needs some size to prevent itself from overflowing
    const { size, x, y } = getVirtualOffsets(
      instance.popper,
      isVerticalPlacement,
    )

    if (isCursorOverReference || !instance.props.interactive) {
      instance.popperInstance!.reference = {
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

      instance.popperInstance!.update()
    }

    if (
      currentInput.isTouch ||
      (followCursor === 'initial' && instance.state.isVisible)
    ) {
      removeListener()
    }
  }

  let {
    placement,
    popperOptions,
    onMount,
    onTrigger,
    onUntrigger,
    onHidden,
  } = instance.props

  // Due to the virtual offsets normalization when using `followCursor`,
  // we need to use the opposite placement
  let normalizedPlacement = placement

  function setNormalizedPlacement(): void {
    const shift = placement.split('-')[1]

    normalizedPlacement = (instance.props.followCursor && shift
      ? placement.replace(shift, shift === 'start' ? 'end' : 'start')
      : placement) as Placement

    originalSetProps({ placement: normalizedPlacement })
  }

  setNormalizedPlacement()

  function popperOnCreate(data: Popper.Data): void {
    preserveInvocation(
      popperOptions && popperOptions.onCreate,
      instance.props.popperOptions.onCreate,
      [data],
    )

    isPopperInstanceCreated = true
  }

  instance.setProps({
    popperOptions: {
      ...popperOptions,
      onCreate: popperOnCreate,
    },
    onMount(instance): void {
      preserveInvocation(onMount, instance.props.onMount, [instance])

      // Popper's scroll listeners make sense for `true`, where the cursor
      // follows both axes. TODO: somehow keep scroll listeners for vertical
      // scrolling for "vertical", and horizontal scrolling for "horizontal".
      if (!wasTriggeredByFocus && instance.props.followCursor !== true) {
        instance.popperInstance!.disableEventListeners()
      }

      onMouseMove(lastMouseMoveEvent)
    },
    onTrigger(instance, event): void {
      preserveInvocation(onTrigger, instance.props.onTrigger, [instance, event])

      wasTriggeredByFocus = event.type === 'focus'

      if (event instanceof MouseEvent) {
        lastMouseMoveEvent = event
      }

      if (wasTriggeredByFocus && instance.popperInstance) {
        instance.popperInstance.reference = instance.reference
      }

      if (
        instance.props.followCursor &&
        !wasTriggeredByFocus &&
        !(instance.state.isMounted && instance.props.followCursor === 'initial')
      ) {
        addListener()
      }
    },
    onUntrigger(instance, event): void {
      preserveInvocation(onUntrigger, instance.props.onUntrigger, [
        instance,
        event,
      ])

      // The listener gets added in `onTrigger()`, but due to potential delay(s)
      // the instance made be untriggered before it shows. `onHidden()` will
      // therefore never be invoked.
      if (!instance.state.isVisible) {
        removeListener()
      }
    },
    onHidden(): void {
      preserveInvocation(onHidden, instance.props.onHidden, [instance])

      // If scheduled to show before unmounting (e.g. delay: [500, 0]), the
      // listener should not be removed
      if (!instance.state.isScheduledToShow) {
        removeListener()
      }

      instance.popperInstance!.options.placement = normalizedPlacement
    },
  })

  instance.setProps = (partialProps): void => {
    placement = partialProps.placement || placement
    onTrigger = partialProps.onTrigger || onTrigger
    onUntrigger = partialProps.onUntrigger || onUntrigger
    onMount = partialProps.onMount || onMount
    onHidden = partialProps.onHidden || onHidden
    popperOptions = partialProps.popperOptions || popperOptions

    originalSetProps({
      popperOptions: {
        ...popperOptions,
        onCreate: popperOnCreate,
      },
      ...removeProperties(partialProps, [
        'placement',
        'onTrigger',
        'onUntrigger',
        'onMount',
        'onHidden',
        'popperOptions',
      ]),
    })

    setNormalizedPlacement()

    onMouseMove(lastMouseMoveEvent)
  }
}
