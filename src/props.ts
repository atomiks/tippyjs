import {Props, DefaultProps, ReferenceElement, Plugin} from './types';
import {invokeWithArgsOrReturn} from './utils';
import {validateProps} from './validation';

export const defaultProps: DefaultProps = {
  allowHTML: true,
  animation: 'fade',
  appendTo: () => document.body,
  aria: 'describedby',
  arrow: true,
  boundary: 'scrollParent',
  content: '',
  delay: 0,
  distance: 10,
  duration: [300, 250],
  flip: true,
  flipBehavior: 'flip',
  flipOnUpdate: false,
  hideOnClick: true,
  ignoreAttributes: false,
  inertia: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  lazy: true,
  maxWidth: 350,
  multiple: false,
  offset: 0,
  onAfterUpdate() {},
  onBeforeUpdate() {},
  onCreate() {},
  onDestroy() {},
  onHidden() {},
  onHide() {},
  onMount() {},
  onShow() {},
  onShown() {},
  onTrigger() {},
  onUntrigger() {},
  placement: 'top',
  plugins: [],
  popperOptions: {},
  role: 'tooltip',
  showOnCreate: false,
  theme: '',
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null,
  updateDuration: 0,
  zIndex: 9999,
};

const defaultKeys = Object.keys(defaultProps);

/**
 * If the setProps() method encounters one of these, the popperInstance must be
 * recreated
 */
export const POPPER_INSTANCE_DEPENDENCIES: Array<keyof Props> = [
  'arrow',
  'boundary',
  'distance',
  'flip',
  'flipBehavior',
  'flipOnUpdate',
  'offset',
  'placement',
  'popperOptions',
];

/**
 * Mutates the defaultProps object by setting the props specified
 */
export function setDefaultProps(partialProps: Partial<DefaultProps>): void {
  if (__DEV__) {
    validateProps(partialProps, []);
  }

  Object.keys(partialProps).forEach(key => {
    defaultProps[key] = partialProps[key];
  });
}

/**
 * Returns an extended props object including plugin props
 */
export function getExtendedProps(props: Props): Props {
  return {
    ...props,
    ...props.plugins.reduce<{[key: string]: any}>((acc, plugin) => {
      const {name, defaultValue} = plugin;

      if (name) {
        acc[name] = props[name] !== undefined ? props[name] : defaultValue;
      }

      return acc;
    }, {}),
  };
}

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
export function getDataAttributeProps(
  reference: ReferenceElement,
  plugins: Plugin[],
): Props {
  const props = (plugins
    ? Object.keys(getExtendedProps({...defaultProps, plugins}))
    : defaultKeys
  ).reduce((acc: any, key): Partial<Props> => {
    const valueAsString = (
      reference.getAttribute(`data-tippy-${key}`) || ''
    ).trim();

    if (!valueAsString) {
      return acc;
    }

    if (key === 'content') {
      acc[key] = valueAsString;
    } else {
      try {
        acc[key] = JSON.parse(valueAsString);
      } catch (e) {
        acc[key] = valueAsString;
      }
    }

    return acc;
  }, {});

  return props;
}

/**
 * Evaluates the props object by merging data attributes and disabling
 * conflicting props where necessary
 */
export function evaluateProps(
  reference: ReferenceElement,
  props: Props,
): Props {
  const out = {
    ...props,
    content: invokeWithArgsOrReturn(props.content, [reference]),
    ...(props.ignoreAttributes
      ? {}
      : getDataAttributeProps(reference, props.plugins)),
  };

  if (out.interactive) {
    out.aria = null;
  }

  return out;
}
