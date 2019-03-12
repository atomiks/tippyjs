import { GroupedInstance, GroupOptions } from './types'
import { hasOwnProperty } from './utils'

/**
 * Groups an array of instances by taking control of their props during
 * certain lifecycles.
 */
export default function group(
  instances: GroupedInstance[],
  { delay = instances[0].props.delay, duration = 0 }: GroupOptions = {},
): void {
  // Already grouped. Cannot group instances more than once (yet) or stale lifecycle
  // closures will be invoked, causing a stack overflow
  if (instances.some(instance => hasOwnProperty(instance, '_originalProps'))) {
    return
  }

  let isAnyTippyOpen = false

  instances.forEach(instance => {
    instance._originalProps = { ...instance.props }
  })

  function setIsAnyTippyOpen(value: boolean): void {
    isAnyTippyOpen = value
    updateInstances()
  }

  function onShow(instance: GroupedInstance): void {
    instance._originalProps.onShow(instance)
    instances.forEach(instance => {
      instance.set({ duration })
      instance.hide()
    })
    setIsAnyTippyOpen(true)
  }

  function onHide(instance: GroupedInstance): void {
    instance._originalProps.onHide(instance)
    setIsAnyTippyOpen(false)
  }

  function onShown(instance: GroupedInstance): void {
    instance._originalProps.onShown(instance)
    instance.set({ duration: instance._originalProps.duration })
  }

  function updateInstances(): void {
    instances.forEach(instance => {
      instance.set({
        onShow,
        onShown,
        onHide,
        delay: isAnyTippyOpen
          ? [0, Array.isArray(delay) ? delay[1] : delay]
          : delay,
        duration: isAnyTippyOpen ? duration : instance._originalProps.duration,
      })
    })
  }

  updateInstances()
}
