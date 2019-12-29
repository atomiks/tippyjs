import {Instance, CreateSingleton, Plugin} from '../types';
import tippy from '..';
import {defaultProps} from '../props';
import {errorWhen} from '../validation';
import {div} from '../utils';

/**
 * Re-uses a single tippy element for many different tippy instances.
 * Replaces v4's `tippy.group()`.
 */
const createSingleton: CreateSingleton = (
  tippyInstances,
  optionalProps = {},
  /** @deprecated use Props.plugins */
  plugins = [],
) => {
  if (__DEV__) {
    errorWhen(
      !Array.isArray(tippyInstances),
      [
        'The first argument passed to createSingleton() must be an array of tippy',
        'instances. The passed value was',
        String(tippyInstances),
      ].join(' '),
    );
  }

  plugins = optionalProps.plugins || plugins;

  tippyInstances.forEach(instance => {
    instance.disable();
  });

  let userAria = {...defaultProps, ...optionalProps}.aria;
  let currentAria: string | null | undefined;
  let currentTarget: Element;
  let shouldSkipUpdate = false;

  const references = tippyInstances.map(instance => instance.reference);

  const singleton: Plugin = {
    fn(instance) {
      function handleAriaDescribedByAttribute(isShow: boolean): void {
        if (!currentAria) {
          return;
        }

        const attr = `aria-${currentAria}`;

        if (isShow && !instance.props.interactive) {
          currentTarget.setAttribute(attr, instance.popperChildren.tooltip.id);
        } else {
          currentTarget.removeAttribute(attr);
        }
      }

      return {
        onAfterUpdate(_, {aria}): void {
          // Ensure `aria` for the singleton instance stays `null`, while
          // changing the `userAria` value
          if (aria !== undefined && aria !== userAria) {
            if (!shouldSkipUpdate) {
              userAria = aria;
            } else {
              shouldSkipUpdate = true;
              instance.setProps({aria: null});
              shouldSkipUpdate = false;
            }
          }
        },
        onDestroy(): void {
          tippyInstances.forEach(instance => {
            instance.enable();
          });
        },
        onMount(): void {
          handleAriaDescribedByAttribute(true);
        },
        onUntrigger(): void {
          handleAriaDescribedByAttribute(false);
        },
        onTrigger(_, event): void {
          const target = event.currentTarget as Element;
          const index = references.indexOf(target);

          // bail-out
          if (target === currentTarget) {
            return;
          }

          currentTarget = target;
          currentAria = userAria;

          if (instance.state.isVisible) {
            handleAriaDescribedByAttribute(true);
          }

          instance.popperInstance!.reference = target;

          instance.setContent(tippyInstances[index].props.content);
        },
      };
    },
  };

  return tippy(div(), {
    ...optionalProps,
    plugins: [singleton, ...plugins],
    aria: null,
    triggerTarget: references,
  }) as Instance;
};

export default createSingleton;
