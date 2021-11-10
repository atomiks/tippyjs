import tippy from '..';
import {TOUCH_OPTIONS} from '../constants';
import {defaultProps} from '../props';
import {Instance, Props, Targets} from '../types';
import {ListenerObject} from '../types-internal';
import {normalizeToArray, removeProperties} from '../utils';
import {errorWhen} from '../validation';

const BUBBLING_EVENTS_MAP = {
  mouseover: 'mouseenter',
  focusin: 'focus',
  click: 'click',
};

/**
 * Creates a delegate instance that controls the creation of tippy instances
 * for child elements (`target` CSS selector).
 */
function delegate(
  targets: Targets,
  props: Partial<Props> & {target: string}
): Instance | Instance[] {
  /* istanbul ignore else */
  if (__DEV__) {
    errorWhen(
      !(props && props.target),
      [
        'You must specity a `target` prop indicating a CSS selector string matching',
        'the target elements that should receive a tippy.',
      ].join(' ')
    );
  }

  let listeners: ListenerObject[] = [];
  let childTippyInstances: Instance[] = [];
  let disabled = false;

  const {target} = props;

  const nativeProps = removeProperties(props, ['target']);
  const parentProps = {...nativeProps, trigger: 'manual', touch: false};
  const childProps = {
    touch: defaultProps.touch,
    ...nativeProps,
    showOnCreate: true,
  };

  const returnValue = tippy(targets, parentProps);
  const normalizedReturnValue = normalizeToArray(returnValue);

  function onTrigger(event: Event): void {
    if (!event.target || disabled) {
      return;
    }

    const targetNode = (event.target as Element).closest(target);

    if (!targetNode) {
      return;
    }

    // Get relevant trigger with fallbacks:
    // 1. Check `data-tippy-trigger` attribute on target node
    // 2. Fallback to `trigger` passed to `delegate()`
    // 3. Fallback to `defaultProps.trigger`
    const trigger =
      targetNode.getAttribute('data-tippy-trigger') ||
      props.trigger ||
      defaultProps.trigger;

    // @ts-ignore
    if (targetNode._tippy) {
      return;
    }

    if (event.type === 'touchstart' && typeof childProps.touch === 'boolean') {
      return;
    }

    if (
      event.type !== 'touchstart' &&
      trigger.indexOf((BUBBLING_EVENTS_MAP as any)[event.type]) < 0
    ) {
      return;
    }

    const instance = tippy(targetNode, childProps);

    if (instance) {
      childTippyInstances = childTippyInstances.concat(instance);
    }
  }

  function on(
    node: Element,
    eventType: string,
    handler: EventListener,
    options: boolean | Record<string, unknown> = false
  ): void {
    node.addEventListener(eventType, handler, options);
    listeners.push({node, eventType, handler, options});
  }

  function addEventListeners(instance: Instance): void {
    const {reference} = instance;

    on(reference, 'touchstart', onTrigger, TOUCH_OPTIONS);
    on(reference, 'mouseover', onTrigger);
    on(reference, 'focusin', onTrigger);
    on(reference, 'click', onTrigger);
  }

  function removeEventListeners(): void {
    listeners.forEach(({node, eventType, handler, options}: ListenerObject) => {
      node.removeEventListener(eventType, handler, options);
    });
    listeners = [];
  }

  function applyMutations(instance: Instance): void {
    const originalDestroy = instance.destroy;
    const originalEnable = instance.enable;
    const originalDisable = instance.disable;

    instance.destroy = (shouldDestroyChildInstances = true): void => {
      if (shouldDestroyChildInstances) {
        childTippyInstances.forEach((instance) => {
          instance.destroy();
        });
      }

      childTippyInstances = [];

      removeEventListeners();
      originalDestroy();
    };

    instance.enable = (): void => {
      originalEnable();
      childTippyInstances.forEach((instance) => instance.enable());
      disabled = false;
    };

    instance.disable = (): void => {
      originalDisable();
      childTippyInstances.forEach((instance) => instance.disable());
      disabled = true;
    };

    addEventListeners(instance);
  }

  normalizedReturnValue.forEach(applyMutations);

  return returnValue;
}

export default delegate;
