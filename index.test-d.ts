import {expectType} from 'tsd';
import tippy, {
  Instance,
  Props,
  Tippy,
  LifecycleHooks,
  delegate,
  DelegateInstance,
  createSingleton,
  Plugin,
  animateFill,
  followCursor,
  inlinePositioning,
  sticky,
  hideAll,
  roundArrow,
} from './src/types';

const singleTarget = document.createElement('div');
const mulitpleTargets = document.querySelectorAll('div');

expectType<Instance>(tippy(singleTarget));
expectType<Instance>(tippy(singleTarget, {content: 'hello'}));

expectType<Instance[]>(tippy(mulitpleTargets));
expectType<Instance[]>(tippy(mulitpleTargets, {content: 'hello'}));

expectType<DelegateInstance>(delegate(singleTarget, {target: '.child'}));
expectType<DelegateInstance>(
  delegate(singleTarget, {target: '.child', content: 'hello'})
);

expectType<DelegateInstance[]>(delegate(mulitpleTargets, {target: '.child'}));
expectType<DelegateInstance[]>(
  delegate(mulitpleTargets, {target: '.child', content: 'hello'})
);

const tippyInstances = [tippy(singleTarget), tippy(singleTarget)];
expectType<Instance>(createSingleton(tippyInstances));
expectType<Instance>(createSingleton(tippyInstances, {content: 'hello'}));
expectType<Instance>(createSingleton(tippyInstances, {overrides: ['content']}));

expectType<Instance>(
  tippy(singleTarget, {
    plugins: [animateFill, followCursor, inlinePositioning, sticky],
  })
);

interface CustomProps {
  custom: number;
}

type FilteredProps = CustomProps &
  Omit<Props, keyof CustomProps | keyof LifecycleHooks>;

type ExtendedProps = FilteredProps & LifecycleHooks<FilteredProps>;

declare const tippyExtended: Tippy<ExtendedProps>;

const customPlugin: Plugin<ExtendedProps> = {
  name: 'custom',
  defaultValue: 42,
  fn(instance) {
    expectType<Instance<ExtendedProps>>(instance);
    expectType<number>(instance.props.custom);

    return {};
  },
};

expectType<Instance<ExtendedProps>>(
  tippyExtended(singleTarget, {
    custom: 42,
    plugins: [customPlugin],
  })
);

expectType<void>(hideAll({duration: 50, exclude: tippy(singleTarget)}));

expectType<string>(roundArrow);
