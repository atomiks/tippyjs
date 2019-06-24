import { Instance, Targets, Props, Tippy, TippyCallWrapper } from '../types'
import {
  includes,
  getVirtualOffsets,
  hasOwnProperty,
  preserveInvocation,
  removeProperties,
  closestCallback,
} from '../utils'
import { getBasePlacement } from '../popper'
import { currentInput } from '../bindGlobalEventListeners'

export default function withFollowCursor(tippy: Tippy): TippyCallWrapper {
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

        let undo = (): void => {}

        const originalSetProps = instance.setProps
        instance.setProps = (partialProps): void => {
          if (hasOwnProperty(partialProps, 'followCursor')) {
            undo()

            if (partialProps.followCursor) {
              undo = applyFollowCursor(instance)
            }
          }

          originalSetProps(partialProps)
        }

        if (instance.props.followCursor) {
          undo = applyFollowCursor(instance)
        }
      },
    })
  }
}

function applyFollowCursor(instance: Instance): () => void {
  const { reference } = instance

  let lastMouseMoveEvent: MouseEvent
  let isPopperInstanceCreated = false
  let triggerEventType: string

  function addListener(): void {
    document.addEventListener('mousemove', onMouseMove)
  }

  function removeListener(): void {
    document.removeEventListener('mousemove', onMouseMove)
  }

  function onMouseMove(event: MouseEvent): void {
    if (!lastMouseMoveEvent) {
      return
    }

    const { clientX, clientY } = (lastMouseMoveEvent = event)

    if (!instance.popperInstance || !isPopperInstanceCreated) {
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
    const { size, x, y } = getVirtualOffsets(instance, isVerticalPlacement)

    if (isCursorOverReference || !instance.props.interactive) {
      instance.popperInstance!.reference = {
        // These `client` values don't get used by Popper.js if they are 0
        clientWidth: 0,
        clientHeight: 0,
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

    // IIFE context vs. ESM/CJS context
    const ci =
      // @ts-ignore
      // eslint-disable-next-line
      typeof tippy !== 'undefined' ? tippy.currentInput : currentInput

    if (
      ci.isTouch ||
      (followCursor === 'initial' && instance.state.isVisible)
    ) {
      removeListener()
    }
  }

  let {
    popperOptions,
    onMount,
    onTrigger,
    onUntrigger,
    onHidden,
  } = instance.props

  instance.setProps({
    popperOptions: {
      onCreate(data): void {
        preserveInvocation(
          popperOptions && popperOptions.onCreate,
          instance.props.popperOptions.onCreate,
          [data],
        )

        isPopperInstanceCreated = true
      },
    },
    onMount(): void {
      preserveInvocation(onMount, instance.props.onMount, [instance])

      if (triggerEventType !== 'focus') {
        onMouseMove(lastMouseMoveEvent)
      }
    },
    onTrigger(instance, event): void {
      preserveInvocation(onTrigger, instance.props.onTrigger, [instance, event])

      triggerEventType = event.type

      if (event instanceof MouseEvent) {
        lastMouseMoveEvent = event
      }

      // If the tooltip has a delay, we need to be listening to the mousemove as
      // soon as the trigger event is fired, so that it's in the correct position
      // upon mount.
      // Edge case: if the tooltip is still mounted, but then scheduleShow() is
      // called, it causes a jump.
      if (triggerEventType !== 'focus' && !instance.state.isMounted) {
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
    },
  })

  const originalSetProps = instance.setProps
  instance.setProps = (partialProps): void => {
    onTrigger = partialProps.onTrigger || onTrigger
    onUntrigger = partialProps.onUntrigger || onUntrigger
    onMount = partialProps.onMount || onMount
    onHidden = partialProps.onHidden || onHidden
    popperOptions = partialProps.popperOptions || popperOptions

    onMouseMove(lastMouseMoveEvent)

    originalSetProps(
      removeProperties(partialProps, [
        'onTrigger',
        'onUntrigger',
        'onMount',
        'onHidden',
        'popperOptions',
      ]),
    )
  }

  return (): void => {
    // Undo
    removeListener()

    if (instance.popperInstance) {
      instance.popperInstance.reference = instance.reference
    }

    instance.setProps = originalSetProps

    originalSetProps({
      popperOptions,
      onTrigger,
      onUntrigger,
      onMount,
      onHidden,
    })
  }
}
