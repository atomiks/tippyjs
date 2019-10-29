import {clean, validateTargets} from '../../src/validation';

let spy;

beforeEach(() => {
  spy = jest.spyOn(console, 'warn');
});

afterEach(() => {
  spy.mockRestore();
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
