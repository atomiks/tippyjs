import { getDataAttributeOptions } from './reference'
import { hasOwnProperty, evaluateValue } from './utils'
import { isUCBrowser } from './browser'

/**
 * Evaluates the props object by merging data attributes and
 * disabling conflicting options where necessary
 * @param {Element} reference
 * @param {Object} props
 * @return {Object}
 */
export function evaluateProps(reference, props) {
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
 * @param {Object} options
 * @param {Object} defaults
 */
export function validateOptions(options = {}, defaults) {
  Object.keys(options).forEach(option => {
    if (!hasOwnProperty(defaults, option)) {
      throw new Error(`[tippy]: \`${option}\` is not a valid option`)
    }
  })
}
