import * as Utils from '../../src/utils';

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

describe('removeProperties', () => {
  it('deletes unwanted properties', () => {
    expect(Utils.removeProperties({a: 1, b: 2}, ['b'])).toEqual({a: 1});
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
        'Element'
      )
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

describe('pushIfUnique', () => {
  it('adds item only if unique', () => {
    const item = {};
    const arr = [];

    Utils.pushIfUnique(arr, item);
    Utils.pushIfUnique(arr, item);
    Utils.pushIfUnique(arr, 2);

    expect(arr).toEqual([item, 2]);
  });
});

describe('appendPxIfNumber', () => {
  it('should append `px` if number', () => {
    expect(Utils.appendPxIfNumber(200)).toBe('200px');
    expect(Utils.appendPxIfNumber(0)).toBe('0px');
  });

  it('should not append `px` if string', () => {
    expect(Utils.appendPxIfNumber('200rem')).toBe('200rem');
    expect(Utils.appendPxIfNumber('10px')).toBe('10px');
  });
});

describe('unique', () => {
  it('filters out duplicate elements', () => {
    const ref1 = {};
    const ref2 = {};
    expect(Utils.unique([0, 1, 0, 2, 3, 2, 3, 3, 4])).toEqual([0, 1, 2, 3, 4]);
    expect(Utils.unique([ref1, ref1, ref2])).toEqual([ref1, ref2]);
  });
});

describe('getNumber', () => {
  it('number: returns number', () => {
    expect(Utils.getNumber(0)).toBe(0);
    expect(Utils.getNumber(100)).toBe(100);
    expect(Utils.getNumber(-1.13812)).toBe(-1.13812);
  });

  it('string: returns number from CSS string', () => {
    expect(Utils.getNumber('0px')).toBe(0);
    expect(Utils.getNumber('100rem')).toBe(100);
    expect(Utils.getNumber('-21.35em')).toBe(-21.35);
  });
});

describe('removeUndefinedProps', () => {
  it('removes properties that are set to `undefined`', () => {
    expect(
      Utils.removeUndefinedProps({
        a: undefined,
        b: null,
        c: 0,
        d: true,
        e: undefined,
      })
    ).toEqual({
      b: null,
      c: 0,
      d: true,
    });
  });
});
