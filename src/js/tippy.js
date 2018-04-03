import { version } from '../../package.json'
import defaults from './defaults'
import browser from './browser'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import {
  isVirtualReference,
  polyfillVirtualReferenceProps,
  getArrayOfElements
} from './utils'

let eventListenersBound = false

export default function tippy(targets, opts) {
  if (!eventListenersBound) {
    bindGlobalEventListeners()
    eventListenersBound = true
  }

  const options = { ...defaults, ...opts }

  // If they are specifying a virtual positioning reference, we need to polyfill
  // some native DOM props
  if (isVirtualReference(targets)) {
    targets = polyfillVirtualReferenceProps(targets)
  }

  const references = getArrayOfElements(targets)
  const instances = references.map(reference => createTippy(reference, options))

  return {
    targets,
    options,
    references,
    instances,
    destroyAll() {
      this.instances.forEach(tippy => {
        tippy.destroy()
      })
      this.instances = []
    }
  }
}

tippy.version = version
tippy.defaults = defaults
tippy.browser = browser

tippy.one = (targets, options) => tippy(targets, options).instances[0]
tippy.disableAnimations = () => {
  defaults.duration = defaults.updateDuration = 0
  defaults.animateFill = false
}
