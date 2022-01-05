import {DefaultProps, Plugin, Props, ReferenceElement, Tippy} from './types';
import {
  hasOwnProperty,
  removeProperties,
  invokeWithArgsOrReturn,
} from './utils';
import {warnWhen} from './validation';
import {TIPPY_DEFAULT_APPEND_TO} from './constants';

const pluginProps = {
  animateFill: false,
  followCursor: false,
  inlinePositioning: false,
  sticky: false,
};

const renderProps = {
  allowHTML: false,
  animation: 'fade',
  arrow: true,
  content: '',
  inertia: false,
  maxWidth: 350,
  role: 'tooltip',
  theme: '',
  zIndex: 9999,
};

export const defaultProps: DefaultProps = {
  appendTo: TIPPY_DEFAULT_APPEND_TO,
  aria: {
    content: 'auto',
    expanded: 'auto',
  },
  delay: 0,
  duration: [300, 250],
  getReferenceClientRect: null,
  hideOnClick: true,
  ignoreAttributes: false,
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
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null,
  ...pluginProps,
  ...renderProps,
};

const defaultKeys = Object.keys(defaultProps);

export const setDefaultProps: Tippy['setDefaultProps'] = (partialProps) => {
  /* istanbul ignore else */
  if (__DEV__) {
    const plugins = defaultProps.plugins.concat(partialProps.plugins || []);
    validateProps(partialProps, plugins);
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
  const out = {
    ...props,
    content: invokeWithArgsOrReturn(props.content, [reference]),
    ...(props.ignoreAttributes
      ? {}
      : getDataAttributeProps(reference, props.plugins)),
  };

  out.aria = {
    ...defaultProps.aria,
    ...out.aria,
  };

  out.aria = {
    expanded:
      out.aria.expanded === 'auto' ? props.interactive : out.aria.expanded,
    content:
      out.aria.content === 'auto'
        ? props.interactive
          ? null
          : 'describedby'
        : out.aria.content,
  };

  return out;
}

export function validateProps(
  partialProps: Partial<Props> = {},
  plugins: Plugin[] = []
): void {
  const keys = Object.keys(partialProps) as Array<keyof Props>;
  keys.forEach((prop) => {
    const nonPluginProps = removeProperties(
      defaultProps,
      Object.keys(pluginProps)
    );

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
