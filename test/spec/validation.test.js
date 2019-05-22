import { validateOptions, validateTargets } from '../../src/validation'

let spy

beforeEach(() => {
  spy = jest.spyOn(console, 'warn')
})

afterEach(() => {
  spy.mockRestore()
})

describe('validateOptions', () => {
  it('recognizes an unknown option', () => {
    validateOptions({ __unknown: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `' +
        '__unknown' +
        '` is not a valid option. You ' +
        'may have spelled it incorrectly. View all of the valid options ' +
        'here: https://atomiks.github.io/tippyjs/all-options/',
    )
  })

  it('recognizes the old `target` option', () => {
    validateOptions({ target: 'button' })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `target` option was removed in v5 and ' +
        'replaced with the `delegate()` method. Read more here: ' +
        'https//atomiks.github.io/tippyjs/event-delegation/',
    )
  })

  it('recognizes the old `a11y` option', () => {
    validateOptions({ a11y: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `a11y` option was removed in v5. Make ' +
        'sure the element you are giving a tippy to is natively ' +
        'focusable, such as <button> or <input>, not <div> or <span>.',
    )
  })

  it('recognizes old `theme` values', () => {
    const themes = ['dark', 'light', 'light-border', 'translucent']
    themes.forEach(theme => {
      validateOptions({ theme })
      expect(spy).toHaveBeenCalledWith(
        '[tippy.js WARNING] The default theme `' +
          theme +
          '` in v5 must include the prefix `__NAMESPACE_PREFIX__`, i.e. ' +
          '"__NAMESPACE_PREFIX__-' +
          theme +
          '" instead of "' +
          theme +
          '".',
      )
    })
  })

  it('recognizes the old `material` theme', () => {
    validateOptions({ theme: 'google' })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The default theme `google` was renamed to ' +
        '`__NAMESPACE_PREFIX__-material` in v5.',
    )
  })
})

describe('validateTargets', () => {
  it('recognizes a falsy target', () => {
    validateTargets(null)
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy()` was passed `' +
        null +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    validateTargets(false)
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy()` was passed `' +
        false +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    validateTargets(undefined)
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy()` was passed `' +
        undefined +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    validateTargets(0)
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy()` was passed `' +
        0 +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    validateTargets('')
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy()` was passed `' +
        '' +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )
  })

  it('recognizes a plain object', () => {
    validateTargets({})
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `tippy()` was passed a plain object (virtual ' +
        'reference element) which is no longer supported in v5. Instead, ' +
        'pass a placeholder element like `document.createElement("div")`',
    )
  })
})
