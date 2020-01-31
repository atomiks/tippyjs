import {Instance, CreateSingleton, Plugin} from '../types';
import tippy from '..';
import {errorWhen} from '../validation';
import {div} from '../dom-utils';
import {removeProperties} from '../utils';

const createSingleton: CreateSingleton = (
  tippyInstances,
  optionalProps = {},
) => {
  /* istanbul ignore else */
  if (__DEV__) {
    errorWhen(
      !Array.isArray(tippyInstances),
      [
        'The first argument passed to createSingleton() must be an array of',
        'tippy instances. The passed value was',
        String(tippyInstances),
      ].join(' '),
    );
  }

  tippyInstances.forEach(instance => {
    instance.disable();
  });

  let currentTarget: Element;

  const references = tippyInstances.map(instance => instance.reference);

  const singleton: Plugin = {
    fn() {
      return {
        onDestroy(): void {
          tippyInstances.forEach(instance => {
            instance.enable();
          });
        },
        onTrigger(instance, event): void {
          const target = event.currentTarget as Element;
          const index = references.indexOf(target);

          // bail-out
          if (target === currentTarget) {
            return;
          }

          currentTarget = target;

          const overrideProps = (optionalProps.overrides || [])
            .concat('content')
            .reduce((acc, prop) => {
              (acc as any)[prop] = tippyInstances[index].props[prop];
              return acc;
            }, {});

          instance.setProps({
            ...overrideProps,
            getReferenceClientRect: () => target.getBoundingClientRect(),
          });
        },
      };
    },
  };

  return tippy(div(), {
    ...removeProperties(optionalProps, ['overrides']),
    plugins: [singleton, ...(optionalProps.plugins || [])],
    triggerTarget: references,
  }) as Instance;
};

export default createSingleton;
