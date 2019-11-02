import {fireEvent} from '@testing-library/dom';
import {h, cleanDocumentBody, setTestDefaultProps} from '../../utils';

import createSingleton from '../../../src/addons/createSingleton';
import tippy from '../../../src';
import {clean} from '../../../src/validation';

setTestDefaultProps();
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('createSingleton', () => {
  it('shows when a tippy instance reference is triggered', () => {
    const refs = [h(), h()];
    const singletonInstance = createSingleton(tippy(refs));

    fireEvent.mouseEnter(refs[0]);

    jest.runAllTimers();

    expect(singletonInstance.state.isVisible).toBe(true);
  });

  it('does not show the original tippy element', () => {
    const refs = [h(), h()];
    const firstRef = refs[0];

    createSingleton(tippy(refs));

    fireEvent.mouseEnter(firstRef);

    jest.runAllTimers();

    expect(firstRef._tippy.state.isVisible).toBe(false);
  });

  it('uses the relevant tippy instance content', () => {
    const configs = [{content: 'hi'}, {content: 'bye'}];
    const instances = configs.map(props => tippy(h(), props));
    const singletonInstance = createSingleton(instances);

    fireEvent.mouseEnter(instances[0].reference);

    expect(singletonInstance.props.content).toBe('hi');

    fireEvent.mouseLeave(instances[0].reference);
    fireEvent.mouseEnter(instances[1].reference);

    expect(singletonInstance.props.content).toBe('bye');
  });

  it('uses `delay: number` correctly', () => {
    const refs = [h(), h()];
    const singletonInstance = createSingleton(tippy(refs), {delay: 1000});
    const firstRef = refs[0];

    fireEvent.mouseEnter(firstRef);
    jest.advanceTimersByTime(999);

    expect(singletonInstance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);

    expect(singletonInstance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(firstRef);
    jest.advanceTimersByTime(999);

    expect(singletonInstance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(1);

    expect(singletonInstance.state.isVisible).toBe(false);
  });

  it('uses `delay: [number, number]` correctly', () => {
    const refs = [h(), h()];
    const singletonInstance = createSingleton(tippy(refs), {
      delay: [500, 1000],
    });
    const firstRef = refs[0];

    fireEvent.mouseEnter(firstRef);
    jest.advanceTimersByTime(499);

    expect(singletonInstance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);

    expect(singletonInstance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(firstRef);
    jest.advanceTimersByTime(999);

    expect(singletonInstance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(1);

    expect(singletonInstance.state.isVisible).toBe(false);
  });

  it('throws if not passed an array', () => {
    expect(() => {
      createSingleton(null);
    }).toThrow(
      clean(`The first argument passed to createSingleton() must be an array of tippy
      instances.

      The passed value was: ${null}`),
    );
  });

  it('does not throw if any passed instance is not part of an existing singleton', () => {
    expect(() => {
      const instances = tippy([h(), h()]);
      const singleton = createSingleton(instances);
      singleton.destroy();
      createSingleton(instances);
    }).not.toThrow();
  });

  it('allows updates to `onTrigger`, `onDestroy`, and `onAfterUpdate`', () => {
    const instances = tippy([h()]);

    const onTriggerSpy = jest.fn();
    const onDestroySpy = jest.fn();
    const onAfterUpdateSpy = jest.fn();

    const singleton = createSingleton(instances);

    singleton.setProps({
      onTrigger: onTriggerSpy,
      onDestroy: onDestroySpy,
      onAfterUpdate: onAfterUpdateSpy,
    });

    fireEvent.mouseEnter(instances[0].reference);

    expect(onTriggerSpy).toHaveBeenCalled();

    singleton.setProps({});

    expect(onAfterUpdateSpy).toHaveBeenCalled();

    singleton.destroy();

    expect(onDestroySpy).toHaveBeenCalled();
  });

  it('can update the `delay` option', () => {
    const refs = [h(), h()];
    const singletonInstance = createSingleton(tippy(refs), {delay: 1000});
    const firstRef = refs[0];

    singletonInstance.setProps({delay: 500});

    fireEvent.mouseEnter(firstRef);
    jest.advanceTimersByTime(499);

    expect(singletonInstance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);

    expect(singletonInstance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(firstRef);
    jest.advanceTimersByTime(499);

    expect(singletonInstance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(1);

    expect(singletonInstance.state.isVisible).toBe(false);
  });

  it('does not destroy the passed instances if passed `false`', () => {
    const tippyInstances = tippy([h(), h()]);
    const singletonInstance = createSingleton(tippyInstances);
    singletonInstance.destroy(false);
    tippyInstances.forEach(instance => {
      expect(instance.state.isDestroyed).toBe(false);
    });
  });

  it('does not throw maximum call stack error due to stale lifecycle hooks', () => {
    const tippyInstances = tippy([h(), h()]);
    const instance = tippyInstances[0];
    const singletonInstance = createSingleton(tippyInstances);

    singletonInstance.destroy(false);

    createSingleton(tippyInstances);

    fireEvent.mouseEnter(instance.reference);

    jest.runAllTimers();
  });

  it('restores original state when destroyed', () => {
    const tippyInstances = tippy([h(), h()]);
    const prevInstanceProps = tippyInstances.map(instance => instance.props);
    const singletonInstance = createSingleton(tippyInstances);

    singletonInstance.destroy(false);
    tippyInstances.forEach((instance, i) => {
      const {props} = instance;
      expect({...props, ...prevInstanceProps[i]}).toEqual(props);
    });
  });

  it('handles aria attribute correctly', () => {
    const tippyInstances = tippy([h(), h()]);
    const singletonInstance = createSingleton(tippyInstances, {delay: 100});

    const id = singletonInstance.popperChildren.tooltip.id;
    const {reference: firstRef} = tippyInstances[0];
    const {reference: secondRef} = tippyInstances[1];

    fireEvent.mouseEnter(firstRef);
    jest.runAllTimers();

    expect(firstRef.getAttribute('aria-describedby')).toBe(id);

    fireEvent.mouseLeave(firstRef);
    fireEvent.mouseEnter(secondRef);

    expect(firstRef.getAttribute('aria-describedby')).toBe(null);
    expect(secondRef.getAttribute('aria-describedby')).toBe(id);

    singletonInstance.setProps({aria: 'labelledby'});

    fireEvent.mouseLeave(secondRef);
    fireEvent.mouseEnter(firstRef);

    expect(firstRef.getAttribute('aria-labelledby')).toBe(id);
    expect(secondRef.getAttribute('aria-labelledby')).toBe(null);

    singletonInstance.setProps({aria: null});

    fireEvent.mouseLeave(firstRef);
    fireEvent.mouseEnter(secondRef);

    expect(firstRef.getAttribute('aria-labelledby')).toBe(null);
    expect(secondRef.getAttribute('aria-labelledby')).toBe(null);
  });

  it('can accept plugins', () => {
    const plugins = [{fn: () => ({})}];
    const singletonInstance = createSingleton(tippy([h(), h()]), {}, plugins);

    expect(singletonInstance.plugins.slice(1)).toEqual(plugins);
  });
});
