import { Instance, Props } from '../types'
import tippy from '..'
import {
  getValueAtIndexOrReturn,
  hasOwnProperty,
  preserveInvocation,
  invokeWithArgsOrReturn,
  removeProperties,
} from '../utils'
import {
  throwErrorWhen,
  createInvalidCreateSingletonArgumentError,
  ARRAY_MISTAKE_ERROR,
  EXISTING_SINGLETON_ERROR,
} from '../validation'

interface SingletonInstance extends Instance {
  __singleton: boolean
  __originalClearDelayTimeouts: Instance['clearDelayTimeouts']
  __originalSetProps: Instance['setProps']
  __originalProps: {
    aria: Props['aria']
    delay: Props['delay']
    onShow: Props['onShow']
    onTrigger: Props['onTrigger']
    onUntrigger: Props['onUntrigger']
  }
}

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function createSingleton(
  tippyInstances: SingletonInstance[],
  optionalProps: { delay: number | [number, number] } = { delay: 0 },
): Instance {
  if (__DEV__) {
    if (!Array.isArray(tippyInstances)) {
      throwErrorWhen(
        !tippyInstances,
        createInvalidCreateSingletonArgumentError(tippyInstances),
      )

      throwErrorWhen(
        // @ts-ignore
        tippyInstances.reference && tippyInstances.reference._tippy,
        ARRAY_MISTAKE_ERROR,
      )
    }

    const isAnyInstancePartOfExistingSingleton = tippyInstances.some(
      (instance): boolean => hasOwnProperty(instance, '__singleton'),
    )

    throwErrorWhen(
      isAnyInstancePartOfExistingSingleton,
      EXISTING_SINGLETON_ERROR,
    )

    tippyInstances.forEach((instance): void => {
      Object.defineProperty(instance, '__singleton', {
        value: true,
        enumerable: false,
        configurable: true,
      })
    })
  }

  // The user needs to specify their own enhanced tippy function to use extra
  // props
  // @ts-ignore
  const tippyConstructor = createSingleton.tippy || tippy
  const singletonInstance = tippyConstructor(document.createElement('div'))

  let { delay } = optionalProps

  let prevReference: Element
  let prevAria: Props['aria']
  let showTimeout: any

  tippyInstances.forEach((instance): void => {
    instance.__originalProps = {
      aria: instance.props.aria,
      delay: instance.props.delay,
      onShow: instance.props.onShow,
      onTrigger: instance.props.onTrigger,
      onUntrigger: instance.props.onUntrigger,
    }

    instance.__originalClearDelayTimeouts = instance.clearDelayTimeouts
    instance.clearDelayTimeouts = (): void => {
      instance.__originalClearDelayTimeouts()
      clearTimeout(showTimeout)
    }

    function handleAriaDescribedBy(): void {
      if (instance.__originalProps.aria) {
        instance.reference.setAttribute(
          `aria-${instance.__originalProps.aria}`,
          singletonInstance.popperChildren.tooltip.id,
        )
      }
    }

    instance.setProps({
      delay,
      aria: null,
      onShow: () => false,
      onUntrigger(_, event): void {
        preserveInvocation(
          instance.__originalProps.onUntrigger,
          instance.props.onUntrigger,
          [instance, event],
        )

        if (prevAria) {
          prevReference.removeAttribute(`aria-${prevAria}`)
        }
      },
      onTrigger(_, event): void {
        preserveInvocation(
          instance.__originalProps.onTrigger,
          instance.props.onTrigger,
          [instance, event],
        )

        singletonInstance.clearDelayTimeouts()

        singletonInstance.setProps({
          ...instance.props,
          onShow: instance.__originalProps.onShow,
          triggerTarget: instance.reference,
        })

        const { appendTo } = instance.props

        singletonInstance.reference.referenceNode =
          appendTo === 'parent'
            ? instance.reference.parentNode
            : invokeWithArgsOrReturn(appendTo, [instance.reference])

        singletonInstance.reference.getBoundingClientRect = ():
          | DOMRect
          | ClientRect => {
          return instance.reference.getBoundingClientRect()
        }

        clearTimeout(showTimeout)

        if (singletonInstance.state.isVisible) {
          handleAriaDescribedBy()
        }

        // Edge case: if the tippy is currently hiding (but still mounted and
        // visible due to its opacity), it will slide to the new reference
        // element but fully to fade out before fading back in.
        // Also, we need to ensure the `popper` element doesn't set its
        // `transitionDuration` to 0ms, so it can transition smoothly
        if (
          !singletonInstance.state.isVisible &&
          singletonInstance.state.isMounted
        ) {
          singletonInstance.show(undefined, false)
          handleAriaDescribedBy()
        } else {
          const defaultDelay = tippyConstructor.defaultProps.delay
          showTimeout = setTimeout((): void => {
            singletonInstance.show()
            handleAriaDescribedBy()
          }, getValueAtIndexOrReturn(delay, 0, defaultDelay))
        }

        prevReference = instance.reference
        prevAria = instance.__originalProps.aria
      },
    })

    // Ensure the lifecycle functions can be updated
    instance.__originalSetProps = instance.setProps
    instance.setProps = (partialProps): void => {
      if (partialProps.aria !== undefined) {
        instance.__originalProps.aria = partialProps.aria
      }

      if (partialProps.delay !== undefined) {
        instance.__originalProps.delay = partialProps.delay
      }

      if (partialProps.onShow) {
        instance.__originalProps.onShow = partialProps.onShow
      }

      if (partialProps.onTrigger) {
        instance.__originalProps.onTrigger = partialProps.onTrigger
      }

      if (partialProps.onUntrigger) {
        instance.__originalProps.onUntrigger = partialProps.onUntrigger
      }

      instance.__originalSetProps({
        ...removeProperties(partialProps, [
          'aria',
          'delay',
          'onShow',
          'onTrigger',
          'onUntrigger',
        ]),
        delay,
      })
    }
  })

  const originalSetProps = singletonInstance.setProps
  singletonInstance.setProps = (partialProps: Partial<Props>): void => {
    if (partialProps.delay !== undefined) {
      delay = partialProps.delay

      tippyInstances.forEach((instance): void => {
        instance.setProps({ delay })
      })
    }

    originalSetProps(partialProps)
  }

  const originalDestroy = singletonInstance.destroy
  singletonInstance.destroy = (
    // ESLint parser and TypeScript are condradicting each other here for some
    // reason
    // eslint-disable-next-line
    shouldDestroyPassedInstances: boolean = true,
  ): void => {
    tippyInstances.forEach((instance): void => {
      if (instance.state.isDestroyed) {
        return
      }

      // Restore the instances to their original state
      instance.clearDelayTimeouts = instance.__originalClearDelayTimeouts
      instance.setProps = instance.__originalSetProps
      instance.setProps(instance.__originalProps)

      delete instance.__originalClearDelayTimeouts
      delete instance.__originalProps
      delete instance.__originalSetProps

      if (__DEV__) {
        delete instance.__singleton
      }

      if (shouldDestroyPassedInstances) {
        instance.destroy()
      }
    })

    originalDestroy()
  }

  return singletonInstance
}
