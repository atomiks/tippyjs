import { version } from '../package.json'
import { isBrowser } from './browser'
import { defaultProps } from './props'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import { arrayFrom } from './ponyfills'
import { hideAll } from './popper'
import { isRealElement, getArrayOfElements, validateOptions } from './utils'
import { Options, Props, Instance, Targets } from './types'

let globalEventListenersBound = false

/**
 * Exported module
 */
function tippy(
  targets: Targets,
  options?: Options,
): Instance | Instance[] | null {
  if (process.env.NODE_ENV !== 'production') {
    if (!targets) {
      console.warn(
        `[tippy.js WARNING] \`tippy()\` was passed \`${targets}\` (an invalid falsy argument) as its targets argument`,
      )
    }

    validateOptions(options, defaultProps)
  }

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  const props: Props = { ...defaultProps, ...options }

  const instances = getArrayOfElements(targets).reduce<Instance[]>(
    (acc, reference) => {
      const instance = reference && createTippy(reference, props)

      if (instance) {
        acc.push(instance)
      }

      return acc
    },
    [],
  )

  return targets ? (isRealElement(targets) ? instances[0] : instances) : null
}

tippy.version = version
tippy.defaults = defaultProps
tippy.hideAll = hideAll

/**
 * Mutates the defaultProps object by setting the props specified
 */
tippy.setDefaults = (partialDefaults: Options) => {
  Object.keys(partialDefaults).forEach(key => {
    // @ts-ignore
    defaultProps[key] = partialDefaults[key]
  })
}

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
export function autoInit(): void {
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
