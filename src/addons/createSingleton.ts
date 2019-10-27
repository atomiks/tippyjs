import {Instance, Props, Plugin} from '../types';
import tippy from '..';
import {preserveInvocation, useIfDefined} from '../utils';
import {defaultProps} from '../props';
import {throwErrorWhen} from '../validation';

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
export default function createSingleton(
  tippyInstances: Instance[],
  optionalProps: Partial<Props> = {},
  /** @deprecated use Props.plugins */
  plugins: Plugin[] = [],
): Instance {
  if (__DEV__) {
    throwErrorWhen(
      !Array.isArray(tippyInstances),
      `The first argument passed to createSingleton() must be an array of tippy
      instances.
  
      The passed value was: ${tippyInstances}`,
    );
  }

  plugins = optionalProps.plugins || plugins;

  tippyInstances.forEach(instance => {
    instance.disable();
  });

  let currentAria: string | null | undefined;
  let currentTarget: Element;

  const userProps: Partial<Props> = {};

  function setUserProps(props: Partial<Props>): void {
    Object.keys(props).forEach((prop): void => {
      userProps[prop] = useIfDefined(props[prop], userProps[prop]);
    });
  }

  setUserProps({...defaultProps, ...optionalProps});

  function handleAriaDescribedByAttribute(
    id: string,
    isInteractive: boolean,
    isShow: boolean,
  ): void {
    if (!currentAria) {
      return;
    }

    if (isShow && !isInteractive) {
      currentTarget.setAttribute(`aria-${currentAria}`, id);
    } else {
      currentTarget.removeAttribute(`aria-${currentAria}`);
    }
  }

  const references = tippyInstances.map(instance => instance.reference);

  const props: Partial<Props> = {
    ...optionalProps,
    plugins,
    aria: null,
    triggerTarget: references,
    onMount(instance) {
      preserveInvocation(userProps.onMount, instance.props.onMount, [instance]);
      handleAriaDescribedByAttribute(
        instance.popperChildren.tooltip.id,
        instance.props.interactive,
        true,
      );
    },
    onUntrigger(instance, event): void {
      preserveInvocation(userProps.onUntrigger, instance.props.onUntrigger, [
        instance,
        event,
      ]);
      handleAriaDescribedByAttribute(
        instance.popperChildren.tooltip.id,
        instance.props.interactive,
        false,
      );
    },
    onTrigger(instance, event): void {
      preserveInvocation(userProps.onTrigger, instance.props.onTrigger, [
        instance,
        event,
      ]);

      const target = event.currentTarget as Element;
      const index = references.indexOf(target);

      currentTarget = target;
      currentAria = userProps.aria;

      if (instance.state.isVisible) {
        handleAriaDescribedByAttribute(
          instance.popperChildren.tooltip.id,
          instance.props.interactive,
          true,
        );
      }

      instance.popperInstance!.reference = {
        referenceNode: target,
        // These `client` values don't get used by Popper.js if they are 0
        clientHeight: 0,
        clientWidth: 0,
        getBoundingClientRect(): ClientRect {
          return target.getBoundingClientRect();
        },
      };

      instance.setContent(tippyInstances[index].props.content);
    },
    onAfterUpdate(instance, partialProps): void {
      preserveInvocation(
        userProps.onAfterUpdate,
        instance.props.onAfterUpdate,
        [instance, partialProps],
      );

      setUserProps(partialProps);
    },
    onDestroy(instance): void {
      preserveInvocation(userProps.onDestroy, instance.props.onDestroy, [
        instance,
      ]);

      tippyInstances.forEach(instance => {
        instance.enable();
      });
    },
  };

  return tippy(document.createElement('div'), props) as Instance;
}
