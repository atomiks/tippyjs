import {
  validateTargets,
  getFormattedMessage,
  warnWhen,
  errorWhen,
} from '../../src/validation';

describe('validateTargets', () => {
  it('recognizes a falsy target', () => {
    const falsys = [null, undefined, false, NaN, 0, ''];
    falsys.forEach((falsy) => {
      validateTargets(falsy);

      expect(console.error).toHaveBeenCalledWith(
        ...getFormattedMessage(
          [
            'tippy() was passed',
            '`' + String(falsy) + '`',
            'as its targets (first) argument. Valid types are: String, Element, Element[],',
            'or NodeList.',
          ].join(' ')
        )
      );
    });
  });
});

describe('warnWhen', () => {
  it('should only ever emit a warning of the same message once', () => {
    warnWhen(true, 'warning');
    warnWhen(true, 'warning');

    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});

describe('errorWhen', () => {
  it('should only ever emit an error of the same message once', () => {
    errorWhen(true, 'error');
    errorWhen(true, 'error');

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
