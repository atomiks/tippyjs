import {fireEvent} from '@testing-library/dom';
import {h, cleanDocumentBody} from '../../utils';

import tippy from '../../../src';
import delegate from '../../../src/addons/delegate';
import {clean} from '../../../src/validation';
import {normalizeToArray} from '../../../src/utils';

tippy.setDefaultProps({duration: 0, delay: 0});
jest.useFakeTimers();

let instance;

afterEach(() => {
  if (instance) {
    normalizeToArray(instance).forEach(i => i.destroy());
  }

  cleanDocumentBody();
});

describe('delegate', () => {
  it('creates an instance for the child target', () => {
    const button = h('button');
    instance = delegate(document.body, {target: 'button'});

    expect(button._tippy).toBeUndefined();

    fireEvent.mouseOver(button);

    expect(button._tippy).toBeDefined();

    instance.destroy();
  });

  it('works with `trigger: click`', () => {
    const button = h('button');
    instance = delegate(document.body, {
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

    refs.forEach(ref => ref.append(document.createElement('button')));

    instance = delegate(refs, {target: 'button'});
    const button = refs[0].querySelector('button');

    expect(button._tippy).toBeUndefined();

    fireEvent.mouseOver(button);

    expect(button._tippy).toBeDefined();

    instance.forEach(instance => instance.destroy());
  });

  it('does not show its own tippy', () => {
    instance = delegate(document.body, {target: 'button'});

    fireEvent.mouseOver(document.body);
    fireEvent.mouseEnter(document.body);

    jest.runAllTimers();

    expect(instance.state.isVisible).toBe(false);

    instance.destroy();
  });

  it('throws if delegate target is falsy', () => {
    expect(() => delegate(null, {target: 'button'})).toThrow();
  });

  it('throws if passed falsy `target` prop', () => {
    const message = clean(
      `You must specify a \`target\` prop indicating the CSS selector string
    matching the target elements that should receive a tippy.`,
    );

    expect(() => {
      delegate(document.body);
    }).toThrow(message);
    expect(() => {
      delegate(document.body, {target: ''});
    }).toThrow(message);
  });

  it('can be destroyed', () => {
    const button = h('button');
    instance = delegate(document.body, {target: 'button'});

    instance.destroy();
    fireEvent.mouseOver(button);

    expect(button._tippy).toBeUndefined();
  });

  it('destroys child instance by default too', () => {
    const button = h('button');
    instance = delegate(document.body, {target: 'button'});

    fireEvent.mouseOver(button);
    instance.destroy();

    expect(button._tippy).toBeUndefined();
  });

  it('does not destroy child instance if passed `false`', () => {
    const button = h('button');
    instance = delegate(document.body, {target: 'button'});

    fireEvent.mouseOver(button);
    instance.destroy(false);

    expect(button._tippy).toBeDefined();
  });

  it('can accept plugins', () => {
    const button = h('button');
    const plugins = [{fn: () => ({})}];
    instance = delegate(document.body, {target: 'button'}, plugins);

    fireEvent.mouseOver(button);

    expect(instance.plugins).toEqual(plugins);
    expect(button._tippy.plugins).toEqual(plugins);
  });

  it('handles `data-tippy-trigger` attribute', () => {
    const clickButton = h('button', {'data-tippy-trigger': 'click'});
    const focusButton = h('button', {'data-tippy-trigger': 'focus'});

    instance = delegate(document.body, {
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
    const button = h('button');
    instance = delegate(document.body, {target: 'button', delay: 100});

    fireEvent.mouseOver(button);

    jest.advanceTimersByTime(99);

    expect(button._tippy.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);

    expect(button._tippy.state.isVisible).toBe(true);
  });
});
