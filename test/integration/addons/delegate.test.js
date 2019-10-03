import {h, cleanDocumentBody, MOUSEENTER, CLICK} from '../../utils';

import tippy from '../../../src';
import delegate from '../../../src/addons/delegate';
import {clean} from '../../../src/validation';

tippy.setDefaultProps({duration: 0, delay: 0});
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('delegate', () => {
  it('creates an instance for the child target', () => {
    const button = h('button');
    const instance = delegate(document.body, {target: 'button'});

    expect(button._tippy).toBeUndefined();

    button.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));

    expect(button._tippy).toBeDefined();

    instance.destroy();
  });

  it('works with `trigger: click`', () => {
    const button = h('button');
    const instance = delegate(document.body, {
      target: 'button',
      trigger: 'click',
    });

    expect(button._tippy).toBeUndefined();

    button.dispatchEvent(CLICK);

    expect(button._tippy).toBeDefined();

    instance.destroy();
  });

  it('handles an array of delegate targets', () => {
    const refs = [h(), h()];

    refs.forEach(ref => ref.append(document.createElement('button')));

    const instances = delegate(refs, {target: 'button'});
    const button = refs[0].querySelector('button');

    expect(button._tippy).toBeUndefined();

    button.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));

    expect(button._tippy).toBeDefined();

    instances.forEach(instance => instance.destroy());
  });

  it('does not show its own tippy', () => {
    const instance = delegate(document.body, {target: 'button'});

    document.body.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    document.body.dispatchEvent(MOUSEENTER);

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
    const instance = delegate(document.body, {target: 'button'});

    instance.destroy();
    button.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));

    expect(button._tippy).toBeUndefined();
  });

  it('destroys child instances by default too', () => {
    const button = h('button');
    const instance = delegate(document.body, {target: 'button'});

    button.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    instance.destroy();

    expect(button._tippy).toBeUndefined();
  });

  it('does not destroy child instances if passed `false`', () => {
    const button = h('button');
    const instance = delegate(document.body, {target: 'button'});

    button.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    instance.destroy(false);

    expect(button._tippy).toBeDefined();
  });

  it('can accept plugins', () => {
    const button = h('button');
    const plugins = [{fn: () => ({})}];
    const instance = delegate(document.body, {target: 'button'}, plugins);

    button.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));

    expect(instance.plugins).toEqual(plugins);
    expect(button._tippy.plugins).toEqual(plugins);
  });
});
