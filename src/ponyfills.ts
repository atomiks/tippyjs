/**
 * Ponyfill for Array.from - converts iterable values to an array
 */
export function arrayFrom(value: ArrayLike<any>): any[] {
  return [].slice.call(value)
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
      return element
    }

    element = element.parentElement
  }

  return null
}
