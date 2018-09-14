import { version } from '../../package.json'
import { Defaults, setDefaults } from './defaults'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import {
  isPlainObject,
  polyfillVirtualReferenceProps,
  getArrayOfElements,
  toArray,
  hideAllPoppers,
  isBrowser
} from './utils'

let eventListenersBound = false
let useCapture = false

export default function tippy(targets, options, one) {
  if (!eventListenersBound) {
    bindGlobalEventListeners(useCapture)
    eventListenersBound = true
  }

  // Throw an error if the user supplied an invalid option
  for (const key in options || {}) {
    if (!(key in Defaults)) {
      throw Error(`[tippy]: ${key} is not a valid option`)
    }
  }

  const props = { ...Defaults, ...options }

  /**
   * If they are specifying a virtual positioning reference, we need to polyfill
   * some native DOM props
   */
  if (isPlainObject(targets)) {
    polyfillVirtualReferenceProps(targets)
  }

  const references = getArrayOfElements(targets)
  const firstReference = references[0]

  const instances = (one && firstReference
    ? [firstReference]
    : references
  ).reduce((acc, reference) => {
    const tip = reference && createTippy(reference, props)
    return tip ? acc.concat(tip) : acc
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
    }
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
  setDefaults(partialDefaults)
  tippy.defaults = Defaults
}
tippy.disableAnimations = () => {
  tippy.setDefaults({
    duration: 0,
    updateDuration: 0,
    animateFill: false
  })
}
tippy.hideAllPoppers = hideAllPoppers
tippy.useCapture = () => {
  useCapture = true
}

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
export const autoInit = () => {
  toArray(document.querySelectorAll('[data-tippy]')).forEach(el => {
    const content = el.getAttribute('data-tippy')
    if (content) {
      tippy(el, { content })
    }
  })
}
if (isBrowser) {
  setTimeout(autoInit)
}
