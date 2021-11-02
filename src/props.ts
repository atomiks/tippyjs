import {DefaultProps, Plugin, Props, ReferenceElement, Tippy} from './types';
import {
  hasOwnProperty,
  removeProperties,
  invokeWithArgsOrReturn,
} from './utils';
import {warnWhen} from './validation';
import {TIPPY_DEFAULT_APPEND_TO} from './constants';

const PLUGIN_PROPS = [
  'animateFill',
  'animation',
  'aria',
  'followCursor',
  'inlinePositioning',
  'sticky',
];

const renderProps = {
  allowHTML: false,
  animation: 'fade',
  arrow: true,
  content: '',
  maxWidth: 350,
  theme: '',
  zIndex: 9999,
};

export const defaultProps: DefaultProps = {
  animateFill: false,
  appendTo: TIPPY_DEFAULT_APPEND_TO,
  aria: {content: 'auto', expanded: 'auto', role: 'tooltip'},
  delay: 0,
  followCursor: false,
  getReferenceClientRect: null,
  hideOnClick: true,
  ignoreAttributes: false,
  inlinePositioning: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  moveTransition: '',
  offset: [0, 10],
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
  onClickOutside() {},
  placement: 'top',
  plugins: [],
  popperOptions: {},
  render: null,
  showOnCreate: false,
  sticky: false,
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null,
  ...renderProps,
};

const defaultKeys = Object.keys(defaultProps);

export const setDefaultProps: Tippy['setDefaultProps'] = (partialProps) => {
  /* istanbul ignore else */
  if (__DEV__) {
    validateProps(partialProps, []);
  }

  const keys = Object.keys(partialProps) as Array<keyof DefaultProps>;
  keys.forEach((key) => {
    (defaultProps as any)[key] = partialProps[key];
  });
};

export function getExtendedPassedProps(
  passedProps: Partial<Props> & Record<string, unknown>
): Partial<Props> {
  const plugins = passedProps.plugins || [];
  const pluginProps = plugins.reduce<Record<string, unknown>>((acc, plugin) => {
    const {name, defaultValue} = plugin;

    if (name) {
      acc[name] =
        passedProps[name] !== undefined
          ? passedProps[name]
          : (defaultProps as any)[name] ?? defaultValue;
    }

    return acc;
  }, {});

  return {
    ...passedProps,
    ...pluginProps,
  };
}

export function getDataAttributeProps(
  reference: ReferenceElement,
  plugins: Plugin[]
): Record<string, unknown> {
  const propKeys = plugins
    ? Object.keys(getExtendedPassedProps({...defaultProps, plugins}))
    : defaultKeys;

  const props = propKeys.reduce(
    (acc: Partial<Props> & Record<string, unknown>, key) => {
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
    },
    {}
  );

  return props;
}

export function evaluateProps(
  reference: ReferenceElement,
  props: Props
): Props {
  return {
    ...props,
    content: invokeWithArgsOrReturn(props.content, [reference]),
    ...(props.ignoreAttributes
      ? {}
      : getDataAttributeProps(reference, props.plugins)),
  };
}

export function validateProps(
  partialProps: Partial<Props> = {},
  plugins: Plugin[] = []
): void {
  const keys = Object.keys(partialProps) as Array<keyof Props>;
  keys.forEach((prop) => {
    const nonPluginProps = removeProperties(defaultProps, PLUGIN_PROPS);
    let didPassUnknownProp = !hasOwnProperty(nonPluginProps, prop);

    // Check if the prop exists in `plugins`
    if (didPassUnknownProp) {
      didPassUnknownProp =
        plugins.filter((plugin) => plugin.name === prop).length === 0;
    }

    warnWhen(
      didPassUnknownProp,
      [
        `\`${prop}\``,
        "is not a valid prop. You may have spelled it incorrectly, or if it's",
        'a plugin, forgot to pass it in an array as props.plugins.',
        '\n\n',
        'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n',
        'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/',
      ].join(' ')
    );
  });
}
