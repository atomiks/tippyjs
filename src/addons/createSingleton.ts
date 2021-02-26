import tippy from '..';
import {div} from '../dom-utils';
import {
  CreateSingleton,
  Plugin,
  CreateSingletonProps,
  ReferenceElement,
  CreateSingletonInstance,
  Instance,
  Props,
} from '../types';
import {removeProperties} from '../utils';
import {errorWhen} from '../validation';
import {applyStyles, Modifier} from '@popperjs/core';

// The default `applyStyles` modifier has a cleanup function that gets called
// every time the popper is destroyed (i.e. a new target), removing the styles
// and causing transitions to break for singletons when the console is open, but
// most notably for non-transform styles being used, `gpuAcceleration: false`.
const applyStylesModifier: Modifier<'applyStyles', {}> = {
  ...applyStyles,
  effect({state}) {
    const initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0',
      },
      arrow: {
        position: 'absolute',
      },
      reference: {},
    };

    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }

    // intentionally return no cleanup function
    // return () => { ... }
  },
};

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
  let currentTarget: Element | null;
  let overrides = optionalProps.overrides;
  let interceptSetPropsCleanups: Array<() => void> = [];
  let shownOnCreate = false;

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

  // have to pass singleton, as it maybe undefined on first call
  function prepareInstance(
    singleton: Instance,
    target: ReferenceElement
  ): void {
    const index = references.indexOf(target);

    // bail-out
    if (target === currentTarget) {
      return;
    }

    currentTarget = target;

    const overrideProps: Partial<Props> = (overrides || [])
      .concat('content')
      .reduce((acc, prop) => {
        (acc as any)[prop] = individualInstances[index].props[prop];
        return acc;
      }, {});

    singleton.setProps({
      ...overrideProps,
      getReferenceClientRect:
        typeof overrideProps.getReferenceClientRect === 'function'
          ? overrideProps.getReferenceClientRect
          : (): ClientRect => target.getBoundingClientRect(),
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
        onHidden(): void {
          currentTarget = null;
        },
        onClickOutside(instance): void {
          if (instance.props.showOnCreate && !shownOnCreate) {
            shownOnCreate = true;
            currentTarget = null;
          }
        },
        onShow(instance): void {
          if (instance.props.showOnCreate && !shownOnCreate) {
            shownOnCreate = true;
            prepareInstance(instance, references[0]);
          }
        },
        onTrigger(instance, event): void {
          prepareInstance(instance, event.currentTarget as Element);
        },
      };
    },
  };

  const singleton = tippy(div(), {
    ...removeProperties(optionalProps, ['overrides']),
    plugins: [plugin, ...(optionalProps.plugins || [])],
    triggerTarget: references,
    popperOptions: {
      ...optionalProps.popperOptions,
      modifiers: [
        ...(optionalProps.popperOptions?.modifiers || []),
        applyStylesModifier,
      ],
    },
  }) as CreateSingletonInstance<CreateSingletonProps>;

  const originalShow = singleton.show;

  singleton.show = (target?: ReferenceElement | Instance | number): void => {
    originalShow();

    // first time, showOnCreate or programmatic call with no params
    // default to showing first instance
    if (!currentTarget && target == null) {
      return prepareInstance(singleton, references[0]);
    }

    // triggered from event (do nothing as prepareInstance already called by onTrigger)
    // programmatic call with no params when already visible (do nothing again)
    if (currentTarget && target == null) {
      return;
    }

    // target is index of instance
    if (typeof target === 'number') {
      return (
        references[target] && prepareInstance(singleton, references[target])
      );
    }

    // target is a child tippy instance
    if (individualInstances.includes(target as Instance)) {
      const ref = (target as Instance).reference;
      return prepareInstance(singleton, ref);
    }

    // target is a ReferenceElement
    if (references.includes(target as ReferenceElement)) {
      return prepareInstance(singleton, target as ReferenceElement);
    }
  };

  singleton.showNext = (): void => {
    const first = references[0];
    if (!currentTarget) {
      return singleton.show(0);
    }
    const index = references.indexOf(currentTarget);
    singleton.show(references[index + 1] || first);
  };

  singleton.showPrevious = (): void => {
    const last = references[references.length - 1];
    if (!currentTarget) {
      return singleton.show(last);
    }
    const index = references.indexOf(currentTarget);
    const target = references[index - 1] || last;
    singleton.show(target);
  };

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
