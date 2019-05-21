import { Instance } from '../types'
import tippy from '..'
import { getValue } from '../utils'

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function singleton(
  tippyInstances: Instance[],
  options: { delay: number | [number, number] } = { delay: 0 },
): Instance {
  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(tippyInstances)) {
      if (!tippyInstances) {
        throw new Error(
          '[tippy.js ERROR] First argument to `singleton()` must ' +
            'be an array of tippy instances. The passed value was `' +
            tippyInstances +
            '`',
        )
        // @ts-ignore
      } else if (tippyInstances.reference && tippyInstances.reference._tippy) {
        throw new Error(
          '[tippy.js ERROR] First argument to `singleton()` must ' +
            'be an *array* of tippy instances. The passed value was a ' +
            '*single* tippy instance.',
        )
      }
    }
  }

  const singletonInstance = tippy(document.createElement('div')) as Instance

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
      instance.clearDelayTimeouts = () => {
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

          const otherOptions = { ...instance.props }
          delete otherOptions.onShow
          singletonInstance.set(otherOptions)

          singletonInstance.reference.getBoundingClientRect = ():
            | DOMRect
            | ClientRect => {
            return instance.reference.getBoundingClientRect()
          }

          clearTimeouts()
          showTimeout = setTimeout((): void => {
            singletonInstance.show()
          }, getValue(options.delay, 0, tippy.defaults.delay))
        },
        onUntrigger(instance, event): void {
          onUntrigger(instance, event)

          clearTimeouts()
          hideTimeout = setTimeout((): void => {
            singletonInstance.hide()
          }, getValue(options.delay, 1, tippy.defaults.delay))
        },
      })

      // Ensure the lifecycles functions are updateable
      const originalSet = instance.set
      instance.set = options => {
        // Delay can't be updated
        delete options.delay

        originalSet(options)

        onShow = options.onShow || onShow
        onTrigger = options.onTrigger || onTrigger
        onUntrigger = options.onUntrigger || onUntrigger
      }
    },
  )

  return singletonInstance
}
