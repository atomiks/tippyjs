import {h, cleanDocumentBody, IDENTIFIER} from '../utils';

import * as Utils from '../../src/utils';
import tippy from '../../src';

jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('getArrayOfElements', () => {
  it('returns an empty array with no arguments', () => {
    expect(Array.isArray(Utils.getArrayOfElements())).toBe(true);
  });

  it('returns the same array if given an array', () => {
    const arr = [];
    expect(Utils.getArrayOfElements(arr)).toBe(arr);
  });

  it('returns an array of elements when given a valid selector string', () => {
    [...Array(10)].map(() => h());
    const allAreElements = Utils.getArrayOfElements(IDENTIFIER).every(
      value => value instanceof Element,
    );
    expect(allAreElements).toBe(true);
  });

  it('returns an empty array when given an invalid selector string', () => {
    const arr = Utils.getArrayOfElements('😎');

    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(0);
  });

  it('returns an array of length 1 if the value is a DOM element', () => {
    const ref = h();
    const arr = Utils.getArrayOfElements(ref);

    expect(arr[0]).toBe(ref);
    expect(arr.length).toBe(1);
  });

  it('returns an array if given a NodeList', () => {
    const ref = h();
    const arr = Utils.getArrayOfElements(
      document.querySelectorAll(`.${IDENTIFIER}`),
    );

    expect(arr[0]).toBe(ref);
    expect(Array.isArray(arr)).toBe(true);
  });
});

describe('hasOwnProperty', () => {
  it('works for plain objects', () => {
    expect(Utils.hasOwnProperty({prop: true}, 'prop')).toBe(true);
    expect(Utils.hasOwnProperty({}, 'toString')).toBe(false);
  });

  it('works for prototypeless objects', () => {
    const o = Object.create(null);
    o.prop = true;
    expect(Utils.hasOwnProperty(o, 'prop')).toBe(true);
  });
});

describe('getValueAtIndexOrReturn', () => {
  it('returns the value if not an array', () => {
    expect(Utils.getValueAtIndexOrReturn('unique', 0)).toBe('unique');
    expect(Utils.getValueAtIndexOrReturn('unique', 1)).toBe('unique');
    expect(Utils.getValueAtIndexOrReturn(true, 1)).toBe(true);
  });

  it('returns the value at the specified index if an array', () => {
    expect(Utils.getValueAtIndexOrReturn([-100, -200], 0)).toBe(-100);
    expect(Utils.getValueAtIndexOrReturn([-100, -200], 1)).toBe(-200);
    expect(Utils.getValueAtIndexOrReturn(['x', 'y'], 0)).toBe('x');
    expect(Utils.getValueAtIndexOrReturn(['x', 'y'], 1)).toBe('y');
  });

  it('uses the default duration if the value is null', () => {
    expect(Utils.getValueAtIndexOrReturn([null, 5], 0, -1)).toBe(-1);
    expect(Utils.getValueAtIndexOrReturn([5, null], 1, 1000)).toBe(1000);
    expect(Utils.getValueAtIndexOrReturn([null, 5], 0, [8, 9])).toBe(8);
    expect(Utils.getValueAtIndexOrReturn([5, null], 1, [1, 2])).toBe(2);
  });

  it('uses the default duration if the value is undefined', () => {
    expect(Utils.getValueAtIndexOrReturn([undefined, 5], 0, -1)).toBe(-1);
    expect(Utils.getValueAtIndexOrReturn([5, undefined], 1, 1000)).toBe(1000);
    expect(Utils.getValueAtIndexOrReturn([undefined, 5], 0, [8, 9])).toBe(8);
    expect(Utils.getValueAtIndexOrReturn([5, undefined], 1, [1, 2])).toBe(2);
  });
});

describe('getModifier', () => {
  it('returns an object nested in `modifiers` object without errors', () => {
    expect(Utils.getModifier({}, 'flip')).toBe(undefined);
    expect(Utils.getModifier({modifiers: {}}, 'flip')).toBe(undefined);
    expect(
      Utils.getModifier(
        {
          modifiers: {
            flip: {
              enabled: true,
            },
          },
        },
        'flip',
      ),
    ).toEqual({enabled: true});
  });
});

