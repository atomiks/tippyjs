import { version } from '../../package.json'
import { isBrowser } from './browser'
import Defaults from './defaults'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import { polyfillElementPrototypeProperties } from './reference'
import { validateOptions } from './props'
import { arrayFrom } from './ponyfills'
import { hideAll } from './popper'
import { isSingular, isBareVirtualElement, getArrayOfElements } from './utils'
import group from './group'

let globalEventListenersBound = false

/**
 * Exported module
 * @param {String|Element|Element[]|NodeList|Object} targets
 * @param {Object} options
 * @return {Object}
 */
function tippy(targets, options) {
  validateOptions(options, Defaults)

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  const props = { ...Defaults, ...options }

  // If they are specifying a virtual positioning reference, we need to polyfill
  // some native DOM props
  if (isBareVirtualElement(targets)) {
    polyfillElementPrototypeProperties(targets)
  }

  const instances = getArrayOfElements(targets).reduce((acc, reference) => {
    const instance = reference && createTippy(reference, props)
    if (instance) {
      acc.push(instance)
    }
    return acc
  }, [])

  return isSingular(targets) ? instances[0] : instances
}

/**
 * Static props
 */
tippy.version = version
tippy.defaults = Defaults

/**
 * Static methods
 */
tippy.setDefaults = partialDefaults => {
  Object.keys(partialDefaults).forEach(key => {
    Defaults[key] = partialDefaults[key]
  })
}
tippy.hideAll = hideAll
tippy.group = group

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
export function autoInit() {
  arrayFrom(document.querySelectorAll('[data-tippy]')).forEach(el => {
    const content = el.getAttribute('data-tippy')
    if (content) {
      tippy(el, { content })
    }
  })
}
if (isBrowser) {
  setTimeout(autoInit)
}

export default tippy
