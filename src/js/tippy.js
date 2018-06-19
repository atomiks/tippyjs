import { version } from '../../package.json'

import { browser } from './core/globals'
import defaults from './core/defaults'

import isObjectLiteral from './utils/isObjectLiteral'
import getArrayOfElements from './utils/getArrayOfElements'
import polyfillVirtualReferenceProps from './utils/polyfillVirtualReferenceProps'

import createTooltips from './core/createTooltips'
import bindEventListeners from './core/bindEventListeners'

let eventListenersBound = false

/**
 * Exported module
 * @param {String|Element|Element[]|NodeList|Object} selector
 * @param {Object} options
 * @param {Boolean} one - create one tooltip
 * @return {Object}
 */
function tippy(selector, options, one) {
  if (browser.supported && !eventListenersBound) {
    bindEventListeners()
    eventListenersBound = true
  }

  if (isObjectLiteral(selector)) {
    polyfillVirtualReferenceProps(selector)
  }

  options = { ...defaults, ...options }

  const references = getArrayOfElements(selector)
  const firstReference = references[0]

  return {
    selector,
    options,
    tooltips: browser.supported
      ? createTooltips(
          one && firstReference ? [firstReference] : references,
          options
        )
      : [],
    destroyAll() {
      this.tooltips.forEach(tooltip => tooltip.destroy())
      this.tooltips = []
    }
  }
}

tippy.version = version
tippy.browser = browser
tippy.defaults = defaults
tippy.one = (selector, options) => tippy(selector, options, true).tooltips[0]
tippy.disableAnimations = () => {
  defaults.updateDuration = defaults.duration = 0
  defaults.animateFill = false
}

export default tippy
