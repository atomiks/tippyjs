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
import { Props, Instance, Targets, VirtualReference } from './types'

let globalEventListenersBound = false

/**
 * Exported module
 */
function tippy(targets: Targets, options?: Props): Instance | Instance[] {
  validateOptions(options, Defaults)

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  const props = { ...Defaults, ...options }

  // If they are specifying a virtual positioning reference, we need to polyfill
  // some native DOM props
  if (isBareVirtualElement(targets)) {
    polyfillElementPrototypeProperties(targets as VirtualReference)
  }

  const instances = getArrayOfElements(targets).reduce(
    (acc: any, reference) => {
      const instance = reference && createTippy(reference, props)
      if (instance) {
        acc.push(instance)
      }
      return acc
    },
    // @ts-ignore
    [],
  )

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
tippy.setDefaults = (partialDefaults: Props) => {
  Object.keys(partialDefaults).forEach(key => {
    ;(Defaults as any)[key] = (partialDefaults as any)[key]
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
