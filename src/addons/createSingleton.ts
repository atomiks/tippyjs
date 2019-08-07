import { Instance, Props } from '../types'
import tippy from '..'
import {
  getValueAtIndexOrReturn,
  hasOwnProperty,
  preserveInvocation,
  invokeWithArgsOrReturn,
  removeProperties,
} from '../utils'
import { throwErrorWhen } from '../validation'
import { NON_UPDATEABLE_PROPS } from '../constants'

interface SingletonInstance extends Instance {
  __singleton: boolean
  __originalClearDelayTimeouts: Instance['clearDelayTimeouts']
  __originalSetProps: Instance['setProps']
  __originalProps: {
    delay: Props['delay']
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
        'First argument to `createSingleton()` must be an array of tippy ' +
          'instances. The passed value was `' +
          tippyInstances +
          '`',
      )

      throwErrorWhen(
        // @ts-ignore
        tippyInstances.reference && tippyInstances.reference._tippy,
        'First argument to `createSingleton()` must be an *array* of tippy ' +
          'instances. The passed value was a *single* tippy instance.',
      )
    }

    const isAnyInstancePartOfExistingSingleton = tippyInstances.some(
      (instance): boolean => hasOwnProperty(instance, '__singleton'),
    )

    throwErrorWhen(
      isAnyInstancePartOfExistingSingleton,
      'The passed tippy instance(s) are already part of an existing ' +
        'singleton instance. Make sure you destroy the previous singleton ' +
        'before calling `createSingleton()` again.',
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
      onTrigger: instance.props.onTrigger,
      onUntrigger: instance.props.onUntrigger,
    }

    // To prevent bugs with `hideOnClick`, we need to let the original tippy
    // instance also go through its lifecycle (i.e. be mounted to the DOM as
    // well). To prevent it from being seen/overlayed over the singleton
    // tippy, we can set its opacity to 0
    instance.popper.style.opacity = '0'

    instance.__originalClearDelayTimeouts = instance.clearDelayTimeouts
    instance.clearDelayTimeouts = (): void => {
      instance.__originalClearDelayTimeouts()
      clearTimeouts()
    }

    instance.setProps({
      delay: 0,
      onTrigger(_, event): void {
        preserveInvocation(
          instance.__originalProps.onTrigger,
          instance.props.onTrigger,
          [instance, event],
        )

        singletonInstance.setProps(
          removeProperties(
            instance.props,
            NON_UPDATEABLE_PROPS.concat('delay'),
          ),
        )

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
      onUntrigger(_, event): void {
        preserveInvocation(
          instance.__originalProps.onUntrigger,
          instance.props.onUntrigger,
          [instance, event],
        )

        clearTimeouts()
        hideTimeout = setTimeout((): void => {
          singletonInstance.hide()
        }, getValueAtIndexOrReturn(delay, 1, tippy.defaultProps.delay))
      },
    })

    // Ensure the lifecycle functions can be updated
    instance.__originalSetProps = instance.setProps
    instance.setProps = (partialProps): void => {
      if (partialProps.onTrigger) {
        instance.__originalProps.onTrigger = partialProps.onTrigger
      }

      if (partialProps.onUntrigger) {
        instance.__originalProps.onUntrigger = partialProps.onUntrigger
      }

      instance.__originalSetProps(
        removeProperties(partialProps, ['delay', 'onTrigger', 'onUntrigger']),
      )
    }
  })

  const originalSetProps = singletonInstance.setProps
  singletonInstance.setProps = (partialProps: Partial<Props>): void => {
    delay = partialProps.delay !== undefined ? partialProps.delay : delay
    originalSetProps(partialProps)
  }

  const originalDestroy = singletonInstance.destroy
  singletonInstance.destroy = (
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
