import { Instance, Props } from '../types'
import tippy from '..'
import {
  invokeWithArgsOrReturn,
  preserveInvocation,
  useIfDefined,
} from '../utils'
import { defaultProps } from '../props'
import {
  throwErrorWhen,
  createInvalidCreateSingletonArgumentError,
} from '../validation'

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function createSingleton(
  tippyInstances: Instance[],
  optionalProps?: Partial<Props>,
): Instance {
  if (__DEV__) {
    throwErrorWhen(
      !Array.isArray(tippyInstances),
      createInvalidCreateSingletonArgumentError(String(tippyInstances)),
    )
  }

  tippyInstances.forEach(instance => {
    instance.disable()
  })

  let currentAria: string | null
  let currentTarget: Element

  let { aria, onTrigger, onMount, onUntrigger, onPropsUpdated, onDestroy } = {
    ...optionalProps,
    ...defaultProps,
  }

  function handleAriaDescribedByAttribute(
    id: string,
    isInteractive: boolean,
    isShow: boolean,
  ): void {
    if (!currentAria) {
      return
    }

    if (isShow && !isInteractive) {
      currentTarget.setAttribute(`aria-${currentAria}`, id)
    } else {
      currentTarget.removeAttribute(`aria-${currentAria}`)
    }
  }

  const references = tippyInstances.map(instance => instance.reference)

  const singleton = tippy(document.createElement('div'), {
    aria: null,
    triggerTarget: references,
    onMount(instance) {
      preserveInvocation(onMount, instance.props.onMount, [instance])
      handleAriaDescribedByAttribute(
        instance.popperChildren.tooltip.id,
        instance.props.interactive,
        true,
      )
    },
    onUntrigger(instance, event): void {
      preserveInvocation(onUntrigger, instance.props.onUntrigger, [
        instance,
        event,
      ])

      handleAriaDescribedByAttribute(
        instance.popperChildren.tooltip.id,
        instance.props.interactive,
        false,
      )
    },
    onTrigger(instance, event): void {
      preserveInvocation(onTrigger, instance.props.onTrigger, [instance, event])

      const target = event.currentTarget as Element
      const index = references.indexOf(target)

      currentTarget = target
      currentAria = aria

      if (instance.state.isVisible) {
        handleAriaDescribedByAttribute(
          instance.popperChildren.tooltip.id,
          instance.props.interactive,
          true,
        )
      }

      instance.setContent(tippyInstances[index].props.content)

      instance.reference.getBoundingClientRect = (): DOMRect | ClientRect =>
        target.getBoundingClientRect()

      // @ts-ignore - awaiting popper.js@1.16.0 release
      instance.reference.referenceNode =
        instance.props.appendTo === 'parent'
          ? target.parentNode
          : invokeWithArgsOrReturn(instance.props.appendTo, [
              instance.reference,
            ])
    },
    onPropsUpdated(instance, partialProps): void {
      preserveInvocation(onPropsUpdated, instance.props.onPropsUpdated, [
        instance,
      ])

      aria = useIfDefined(partialProps.aria, aria)
      onTrigger = useIfDefined(partialProps.onTrigger, onTrigger)
      onMount = useIfDefined(partialProps.onMount, onMount)
      onUntrigger = useIfDefined(partialProps.onUntrigger, onUntrigger)
      onPropsUpdated = useIfDefined(partialProps.onPropsUpdated, onPropsUpdated)
      onDestroy = useIfDefined(partialProps.onDestroy, onDestroy)
    },
    onDestroy(instance): void {
      preserveInvocation(onDestroy, instance.props.onDestroy, [instance])

      tippyInstances.forEach(instance => {
        instance.enable()
      })
    },
    ...optionalProps,
  }) as Instance

  return singleton
}
