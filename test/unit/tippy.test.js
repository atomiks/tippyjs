import {h, cleanDocumentBody} from '../utils';

import {defaultProps, extraProps} from '../../src/props';
import {POPPER_SELECTOR} from '../../src/constants';
import tippy, {hideAll, createTippyWithPlugins} from '../../src';
import {getFormattedMessage} from '../../src/validation';

jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('tippy', () => {
  it('returns the expected object', () => {
    expect(typeof tippy(h())).toBe('object');
    expect(Array.isArray(tippy([h(), h()]))).toBe(true);
  });

  it('merges the default props with the supplied props', () => {
    expect(tippy(h(), {placement: 'bottom-end'}).props).toEqual({
      ...defaultProps,
      ...extraProps,
      placement: 'bottom-end',
    });
  });

  it('warns if invalid props(s) are supplied', () => {
    const spy = jest.spyOn(console, 'warn');

    tippy(h(), {placement: 'top', _someInvalidProp: true});

    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it('handles falsy reference in an array', () => {
    tippy([null, false, 0, undefined]);
  });

  it('throws if passed falsy Target type', () => {
    expect(() => tippy(null)).toThrow();
    expect(() => tippy(undefined)).toThrow();
    expect(() => tippy(false)).toThrow();
    expect(() => tippy(0)).toThrow();
    expect(() => tippy(NaN)).toThrow();
    expect(() => tippy('')).toThrow();
  });

  it('warns if passed a single content element for many different references', () => {
    const spy = jest.spyOn(console, 'warn');
    const targets = [h(), h()];

    tippy(targets, {content: document.createElement('div')});

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `tippy() was passed an Element as the \`content\` prop, but more than one
      tippy instance was created by this invocation. This means the content
      element will only be appended to the last tippy instance.
      
      Instead, pass the .innerHTML of the element, or use a function that
      returns a cloned version of the element instead.
      
      1) content: () => element.cloneNode(true)
      2) content: element.innerHTML`,
      ),
    );

    spy.mockRestore();
  });
});

describe('tippy.setDefaultProps()', () => {
  it('changes the default props applied to instances', () => {
    const newPlacement = 'bottom-end';

    tippy.setDefaultProps({placement: newPlacement});

    expect(defaultProps.placement).toBe(newPlacement);
  });

  it('is validated', () => {
    const spy = jest.spyOn(console, 'warn');

    tippy.setDefaultProps({theme: 'google'});

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `The included theme "google" was renamed to "material" in v5.`,
      ),
    );

    spy.mockRestore();
  });
});

describe('hideAll()', () => {
  it('hides all tippys on the document, ignoring `hideOnClick`', () => {
    const props = {showOnCreate: true, hideOnClick: false};
    const instances = [...Array(3)].map(() => tippy(h(), props));

    jest.runAllTimers();
    hideAll();

    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(false);
    });
  });

  it('respects `duration` option', () => {
    const props = {showOnCreate: true, duration: 100};
    const instances = [...Array(3)].map(() => tippy(h(), props));

    jest.runAllTimers();
    hideAll({duration: 0});

    instances.forEach(instance => {
      expect(instance.state.isMounted).toBe(false);
    });
  });

  it('respects `exclude` option', () => {
    const props = {showOnCreate: true};
    const instances = [...Array(3)].map(() => tippy(h(), props));

    jest.runAllTimers();
    hideAll({exclude: instances[0]});

    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(
        instance === instances[0] ? true : false,
      );
    });
  });

  it('respects `exclude` option as type ReferenceElement for multiple tippys', () => {
    const props = {showOnCreate: true, multiple: true};
    const ref = h();

    tippy(ref, props);
    tippy(ref, props);
    hideAll({exclude: ref});

    const instances = [...document.querySelectorAll(POPPER_SELECTOR)].map(
      popper => popper._tippy,
    );

    instances.forEach(instance => {
      expect(instance.state.isVisible).toBe(true);
    });
  });
});

describe('createTippyWithPlugins', () => {
  it('returns a higher order tippy function that passes plugins', () => {
    const plugin = {fn: () => ({})};
    const tippy = createTippyWithPlugins([plugin]);
    const instance = tippy(document.createElement('div'));

    expect(instance.plugins).toEqual([plugin]);
  });

  it('preserves statics', () => {
    const plugin = {fn: () => ({})};
    const tippy = createTippyWithPlugins([plugin]);

    expect(tippy.version).toBeDefined();
    expect(tippy.defaultProps).toBeDefined();
    expect(tippy.setDefaultProps).toBeDefined();
    expect(tippy.currentInput).toBeDefined();
  });

  it('warns', () => {
    const spy = jest.spyOn(console, 'warn');

    createTippyWithPlugins([]);

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `createTippyWithPlugins([...]) has been deprecated.

      Use tippy.setDefaultProps({plugins: [...]}) instead.`,
      ),
    );

    spy.mockRestore();
  });
});
