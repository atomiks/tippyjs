import { Targets, Options, Instance } from '../types'
import tippy from '..'

/**
 * Creates a delegate instance that controls the creation of tippy instances
 * for child elements (`target` CSS selector).
 * Port of v4's `target` option to a separate function.
 */
export default function delegate(
  targets: Targets,
  { target, ...options }: Options & { target: string },
): Instance | Instance[] | null {
  const instanceOrInstances = tippy(targets, {
    ...options,
    trigger: 'manual',
  })
  let listeners = []

  function onTrigger(event: Event) {
    if (event.target) {
      const targetNode = (event.target as Element).closest(target)

      if (targetNode) {
        tippy(targetNode, { ...options, showOnInit: true })
      }
    }
  }

  function onShow(): void | false {
    return false
  }

  function on(
    element: Element,
    eventType: string,
    listener: EventListener,
    options: object | boolean = false,
  ) {
    element.addEventListener(eventType, listener, options)
    listeners.push({
      element,
      eventType,
      listener,
      options,
    })
  }

  function addEventListeners(instance: Instance) {
    const { reference } = instance
    instance.props.trigger
      .trim()
      .split(' ')
      .forEach(eventType => {
        switch (eventType) {
          case 'mouseenter': {
            on(reference, 'mouseover', onTrigger)
            break
          }
          case 'focus': {
            on(reference, 'focusin', onTrigger)
            break
          }
          case 'click': {
            on(reference, 'click', onTrigger)
          }
        }
      })
  }

  if (instanceOrInstances) {
    if (Array.isArray(instanceOrInstances)) {
      const instances = instanceOrInstances
      instances.forEach(instance => {
        instance.set({
          trigger: options.trigger || tippy.defaults.trigger,
          onShow,
        })
        addEventListeners(instance)
      })
    } else {
      const instance = instanceOrInstances
      instance.set({
        trigger: options.trigger || tippy.defaults.trigger,
        onShow,
      })
      addEventListeners(instance)
    }
  }

  return instanceOrInstances
}
