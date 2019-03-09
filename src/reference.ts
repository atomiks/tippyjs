import Defaults from './defaults'
import { Props, VirtualReference, ReferenceElement } from './types'

const keys = Object.keys(Defaults)

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
export function getDataAttributeOptions(reference: ReferenceElement): Props {
  return keys.reduce((acc: any, key) => {
    const valueAsString = (
      reference.getAttribute(`data-tippy-${key}`) || ''
    ).trim()

    if (!valueAsString) {
      return acc
    }

    if (key === 'content') {
      acc[key] = valueAsString
    } else {
      try {
        acc[key] = JSON.parse(valueAsString)
      } catch (e) {
        acc[key] = valueAsString
      }
    }

    return acc
  }, {})
}

/**
 * Polyfills the virtual reference (plain object) with Element.prototype props
 * Mutating because DOM elements are mutated, adds `_tippy` property
 */
export function polyfillElementPrototypeProperties(
  virtualReference: VirtualReference & Record<string, any>,
) {
  const polyfills: Record<string, any> = {
    isVirtual: true,
    attributes: virtualReference.attributes || {},
    setAttribute(key: string, value: any) {
      virtualReference.attributes[key] = value
    },
    getAttribute(key: string) {
      return virtualReference.attributes[key]
    },
    removeAttribute(key: string) {
      delete virtualReference.attributes[key]
    },
    hasAttribute(key: string) {
      return key in virtualReference.attributes
    },
    addEventListener() {},
    removeEventListener() {},
    classList: {
      classNames: {},
      add(key: string) {
        virtualReference.classList.classNames[key] = true
      },
      remove(key: string) {
        delete virtualReference.classList.classNames[key]
      },
      contains(key: string) {
        return key in virtualReference.classList.classNames
      },
    },
  }

  for (const key in polyfills) {
    virtualReference[key] = polyfills[key]
  }
}
