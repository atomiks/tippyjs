import {BasePlacement, Placement} from './types';

export function hasOwnProperty(
  obj: Record<string, unknown>,
  key: string
): boolean {
  return {}.hasOwnProperty.call(obj, key);
}

export function getValueAtIndexOrReturn<T>(
  value: T | [T | null, T | null],
  index: number,
  defaultValue: T | [T, T]
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

export function isType(value: any, type: string): boolean {
  const str = {}.toString.call(value);
  return str.indexOf('[object') === 0 && str.indexOf(`${type}]`) > -1;
}

export function invokeWithArgsOrReturn(value: any, args: any[]): any {
  return typeof value === 'function' ? value(...args) : value;
}

export function debounce<T>(
  fn: (arg: T) => void,
  ms: number
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

export function removeProperties<T>(obj: T, keys: string[]): Partial<T> {
  const clone = {...obj};
  keys.forEach((key) => {
    delete (clone as any)[key];
  });
  return clone;
}

export function splitBySpaces(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

export function normalizeToArray<T>(value: T | T[]): T[] {
  return ([] as T[]).concat(value);
}

export function pushIfUnique<T>(arr: T[], value: T): void {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
}

export function appendPxIfNumber(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function unique<T>(arr: T[]): T[] {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function getNumber(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

export function getBasePlacement(placement: Placement): BasePlacement {
  return placement.split('-')[0] as BasePlacement;
}

export function arrayFrom(value: ArrayLike<any>): any[] {
  return [].slice.call(value);
}

export function removeUndefinedProps(
  obj: Record<string, unknown>
): Partial<Record<string, unknown>> {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      (acc as any)[key] = obj[key];
    }

    return acc;
  }, {});
}
