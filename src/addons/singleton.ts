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
) {
  const props: Props = { ...tippy.defaults, ...options }
  const singletonInstance = tippy(
    document.createElement('div'),
    options,
  ) as Instance // we know the instance is not `null`

  let showTimeout: any
  let hideTimeout: any

  function clearTimeouts() {
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
  }

  tippyInstances.forEach(instance => {
    instance.popper.style.display = 'none'

    instance.set({
      ...options,
      delay: 0,
      onTrigger(instance, event) {
        if (props.onTrigger) {
          props.onTrigger(instance, event)
        }

        singletonInstance.set(instance.props)
        singletonInstance.reference.getBoundingClientRect = () => {
          return instance.reference.getBoundingClientRect()
        }

        clearTimeouts()
        showTimeout = setTimeout(() => {
          if (!singletonInstance.state.isVisible) {
            singletonInstance.show()
          }
        }, getValue(props.delay, 0, tippy.defaults.delay))
      },
      onUntrigger(instance, event) {
        if (props.onUntrigger) {
          props.onUntrigger(instance, event)
        }

        clearTimeouts()
        hideTimeout = setTimeout(() => {
          singletonInstance.hide()
        }, getValue(props.delay, 1, tippy.defaults.delay))
      },
    })
  })

  return singletonInstance
}
