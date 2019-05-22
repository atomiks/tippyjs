import { Options, Targets } from './types'
import { hasOwnProperty, includes, warnWhen } from './utils'
import { defaultProps } from './props'

/**
 * Validates options with the valid `defaultProps` object
 */
export function validateOptions(options: Options = {}): void {
  Object.keys(options).forEach(
    (option): void => {
      const value = (options as any)[option]
      const didPassTargetOption = option === 'target'
      const didPassA11yOption = option === 'a11y'
      const didPassOtherUnknownOption =
        !hasOwnProperty(defaultProps, option) &&
        option !== 'target' &&
        option !== 'a11y'
      const didPassOldThemeName =
        option === 'theme' &&
        includes(['dark', 'light', 'light-border', 'translucent'], value)
      const didPassGoogleTheme = option === 'theme' && value === 'google'

      warnWhen(
        didPassTargetOption,
        'The `target` option was removed in v5 and ' +
          'replaced with the `delegate()` method. Read more here: ' +
          'https//atomiks.github.io/tippyjs/event-delegation/',
      )

      warnWhen(
        didPassA11yOption,
        'The `a11y` option was removed in v5. Make ' +
          'sure the element you are giving a tippy to is natively ' +
          'focusable, such as <button> or <input>, not <div> or <span>.',
      )

      warnWhen(
        didPassOtherUnknownOption,
        '`' +
          option +
          '` is not a valid option. You ' +
          'may have spelled it incorrectly. View all of the valid options ' +
          'here: https://atomiks.github.io/tippyjs/all-options/',
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

  warnWhen(
    didPassFalsyValue,
    '`tippy()` was passed `' +
      targets +
      '` (an invalid falsy value) as its targets argument. Valid types are: ' +
      'String (CSS selector), Element, Element[], or NodeList.',
  )

  warnWhen(
    didPassPlainObject,
    '`tippy()` was passed a plain object (virtual ' +
      'reference element) which is no longer supported in v5. Instead, pass ' +
      'a placeholder element like `document.createElement("div")`',
  )
}
