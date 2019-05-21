import { version } from '../package.json'
import { isBrowser } from './browser'
import { defaultProps } from './props'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import { arrayFrom } from './ponyfills'
import { isRealElement, getArrayOfElements, isReferenceElement } from './utils'
import { validateTargets, validateOptions } from './validation'
import { POPPER_SELECTOR } from './constants'
import {
  Options,
  Props,
  Instance,
  Targets,
  PopperElement,
  HideAllOptions,
} from './types'

let globalEventListenersBound = false

/**
 * Exported module
 */
function tippy(
  targets: Targets,
  options?: Options,
): Instance | Instance[] | null {
  if (process.env.NODE_ENV !== 'production') {
    validateTargets(targets)
    validateOptions(options, defaultProps)
  }

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  const props: Props = { ...defaultProps, ...options }

  const instances = getArrayOfElements(targets).reduce<Instance[]>(
    (acc, reference): Instance[] => {
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

/**
 * Mutates the defaultProps object by setting the props specified
 */
tippy.setDefaults = (partialDefaults: Options): void => {
  Object.keys(partialDefaults).forEach(
    (key): void => {
      // @ts-ignore
      defaultProps[key] = partialDefaults[key]
    },
  )
}

/**
 * Hides all visible poppers on the document
 */
tippy.hideAll = ({
  exclude: excludedReferenceOrInstance,
  duration,
}: HideAllOptions = {}): void => {
  arrayFrom(document.querySelectorAll(POPPER_SELECTOR)).forEach(
    (popper: PopperElement): void => {
      const instance = popper._tippy

      if (instance) {
        let isExcluded = false
        if (excludedReferenceOrInstance) {
          isExcluded = isReferenceElement(excludedReferenceOrInstance)
            ? instance.reference === excludedReferenceOrInstance
            : popper === excludedReferenceOrInstance.popper
        }

        if (!isExcluded) {
          instance.hide(duration)
        }
      }
    },
  )
}

if (process.env.NODE_ENV !== 'production') {
  tippy.group = (): void => {
    /* eslint-disable-next-line no-console */
    console.warn(
      '[tippy.js WARNING] `tippy.group()` was removed in v5 and replaced by ' +
        '`singleton()`. Read more: ' +
        'https://atomiks.github.io/tippyjs/singleton/',
    )
  }
}

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
export function autoInit(): void {
  arrayFrom(document.querySelectorAll('[data-tippy]')).forEach(
    (el): void => {
      const content = el.getAttribute('data-tippy')

      if (content) {
        tippy(el, { content })
      }
    },
  )
}

if (isBrowser) {
  setTimeout(autoInit)
}

export default tippy
