import {expectType} from 'tsd';
import tippy, {
  Instance,
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
} from '.';

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

const customPlugin: Plugin = {
  name: 'custom',
  defaultValue: 42,
  fn(instance) {
    expectType<Instance>(instance);
    return {};
  },
};
expectType<Instance>(tippy(singleTarget, {plugins: [customPlugin]}));

expectType<void>(hideAll({duration: 50, exclude: tippy(singleTarget)}));

expectType<string>(roundArrow);
