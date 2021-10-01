import {h} from '../utils';

import {
  getDataAttributeProps,
  evaluateProps,
  validateProps,
  setDefaultProps,
} from '../../src/props';
import {getFormattedMessage} from '../../src/validation';
import tippy from '../../src';

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
      '3333333333333333333333333'
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

    expect(evaluateProps(reference, props)).toMatchSnapshot();
  });

  it('does not ignore attributes if `ignoreAttributes: false`', () => {
    const props = {animation: 'scale', ignoreAttributes: false};
    const reference = h();

    reference.setAttribute('data-tippy-animation', 'fade');

    expect(evaluateProps(reference, props)).toMatchSnapshot();
  });

  it('considers plugin props', () => {
    const plugins = [{name: 'plugin', fn: () => ({})}];
    const props = {plugin: 'x', plugins};
    const reference = h();

    reference.setAttribute('data-tippy-plugin', 'y');

    expect(evaluateProps(reference, props)).toMatchSnapshot();
  });
});

describe('validateProps', () => {
  it('recognizes an unknown prop', () => {
    const prop = '__x';
    validateProps({[prop]: true});
    expect(console.warn).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          `\`${prop}\``,
          "is not a valid prop. You may have spelled it incorrectly, or if it's",
          'a plugin, forgot to pass it in an array as props.plugins.',
          '\n\n',
          'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n',
          'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/',
        ].join(' ')
      )
    );
  });

  it('handles included plugin props', () => {
    const prop = 'followCursor';
    const plugins = [{name: prop, fn: () => ({})}];

    validateProps({[prop]: true});
    expect(console.warn).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          `\`${prop}\``,
          "is not a valid prop. You may have spelled it incorrectly, or if it's",
          'a plugin, forgot to pass it in an array as props.plugins.',
          '\n\n',
          'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n',
          'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/',
        ].join(' ')
      )
    );

    console.warn.mockClear();

    validateProps({[prop]: true}, plugins);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('handles custom plugin props', () => {
    const prop = '__custom';
    const plugins = [{name: prop, fn: () => ({})}];

    validateProps({[prop]: true});
    expect(console.warn).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          `\`${prop}\``,
          "is not a valid prop. You may have spelled it incorrectly, or if it's",
          'a plugin, forgot to pass it in an array as props.plugins.',
          '\n\n',
          'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n',
          'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/',
        ].join(' ')
      )
    );

    console.warn.mockClear();

    validateProps({[prop]: true}, plugins);
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('setDefaultProps', () => {
  it('is preferred over .defaultValue on Plugin objects', () => {
    const instance1 = tippy(h());
    expect(instance1.props.followCursor).toBe(false);
    setDefaultProps({followCursor: 'initial'});
    const instance2 = tippy(h());
    expect(instance2.props.followCursor).toBe('initial');
    const instance3 = tippy(h(), {followCursor: true});
    expect(instance3.props.followCursor).toBe(true);
  });

  it('works as expected with non-default plugins', () => {
    const instance1 = tippy(h(), {
      plugins: [{name: 'testPlugin', defaultValue: 'new', fn: () => ({})}],
    });
    expect(instance1.props.testPlugin).toBe('new');
    setDefaultProps({testPlugin: false});
    const instance2 = tippy(h(), {
      plugins: [{name: 'testPlugin', defaultValue: 'new', fn: () => ({})}],
    });
    expect(instance2.props.testPlugin).toBe(false);
  });
});
