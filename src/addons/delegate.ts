import { Targets, Instance, Props } from '../types'
import tippy from '..'
import { throwErrorWhen } from '../validation'
import { getValueAtIndexOrReturn } from '../utils'

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
    throwErrorWhen(
      !props || !props.target,
      'You must specify a `target` prop indicating the CSS selector string ' +
        'matching the target elements that should receive a tippy.',
    )
  }

  let listeners: ListenerObj[] = []
  let childTippyInstances: Instance[] = []

  const { target, trigger } = props
  delete props.target

  // The user needs to specify their own enhanced tippy function to use extra
  // props
  // @ts-ignore
  const tippyConstructor = delegate.tippy || tippy

  const returnValue = tippyConstructor(targets, {
    ...props,
    trigger: 'manual',
  })

  function onTrigger(event: Event): void {
    if (event.target) {
      const targetNode = (event.target as Element).closest(target)

      if (targetNode) {
        const instance = tippyConstructor(targetNode, {
          ...props,
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
    const t = trigger || tippy.defaultProps.trigger
    const showTrigger = getValueAtIndexOrReturn(t, 0, t)

    showTrigger
      .trim()
      .split(' ')
      .forEach((eventType): void => {
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
        childTippyInstances.forEach((instance): void => {
          instance.destroy()
        })
      }

      childTippyInstances = []

      removeEventListeners(listeners)
      originalDestroy()
    }

    addEventListeners(instance)

    instance.setProps({ trigger: 'manual' })
  }

  const instances = ([] as Instance[]).concat(returnValue)
  instances.forEach(applyMutations)

  return returnValue
}
