import {h, cleanDocumentBody} from '../utils';

import {
  getDataAttributeProps,
  evaluateProps,
  validateProps,
} from '../../src/props';
import {getFormattedMessage} from '../../src/validation';

afterEach(cleanDocumentBody);

describe('getDataAttributeProps', () => {
  it('uses data-tippy-content', () => {
    const ref = h();
    ref.setAttribute('data-tippy-content', 'test');

    expect(getDataAttributeProps(ref).content).toBe('test');
  });

  it('does not parse data-tippy-content', () => {
    const ref = h();

    ref.setAttribute('data-tippy-content', '[Hello');
    expect(getDataAttributeProps(ref).content).toBe('[Hello');

    ref.setAttribute('data-tippy-content', '3333333333333333333333333');
    expect(getDataAttributeProps(ref).content).toBe(
      '3333333333333333333333333',
    );
  });

  it('returns the attribute props', () => {
    const ref = h();

    ref.setAttribute('data-tippy-arrow', 'round');

    expect(getDataAttributeProps(ref)).toEqual({arrow: 'round'});
  });

  it('correctly parses true & false strings', () => {
    const ref = h();

    ref.setAttribute('data-tippy-interactive', 'true');
    ref.setAttribute('data-tippy-arrow', 'false');

    expect(getDataAttributeProps(ref)).toEqual({
      interactive: true,
      arrow: false,
    });
  });

  it('correctly parses number strings', () => {
    const ref = h();

    ref.setAttribute('data-tippy-delay', '129');
    ref.setAttribute('data-tippy-duration', '111');

    expect(getDataAttributeProps(ref)).toEqual({delay: 129, duration: 111});
  });

  it('correctly parses JSON-serializable props', () => {
    const ref = h();

    ref.setAttribute('data-tippy-delay', '[100, 255]');
    ref.setAttribute('data-tippy-duration', '[0, 999]');
    ref.setAttribute('data-tippy-popperOptions', '{ "placement": "right" }');

    expect(getDataAttributeProps(ref)).toEqual({
      delay: [100, 255],
      duration: [0, 999],
      popperOptions: {placement: 'right'},
    });
  });

  it('does not break if content begins with [ or {', () => {
    const ref = h();

    ref.setAttribute('data-tippy-content', '[');
    expect(() => getDataAttributeProps(ref)).not.toThrow();

    ref.setAttribute('data-tippy-content', '{');
    expect(() => getDataAttributeProps(ref)).not.toThrow();
  });
});

describe('evaluateProps', () => {
  it('ignores attributes if `ignoreAttributes: true`', () => {
    const props = {animation: 'scale', ignoreAttributes: true};
    const reference = h();

    reference.setAttribute('data-tippy-animation', 'fade');

    expect(evaluateProps(reference, props)).toEqual({
      animation: 'scale',
      ignoreAttributes: true,
    });
  });

  it('does not ignore attributes if `ignoreAttributes: false`', () => {
    const props = {animation: 'scale', ignoreAttributes: false};
    const reference = h();

    reference.setAttribute('data-tippy-animation', 'fade');

    expect(evaluateProps(reference, props)).toEqual({
      animation: 'fade',
      ignoreAttributes: false,
    });
  });

  it('considers plugin props', () => {
    const plugins = [{name: 'plugin', fn: () => ({})}];
    const props = {plugin: 'x', plugins};
    const reference = h();

    reference.setAttribute('data-tippy-plugin', 'y');

    expect(evaluateProps(reference, props)).toEqual({
      plugin: 'y',
      plugins,
    });
  });
});

describe('validateProps', () => {
  let spy;

  beforeEach(() => {
    spy = jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    spy.mockRestore();
  });

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

  it('handles included plugin props', () => {
    const prop = 'followCursor';
    const plugins = [{name: prop, fn: () => ({})}];

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

    spy.mockClear();

    validateProps({[prop]: true}, plugins);
    expect(spy).not.toHaveBeenCalled();
  });

  it('handles custom plugin props', () => {
    const prop = '__custom';
    const plugins = [{name: prop, fn: () => ({})}];

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

    spy.mockClear();

    validateProps({[prop]: true}, plugins);
    expect(spy).not.toHaveBeenCalled();
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
