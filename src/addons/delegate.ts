import {Targets, Instance, Props, Plugin, Delegate} from '../types';
import tippy from '..';
import {throwErrorWhen} from '../validation';
import {removeProperties, normalizeToArray, includes} from '../utils';
import {defaultProps} from '../props';

interface ListenerObj {
  element: Element;
  eventType: string;
  listener: EventListener;
  options: boolean | object;
}

const BUBBLING_EVENTS_MAP = {
  mouseover: 'mouseenter',
  focusin: 'focus',
  click: 'click',
};

/**
 * Creates a delegate instance that controls the creation of tippy instances
 * for child elements (`target` CSS selector).
 */
export default function delegate(
  targets: Targets,
  props: Partial<Props> & {target: string},
  plugins: Plugin[] = [],
): Instance | Instance[] {
  if (__DEV__) {
    throwErrorWhen(
      !props || !props.target,
      `You must specify a \`target\` prop indicating the CSS selector string
      matching the target elements that should receive a tippy.`,
    );
  }

  let listeners: ListenerObj[] = [];
  let childTippyInstances: Instance[] = [];

  const {target} = props;

  const nativeProps = removeProperties(props, ['target']);
  const parentProps = {...nativeProps, trigger: 'manual'};
  const childProps = {...nativeProps, showOnCreate: true};

  const returnValue = tippy(targets, parentProps, plugins);
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

    // Only create the instance if the bubbling event matches the trigger type
    if (!includes(trigger, (BUBBLING_EVENTS_MAP as any)[event.type])) {
      return;
    }

    const instance = tippy(targetNode, childProps, plugins);

    if (instance) {
      childTippyInstances = childTippyInstances.concat(instance);
    }
  }

  function on(
    element: Element,
    eventType: string,
    listener: EventListener,
    options: object | boolean = false,
  ): void {
    element.addEventListener(eventType, listener, options);
    listeners.push({element, eventType, listener, options});
  }

  function addEventListeners(instance: Instance): void {
    const {reference} = instance;

    on(reference, 'mouseover', onTrigger);
    on(reference, 'focusin', onTrigger);
    on(reference, 'click', onTrigger);
  }

  function removeEventListeners(): void {
    listeners.forEach(
      ({element, eventType, listener, options}: ListenerObj): void => {
        element.removeEventListener(eventType, listener, options);
      },
    );
    listeners = [];
  }

  function applyMutations(instance: Instance): void {
    const originalDestroy = instance.destroy;
    instance.destroy = (shouldDestroyChildInstances = true): void => {
      if (shouldDestroyChildInstances) {
        childTippyInstances.forEach((instance): void => {
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

/**
 * For IIFE version only.
 */
export function createDelegateWithPlugins(outerPlugins: Plugin[]): Delegate {
  return (
    targets,
    props,
    innerPlugins: Plugin[] = [],
  ): Instance | Instance[] => {
    return delegate(targets, props, [...outerPlugins, ...innerPlugins]);
  };
}
