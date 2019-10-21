import {Props, ReferenceElement, Targets, Plugin} from './types';
import {getDataAttributeProps} from './reference';

/**
 * Determines if the value is a reference element
 */
export function isReferenceElement(value: any): value is ReferenceElement {
  return !!(value && value._tippy && value._tippy.reference === value);
}

/**
 * Safe .hasOwnProperty check, for prototype-less objects
 */
export function hasOwnProperty(obj: object, key: string): boolean {
  return {}.hasOwnProperty.call(obj, key);
}

/**
 * Returns an array of elements based on the value
 */
export function getArrayOfElements(value: Targets): Element[] {
  if (isElement(value)) {
    return [value];
  }

  if (isNodeList(value)) {
    return arrayFrom(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  return arrayFrom(document.querySelectorAll(value));
}

/**
 * Returns a value at a given index depending on if it's an array or number
 */
export function getValueAtIndexOrReturn<T>(
  value: T | [T | null, T | null],
  index: number,
  defaultValue: T | [T, T],
): T {
  if (Array.isArray(value)) {
    const v = value[index];
    return v == null
      ? Array.isArray(defaultValue)
        ? defaultValue[index]
        : defaultValue
      : v;
  }

  return value;
}

/**
 * Prevents errors from being thrown while accessing nested modifier objects
 * in `popperOptions`
 */
export function getModifier(obj: any, key: string): any {
  return obj && obj.modifiers && obj.modifiers[key];
}

/**
 * Determines if the value is of type
 */
export function isType(value: any, type: string): boolean {
  const str = {}.toString.call(value);
  return str.indexOf('[object') === 0 && str.indexOf(`${type}]`) > -1;
}

/**
 * Determines if the value is of type Element
 */
export function isElement(value: any): value is Element {
  return isType(value, 'Element');
}

/**
 * Determines if the value is of type NodeList
 */
export function isNodeList(value: any): value is NodeList {
  return isType(value, 'NodeList');
}

/**
 * Determines if the value is of type MouseEvent
 */
export function isMouseEvent(value: any): value is MouseEvent {
  return isType(value, 'MouseEvent');
}

/**
 * Firefox extensions don't allow setting .innerHTML directly, this will trick
 * it
 */
export function innerHTML(): 'innerHTML' {
  return 'innerHTML';
}

/**
 * Evaluates a function if one, or returns the value
 */
export function invokeWithArgsOrReturn(value: any, args: any[]): any {
  return typeof value === 'function' ? value(...args) : value;
}

/**
 * Sets a popperInstance `flip` modifier's enabled state
 */
export function setFlipModifierEnabled(modifiers: any[], value: any): void {
  modifiers.filter((m): boolean => m.name === 'flip')[0].enabled = value;
}

/**
 * Returns a new `div` element
 */
export function div(): HTMLDivElement {
  return document.createElement('div');
}

/**
 * Applies a transition duration to a list of elements
 */
export function setTransitionDuration(
  els: (HTMLDivElement | null)[],
  value: number,
): void {
  els.forEach((el): void => {
    if (el) {
      el.style.transitionDuration = `${value}ms`;
    }
  });
}

/**
 * Sets the visibility state to elements so they can begin to transition
 */
export function setVisibilityState(
  els: (HTMLDivElement | null)[],
  state: 'visible' | 'hidden',
): void {
  els.forEach((el): void => {
    if (el) {
      el.setAttribute('data-state', state);
    }
  });
}

/**
 * Evaluates the props object by merging data attributes and disabling
 * conflicting props where necessary
 */
export function evaluateProps(
  reference: ReferenceElement,
  props: Props,
  plugins: Plugin[],
): Props {
  const out = {
    ...props,
    content: invokeWithArgsOrReturn(props.content, [reference]),
    ...(props.ignoreAttributes
      ? {}
      : getDataAttributeProps(reference, plugins)),
  };

  if (out.interactive) {
    out.aria = null;
  }

  return out;
}

/**
 * Debounce utility. To avoid bloating bundle size, we're only passing 1
 * argument here, a more generic function would pass all arguments. Only
 * `onMouseMove` uses this which takes the event object for now.
 */
export function debounce<T>(
  fn: (arg: T) => void,
  ms: number,
): (arg: T) => void {
  // Avoid wrapping in `setTimeout` if ms is 0 anyway
  if (ms === 0) {
    return fn;
  }

  let timeout: any;

  return (arg): void => {
    clearTimeout(timeout);
    timeout = setTimeout((): void => {
      fn(arg);
    }, ms);
  };
}

/**
 * Preserves the original function invocation when another function replaces it
 */
export function preserveInvocation<T>(
  originalFn: undefined | ((...args: any) => void),
  currentFn: undefined | ((...args: any) => void),
  args: T[],
): void {
  if (originalFn && originalFn !== currentFn) {
    originalFn(...args);
  }
}

/**
 * Deletes properties from an object (pure)
 */
export function removeProperties<T>(obj: T, keys: Array<keyof T>): Partial<T> {
  const clone = {...obj};
  keys.forEach((key): void => {
    delete clone[key];
  });
  return clone;
}

/**
 * Ponyfill for Array.from - converts iterable values to an array
 */
export function arrayFrom(value: ArrayLike<any>): any[] {
  return [].slice.call(value);
}

/**
 * Works like Element.prototype.closest, but uses a callback instead
 */
export function closestCallback(
  element: Element | null,
  callback: Function,
): Element | null {
  while (element) {
    if (callback(element)) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
}

/**
 * Determines if an array or string includes a string
 */
export function includes(a: string[] | string, b: string): boolean {
  return a.indexOf(b) > -1;
}

/**
 * Creates an array from string of values separated by whitespace
 */
export function splitBySpaces(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

/**
 * Returns the `nextValue` if `nextValue` is not `undefined`, otherwise returns
 * `currentValue`
 */
export function useIfDefined(nextValue: any, currentValue: any): any {
  return nextValue !== undefined ? nextValue : currentValue;
}

/**
 * Converts a value that's an array or single value to an array
 */
export function normalizeToArray<T>(value: T | T[]): T[] {
  // @ts-ignore
  return [].concat(value);
}

/**
 * Returns the ownerDocument of the first available element, otherwise global
 * document
 */
export function getOwnerDocument(
  elementOrElements: Element | Element[],
): Document {
  const [element] = normalizeToArray(elementOrElements);
  return element ? element.ownerDocument || document : document;
}

/**
 * Adds item to array if array does not contain it
 */
export function pushIfUnique<T>(arr: T[], value: T): void {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
}

/**
 * Adds `px` if value is a number, or returns it directly
 */
export function appendPxIfNumber(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}
