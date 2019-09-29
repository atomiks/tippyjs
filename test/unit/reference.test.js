import {h, cleanDocumentBody} from '../utils';

import {getDataAttributeProps} from '../../src/reference';

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
