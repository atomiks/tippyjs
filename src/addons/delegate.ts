import { Targets, Instance, Props } from '../types'
import tippy from '..'
import { throwErrorWhen } from '../validation'

interface ListenerObj {
  element: Element
  eventType: string
  listener: EventListener
  options: boolean | object
}

/**
 * Creates a delegate instance that controls the creation of tippy instances
 * for child elements (`target` CSS selector).
 * Port of v4's `target` prop to a separate function.
 */
export default function delegate(
  targets: Targets,
  props: Props & { target: string },
): Instance | Instance[] | null {
  if (__DEV__) {
    throwErrorWhen(
      !props || !props.target,
      'You must specify a `target` prop indicating the CSS selector string ' +
        'matching the target elements that should receive a tippy.',
    )
  }

  let listeners: ListenerObj[] = []
  let childTippyInstances: Instance[] = []

  const { target } = props
  delete props.target

  const instanceOrInstances = tippy(targets, props)

  function onTrigger(event: Event): void {
    if (event.target) {
      const targetNode = (event.target as Element).closest(target)

      if (targetNode) {
        const instance = tippy(targetNode, { ...props, showOnCreate: true })

        if (instance) {
          childTippyInstances = childTippyInstances.concat(instance)
        }
      }
    }
  }

  function on(
    element: Element,
    eventType: string,
    listener: EventListener,
    options: object | boolean = false,
  ): void {
    element.addEventListener(eventType, listener, options)
    listeners.push({
      element,
      eventType,
      listener,
      options,
    })
  }

  function addEventListeners(instance: Instance): void {
    const { reference } = instance
    instance.props.trigger
      .trim()
      .split(' ')
      .forEach(
        (eventType): void => {
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
        },
      )
  }

  function removeEventListeners(listeners: ListenerObj[]): void {
    listeners.forEach(
      ({ element, eventType, listener, options }: ListenerObj): void => {
        element.removeEventListener(eventType, listener, options)
      },
    )
    listeners = []
  }

  function applyMutations(instance: Instance): void {
    const originalDestroy = instance.destroy
    instance.destroy = (shouldDestroyChildInstances: boolean = true): void => {
      if (shouldDestroyChildInstances) {
        childTippyInstances.forEach(
          (instance): void => {
            instance.destroy()
          },
        )
      }
      childTippyInstances = []

      removeEventListeners(listeners)
      originalDestroy()
    }

    addEventListeners(instance)

    instance.setProps({ trigger: 'manual' })
  }

  if (instanceOrInstances) {
    if (Array.isArray(instanceOrInstances)) {
      const instances = instanceOrInstances
      instances.forEach(applyMutations)
    } else {
      const instance = instanceOrInstances
      applyMutations(instance)
    }
  }

  return instanceOrInstances
}
