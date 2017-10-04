/**
* Evaluates/modifies the settings object for appropriate behavior
* @param {Object} settings
* @return {Object} modified/evaluated settings
*/
export default function evaluateSettings(settings) {
  // animateFill is disabled if an arrow is true
  if (settings.arrow) {
    settings.animateFill = false
  }

  // reassign appendTo into the result of evaluating appendTo
  // if it's set as a function instead of Element
  if (settings.appendTo && typeof settings.appendTo === 'function') {
    settings.appendTo = settings.appendTo()
  }

  return settings
}
