import { validateProps, validateTargets } from '../../src/validation'

let spy

beforeEach(() => {
  spy = jest.spyOn(console, 'warn')
})

afterEach(() => {
  spy.mockRestore()
})

describe('validateProps', () => {
  it('recognizes an unknown prop', () => {
    validateProps({ __unknown: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] `' +
        '__unknown' +
        '` is not a valid prop. You ' +
        'may have spelled it incorrectly. View all of the valid props ' +
        'here: https://atomiks.github.io/tippyjs/all-props/',
    )
  })

  it('recognizes the old `target` prop', () => {
    validateProps({ target: 'button' })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `target` prop was removed in v5 and ' +
        'replaced with the `delegate()` method. Read more here: ' +
        'https//atomiks.github.io/tippyjs/addons#event-delegation',
    )
  })

  it('recognizes the old `a11y` prop', () => {
    validateProps({ a11y: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `a11y` prop was removed in v5. Make ' +
        'sure the element you are giving a tippy to is natively ' +
        'focusable, such as <button> or <input>, not <div> or <span>.',
    )
  })

  it('recognizes the old `showOnInit` prop', () => {
    validateProps({ showOnInit: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] ' +
        'The `showOnInit` prop was renamed to `showOnCreate` in v5.',
    )
  })

  it('recognizes the old `arrowType` prop', () => {
    validateProps({ arrowType: 'round' })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `arrowType` prop was removed in v5 ' +
        'in favor of overloading the `arrow` prop. Specify ' +
        '`arrowType: "' +
        'round' +
        '"` instead.',
    )
  })

  it('recognizes the old `touchHold` prop', () => {
    validateProps({ touchHold: true })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `touchHold` prop was removed in v5 in favor of ' +
        'overloading the `touch` prop. Specify `touch: "hold"` instead.',
    )
  })

  it('recognizes the old `size` prop', () => {
    validateProps({ size: 'small' })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The `size` prop was removed in v5. Instead, use a ' +
        'theme that that specifies `font-size` and `padding` CSS properties.',
    )
  })

  it('recognizes the old `google` theme', () => {
    validateProps({ theme: 'google' })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] The included theme `google` was renamed to ' +
        '`material` in v5.',
    )
  })

  it('recognizes specifying `placement` in `popperOptions`', () => {
    validateProps({ popperOptions: { placement: 'auto' } })
    expect(spy).toHaveBeenCalledWith(
      '[tippy.js WARNING] Specifying `placement` in `popperOptions` is not ' +
        'supported. Use the base-level `placement` prop instead.',
    )
  })
})

describe('validateTargets', () => {
  it('recognizes a falsy target', () => {
    expect(() => {
      validateTargets(null)
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed `' +
        null +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    expect(() => {
      validateTargets(false)
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed `' +
        false +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    expect(() => {
      validateTargets(undefined)
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed `' +
        undefined +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    expect(() => {
      validateTargets(0)
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed `' +
        0 +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    expect(() => {
      validateTargets('')
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed `' +
        '' +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )

    expect(() => {
      validateTargets(NaN)
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed `' +
        NaN +
        '` (an invalid falsy value) as its targets argument. Valid types ' +
        'are: String (CSS selector), Element, Element[], or NodeList.',
    )
  })

  it('recognizes a plain object', () => {
    expect(() => {
      validateTargets({})
    }).toThrow(
      '[tippy.js ERROR] `tippy()` was passed a plain object (virtual ' +
        'reference element) which is no longer supported in v5. Instead, ' +
        'pass a placeholder element like `document.createElement("div")`',
    )
  })
})
