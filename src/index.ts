import {defaultProps, setDefaultProps, validateProps} from './props';
import createTippy, {mountedInstances} from './createTippy';
import bindGlobalEventListeners, {
  currentInput,
} from './bindGlobalEventListeners';
import {getArrayOfElements, isReferenceElement, isElement} from './dom-utils';
import {warnWhen, validateTargets} from './validation';
import {Props, Instance, Targets, HideAllOptions, HideAll} from './types';

function tippy(
  targets: Targets,
  optionalProps: Partial<Props> = {},
): Instance | Instance[] {
  const plugins = defaultProps.plugins.concat(optionalProps.plugins || []);

  /* istanbul ignore else */
  if (__DEV__) {
    validateTargets(targets);
    validateProps(optionalProps, plugins);
  }

  bindGlobalEventListeners();

  const passedProps: Partial<Props> = {...optionalProps, plugins};

  const elements = getArrayOfElements(targets);

  /* istanbul ignore else */
  if (__DEV__) {
    const isSingleContentElement = isElement(passedProps.content);
    const isMoreThanOneReferenceElement = elements.length > 1;
    warnWhen(
      isSingleContentElement && isMoreThanOneReferenceElement,
      [
        'tippy() was passed an Element as the `content` prop, but more than',
        'one tippy instance was created by this invocation. This means the',
        'content element will only be appended to the last tippy instance.',
        '\n\n',
        'Instead, pass the .innerHTML of the element, or use a function that',
        'returns a cloned version of the element instead.',
        '\n\n',
        '1) content: element.innerHTML\n',
        '2) content: () => element.cloneNode(true)',
      ].join(' '),
    );
  }

  const instances = elements.reduce<Instance[]>(
    (acc, reference): Instance[] => {
      const instance = reference && createTippy(reference, passedProps);

      if (instance) {
        acc.push(instance);
      }

      return acc;
    },
    [],
  );

  return isElement(targets) ? instances[0] : instances;
}

tippy.defaultProps = defaultProps;
tippy.setDefaultProps = setDefaultProps;
tippy.currentInput = currentInput;

export default tippy;

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
      const originalDuration = instance.props.duration;
      instance.setProps({duration});
      instance.hide();
      instance.setProps({duration: originalDuration});
    }
  });
};
