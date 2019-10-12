import {version} from '../package.json';
import {defaultProps} from './props';
import createTippy, {mountedInstances} from './createTippy';
import bindGlobalEventListeners, {
  currentInput,
} from './bindGlobalEventListeners';
import {getArrayOfElements, isReferenceElement, isElement} from './utils';
import {warnWhen, validateTargets, validateProps} from './validation';
import {Props, Instance, Targets, HideAllOptions, Plugin, Tippy} from './types';

/**
 * Exported module
 */
function tippy(
  targets: Targets,
  optionalProps?: Partial<Props>,
  plugins: Plugin[] = [],
): Instance | Instance[] {
  if (__DEV__) {
    validateTargets(targets);
    validateProps(optionalProps, plugins);
  }

  bindGlobalEventListeners();

  const props: Props = {...defaultProps, ...optionalProps};

  const elements = getArrayOfElements(targets);

  if (__DEV__) {
    const isSingleContentElement = isElement(props.content);
    const isMoreThanOneReferenceElement = elements.length > 1;
    warnWhen(
      isSingleContentElement && isMoreThanOneReferenceElement,
      `tippy() was passed an Element as the \`content\` prop, but more than one
      tippy instance was created by this invocation. This means the content
      element will only be appended to the last tippy instance.
      
      Instead, pass the .innerHTML of the element, or use a function that
      returns a cloned version of the element instead.
      
      1) content: () => element.cloneNode(true)
      2) content: element.innerHTML`,
    );
  }

  const instances = elements.reduce<Instance[]>(
    (acc, reference): Instance[] => {
      const instance = reference && createTippy(reference, props, plugins);

      if (instance) {
        acc.push(instance);
      }

      return acc;
    },
    [],
  );

  return isElement(targets) ? instances[0] : instances;
}

tippy.version = version;
tippy.defaultProps = defaultProps;
tippy.setDefaultProps = setDefaultProps;
tippy.currentInput = currentInput;

/**
 * Mutates the defaultProps object by setting the props specified
 */
function setDefaultProps(partialProps: Partial<Props>): void {
  if (__DEV__) {
    validateProps(partialProps, []);
  }

  Object.keys(partialProps).forEach((key): void => {
    defaultProps[key] = partialProps[key];
  });
}

/**
 * Returns a proxy wrapper function that passes the plugins
 */
export function createTippyWithPlugins(outerPlugins: Plugin[]): Tippy {
  const fn = (
    targets: Targets,
    optionalProps?: Partial<Props>,
    innerPlugins: Plugin[] = [],
  ): Instance | Instance[] =>
    tippy(targets, optionalProps, [...outerPlugins, ...innerPlugins]);

  fn.version = version;
  fn.defaultProps = defaultProps;
  fn.setDefaultProps = setDefaultProps;
  fn.currentInput = currentInput;

  return fn;
}

/**
 * Hides all visible poppers on the document
 */
export function hideAll({
  exclude: excludedReferenceOrInstance,
  duration,
}: HideAllOptions = {}): void {
  mountedInstances.forEach(instance => {
    let isExcluded = false;

    if (excludedReferenceOrInstance) {
      isExcluded = isReferenceElement(excludedReferenceOrInstance)
        ? instance.reference === excludedReferenceOrInstance
        : instance.popper === excludedReferenceOrInstance.popper;
    }

    if (!isExcluded) {
      instance.hide(duration);
    }
  });
}

export default tippy;
