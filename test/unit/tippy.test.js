import {h} from '../utils';

import {defaultProps, extraProps} from '../../src/props';
import {POPPER_SELECTOR} from '../../src/constants';
import tippy, {hideAll} from '../../src';
import {getFormattedMessage} from '../../src/validation';

describe('tippy', () => {
  it('returns the expected object', () => {
    expect(typeof tippy(h())).toBe('object');
    expect(Array.isArray(tippy([h(), h()]))).toBe(true);
  });

  it('merges the default props with the supplied props', () => {
    expect(tippy(h(), {placement: 'bottom-end'}).props).toMatchSnapshot();
  });

  it('warns if invalid props(s) are supplied', () => {
    tippy(h(), {placement: 'top', _someInvalidProp: true});

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('handles falsy reference in an array', () => {
    tippy([null, false, 0, undefined]);
  });

  it('errors if passed falsy Target type', () => {
    tippy(null);

    expect(console.error).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          'tippy() was passed',
          '`' + String(null) + '`',
          'as its targets (first) argument. Valid types are: String, Element, Element[],',
          'or NodeList.',
        ].join(' ')
      )
    );
  });

  it('warns if passed a single content element for many different references', () => {
    const targets = [h(), h()];

    tippy(targets, {content: document.createElement('div')});

    expect(console.warn).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          'tippy() was passed an Element as the `content` prop, but more than',
          'one tippy instance was created by this invocation. This means the',
          'content element will only be appended to the last tippy instance.',
          '\n\n',
          'Instead, pass the .innerHTML of the element, or use a function that',
          'returns a cloned version of the element instead.',
          '\n\n',
          '1) content: element.innerHTML\n',
          '2) content: () => element.cloneNode(true)',
        ].join(' ')
      )
    );
  });
});

describe('tippy.setDefaultProps()', () => {
  it('changes the default props applied to instances', () => {
    const newPlacement = 'bottom-end';

    tippy.setDefaultProps({placement: newPlacement});

    expect(defaultProps.placement).toBe(newPlacement);
  });
});

describe('hideAll()', () => {
  it('hides all tippys on the document, ignoring `hideOnClick`', () => {
    const props = {showOnCreate: true, hideOnClick: false};
    const instances = [...Array(3)].map(() => tippy(h(), props));

    jest.runAllTimers();
    hideAll();

    instances.forEach((instance) => {
      expect(instance.state.isVisible).toBe(false);
    });
  });

  it('respects `duration` option', () => {
    const props = {showOnCreate: true, duration: 100};
    const instances = [...Array(3)].map(() => tippy(h(), props));

    jest.runAllTimers();
    hideAll({duration: 0});

    instances.forEach((instance) => {
      expect(instance.state.isMounted).toBe(false);
    });
  });

  it('respects `exclude` option', () => {
    const props = {showOnCreate: true};
    const instances = [...Array(3)].map(() => tippy(h(), props));

    jest.runAllTimers();
    hideAll({exclude: instances[0]});

    instances.forEach((instance) => {
      expect(instance.state.isVisible).toBe(
        instance === instances[0] ? true : false
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
      (popper) => popper._tippy
    );

    instances.forEach((instance) => {
      expect(instance.state.isVisible).toBe(true);
    });
  });
});
