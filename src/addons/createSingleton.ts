import { Instance } from '../types'
import tippy from '..'
import { getValue } from '../utils'

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function createSingleton(
  tippyInstances: Instance[],
  optionalProps: { delay: number | [number, number] } = { delay: 0 },
): Instance {
  if (__DEV__) {
    if (!Array.isArray(tippyInstances)) {
      if (!tippyInstances) {
        throw new Error(
          '[tippy.js ERROR] First argument to `createSingleton()` must ' +
            'be an array of tippy instances. The passed value was `' +
            tippyInstances +
            '`',
        )
        // @ts-ignore
      } else if (tippyInstances.reference && tippyInstances.reference._tippy) {
        throw new Error(
          '[tippy.js ERROR] First argument to `createSingleton()` must ' +
            'be an *array* of tippy instances. The passed value was a ' +
            '*single* tippy instance.',
        )
      }
    }
  }

  const singletonInstance = tippy(document.createElement('div')) as Instance
  let { delay } = optionalProps

  let showTimeout: any
  let hideTimeout: any

  function clearTimeouts(): void {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  tippyInstances.forEach(
    (instance): void => {
      let { onShow, onTrigger, onUntrigger } = instance.props

      const originalClearDelayTimeouts = instance.clearDelayTimeouts
      instance.clearDelayTimeouts = (): void => {
        originalClearDelayTimeouts()
        clearTimeouts()
      }

      instance.setProps({
        delay: 0,
        onShow(instance): false {
          onShow(instance)
          return false
        },
        onTrigger(instance, event): void {
          onTrigger(instance, event)

          const props = { ...instance.props }
          delete props.onShow
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
        // Delay can't be updated
        delete partialProps.delay

        originalSetProps(partialProps)

        onShow = partialProps.onShow || onShow
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
    if (shouldDestroyPassedInstances) {
      tippyInstances.forEach(
        (instance): void => {
          instance.destroy()
        },
      )
    }

    originalDestroy()
  }

  return singletonInstance
}
