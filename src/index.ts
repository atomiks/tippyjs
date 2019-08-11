import { version } from '../package.json'
import { isBrowser } from './browser'
import { defaultProps } from './props'
import createTippy from './createTippy'
import bindGlobalEventListeners, {
  currentInput,
} from './bindGlobalEventListeners'
import {
  arrayFrom,
  isRealElement,
  getArrayOfElements,
  isReferenceElement,
} from './utils'
import {
  warnWhen,
  validateTargets,
  validateProps,
  validateExtraPropsFunctionality,
  CONTENT_WARNING,
  TIPPY_GROUP_WARNING,
  SET_DEFAULTS_WARNING,
  DEFAULTS_WARNING,
} from './validation'
import { POPPER_SELECTOR } from './constants'
import {
  Props,
  Instance,
  Targets,
  PopperElement,
  HideAllOptions,
} from './types'

/**
 * Exported module
 */
function tippy(
  targets: Targets,
  optionalProps?: Partial<Props>,
): Instance | Instance[] {
  if (__DEV__) {
    validateTargets(targets)
    validateProps(optionalProps)
  }

  bindGlobalEventListeners()

  const props: Props = { ...defaultProps, ...optionalProps }

  const elements = getArrayOfElements(targets)

  if (__DEV__) {
    const isSingleContentElement = isRealElement(props.content)
    const isMoreThanOneReferenceElement = elements.length > 1
    warnWhen(
      isSingleContentElement && isMoreThanOneReferenceElement,
      CONTENT_WARNING,
    )
  }

  const instances = elements.reduce<Instance[]>(
    (acc, reference): Instance[] => {
      const instance = reference && createTippy(reference, props)

      if (instance) {
        if (__DEV__) {
          validateExtraPropsFunctionality(instance, optionalProps)
        }

        acc.push(instance)
      }

      return acc
    },
    [],
  )

  return isRealElement(targets) ? instances[0] : instances
}

tippy.version = version
tippy.defaultProps = defaultProps
tippy.currentInput = currentInput

/**
 * Mutates the defaultProps object by setting the props specified
 */
tippy.setDefaultProps = (partialProps: Partial<Props>): void => {
  if (__DEV__) {
    validateProps(partialProps)
  }

  Object.keys(partialProps).forEach((key): void => {
    // @ts-ignore
    defaultProps[key] = partialProps[key]
  })
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
  Object.defineProperty(tippy, 'group', {
    value: (): void => {
      warnWhen(true, TIPPY_GROUP_WARNING)
    },
    enumerable: false,
  })

  Object.defineProperty(tippy, 'setDefaults', {
    value: (): void => {
      warnWhen(true, SET_DEFAULTS_WARNING)
    },
    enumerable: false,
  })

  Object.defineProperty(tippy, 'defaults', {
    get(): void {
      warnWhen(true, DEFAULTS_WARNING)
      return undefined
    },
    enumerable: false,
  })
}

/**
 * Auto-init tooltips for elements with a `data-tippy="..."` attribute
 */
export function autoInit(): void {
  arrayFrom(document.querySelectorAll('[data-tippy]')).forEach((el): void => {
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
