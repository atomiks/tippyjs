import {h} from '../utils';

import tippy from '../../src';
import * as Listeners from '../../src/bindGlobalEventListeners';

describe('onDocumentTouchStart', () => {
  it('sets currentInput.isTouch to `true`', () => {
    Listeners.onDocumentTouchStart();
    Listeners.onDocumentTouchStart();

    expect(Listeners.currentInput.isTouch).toBe(true);
  });

  it('is undone if two consecutive mousemove events are fired', () => {
    // NOTE: this is dependent on the previous test
    Listeners.onDocumentMouseMove();
    Listeners.onDocumentMouseMove();

    expect(Listeners.currentInput.isTouch).toBe(false);
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
