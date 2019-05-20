import { Instance, Options, Props } from '../types'
import tippy from '..'
import { getValue } from '../utils'

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function singleton(
  tippyInstances: Instance[],
  options?: Options,
): Instance {
  const props: Props = { ...tippy.defaults, ...options }
  const singletonInstance = tippy(
    document.createElement('div'),
    options,
  ) as Instance // we know the instance is not `null`

  let showTimeout: any
  let hideTimeout: any

  function clearTimeouts(): void {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  tippyInstances.forEach(
    (instance): void => {
      instance.set({
        ...options,
        delay: 0,
        onShow(instance): false {
          if (props.onShow) {
            props.onShow(instance)
          }

          return false
        },
        onTrigger(instance, event): void {
          if (props.onTrigger) {
            props.onTrigger(instance, event)
          }

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
            if (!singletonInstance.state.isVisible) {
              singletonInstance.show()
            }
          }, getValue(props.delay, 0, tippy.defaults.delay))
        },
        onUntrigger(instance, event): void {
          if (props.onUntrigger) {
            props.onUntrigger(instance, event)
          }

          clearTimeouts()
          hideTimeout = setTimeout((): void => {
            singletonInstance.hide()
          }, getValue(props.delay, 1, tippy.defaults.delay))
        },
      })
    },
  )

  return singletonInstance
}
