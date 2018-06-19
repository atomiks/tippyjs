import { defaultsKeys } from '../core/defaults'

/**
 * Returns an object of settings to override global settings
 * @param {Element} reference
 * @param {Object} instanceOptions
 * @return {Object} - individual options
 */
export default function getIndividualOptions(reference, instanceOptions) {
  const options = defaultsKeys.reduce((acc, key) => {
    let val =
      reference.getAttribute(`data-tippy-${key.toLowerCase()}`) ||
      instanceOptions[key]

    // Convert strings to booleans
    if (val === 'false') val = false
    if (val === 'true') val = true

    // Convert number strings to true numbers
    if (isFinite(val) && !isNaN(parseFloat(val))) {
      val = parseFloat(val)
    }

    // Convert array strings to actual arrays
    if (
      key !== 'target' &&
      typeof val === 'string' &&
      val.trim().charAt(0) === '['
    ) {
      val = JSON.parse(val)
    }

    acc[key] = val

    return acc
  }, {})

  return { ...instanceOptions, ...options }
}