describe('debounce', () => {
  it('works as expected', () => {
    const fn = jest.fn();
    const debouncedFn = Utils.debounce(fn, 50);
    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(40);
    expect(fn).toHaveBeenCalledTimes(0);
    debouncedFn();
    jest.advanceTimersByTime(40);
    expect(fn).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('is called with arguments', () => {
    const fn = jest.fn();
    const ms = 50;
    const debouncedFn = Utils.debounce(fn, ms);
    debouncedFn('string');
    jest.advanceTimersByTime(ms);
    expect(fn).toHaveBeenCalledWith('string');
  });

  it('does not wrap with new function if ms = 0', () => {
    const fn = jest.fn();
    const debouncedFn = Utils.debounce(fn, 0);
    expect(debouncedFn).toBe(fn);
  });
});

describe('includes', () => {
  it('includes(string, string)', () => {
    expect(Utils.includes('test', 'es')).toBe(true);
    expect(Utils.includes('$128', '$12')).toBe(true);
    expect(Utils.includes('test', 'tesst')).toBe(false);
    expect(Utils.includes('$128', '$$')).toBe(false);
  });

  it('includes(Array, string)', () => {
    expect(Utils.includes(['test', 'other'], 'other')).toBe(true);
    expect(Utils.includes(['test', 'other'], 'test')).toBe(true);
    expect(Utils.includes(['test', 'other'], 'othr')).toBe(false);
    expect(Utils.includes(['test', 'other'], 'tst')).toBe(false);
  });
});

describe('setFlipModifierEnabled', () => {
  it('sets it correctly', () => {
    const modifiers = [{name: 'x'}, {name: 'flip', enabled: true}];
    Utils.setFlipModifierEnabled(modifiers, false);
    expect(modifiers[1].enabled).toBe(false);
    Utils.setFlipModifierEnabled(modifiers, true);
    expect(modifiers[1].enabled).toBe(true);
  });
});

describe('div', () => {
  it('creates and returns a div element', () => {
    const d = Utils.div();
    expect(d.nodeName).toBe('DIV');
  });
});

describe('evaluateProps', () => {
  it('ignores attributes if `ignoreAttributes: true`', () => {
    const props = {animation: 'scale', ignoreAttributes: true};
    const reference = h();

    reference.setAttribute('data-tippy-animation', 'fade');

    expect(Utils.evaluateProps(reference, props, [])).toEqual({
      animation: 'scale',
      ignoreAttributes: true,
    });
  });

  it('does not ignore attributes if `ignoreAttributes: false`', () => {
    const props = {animation: 'scale', ignoreAttributes: false};
    const reference = h();

    reference.setAttribute('data-tippy-animation', 'fade');

    expect(Utils.evaluateProps(reference, props, [])).toEqual({
      animation: 'fade',
      ignoreAttributes: false,
    });
  });

  it('considers plugin props', () => {
    const props = {plugin: 'x'};
    const plugins = [{name: 'plugin', fn: () => ({})}];
    const reference = h();

    reference.setAttribute('data-tippy-plugin', 'y');

    expect(Utils.evaluateProps(reference, props, plugins)).toEqual({
      plugin: 'y',
    });
  });
});

describe('setTransitionDuration', () => {
  it('sets the `transition-duration` property on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()];
    Utils.setTransitionDuration(els, 1298);

    expect(els[0].style.transitionDuration).toBe('1298ms');
    expect(els[1].style.transitionDuration).toBe('1298ms');
    expect(els[3].style.transitionDuration).toBe('1298ms');
  });
});

describe('setVisibilityState', () => {
  it('sets the `data-state` attribute on a list of elements with the value specified', () => {
    const els = [h(), h(), null, h()];

    Utils.setVisibilityState(els, 'visible');

    expect(els[0].getAttribute('data-state')).toBe('visible');
    expect(els[1].getAttribute('data-state')).toBe('visible');
    expect(els[3].getAttribute('data-state')).toBe('visible');

    Utils.setVisibilityState(els, 'hidden');

    expect(els[0].getAttribute('data-state')).toBe('hidden');
    expect(els[1].getAttribute('data-state')).toBe('hidden');
    expect(els[3].getAttribute('data-state')).toBe('hidden');
  });
});

describe('isReferenceElement', () => {
  it('correctly determines if a value is a reference element', () => {
    const instance = tippy(h());

    expect(Utils.isReferenceElement(document.createElement('div'))).toBe(false);
    expect(Utils.isReferenceElement(instance.reference)).toBe(true);
    expect(Utils.isReferenceElement(instance.popper)).toBe(false);

    instance.popper.classList.add('other');

    expect(Utils.isReferenceElement(instance.popper)).toBe(false);
  });
});

describe('preserveInvocation', () => {
  it('should invoke the first function if not the same as second', () => {
    const spy = jest.fn();

    Utils.preserveInvocation(spy, () => {}, ['test']);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should not invoke the first function is the same as second', () => {
    const spy = jest.fn();

    Utils.preserveInvocation(spy, spy, ['test']);

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('removeProperties', () => {
  it('deletes unwanted properties', () => {
    expect(Utils.removeProperties({a: 1, b: 2}, ['b'])).toEqual({a: 1});
  });
});

describe('arrayFrom', () => {
  it('converts a NodeList to an array', () => {
    [...Array(10)].map(() => h());
    const arr = Utils.arrayFrom(document.querySelectorAll(IDENTIFIER));

    expect(Array.isArray(arr)).toBe(true);
  });
});

describe('closestCallback', () => {
  it('works like Element.prototype.closest but uses a callback instead', () => {
    const ref = h('div', {class: 'parent'});
    const child = h('div', {class: 'child'});

    ref.append(child);

    expect(
      Utils.closestCallback(ref, node => node.className === 'parent'),
    ).toBe(ref);
    expect(
      Utils.closestCallback(child, node => node.className === 'parent'),
    ).toBe(ref);
  });
});

describe('splitBySpaces', () => {
  it('returns an array parsed from the specified string', () => {
    expect(Utils.splitBySpaces('')).toMatchObject([]);
    expect(Utils.splitBySpaces('one')).toMatchObject(['one']);
    expect(Utils.splitBySpaces('one two')).toMatchObject(['one', 'two']);
    expect(Utils.splitBySpaces('one  two    three')).toMatchObject([
      'one',
      'two',
      'three',
    ]);
  });

  it('ignores surrounding whitespace', () => {
    expect(Utils.splitBySpaces('  one  ')).toMatchObject(['one']);
    expect(Utils.splitBySpaces(' one  two ')).toMatchObject(['one', 'two']);
  });
});

describe('isType', () => {
  it('correctly determines types of Elements', () => {
    expect(Utils.isType(document.createElement('div'), 'Element')).toBe(true);
    expect(
      Utils.isType(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        'Element',
      ),
    ).toBe(true);
    expect(Utils.isType({}, 'Element')).toBe(false);
    expect(Utils.isType('button', 'Element')).toBe(false);
    expect(Utils.isType(document.querySelectorAll('a'), 'Element')).toBe(false);
  });

  it('correctly determines type of MouseEvents', () => {
    expect(Utils.isType(new MouseEvent('mouseenter'), 'MouseEvent')).toBe(true);
    expect(Utils.isType(new FocusEvent('focus'), 'MouseEvent')).toBe(false);
  });

  it('correctly determines type of NodeLists', () => {
    expect(Utils.isType(document.querySelectorAll('a'), 'NodeList')).toBe(true);
    expect(Utils.isType(document.createElement('div'), 'NodeList')).toBe(false);
    expect(Utils.isType({}, 'NodeList')).toBe(false);
  });
});
