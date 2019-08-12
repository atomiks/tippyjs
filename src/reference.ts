import { ReferenceElement, Props } from './types'
import { defaultProps } from './props'

const keys = Object.keys(defaultProps)

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
export function getDataAttributeProps(reference: ReferenceElement): Props {
  const props = keys.reduce((acc: any, key): Partial<Props> => {
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

  return props
}

/**
 * Applies the `aria-describedby` (or `aria-labelledby`) attribute to the
 * triggerTarget
 */
export function handleAriaDescribedByAttribute(
  node: Element,
  isShowing: boolean,
  aria: string | null,
  id: string,
): void {
  if (!aria) {
    return
  }

  const attr = `aria-${aria}`
  const currentValue = node.getAttribute(attr)

  if (isShowing) {
    node.setAttribute(attr, currentValue ? `${currentValue} ${id}` : id)
  } else {
    const nextValue = currentValue && currentValue.replace(id, '').trim()

    if (nextValue) {
      node.setAttribute(attr, nextValue)
    } else {
      node.removeAttribute(attr)
    }
  }
}

/**
 * Applies the `aria-expanded` attribute for interactive tippys, or removes it
 * if no longer interactive
 */
export function handleAriaExpandedAttribute(
  node: Element,
  isShowing: boolean,
  isInteractive: boolean,
): void {
  const attr = 'aria-expanded'

  if (isInteractive) {
    node.setAttribute(attr, isShowing ? 'true' : 'false')
  } else {
    node.removeAttribute(attr)
  }
}
