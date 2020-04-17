import tippy from '..';
import {div} from '../dom-utils';
import {
  CreateSingleton,
  Plugin,
  CreateSingletonProps,
  ReferenceElement,
  CreateSingletonInstance,
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

  let mutTippyInstances = tippyInstances;
  let references: Array<ReferenceElement> = [];
  let currentTarget: Element;
  let overrides = optionalProps.overrides;

  function setReferences(): void {
    references = mutTippyInstances.map((instance) => instance.reference);
  }

  function enableInstances(isEnabled: boolean): void {
    mutTippyInstances.forEach((instance) => {
      if (isEnabled) {
        instance.enable();
      } else {
        instance.disable();
      }
    });
  }

  enableInstances(false);
  setReferences();

  const singleton: Plugin = {
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
              (acc as any)[prop] = mutTippyInstances[index].props[prop];
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

  const instance = tippy(div(), {
    ...removeProperties(optionalProps, ['overrides']),
    plugins: [singleton, ...(optionalProps.plugins || [])],
    triggerTarget: references,
  }) as CreateSingletonInstance<CreateSingletonProps>;

  const originalSetProps = instance.setProps;

  instance.setProps = (props): void => {
    overrides = props.overrides || overrides;
    originalSetProps(props);
  };

  instance.setInstances = (nextInstances): void => {
    enableInstances(true);

    mutTippyInstances = nextInstances;

    enableInstances(false);
    setReferences();

    instance.setProps({triggerTarget: references});
  };

  return instance;
};

export default createSingleton;
