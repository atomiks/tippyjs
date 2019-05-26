import { Instance } from '../types'
import tippy from '..'
import { getValue, throwErrorWhen, hasOwnProperty } from '../utils'

interface InstanceMaybePartOfSingleton extends Instance {
  __singleton__?: boolean
}

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function createSingleton(
  tippyInstances: InstanceMaybePartOfSingleton[],
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

    const isAnyInstancePartOfExistingSingleton = tippyInstances.some(instance =>
      hasOwnProperty(instance, '__singleton__'),
    )

    throwErrorWhen(
      isAnyInstancePartOfExistingSingleton,
      'The passed tippy instance(s) are already part of an existing ' +
        'singleton instance. Make sure you destroy the previous singleton ' +
        'before calling `createSingleton()` again.',
    )

    tippyInstances.forEach(instance => {
      instance.__singleton__ = true
    })
  }

  const singletonInstance = tippy(document.createElement('div')) as Instance
  let { delay } = optionalProps

  let showTimeout: any
  let hideTimeout: any
  let onTrigger: (instance: Instance, event: Event) => void
  let onUntrigger: (instance: Instance, event: Event) => void

  function clearTimeouts(): void {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  tippyInstances.forEach(
    (instance): void => {
      // To prevent bugs with `hideOnClick`, we need to let the original tippy
      // instance also go through its lifecycle (i.e. be mounted to the DOM as
      // well). To prevent it from being seen/overlayed over the singleton
      // tippy, we can set its opacity to 0
      instance.popper.style.opacity = '0'

      onTrigger = instance.props.onTrigger
      onUntrigger = instance.props.onUntrigger

      const originalClearDelayTimeouts = instance.clearDelayTimeouts
      instance.clearDelayTimeouts = (): void => {
        originalClearDelayTimeouts()
        clearTimeouts()
      }

      instance.setProps({
        delay: 0,
        onTrigger(instance, event): void {
          onTrigger(instance, event)

          const props = { ...instance.props }
          delete props.delay

          singletonInstance.setProps(props)

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
            }, getValue(delay, 0, tippy.defaultProps.delay))
          }
        },
        onUntrigger(instance, event): void {
          onUntrigger(instance, event)

          clearTimeouts()
          hideTimeout = setTimeout((): void => {
            singletonInstance.hide()
          }, getValue(delay, 1, tippy.defaultProps.delay))
        },
      })

      // Ensure the lifecycles functions are updateable
      const originalSetProps = instance.setProps
      instance.setProps = (partialProps): void => {
        // `delay` can't be updated
        delete partialProps.delay

        originalSetProps(partialProps)

        onTrigger = partialProps.onTrigger || onTrigger
        onUntrigger = partialProps.onUntrigger || onUntrigger
      }
    },
  )

  const originalSetProps = singletonInstance.setProps
  singletonInstance.setProps = (partialProps): void => {
    delay = partialProps.delay !== undefined ? partialProps.delay : delay
    originalSetProps(partialProps)
  }

  const originalDestroy = singletonInstance.destroy
  singletonInstance.destroy = (
    shouldDestroyPassedInstances: boolean = true,
  ): void => {
    tippyInstances.forEach(
      (instance): void => {
        // Reset the original lifecycle hooks to prevent stack overflow if
        // calling again.
        // Note: users must always destroy the singleton instance before calling
        // `createSingleton()` again on the same instances.
        instance.setProps({
          onTrigger,
          onUntrigger,
        })

        if (__DEV__) {
          delete instance.__singleton__
        }

        if (shouldDestroyPassedInstances) {
          instance.destroy()
        }
      },
    )

    originalDestroy()
  }

  return singletonInstance
}
