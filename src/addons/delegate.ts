import { Targets, Instance, Props } from '../types'
import tippy from '..'
import { throwErrorWhen, MISSING_TARGET_WARNING } from '../validation'
import { removeProperties, splitBySpaces } from '../utils'

interface ListenerObj {
  element: Element
  eventType: string
  listener: EventListener
  options: boolean | object
}

/**
 * Creates a delegate instance that controls the creation of tippy instances
 * for child elements (`target` CSS selector).
 */
export default function delegate(
  targets: Targets,
  props: Props & { target: string },
): Instance | Instance[] {
  if (__DEV__) {
    throwErrorWhen(!props || !props.target, MISSING_TARGET_WARNING)
  }

  let listeners: ListenerObj[] = []
  let childTippyInstances: Instance[] = []

  const { target } = props
  const nativeProps = removeProperties(props, ['target'])
  const trigger = props.trigger || tippy.defaultProps.trigger

  // The user needs to specify their own enhanced tippy function to use extra
  // props
  // @ts-ignore
  const tippyConstructor = delegate.tippy || tippy
  const returnValue = tippyConstructor(targets, {
    ...nativeProps,
    trigger: 'manual',
  })

  function onTrigger(event: Event): void {
    if (event.target) {
      const targetNode = (event.target as Element).closest(target)

      if (targetNode) {
        const instance = tippyConstructor(targetNode, {
          ...nativeProps,
          showOnCreate: true,
        })

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
    listeners.push({ element, eventType, listener, options })
  }

  function addEventListeners(instance: Instance): void {
    const { reference } = instance

    splitBySpaces(trigger).forEach((eventType): void => {
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

  function removeEventListeners(): void {
    listeners.forEach(
      ({ element, eventType, listener, options }: ListenerObj): void => {
        element.removeEventListener(eventType, listener, options)
      },
    )
    listeners = []
  }

  function applyMutations(instance: Instance): void {
    const originalDestroy = instance.destroy
    instance.destroy = (shouldDestroyChildInstances = true): void => {
      if (shouldDestroyChildInstances) {
        childTippyInstances.forEach((instance): void => {
          instance.destroy()
        })
      }

      childTippyInstances = []

      removeEventListeners()
      originalDestroy()
    }

    addEventListeners(instance)

    instance.setProps({ trigger: 'manual' })
  }

  const instances = ([] as Instance[]).concat(returnValue)
  instances.forEach(applyMutations)

  return returnValue
}
