import {
  clean,
  validateProps,
  validateTargets,
  getFormattedMessage,
} from '../../src/validation';

let spy;

beforeEach(() => {
  spy = jest.spyOn(console, 'warn');
});

afterEach(() => {
  spy.mockRestore();
});

describe('validateProps', () => {
  it('recognizes an unknown prop', () => {
    const prop = '__x';
    validateProps({[prop]: true});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `\`${prop}\` is not a valid prop. You may have spelled it incorrectly,
        or if it's a plugin, forgot to pass it in an array as props.plugins.

        In v5, the following props were turned into plugins:

        * animateFill
        * followCursor
        * sticky

        All props: https://atomiks.github.io/tippyjs/all-props/
        Plugins: https://atomiks.github.io/tippyjs/plugins/`,
      ),
    );
  });

  it('recognizes the old `target` prop', () => {
    validateProps({target: 'button'});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The \`target\` prop was removed in v5 and replaced with the delegate()
        addon in order to conserve bundle size.
        
        See: https://atomiks.github.io/tippyjs/addons/#event-delegation`,
      ),
    );
  });

  it('recognizes the old `a11y` prop', () => {
    validateProps({a11y: true});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The \`a11y\` prop was removed in v5. Make sure the element you are giving
        a tippy to is natively focusable, such as <button> or <input>, not <div>
        or <span>.`,
      ),
    );
  });

  it('recognizes the old `showOnInit` prop', () => {
    validateProps({showOnInit: true});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The \`showOnInit\` prop was renamed to \`showOnCreate\` in v5.`,
      ),
    );
  });

  it('recognizes the old `arrowType` prop', () => {
    validateProps({arrowType: 'round'});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The \`arrowType\` prop was removed in v5 in favor of overloading the
        \`arrow\` prop.

        "round" string was replaced with importing the string from the package.

        * import {roundArrow} from 'tippy.js'; (ESM version)
        * const {roundArrow} = tippy; (IIFE CDN version)

        Before: {arrow: true, arrowType: "round"}
        After: {arrow: roundArrow}`,
      ),
    );
  });

  it('recognizes the old `touchHold` prop', () => {
    validateProps({touchHold: true});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The \`touchHold\` prop was removed in v5 in favor of overloading the
      \`touch\` prop.
      
      Before: {touchHold: true}
      After: {touch: "hold"}`,
      ),
    );
  });

  it('recognizes the old `size` prop', () => {
    validateProps({size: 'small'});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The \`size\` prop was removed in v5. Instead, use a theme that specifies
      CSS padding and font-size properties.`,
      ),
    );
  });

  it('recognizes the old `google` theme', () => {
    validateProps({theme: 'google'});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The included theme "google" was renamed to "material" in v5.`,
      ),
    );
  });

  it('recognizes specifying `placement` in `popperOptions`', () => {
    validateProps({popperOptions: {placement: 'auto'}});
    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `Specifying placement in \`popperOptions\` is not supported. Use the
      base-level \`placement\` prop instead.
      
      Before: {popperOptions: {placement: "bottom"}}
      After: {placement: "bottom"}`,
      ),
    );
  });
});

describe('validateTargets', () => {
  it('recognizes a falsy target', () => {
    const falsy = [null, undefined, false, NaN, 0, ''];
    falsy.forEach(falsy => {
      expect(() => {
        validateTargets(falsy);
      }).toThrow(
        clean(
          `tippy() was passed \`${falsy}\` as its targets (first) argument.

          Valid types are: String, Element, Element[], or NodeList.`,
        ),
      );
    });
  });

  it('recognizes a plain object', () => {
    expect(() => {
      validateTargets({});
    }).toThrow(
      clean(
        `tippy() was passed a plain object which is no longer supported as an
        argument.
        
        See https://atomiks.github.io/tippyjs/misc/#custom-position`,
      ),
    );
  });
});
