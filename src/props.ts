import { getDataAttributeOptions } from './reference'
import { hasOwnProperty, evaluateValue } from './utils'
import { isUCBrowser } from './browser'
import { ReferenceElement, Props } from './types'

/**
 * Evaluates the props object by merging data attributes and
 * disabling conflicting options where necessary
 */
export function evaluateProps(
  reference: ReferenceElement,
  props: Props,
): Props {
  const out = {
    ...props,
    content: evaluateValue(props.content, [reference]),
    ...(props.ignoreAttributes ? {} : getDataAttributeOptions(reference)),
  }

  if (out.arrow || isUCBrowser) {
    out.animateFill = false
  }

  return out
}

/**
 * Validates an object of options with the valid default props object
 */
export function validateOptions(options = {}, defaults: Props): void {
  Object.keys(options).forEach(option => {
    if (!hasOwnProperty(defaults, option)) {
      throw new Error(`[tippy]: \`${option}\` is not a valid option`)
    }
  })
}
