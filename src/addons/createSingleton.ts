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
import { NON_UPDATEABLE_PROPS } from '../constants'

interface SingletonInstance extends Instance {
  __singleton: boolean
  __originalClearDelayTimeouts: Instance['clearDelayTimeouts']
  __originalSetProps: Instance['setProps']
  __originalProps: {
    delay: Props['delay']
    onShow: Props['onShow']
    onTrigger: Props['onTrigger']
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

  let showTimeout: any
  let hideTimeout: any

  function clearTimeouts(): void {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  tippyInstances.forEach((instance): void => {
    instance.__originalProps = {
      delay: instance.props.delay,
      onShow: instance.props.onShow,
      onTrigger: instance.props.onTrigger,
    }

    instance.__originalClearDelayTimeouts = instance.clearDelayTimeouts
    instance.clearDelayTimeouts = (): void => {
      instance.__originalClearDelayTimeouts()
      clearTimeouts()
    }

    instance.setProps({
      delay,
      onShow: () => false,
      onTrigger(_, event): void {
        preserveInvocation(
          instance.__originalProps.onTrigger,
          instance.props.onTrigger,
          [instance, event],
        )

        singletonInstance.clearDelayTimeouts()

        singletonInstance.setProps({
          ...removeProperties(instance.props, NON_UPDATEABLE_PROPS),
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

        clearTimeouts()

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
        } else {
          showTimeout = setTimeout((): void => {
            singletonInstance.show()
          }, getValueAtIndexOrReturn(delay, 0, tippy.defaultProps.delay))
        }
      },
    })

    // Ensure the lifecycle functions can be updated
    instance.__originalSetProps = instance.setProps
    instance.setProps = (partialProps): void => {
      if (partialProps.onTrigger) {
        instance.__originalProps.onTrigger = partialProps.onTrigger
      }

      if (partialProps.onShow) {
        instance.__originalProps.onShow = partialProps.onShow
      }

      if (partialProps.delay !== undefined) {
        instance.__originalProps.delay = partialProps.delay
      }

      instance.__originalSetProps({
        ...removeProperties(partialProps, [
          ...NON_UPDATEABLE_PROPS,
          'onTrigger',
          'onShow',
          'delay',
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
