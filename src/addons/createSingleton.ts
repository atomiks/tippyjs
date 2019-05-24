import { Instance } from '../types'
import tippy from '..'
import { getValue } from '../utils'

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function createSingleton(
  tippyInstances: Instance[],
  options: { delay: number | [number, number] } = { delay: 0 },
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
  let { delay } = options

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

      instance.set({
        delay: 0,
        onShow(instance): false {
          onShow(instance)
          return false
        },
        onTrigger(instance, event): void {
          onTrigger(instance, event)

          const options = { ...instance.props }
          delete options.onShow
          delete options.delay

          singletonInstance.set(options)

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
            }, getValue(delay, 0, tippy.defaults.delay))
          }
        },
        onUntrigger(instance, event): void {
          onUntrigger(instance, event)

          clearTimeouts()
          hideTimeout = setTimeout((): void => {
            singletonInstance.hide()
          }, getValue(delay, 1, tippy.defaults.delay))
        },
      })

      // Ensure the lifecycles functions are updateable
      const originalSet = instance.set
      instance.set = (options): void => {
        // Delay can't be updated
        delete options.delay

        originalSet(options)

        onShow = options.onShow || onShow
        onTrigger = options.onTrigger || onTrigger
        onUntrigger = options.onUntrigger || onUntrigger
      }
    },
  )

  const originalSet = singletonInstance.set
  singletonInstance.set = (options): void => {
    delay = options.delay !== undefined ? options.delay : delay
    originalSet(options)
  }

  const originalDestroy = singletonInstance.destroy
  singletonInstance.destroy = (
    shouldDestroyPassedInstances: boolean = true,
  ) => {
    if (shouldDestroyPassedInstances) {
      tippyInstances.forEach(instance => {
        instance.destroy()
      })
    }

    originalDestroy()
  }

  return singletonInstance
}
