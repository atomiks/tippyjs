import { version } from '../package.json'
import { isBrowser } from './browser'
import { defaultProps } from './props'
import createTippy from './createTippy'
import bindGlobalEventListeners from './bindGlobalEventListeners'
import { arrayFrom } from './ponyfills'
import {
  isRealElement,
  getArrayOfElements,
  isReferenceElement,
  warnWhen,
} from './utils'
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
  if (__DEV__) {
    validateTargets(targets)
    validateOptions(options)
  }

  if (!globalEventListenersBound) {
    bindGlobalEventListeners()
    globalEventListenersBound = true
  }

  const props: Props = { ...defaultProps, ...options }

  const elements = getArrayOfElements(targets)

  if (__DEV__) {
    const isSingleContentElement = isRealElement(props.content)
    const isMoreThanOneReferenceElement = elements.length > 1
    warnWhen(
      isSingleContentElement && isMoreThanOneReferenceElement,
      '`tippy()` was passed a targets argument that will create more than ' +
        'one tippy instance, but only a single element was supplied as the ' +
        '`content` option. Use a function that returns a cloned version of ' +
        'the element instead, or pass the .innerHTML of the template element.',
    )
  }

  const instances = elements.reduce<Instance[]>(
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

if (__DEV__) {
  tippy.group = (): void => {
    warnWhen(
      true,
      '`tippy.group()` was removed in v5 and replaced with ' +
        '`createSingleton()`. Read more here: ' +
        'https://atomiks.github.io/tippyjs/addons#singleton',
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
