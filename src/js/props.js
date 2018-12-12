import { getDataAttributeOptions } from './reference'
import { hasOwnProperty } from './utils'

/**
 * Evaluates the props object
 * @param {Element} reference
 * @param {Object} props
 * @return {Object}
 */
export function evaluateProps(reference, props) {
  const out = {
    ...props,
    ...(props.performance ? {} : getDataAttributeOptions(reference)),
  }

  if (out.arrow) {
    out.animateFill = false
  }

  if (typeof out.appendTo === 'function') {
    out.appendTo = props.appendTo(reference)
  }

  if (typeof out.content === 'function') {
    out.content = props.content(reference)
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
