import {Props, DefaultProps, ReferenceElement, Plugin, Tippy} from './types';
import {
  invokeWithArgsOrReturn,
  hasOwnProperty,
  includes,
  removeProperties,
} from './utils';
import {warnWhen} from './validation';
import {PropsV4} from './types-internal';

const pluginProps = {
  animateFill: false,
  followCursor: false,
  inlinePositioning: false,
  sticky: false,
};

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
  ...pluginProps,
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
export const setDefaultProps: Tippy['setDefaultProps'] = partialProps => {
  if (__DEV__) {
    validateProps(partialProps, []);
  }

  const keys = Object.keys(partialProps) as Array<keyof DefaultProps>;
  keys.forEach(key => {
    (defaultProps as any)[key] = partialProps[key];
  });
};

/**
 * Returns an extended props object including plugin props
 */
export function getExtendedPassedProps(
  passedProps: Partial<Props> & Record<string, unknown>,
): Partial<Props> {
  const plugins = passedProps.plugins || [];
  const pluginProps = plugins.reduce<Record<string, unknown>>((acc, plugin) => {
    const {name, defaultValue} = plugin;

    if (name) {
      acc[name] =
        passedProps[name] !== undefined ? passedProps[name] : defaultValue;
    }

    return acc;
  }, {});

  return {
    ...passedProps,
    ...pluginProps,
  };
}

/**
 * Returns an object of optional props from data-tippy-* attributes
 */
export function getDataAttributeProps(
  reference: ReferenceElement,
  plugins: Plugin[],
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
    {},
  );

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

/**
 * Validates props with the valid `defaultProps` object
 */
export function validateProps(
  partialProps: Partial<PropsV4> = {},
  plugins: Plugin[] = [],
): void {
  const keys = Object.keys(partialProps) as Array<keyof PropsV4>;
  keys.forEach(prop => {
    const value = partialProps[prop];

    const didSpecifyPlacementInPopperOptions =
      prop === 'popperOptions' &&
      value !== null &&
      typeof value === 'object' &&
      hasOwnProperty(value, 'placement');

    const nonPluginProps = removeProperties(defaultProps, [
      'animateFill',
      'followCursor',
      'inlinePositioning',
      'sticky',
    ]);

    // These props have custom warnings
    const customWarningProps = [
      'a11y',
      'arrowType',
      'showOnInit',
      'size',
      'target',
      'touchHold',
    ];

    let didPassUnknownProp =
      !hasOwnProperty(nonPluginProps, prop) &&
      !includes(customWarningProps, prop);

    // Check if the prop exists in `plugins`
    if (didPassUnknownProp) {
      didPassUnknownProp =
        plugins.filter(plugin => plugin.name === prop).length === 0;
    }

    warnWhen(
      prop === 'target',
      [
        'The `target` prop was removed in v5 and replaced with the delegate() addon',
        'in order to conserve bundle size.',
        'See: https://atomiks.github.io/tippyjs/addons/#event-delegation',
      ].join(' '),
    );

    warnWhen(
      prop === 'a11y',
      [
        'The `a11y` prop was removed in v5. Make sure the element you are giving a',
        'tippy to is natively focusable, such as <button> or <input>, not <div>',
        'or <span>.',
      ].join(' '),
    );

    warnWhen(
      prop === 'showOnInit',
      'The `showOnInit` prop was renamed to `showOnCreate` in v5.',
    );

    warnWhen(
      prop === 'arrowType',
      [
        'The `arrowType` prop was removed in v5 in favor of overloading the `arrow`',
        'prop.',
        '\n\n',
        '"round" string was replaced with importing the string from the package.',
        '\n\n',
        "* import {roundArrow} from 'tippy.js'; (ESM version)\n",
        '* const {roundArrow} = tippy; (IIFE CDN version)',
        '\n\n',
        'Before: {arrow: true, arrowType: "round"}\n',
        'After: {arrow: roundArrow}`',
      ].join(' '),
    );

    warnWhen(
      prop === 'touchHold',
      [
        'The `touchHold` prop was removed in v5 in favor of overloading the `touch`',
        'prop.',
        '\n\n',
        'Before: {touchHold: true}\n',
        'After: {touch: "hold"}',
      ].join(' '),
    );

    warnWhen(
      prop === 'size',
      [
        'The `size` prop was removed in v5. Instead, use a theme that specifies',
        'CSS padding and font-size properties.',
      ].join(' '),
    );

    warnWhen(
      prop === 'theme' && value === 'google',
      'The included theme "google" was renamed to "material" in v5.',
    );

    warnWhen(
      didSpecifyPlacementInPopperOptions,
      [
        'Specifying placement in `popperOptions` is not supported. Use the base-level',
        '`placement` prop instead.',
        '\n\n',
        'Before: {popperOptions: {placement: "bottom"}}\n',
        'After: {placement: "bottom"}',
      ].join(' '),
    );

    warnWhen(
      didPassUnknownProp,
      [
        `\`${prop}\``,
        "is not a valid prop. You may have spelled it incorrectly, or if it's a",
        'plugin, forgot to pass it in an array as props.plugins.',
        '\n\n',
        'In v5, the following props were turned into plugins:',
        '\n\n',
        '* animateFill\n',
        '* followCursor\n',
        '* sticky',
        '\n\n',
        'All props: https://atomiks.github.io/tippyjs/all-props/\n',
        'Plugins: https://atomiks.github.io/tippyjs/plugins/',
      ].join(' '),
    );
  });
}
