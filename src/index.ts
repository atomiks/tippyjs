import {version} from '../package.json';
import {defaultProps, setDefaultProps, validateProps} from './props';
import createTippy, {mountedInstances} from './createTippy';
import bindGlobalEventListeners, {
  currentInput,
} from './bindGlobalEventListeners';
import {getArrayOfElements, isReferenceElement, isElement} from './utils';
import {warnWhen, validateTargets} from './validation';
import {
  Props,
  Instance,
  Targets,
  HideAllOptions,
  Plugin,
  Tippy,
  HideAll,
} from './types';

function tippy(
  targets: Targets,
  optionalProps: Partial<Props> = {},
  /** @deprecated use Props.plugins */
  plugins: Plugin[] = [],
): Instance | Instance[] {
  plugins = defaultProps.plugins.concat(optionalProps.plugins || plugins);

  if (__DEV__) {
    validateTargets(targets);
    validateProps(optionalProps, plugins);
  }

  bindGlobalEventListeners();

  const props: Props = {
    ...defaultProps,
    ...optionalProps,
    plugins,
  };

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
      const instance = reference && createTippy(reference, props);

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

export default tippy;

/**
 * Hides all visible poppers on the document
 */
export const hideAll: HideAll = ({
  exclude: excludedReferenceOrInstance,
  duration,
}: HideAllOptions = {}) => {
  mountedInstances.forEach(instance => {
    let isExcluded = false;

    if (excludedReferenceOrInstance) {
      isExcluded = isReferenceElement(excludedReferenceOrInstance)
        ? instance.reference === excludedReferenceOrInstance
        : instance.popper === (excludedReferenceOrInstance as Instance).popper;
    }

    if (!isExcluded) {
      instance.hide(duration);
    }
  });
};

/**
 * Returns a proxy wrapper function that passes the plugins
 * @deprecated use tippy.setDefaultProps({plugins: [...]});
 */
export function createTippyWithPlugins(outerPlugins: Plugin[]): Tippy {
  if (__DEV__) {
    warnWhen(
      true,
      `createTippyWithPlugins([...]) has been deprecated.

      Use tippy.setDefaultProps({plugins: [...]}) instead.`,
    );
  }

  const tippyPluginsWrapper = (
    targets: Targets,
    optionalProps: Partial<Props> = {},
    innerPlugins: Plugin[] = [],
  ): Instance | Instance[] => {
    innerPlugins = optionalProps.plugins || innerPlugins;
    return tippy(targets, {
      ...optionalProps,
      plugins: [...outerPlugins, ...innerPlugins],
    });
  };

  tippyPluginsWrapper.version = version;
  tippyPluginsWrapper.defaultProps = defaultProps;
  tippyPluginsWrapper.setDefaultProps = setDefaultProps;
  tippyPluginsWrapper.currentInput = currentInput;

  // @ts-ignore
  return tippyPluginsWrapper;
}
