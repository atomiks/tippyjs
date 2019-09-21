import {
  validateProps,
  validateTargets,
  getFormattedMessage,
  createUnknownPropWarning,
  createInvalidTargetsArgumentError,
  TARGET_WARNING,
  A11Y_WARNING,
  SHOW_ON_INIT_WARNING,
  ARROW_TYPE_WARNING,
  TOUCH_HOLD_WARNING,
  SIZE_WARNING,
  GOOGLE_THEME_WARNING,
  PLACEMENT_WARNING,
  VIRTUAL_REFERENCE_OBJECT_WARNING,
} from '../../src/validation'

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
      ...getFormattedMessage(createUnknownPropWarning('__unknown')),
    )
  })

  it('recognizes the old `target` prop', () => {
    validateProps({ target: 'button' })
    expect(spy).toHaveBeenCalledWith(...getFormattedMessage(TARGET_WARNING))
  })

  it('recognizes the old `a11y` prop', () => {
    validateProps({ a11y: true })
    expect(spy).toHaveBeenCalledWith(...getFormattedMessage(A11Y_WARNING))
  })

  it('recognizes the old `showOnInit` prop', () => {
    validateProps({ showOnInit: true })
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(SHOW_ON_INIT_WARNING),
    )
  })

  it('recognizes the old `arrowType` prop', () => {
    validateProps({ arrowType: 'round' })
    expect(spy).toHaveBeenCalledWith(...getFormattedMessage(ARROW_TYPE_WARNING))
  })

  it('recognizes the old `touchHold` prop', () => {
    validateProps({ touchHold: true })
    expect(spy).toHaveBeenCalledWith(...getFormattedMessage(TOUCH_HOLD_WARNING))
  })

  it('recognizes the old `size` prop', () => {
    validateProps({ size: 'small' })
    expect(spy).toHaveBeenCalledWith(...getFormattedMessage(SIZE_WARNING))
  })

  it('recognizes the old `google` theme', () => {
    validateProps({ theme: 'google' })
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(GOOGLE_THEME_WARNING),
    )
  })

  it('recognizes specifying `placement` in `popperOptions`', () => {
    validateProps({ popperOptions: { placement: 'auto' } })
    expect(spy).toHaveBeenCalledWith(...getFormattedMessage(PLACEMENT_WARNING))
  })
})

describe('validateTargets', () => {
  it('recognizes a falsy target', () => {
    expect(() => {
      validateTargets(null)
    }).toThrow(createInvalidTargetsArgumentError(null))

    expect(() => {
      validateTargets(false)
    }).toThrow(createInvalidTargetsArgumentError(false))

    expect(() => {
      validateTargets(undefined)
    }).toThrow(createInvalidTargetsArgumentError(undefined))

    expect(() => {
      validateTargets(0)
    }).toThrow(createInvalidTargetsArgumentError(0))

    expect(() => {
      validateTargets('')
    }).toThrow(createInvalidTargetsArgumentError(''))

    expect(() => {
      validateTargets(NaN)
    }).toThrow(createInvalidTargetsArgumentError(NaN))
  })

  it('recognizes a plain object', () => {
    expect(() => {
      validateTargets({})
    }).toThrow(VIRTUAL_REFERENCE_OBJECT_WARNING)
  })
})
