import {h, cleanDocumentBody, setTestDefaultProps} from '../../utils';

import tippy from '../../../src';
import animateFill from '../../../src/plugins/animateFill';

setTestDefaultProps({plugins: [animateFill]});
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('animateFill', () => {
  it('true: sets `data-animatefill` attribute on tooltip', () => {
    const ref = h();
    const instance = tippy(ref, {animateFill: true});

    expect(
      instance.popperChildren.tooltip.hasAttribute('data-animatefill'),
    ).toBe(true);
  });

  it('false: does not set `data-animatefill` attribute on tooltip', () => {
    const ref = h();
    const instance = tippy(ref, {animateFill: false});

    expect(
      instance.popperChildren.tooltip.hasAttribute('data-animatefill'),
    ).toBe(false);
  });

  it('true: sets `transitionDelay` style on content element', () => {
    const instance = tippy(h(), {animateFill: true, duration: 120});
    const {content} = instance.popperChildren;

    instance.show();
    jest.runAllTimers();

    expect(content.style.transitionDelay).toBe(`${120 / 10}ms`);
  });

  it('false: does not set `transitionDelay` style on content element', () => {
    const instance = tippy(h(), {
      animateFill: false,
      duration: 120,
    });
    const {content} = instance.popperChildren;

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
    const {backdrop} = instance.popperChildren;

    expect(backdrop.getAttribute('data-state')).toBe('hidden');

    instance.show();
    jest.runAllTimers();

    expect(backdrop.getAttribute('data-state')).toBe('visible');

    instance.hide();

    expect(backdrop.getAttribute('data-state')).toBe('hidden');
  });
});
