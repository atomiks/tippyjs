import { Props, Targets } from './types'
import { hasOwnProperty, includes, warnWhen, throwErrorWhen } from './utils'
import { defaultProps } from './props'

/**
 * Validates props with the valid `defaultProps` object
 */
export function validateProps(partialProps: Partial<Props> = {}): void {
  Object.keys(partialProps).forEach(
    (prop): void => {
      const value = (partialProps as any)[prop]
      const didPassTargetprop = prop === 'target'
      const didPassA11yprop = prop === 'a11y'
      const didPassOtherUnknownprop =
        !hasOwnProperty(defaultProps, prop) &&
        prop !== 'target' &&
        prop !== 'a11y'
      const didPassOldThemeName =
        prop === 'theme' &&
        includes(['dark', 'light', 'light-border', 'translucent'], value)
      const didPassGoogleTheme = prop === 'theme' && value === 'google'

      warnWhen(
        didPassTargetprop,
        'The `target` prop was removed in v5 and ' +
          'replaced with the `delegate()` method. Read more here: ' +
          'https//atomiks.github.io/tippyjs/addons#event-delegation',
      )

      warnWhen(
        didPassA11yprop,
        'The `a11y` prop was removed in v5. Make ' +
          'sure the element you are giving a tippy to is natively ' +
          'focusable, such as <button> or <input>, not <div> or <span>.',
      )

      warnWhen(
        didPassOtherUnknownprop,
        '`' +
          prop +
          '` is not a valid prop. You ' +
          'may have spelled it incorrectly. View all of the valid props ' +
          'here: https://atomiks.github.io/tippyjs/all-props/',
      )

      warnWhen(
        didPassOldThemeName,
        'The default theme `' +
          value +
          '` in v5 must include the prefix `__NAMESPACE_PREFIX__`, i.e. ' +
          '"__NAMESPACE_PREFIX__-' +
          value +
          '" instead of "' +
          value +
          '".',
      )

      warnWhen(
        didPassGoogleTheme,
        'The default theme `google` was renamed to ' +
          '`__NAMESPACE_PREFIX__-material` in v5.',
      )
    },
  )
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
