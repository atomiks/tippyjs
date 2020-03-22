import {h} from '../../utils';

import tippy from '../../../src';
import animateFill from '../../../src/plugins/animateFill';
import {getChildren} from '../../../src/template';
import {getFormattedMessage} from '../../../src/validation';

tippy.setDefaultProps({plugins: [animateFill]});

describe('animateFill', () => {
  it('true: sets `data-animatefill` attribute on tooltip', () => {
    const ref = h();
    const instance = tippy(ref, {animateFill: true});

    expect(
      getChildren(instance.popper).box.hasAttribute('data-animatefill')
    ).toBe(true);
  });

  it('false: does not set `data-animatefill` attribute on tooltip', () => {
    const ref = h();
    const instance = tippy(ref, {animateFill: false});

    expect(
      getChildren(instance.popper).box.hasAttribute('data-animatefill')
    ).toBe(false);
  });

  it('true: sets `transitionDelay` style on content element', () => {
    const instance = tippy(h(), {animateFill: true, duration: 120});
    const {content} = getChildren(instance.popper);

    instance.show();
    jest.runAllTimers();

    expect(content.style.transitionDelay).toBe(`${120 / 10}ms`);
  });

  it('false: does not set `transitionDelay` style on content element', () => {
    const instance = tippy(h(), {
      animateFill: false,
      duration: 120,
    });
    const {content} = getChildren(instance.popper);

    instance.show();
    jest.runAllTimers();

    expect(content.style.transitionDelay).toBe('');
  });

  it('true: sets `animation: "shift-away"', () => {
    const instance = tippy(h(), {animateFill: true});
    expect(instance.props.animation).toBe('shift-away');
  });

  it('false: does not set `animation: "shift-away"', () => {
    const instance = tippy(h(), {animateFill: false});
    expect(instance.props.animation).not.toBe('shift-away');
  });

  it('sets `data-state` correctly', () => {
    const instance = tippy(h(), {animateFill: true});
    const {backdrop} = getChildren(instance.popper);

    expect(backdrop.getAttribute('data-state')).toBe('hidden');

    instance.show();
    jest.runAllTimers();

    expect(backdrop.getAttribute('data-state')).toBe('visible');

    instance.hide();

    expect(backdrop.getAttribute('data-state')).toBe('hidden');
  });

  it('true: should error when render function is not default', () => {
    const spy = jest.spyOn(console, 'error');

    tippy(h(), {
      animateFill: true,
      render() {
        return {
          popper: document.createElement('div'),
        };
      },
    });

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        'The `animateFill` plugin requires the default render function.'
      )
    );
  });

  it('false: should not error when render function is not default', () => {
    const spy = jest.spyOn(console, 'error');

    tippy(h(), {
      animateFill: false,
      render() {
        return {
          popper: document.createElement('div'),
        };
      },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not error if render fn is not default', () => {
    const spy = jest.spyOn(console, 'error');

    tippy(h(), {
      animateFill: false,
      render() {
        return {
          popper: document.createElement('div'),
        };
      },
    });
  });
});
