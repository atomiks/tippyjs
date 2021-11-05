import {fireEvent} from '@testing-library/dom';
import {h} from '../../utils';

import createSingleton from '../../../src/addons/createSingleton';
import tippy from '../../../src';
import {getFormattedMessage} from '../../../src/validation';
import {currentInput} from '../../../src/bindGlobalEventListeners';

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
    const instances = configs.map((props) => tippy(h(), props));
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
    }).toThrow();

    expect(console.error).toHaveBeenCalledWith(
      ...getFormattedMessage(
        [
          'The first argument passed to createSingleton() must be an array of tippy',
          'instances. The passed value was',
          String(null),
        ].join(' ')
      )
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
    tippyInstances.forEach((instance) => {
      expect(instance.state.isDestroyed).toBe(false);
    });
  });

  it('restores original state when destroyed', () => {
    const tippyInstances = tippy([h(), h()]);
    const prevInstanceProps = tippyInstances.map((instance) => instance.props);
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

    const id = `__NAMESPACE_PREFIX__-${singletonInstance.id}`;
    const {reference: firstRef} = tippyInstances[0];
    const {reference: secondRef} = tippyInstances[1];

    fireEvent.mouseEnter(firstRef);
    jest.runAllTimers();

    expect(firstRef.getAttribute('aria-describedby')).toBe(id);
    expect(secondRef.getAttribute('aria-describedby')).toBe(id);

    fireEvent.mouseLeave(firstRef);
    fireEvent.mouseEnter(secondRef);

    expect(firstRef.getAttribute('aria-describedby')).toBe(id);
    expect(secondRef.getAttribute('aria-describedby')).toBe(id);

    singletonInstance.setProps({aria: {content: 'labelledby'}});
    singletonInstance.hide();

    fireEvent.mouseEnter(firstRef);
    jest.runAllTimers();

    expect(firstRef.getAttribute('aria-labelledby')).toBe(id);
    expect(secondRef.getAttribute('aria-labelledby')).toBe(id);

    fireEvent.mouseLeave(firstRef);
    jest.advanceTimersByTime(100);

    expect(firstRef.getAttribute('aria-labelledby')).toBe(null);
    expect(secondRef.getAttribute('aria-labelledby')).toBe(null);
  });

  it('does not use the placeholder element content with a function', () => {
    const refs = [h(), h()];
    const instances = tippy(refs, {content: () => 'hello'});
    const singleton = createSingleton(instances);
    const firstRef = refs[0];

    expect(singleton.props.content).toBe('__DEFAULT_TEST_CONTENT__');

    fireEvent.mouseEnter(firstRef);

    expect(singleton.props.content).toBe('hello');
  });
});

describe('overrides prop', () => {
  it('individual tippy instance props override singleton instance props', () => {
    const tippyInstances = tippy([h(), h()], {delay: 100});
    const singletonInstance = createSingleton(tippyInstances, {
      delay: 0,
      overrides: ['delay'],
    });

    fireEvent.mouseEnter(tippyInstances[0].reference);

    expect(singletonInstance.props.delay).toBe(100);
  });

  it('can be updated via .setProps()', () => {
    const tippyInstances = tippy([h(), h()], {delay: 100});
    const singletonInstance = createSingleton(tippyInstances, {
      delay: 0,
      overrides: ['delay'],
    });

    singletonInstance.setProps({overrides: []});

    fireEvent.mouseEnter(tippyInstances[0].reference);

    expect(singletonInstance.props.delay).toBe(0);
  });
});

describe('.setInstances() method', () => {
  it('updates the singleton instances', () => {
    const initialRefs = [h(), h()];
    const nextRefs = [initialRefs[0], h()];

    const initialInstances = tippy(initialRefs);
    const nextInstances = tippy(nextRefs);

    const singleton = createSingleton(initialInstances);

    singleton.setInstances(nextInstances);

    expect(initialInstances[1].state.isEnabled).toBe(true);
    expect(nextInstances[1].state.isEnabled).toBe(false);

    fireEvent.mouseEnter(nextRefs[1]);

    expect(singleton.state.isVisible).toBe(true);
  });
});

describe('.show() method', () => {
  const getInstances = () =>
    [{content: 'first'}, {content: 'second'}, {content: 'last'}].map((props) =>
      tippy(h(), props)
    );

  it('shows the first tippy instance when no parameters are passed', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.show();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('first');
  });

  it('shows the tippy instance passed as an argument', () => {
    const tippyInstances = getInstances();
    const singletonInstance = createSingleton(tippyInstances);

    singletonInstance.show(tippyInstances[1]);

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('second');
  });

  it('shows the tippy instance related to the reference element passed as an argument', () => {
    const tippyInstances = getInstances();
    const singletonInstance = createSingleton(tippyInstances);

    singletonInstance.show(tippyInstances[1].reference);

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('second');
  });

  it('shows the tippy instance at the given index number', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.show(1);

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('second');
  });
});

