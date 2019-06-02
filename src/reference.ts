import { Props, ReferenceElement } from './types'
import { defaultProps } from './props'
import { validateProps } from './validation'

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

  if (__DEV__) {
    validateProps(props)
  }

  return props
}
