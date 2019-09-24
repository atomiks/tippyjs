import { version } from '../package.json'
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
import { warnWhen, validateTargets, validateProps } from './validation'
import { POPPER_SELECTOR } from './constants'
import {
  Props,
  Instance,
  Targets,
  PopperElement,
  HideAllOptions,
  Plugin,
} from './types'

/**
 * Exported module
 */
function tippy(
  targets: Targets,
  optionalProps?: Partial<Props>,
  plugins: Plugin[] = [],
): Instance | Instance[] {
  if (__DEV__) {
    validateTargets(targets)
    validateProps(optionalProps, plugins)
  }

  bindGlobalEventListeners()

  const props: Props = { ...defaultProps, ...optionalProps }

  const elements = getArrayOfElements(targets)

  if (__DEV__) {
    const isSingleContentElement = isRealElement(props.content)
    const isMoreThanOneReferenceElement = elements.length > 1
    warnWhen(
      isSingleContentElement && isMoreThanOneReferenceElement,
      `tippy() was passed an Element as the \`content\` prop, but more than one
      tippy instance was created by this invocation. This means the content
      element will only be appended to the last tippy instance.
      
      Instead, pass the .innerHTML of the element, or use a function that
      returns a cloned version of the element instead.
      
      1) content: () => element.cloneNode(true)
      2) content: element.innerHTML`,
    )
  }

  const instances = elements.reduce<Instance[]>(
    (acc, reference): Instance[] => {
      const instance = reference && createTippy(reference, props, plugins)

      if (instance) {
        acc.push(instance)
      }

      return acc
    },
    [],
  )

  return isRealElement(targets) ? instances[0] : instances
}

function addStatics(fn: any): void {
  fn.version = version
  fn.defaultProps = defaultProps
  fn.setDefaultProps = setDefaultProps
  fn.currentInput = currentInput
}

addStatics(tippy)

/**
 * Mutates the defaultProps object by setting the props specified
 */
function setDefaultProps(partialProps: Partial<Props>): void {
  if (__DEV__) {
    validateProps(partialProps, [])
  }

  Object.keys(partialProps).forEach((key): void => {
    defaultProps[key] = partialProps[key]
  })
}

/**
 * Returns a proxy wrapper function that passes the plugins
 */
export function createTippyWithPlugins(
  plugins: Plugin[],
): (targets: Targets, optionalProps?: Partial<Props>) => Instance | Instance[] {
  const fn = (targets: Targets, optionalProps?: Partial<Props>) =>
    tippy(targets, optionalProps, plugins)

  addStatics(fn)

  return fn
}

/**
 * Hides all visible poppers on the document
 */
export function hideAll({
  exclude: excludedReferenceOrInstance,
  duration,
}: HideAllOptions = {}): void {
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

export default tippy
