import { version } from '../../package.json'
import { isBrowser } from './browser'
import Defaults from './defaults'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import { polyfillElementPrototypeProperties } from './reference'
import { validateOptions } from './props'
import { arrayFrom } from './ponyfills'
import { hideAllPoppers } from './popper'
import { isPlainObject, getArrayOfElements } from './utils'

let globalEventListenersBound = false

/**
 * Exported module
 * @param {String|Element|Element[]|NodeList|Object} targets
 * @param {Object} options
 * @param {Boolean} one
 * @return {Object}
 */
function tippy(targets, options, one) {
  validateOptions(options, Defaults)

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  const props = { ...Defaults, ...options }

  /**
   * If they are specifying a virtual positioning reference, we need to polyfill
   * some native DOM props
   */
  if (isPlainObject(targets)) {
    polyfillElementPrototypeProperties(targets)
  }

  const references = getArrayOfElements(targets)
  const firstReference = references[0]

  const instances = (one && firstReference
    ? [firstReference]
    : references
  ).reduce((acc, reference) => {
    const tip = reference && createTippy(reference, props)
    if (tip) {
      acc.push(tip)
    }
    return acc
  }, [])

  return {
    targets,
    props,
    instances,
    destroyAll() {
      this.instances.forEach(instance => {
        instance.destroy()
      })
      this.instances = []
    },
  }
}

/**
 * Static props
 */
tippy.version = version
tippy.defaults = Defaults

/**
 * Static methods
 */
tippy.one = (targets, options) => tippy(targets, options, true).instances[0]
tippy.setDefaults = partialDefaults => {
  Object.keys(partialDefaults).forEach(key => {
    Defaults[key] = partialDefaults[key]
  })
}
tippy.disableAnimations = () => {
  tippy.setDefaults({
    duration: 0,
    updateDuration: 0,
    animateFill: false,
  })
}
tippy.hideAllPoppers = hideAllPoppers
// noop: deprecated static method as capture phase is now default
tippy.useCapture = () => {}

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
export const autoInit = () => {
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
