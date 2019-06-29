import { Props, Targets, Instance } from './types'
import { hasOwnProperty } from './utils'
import { defaultProps } from './props'

/**
 * Helpful wrapper around `console.warn()`.
 * TODO: Should we use a cache so it only warns a single time and not spam the
 * console? (Need to consider hot reloading and invalidation though). Chrome
 * already batches warnings as well.
 */
export function warnWhen(condition: boolean, message: string): void {
  if (condition) {
    /* eslint-disable-next-line no-console */
    console.warn(`[tippy.js WARNING] ${message}`)
  }
}

/**
 * Helpful wrapper around thrown errors
 */
export function throwErrorWhen(condition: boolean, message: string): void {
  if (condition) {
    throw new Error(`[tippy.js ERROR] ${message}`)
  }
}

/**
 * Validates props with the valid `defaultProps` object
 */
export function validateProps(partialProps: Partial<Props> = {}): void {
  Object.keys(partialProps).forEach((prop): void => {
    const value = (partialProps as any)[prop]
    const didPassTargetProp = prop === 'target'
    const didPassA11yProp = prop === 'a11y'
    const didPassShowOnInitProp = prop === 'showOnInit'
    const didPassArrowTypeProp = prop === 'arrowType'
    const didPassTouchHoldProp = prop === 'touchHold'
    const didPassSizeProp = prop === 'size'
    const didPassOtherUnknownProp =
      !hasOwnProperty(defaultProps, prop) &&
      !didPassTargetProp &&
      !didPassA11yProp &&
      !didPassShowOnInitProp
    const didPassGoogleTheme = prop === 'theme' && value === 'google'
    const didSpecifyPlacementInPopperOptions =
      prop === 'popperOptions' && value && hasOwnProperty(value, 'placement')

    warnWhen(
      didPassTargetProp,
      'The `target` prop was removed in v5 and ' +
        'replaced with the `delegate()` method. Read more here: ' +
        'https//atomiks.github.io/tippyjs/addons#event-delegation',
    )

    warnWhen(
      didPassA11yProp,
      'The `a11y` prop was removed in v5. Make ' +
        'sure the element you are giving a tippy to is natively ' +
        'focusable, such as <button> or <input>, not <div> or <span>.',
    )

    warnWhen(
      didPassShowOnInitProp,
      'The `showOnInit` prop was renamed to `showOnCreate` in v5.',
    )

    warnWhen(
      didPassArrowTypeProp,
      'The `arrowType` prop was removed in v5 ' +
        'in favor of overloading the `arrow` prop. Specify ' +
        '`arrow: "' +
        value +
        '"` instead.',
    )

    warnWhen(
      didPassTouchHoldProp,
      'The `touchHold` prop was removed in v5 in favor of overloading the ' +
        '`touch` prop. Specify `touch: "hold"` instead.',
    )

    warnWhen(
      didPassSizeProp,
      'The `size` prop was removed in v5. Instead, use a theme that ' +
        'specifies `font-size` and `padding` CSS properties.',
    )

    warnWhen(
      didPassOtherUnknownProp,
      '`' +
        prop +
        '` is not a valid prop. You ' +
        'may have spelled it incorrectly. View all of the valid props ' +
        'here: https://atomiks.github.io/tippyjs/all-props/',
    )

    warnWhen(
      didPassGoogleTheme,
      'The included theme `google` was renamed to `material` in v5.',
    )

    warnWhen(
      didSpecifyPlacementInPopperOptions,
      'Specifying `placement` in `popperOptions` is not supported. Use the ' +
        'base-level `placement` prop instead.',
    )
  })
}

/**
 * Validates the `targets` value passed to `tippy()`
 */
export function validateTargets(targets: Targets): void {
  const didPassFalsyValue = !targets
  const didPassPlainObject =
    Object.prototype.toString.call(targets) === '[object Object]' &&
    !(targets as any).addEventListener

  throwErrorWhen(
    didPassFalsyValue,
    '`tippy()` was passed `' +
      targets +
      '` (an invalid falsy value) as its targets argument. Valid types are: ' +
      'String (CSS selector), Element, Element[], or NodeList.',
  )

  throwErrorWhen(
    didPassPlainObject,
    '`tippy()` was passed a plain object (virtual ' +
      'reference element) which is no longer supported in v5. Instead, pass ' +
      'a placeholder element like `document.createElement("div")`',
  )
}

/**
 * Ensures the instance has been configured with the extra prop's functionality
 * if the user is specifying it as a prop
 */
export function validateExtraPropsFunctionality(
  instance: Instance,
  partialProps: Partial<Props> = {},
): void {
  const extraProps = ['followCursor', 'inlinePositioning']

  extraProps.forEach(prop => {
    if (hasOwnProperty(partialProps, prop) && !instance.__dev__[prop]) {
      const didPassFollowCursor = prop === 'followCursor'
      const didPassOtherExtraProp = !didPassFollowCursor

      warnWhen(
        didPassFollowCursor,
        'The `followCursor` prop was specified, but the instance has not ' +
          'been configured with followCursor functionality. In v5, ' +
          '`followCursor` was moved to `extra-props`. View details: ' +
          'https://atomiks.github.io/tippyjs/extra-props/',
      )

      warnWhen(
        didPassOtherExtraProp,
        'The `' +
          prop +
          '` prop was specified, but the instance has not been configured ' +
          'with inlinePositioning functionality. View details: ' +
          'https://atomiks.github.io/tippyjs/extra-props/',
      )
    }
  })
}
