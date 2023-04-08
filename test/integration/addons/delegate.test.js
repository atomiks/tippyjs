import {fireEvent} from '@testing-library/dom';
import {h} from '../../utils';

import delegate from '../../../src/addons/delegate';
import {getFormattedMessage} from '../../../src/validation';
import {normalizeToArray} from '../../../src/utils';

let instance;
let delegateElement = h();

afterEach(() => {
  if (instance) {
    normalizeToArray(instance).forEach((i) => i.destroy());
  }

  delegateElement = h();
});

describe('delegate', () => {
  it('creates an instance for the child target', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {target: 'button'});

    expect(button._tippy).toBeUndefined();

    fireEvent.mouseOver(button);

    expect(button._tippy).toBeDefined();

    instance.destroy();
  });

  it('works with `trigger: click`', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {
      target: 'button',
      trigger: 'click',
    });

    expect(button._tippy).toBeUndefined();

    fireEvent.click(button);

    expect(button._tippy).toBeDefined();

    instance.destroy();
  });

  it('handles an array of delegate targets', () => {
    const refs = [h(), h()];

    refs.forEach((ref) => ref.append(document.createElement('button')));

    instance = delegate(refs, {target: 'button'});
    const button = refs[0].querySelector('button');

    expect(button._tippy).toBeUndefined();

    fireEvent.mouseOver(button);

    expect(button._tippy).toBeDefined();

    instance.forEach((instance) => instance.destroy());
  });

  it('does not show its own tippy', () => {
    instance = delegate(delegateElement, {target: 'button'});

    fireEvent.mouseOver(delegateElement);
    fireEvent.mouseEnter(delegateElement);

    jest.runAllTimers();

    expect(instance.state.isVisible).toBe(false);

    instance.destroy();
  });

  it('throws if delegate target is falsy', () => {
    delegate(null, {target: 'button'});

    expect(console.error).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          'tippy() was passed',
          '`' + String(null) + '`',
          'as its targets (first) argument. Valid types are: String, Element, Element[],',
          'or NodeList.',
        ].join(' ')
      )
    );
  });

  it('errors if passed missing props object', () => {
    expect(() => delegate(delegateElement)).toThrow();

    expect(console.error).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          'You must specity a `target` prop indicating a CSS selector string matching',
          'the target elements that should receive a tippy.',
        ].join(' ')
      )
    );
  });

  it('errors if passed falsy or missing `target` prop', () => {
    delegate(delegateElement, {target: ''});

    expect(console.error).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          'You must specity a `target` prop indicating a CSS selector string matching',
          'the target elements that should receive a tippy.',
        ].join(' ')
      )
    );
  });

  it('can be destroyed', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {target: 'button'});

    instance.destroy();
    fireEvent.mouseOver(button);

    expect(button._tippy).toBeUndefined();
  });

  it('destroys child instance by default too', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {target: 'button'});

    fireEvent.mouseOver(button);
    instance.destroy();

    expect(button._tippy).toBeUndefined();
  });

  it('does not destroy child instance if passed `false`', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {target: 'button'});

    fireEvent.mouseOver(button);
    instance.destroy(false);

    expect(button._tippy).toBeDefined();
  });

  it('handles `data-tippy-trigger` attribute', () => {
    const clickButton = h(
      'button',
      {'data-tippy-trigger': 'click'},
      delegateElement
    );
    const focusButton = h(
      'button',
      {'data-tippy-trigger': 'focus'},
      delegateElement
    );

    instance = delegate(delegateElement, {
      target: 'button',
      trigger: 'mouseenter',
    });

    fireEvent.mouseOver(clickButton);
    expect(clickButton._tippy).toBeUndefined();

    fireEvent.click(clickButton);
    expect(clickButton._tippy).toBeDefined();

    fireEvent.mouseOver(focusButton);
    expect(focusButton._tippy).toBeUndefined();

    fireEvent.focusIn(focusButton);
    expect(focusButton._tippy).toBeDefined();
  });

  it('respects `delay` on first show', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {target: 'button', delay: 100});

    fireEvent.mouseOver(button);

    jest.advanceTimersByTime(99);

    expect(button._tippy.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);

    expect(button._tippy.state.isVisible).toBe(true);
  });

  it('does not hide tippy with touch input using click trigger', () => {
    const button = h('button', {}, delegateElement);
    instance = delegate(delegateElement, {target: 'button', trigger: 'click'});

    fireEvent.touchStart(button, {bubbles: true});
    fireEvent.click(button, {bubbles: true});

    jest.runAllTimers();

    expect(button._tippy.state.isVisible).toBe(true);
  });
});
