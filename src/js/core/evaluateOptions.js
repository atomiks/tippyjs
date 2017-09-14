/**
* Evaluates/modifies the options object for appropriate behavior
* @param {Object} options
* @return {Object} modified/evaluated options
*/
export default function evaluateOptions(options) {
  // animateFill is disabled if an arrow is true
  if (options.arrow) {
    options.animateFill = false
  }

  // reassign appendTo into the result of evaluating appendTo
  // if it's set as a function instead of Element
  if (options.appendTo && typeof options.appendTo === 'function') {
    options.appendTo = options.appendTo()
  }

  return options
}