describe('.showNext() method', () => {
  const getInstances = () =>
    [{content: 'first'}, {content: 'second'}, {content: 'last'}].map((props) =>
      tippy(h(), props)
    );

  it('shows the first tippy instance if none is visible', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.showNext();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('first');
  });
  it('shows the tippy instance after the currently visible one', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.show();

    expect(singletonInstance.props.content).toBe('first');
    singletonInstance.showNext();
    expect(singletonInstance.props.content).toBe('second');
    singletonInstance.showNext();
    expect(singletonInstance.props.content).toBe('last');
  });
  it('loops to the beginning if the last instance is visible', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.show(2);

    expect(singletonInstance.props.content).toBe('last');
    singletonInstance.showNext();
    expect(singletonInstance.props.content).toBe('first');
  });
});

describe('.showPrevious() method', () => {
  const getInstances = () =>
    [{content: 'first'}, {content: 'second'}, {content: 'last'}].map((props) =>
      tippy(h(), props)
    );

  it('shows the last tippy instance if none is visible', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.showPrevious();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('last');
  });
  it('shows the tippy instance before the currently visible one', () => {
    const singletonInstance = createSingleton(getInstances(), {
      showOnCreate: true,
    });

    singletonInstance.hide();
    singletonInstance.show(2);

    expect(singletonInstance.props.content).toBe('last');
    singletonInstance.showPrevious();
    expect(singletonInstance.props.content).toBe('second');
    singletonInstance.showPrevious();
    expect(singletonInstance.props.content).toBe('first');
  });
  it('loops to the end if the first instance is visible', () => {
    const singletonInstance = createSingleton(getInstances());

    singletonInstance.show();

    expect(singletonInstance.props.content).toBe('first');
    singletonInstance.showPrevious();
    expect(singletonInstance.props.content).toBe('last');
  });
});

describe('showOnCreate prop', () => {
  it('shows the first tippy instance on creation', () => {
    const tippyInstances = [{content: 'first'}, {content: 'second'}].map(
      (props) => tippy(h(), props)
    );

    const singletonInstance = createSingleton(tippyInstances, {
      showOnCreate: true,
    });

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('first');
  });

  it('resets correctly if showOnCreate is cancelled by a click outside', () => {
    const tippyInstances = [{content: 'first'}, {content: 'second'}].map(
      (props) => tippy(h(), props)
    );

    const singletonInstance = createSingleton(tippyInstances, {
      showOnCreate: true,
      delay: 500,
    });

    fireEvent.mouseDown(document.body);
    jest.runAllTimers();
    fireEvent.mouseEnter(tippyInstances[1].reference);
    jest.runAllTimers();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('second');
  });

  it('does not hide tippy upon clicking next target', () => {
    currentInput.isTouch = true;

    const tippyInstances = [{content: 'first'}, {content: 'second'}].map(
      (props) => tippy(h(), props)
    );

    const singletonInstance = createSingleton(tippyInstances);

    fireEvent.mouseEnter(tippyInstances[0].reference);
    fireEvent.mouseDown(document.body);
    fireEvent.mouseEnter(tippyInstances[1].reference);

    jest.runAllTimers();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('second');

    currentInput.isTouch = false;
  });

  it('accepts custom `triggerTarget` in individual instances', () => {
    const ref1 = h();
    const ref2 = h();
    const triggerTarget1 = h();
    const triggerTarget2 = h();

    const tippyInstances = [
      {ref: ref1, content: 'first', triggerTarget: triggerTarget1},
      {ref: ref2, content: 'second', triggerTarget: triggerTarget2},
    ].map(({ref, ...props}) => tippy(ref, props));

    const singletonInstance = createSingleton(tippyInstances);

    fireEvent.mouseEnter(ref1);
    jest.runAllTimers();
    expect(singletonInstance.state.isVisible).toBe(false);

    fireEvent.mouseEnter(triggerTarget1);
    jest.runAllTimers();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('first');

    fireEvent.mouseEnter(triggerTarget2);
    jest.runAllTimers();

    expect(singletonInstance.state.isVisible).toBe(true);
    expect(singletonInstance.props.content).toBe('second');

    fireEvent.mouseEnter(ref1);
    jest.runAllTimers();

    expect(singletonInstance.props.content).toBe('second');
  });
});
