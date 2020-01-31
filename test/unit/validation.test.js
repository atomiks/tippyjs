import {
  clean,
  validateTargets,
  getFormattedMessage,
} from '../../src/validation';

describe('validateTargets', () => {
  it('recognizes a falsy target', () => {
    const falsys = [null, undefined, false, NaN, 0, ''];
    falsys.forEach(falsy => {
      validateTargets(falsy);

      expect(console.error).toHaveBeenCalledWith(
        ...getFormattedMessage(
          [
            'tippy() was passed',
            '`' + String(falsy) + '`',
            'as its targets (first) argument. Valid types are: String, Element, Element[],',
            'or NodeList.',
          ].join(' '),
        ),
      );
    });
  });
});
