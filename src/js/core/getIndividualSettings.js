import { DefaultsKeys } from './globals'

/**
* Returns an object of settings to override global settings
* @param {Element} el - the tooltipped element
* @param {Object} instanceSettings
* @return {Object} - individual settings
*/
export default function getIndividualSettings(el, instanceSettings) {
  const settings = DefaultsKeys.reduce((acc, key) => {
    let val = el.getAttribute(`data-${ key.toLowerCase() }`) || instanceSettings[key]

    // Convert strings to booleans
    if (val === 'false') val = false
    if (val === 'true') val = true

    // Convert number strings to true numbers
    if (isFinite(val) && !isNaN(parseFloat(val))) {
      val = parseFloat(val)
    }

    // Convert array strings to actual arrays
    if (typeof val === 'string' && val.trim().charAt(0) === '[') {
      val = JSON.parse(val)
    }

    acc[key] = val

    return acc
  }, {})

  return Object.assign({}, instanceSettings, settings)
}
