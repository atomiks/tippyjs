import tippy from '..';
import {div} from '../dom-utils';
import {
  CreateSingleton,
  Plugin,
  CreateSingletonProps,
  ReferenceElement,
  CreateSingletonInstance,
  Instance,
} from '../types';
import {removeProperties} from '../utils';
import {errorWhen} from '../validation';

const createSingleton: CreateSingleton = (
  tippyInstances,
  optionalProps = {}
) => {
  /* istanbul ignore else */
  if (__DEV__) {
    errorWhen(
      !Array.isArray(tippyInstances),
      [
        'The first argument passed to createSingleton() must be an array of',
        'tippy instances. The passed value was',
        String(tippyInstances),
      ].join(' ')
    );
  }

  let individualInstances = tippyInstances;
  let references: Array<ReferenceElement> = [];
  let currentTarget: Element;
  let overrides = optionalProps.overrides;
  let interceptSetPropsCleanups: Array<() => void> = [];

  function setReferences(): void {
    references = individualInstances.map((instance) => instance.reference);
  }

  function enableInstances(isEnabled: boolean): void {
    individualInstances.forEach((instance) => {
      if (isEnabled) {
        instance.enable();
      } else {
        instance.disable();
      }
    });
  }

  function interceptSetProps(singleton: Instance): Array<() => void> {
    return individualInstances.map((instance) => {
      const originalSetProps = instance.setProps;

      instance.setProps = (props): void => {
        originalSetProps(props);

        if (instance.reference === currentTarget) {
          singleton.setProps(props);
        }
      };

      return (): void => {
        instance.setProps = originalSetProps;
      };
    });
  }

  enableInstances(false);
  setReferences();

  const plugin: Plugin = {
    fn() {
      return {
        onDestroy(): void {
          enableInstances(true);
        },
        onTrigger(instance, event): void {
          const target = event.currentTarget as Element;
          const index = references.indexOf(target);

          // bail-out
          if (target === currentTarget) {
            return;
          }

          currentTarget = target;

          const overrideProps = (overrides || [])
            .concat('content')
            .reduce((acc, prop) => {
              (acc as any)[prop] = individualInstances[index].props[prop];
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

  const singleton = tippy(div(), {
    ...removeProperties(optionalProps, ['overrides']),
    plugins: [plugin, ...(optionalProps.plugins || [])],
    triggerTarget: references,
  }) as CreateSingletonInstance<CreateSingletonProps>;

  const originalSetProps = singleton.setProps;

  singleton.setProps = (props): void => {
    overrides = props.overrides || overrides;
    originalSetProps(props);
  };

  singleton.setInstances = (nextInstances): void => {
    enableInstances(true);
    interceptSetPropsCleanups.forEach((fn) => fn());

    individualInstances = nextInstances;

    enableInstances(false);
    setReferences();
    interceptSetProps(singleton);

    singleton.setProps({triggerTarget: references});
  };

  interceptSetPropsCleanups = interceptSetProps(singleton);

  return singleton;
};

export default createSingleton;
