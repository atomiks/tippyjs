import {Props, DefaultProps, ReferenceElement, Plugin, Tippy} from './types';
import {
  invokeWithArgsOrReturn,
  hasOwnProperty,
  includes,
  removeProperties,
} from './utils';
import {warnWhen} from './validation';
import {PropsV4} from './types-internal';

export const defaultProps: DefaultProps = {
  allowHTML: true,
  animateFill: false,
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
  followCursor: false,
  hideOnClick: true,
  ignoreAttributes: false,
  inlinePositioning: false,
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
  sticky: false,
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
export function getExtendedProps(
  props: Props & Record<string, unknown>,
): Props & Record<string, unknown> {
  return {
    ...props,
    ...props.plugins.reduce<Record<string, unknown>>((acc, plugin) => {
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
): Partial<Props> & Record<string, unknown> {
  const propKeys = plugins
    ? Object.keys(getExtendedProps({...defaultProps, plugins}))
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
): Props & Record<string, unknown> {
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
      `The \`target\` prop was removed in v5 and replaced with the delegate()
      addon in order to conserve bundle size.
      
      See: https://atomiks.github.io/tippyjs/addons/#event-delegation`,
    );

    warnWhen(
      prop === 'a11y',
      `The \`a11y\` prop was removed in v5. Make sure the element you are giving
      a tippy to is natively focusable, such as <button> or <input>, not <div>
      or <span>.`,
    );

    warnWhen(
      prop === 'showOnInit',
      `The \`showOnInit\` prop was renamed to \`showOnCreate\` in v5.`,
    );

    warnWhen(
      prop === 'arrowType',
      `The \`arrowType\` prop was removed in v5 in favor of overloading the
      \`arrow\` prop.

      "round" string was replaced with importing the string from the package.

      * import {roundArrow} from 'tippy.js'; (ESM version)
      * const {roundArrow} = tippy; (IIFE CDN version)

      Before: {arrow: true, arrowType: "round"}
      After: {arrow: roundArrow}`,
    );

    warnWhen(
      prop === 'touchHold',
      `The \`touchHold\` prop was removed in v5 in favor of overloading the
      \`touch\` prop.
      
      Before: {touchHold: true}
      After: {touch: "hold"}`,
    );

    warnWhen(
      prop === 'size',
      `The \`size\` prop was removed in v5. Instead, use a theme that specifies
      CSS padding and font-size properties.`,
    );

    warnWhen(
      prop === 'theme' && value === 'google',
      `The included theme "google" was renamed to "material" in v5.`,
    );

    warnWhen(
      didSpecifyPlacementInPopperOptions,
      `Specifying placement in \`popperOptions\` is not supported. Use the
      base-level \`placement\` prop instead.
      
      Before: {popperOptions: {placement: "bottom"}}
      After: {placement: "bottom"}`,
    );

    warnWhen(
      didPassUnknownProp,
      `\`${prop}\` is not a valid prop. You may have spelled it incorrectly,
      or if it's a plugin, forgot to pass it in an array as props.plugins.

      In v5, the following props were turned into plugins:

      * animateFill
      * followCursor
      * sticky

      All props: https://atomiks.github.io/tippyjs/all-props/
      Plugins: https://atomiks.github.io/tippyjs/plugins/`,
    );
  });
}
