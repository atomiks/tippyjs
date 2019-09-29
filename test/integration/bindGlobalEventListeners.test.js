import {cleanDocumentBody, h} from '../utils';

import tippy from '../../src';
import * as Listeners from '../../src/bindGlobalEventListeners';
import {IOS_CLASS} from '../../src/constants';

afterEach(cleanDocumentBody);

describe('onDocumentTouchStart', () => {
  it('sets input.touch to `true` and adds tippy-iOS class to body', () => {
    const bodyClass = document.body.classList;

    expect(bodyClass.contains(IOS_CLASS)).toBe(false);

    Listeners.onDocumentTouchStart();
    Listeners.onDocumentTouchStart();

    expect(Listeners.currentInput.isTouch).toBe(true);
    expect(bodyClass.contains(IOS_CLASS)).toBe(true);
  });

  it('is undone if two consecutive mousemove events are fired', () => {
    // NOTE: this is dependent on the previous test
    Listeners.onDocumentMouseMove();
    Listeners.onDocumentMouseMove();

    expect(Listeners.currentInput.isTouch).toBe(false);
    expect(document.body.classList.contains(IOS_CLASS)).toBe(true);
  });
});

describe('onWindowBlur', () => {
  it('does not blur reference element if the tippy is visible', () => {
    const instance = tippy(h(), {trigger: 'manual'});
    const spy = jest.fn();

    instance.reference.addEventListener('blur', spy);
    instance.reference.focus();
    instance.show();

    Listeners.onWindowBlur();

    expect(spy).not.toHaveBeenCalled();
  });

  it('does blur reference element if the tippy is not visible', () => {
    const instance = tippy(h(), {trigger: 'manual'});
    const spy = jest.fn();

    instance.reference.addEventListener('blur', spy);
    instance.reference.focus();

    Listeners.onWindowBlur();

    expect(spy).toHaveBeenCalled();
  });
});
