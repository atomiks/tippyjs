import { browser, defaults } from './core/globals'

import isObjectLiteral from './utils/isObjectLiteral'
import getArrayOfElements from './utils/getArrayOfElements'

import createTooltips from './core/createTooltips'
import bindEventListeners from './core/bindEventListeners'

let eventListenersBound = false

/**
 * Creates tooltips
 * @param {String|Element|Element[]|NodeList|Object} selector
 * @param {Object} options
 * @return {Object}
 */
function tippy(selector, options) {
  if (browser.supported && !eventListenersBound) {
    bindEventListeners()
    eventListenersBound = true
  }

  if (isObjectLiteral(selector)) {
    selector.refObj = true
    selector.attributes = selector.attributes || {}
    selector.setAttribute = (key, val) => {
      selector.attributes[key] = val
    }
    selector.getAttribute = key => selector.attributes[key]
    selector.removeAttribute = key => {
      delete selector.attributes[key]
    }
    selector.addEventListener = () => {}
    selector.removeEventListener = () => {}
    selector.classList = {
      classNames: {},
      add: key => (selector.classList.classNames[key] = true),
      remove: key => {
        delete selector.classList.classNames[key]
        return true
      },
      contains: key => !!selector.classList.classNames[key]
    }
  }

  options = { ...defaults, ...options }

  return {
    selector,
    options,
    tooltips: browser.supported ? createTooltips(getArrayOfElements(selector), options) : [],
    destroyAll() {
      this.tooltips.forEach(tooltip => tooltip.destroy())
      this.tooltips = []
    }
  }
}

tippy.browser = browser
tippy.defaults = defaults

export default tippy
