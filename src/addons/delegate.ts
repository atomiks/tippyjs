import tippy from '..';
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
  props: Partial<Props> & {target: string},
): Instance | Instance[] {
  /* istanbul ignore else */
  if (__DEV__) {
    errorWhen(
      !(props && props.target),
      [
        'You must specity a `target` prop indicating a CSS selector string matching',
        'the target elements that should receive a tippy.',
      ].join(' '),
    );
  }

  let listeners: ListenerObject[] = [];
  let childTippyInstances: Instance[] = [];

  const {target} = props;

  const nativeProps = removeProperties(props, ['target']);
  const parentProps = {...nativeProps, trigger: 'manual'};
  const childProps = {...nativeProps, showOnCreate: true};

  const returnValue = tippy(targets, parentProps);
  const normalizedReturnValue = normalizeToArray(returnValue);

  function onTrigger(event: Event): void {
    if (!event.target) {
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

    // Only create the instance if the bubbling event matches the trigger type,
    // or the node already has a tippy instance attached
    if (
      trigger.indexOf((BUBBLING_EVENTS_MAP as any)[event.type]) < 0 ||
      // @ts-ignore
      targetNode._tippy
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
    options: object | boolean = false,
  ): void {
    node.addEventListener(eventType, handler, options);
    listeners.push({node, eventType, handler, options});
  }

  function addEventListeners(instance: Instance): void {
    const {reference} = instance;

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
    instance.destroy = (shouldDestroyChildInstances = true): void => {
      if (shouldDestroyChildInstances) {
        childTippyInstances.forEach(instance => {
          instance.destroy();
        });
      }

      childTippyInstances = [];

      removeEventListeners();
      originalDestroy();
    };

    addEventListeners(instance);
  }

  normalizedReturnValue.forEach(applyMutations);

  return returnValue;
}

export default delegate;
