import {ReferenceElement, Targets, BasePlacement} from './types';
import Popper from 'popper.js';

/**
 * Triggers reflow
 */
export function reflow(element: HTMLElement): void {
  void element.offsetHeight;
}

/**
 * Sets the innerHTML of an element
 */
export function setInnerHTML(element: Element, html: string): void {
  element[innerHTML()] = html;
}

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
 * Sets a popperInstance modifier's property to a value
 */
export function setModifierValue(
  modifiers: any[],
  name: string,
  property: string,
  value: unknown,
): void {
  modifiers.filter(m => m.name === name)[0][property] = value;
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
  els.forEach(el => {
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
  els.forEach(el => {
    if (el) {
      el.setAttribute('data-state', state);
    }
  });
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
    timeout = setTimeout(() => {
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
  keys.forEach(key => {
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
  return ([] as T[]).concat(value);
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

/**
 * Filters out duplicate elements in an array
 */
export function unique<T>(arr: T[]): T[] {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

/**
 * Returns number from number or CSS units string
 */
export function getNumber(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

/**
 * Gets number or CSS string units in pixels (e.g. `1rem` -> 16)
 */
export function getUnitsInPx(doc: Document, value: string | number): number {
  const isRem = typeof value === 'string' && includes(value, 'rem');
  const html = doc.documentElement;
  const rootFontSize = 16;

  if (html && isRem) {
    return (
      parseFloat(getComputedStyle(html).fontSize || String(rootFontSize)) *
      getNumber(value)
    );
  }

  return getNumber(value);
}

/**
 * Adds the `distancePx` value to the placement of a Popper.Padding object
 */
export function getComputedPadding(
  basePlacement: BasePlacement,
  padding: number | Popper.Padding = 5,
  distancePx: number,
): Popper.Padding {
  const freshPaddingObject = {top: 0, right: 0, bottom: 0, left: 0};
  const keys = Object.keys(freshPaddingObject) as BasePlacement[];

  return keys.reduce<Popper.Padding>((obj, key) => {
    obj[key] = typeof padding === 'number' ? padding : (padding as any)[key];

    if (basePlacement === key) {
      obj[key] =
        typeof padding === 'number'
          ? padding + distancePx
          : (padding as any)[basePlacement] + distancePx;
    }

    return obj;
  }, freshPaddingObject);
}
