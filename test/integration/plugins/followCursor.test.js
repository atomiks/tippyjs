import {fireEvent} from '@testing-library/dom';
import {
  h,
  cleanDocumentBody,
  enableTouchEnvironment,
  disableTouchEnvironment,
  setTestDefaultProps,
} from '../../utils';

import tippy from '../../../src';
import followCursor, {
  getVirtualOffsets,
} from '../../../src/plugins/followCursor';
import {getBasePlacement} from '../../../src/popper';

setTestDefaultProps({plugins: [followCursor]});
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('followCursor', () => {
  // NOTE: Jest's simulated window dimensions are 1024 x 768. These values
  // should be within that
  const defaultPosition = {clientX: 1, clientY: 1};

  const first = {clientX: 317, clientY: 119};
  const second = {clientX: 240, clientY: 500};

  const placements = ['top', 'bottom', 'left', 'right'];

  let rect;
  let instance;

  afterEach(() => {
    instance.destroy();
  });

  function matches(receivedRect) {
    const isVerticalPlacement = ['top', 'bottom'].includes(
      getBasePlacement(instance.state.currentPlacement),
    );
    const {x, y} = getVirtualOffsets(instance.popper, isVerticalPlacement);

    expect(rect.left).toBe(receivedRect.left - x);
    expect(rect.right).toBe(receivedRect.right + x);
    expect(rect.top).toBe(receivedRect.top - y);
    expect(rect.bottom).toBe(receivedRect.bottom + y);
  }

  it('true: follows both axes', () => {
    placements.forEach(placement => {
      instance = tippy(h(), {followCursor: true, placement});

      fireEvent.mouseEnter(instance.reference, defaultPosition);

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: second.clientY,
        bottom: second.clientY,
        left: second.clientX,
        right: second.clientX,
      });
    });
  });

  it('"horizontal": follows x-axis', () => {
    placements.forEach(placement => {
      instance = tippy(h(), {
        followCursor: 'horizontal',
        placement,
      });
      const referenceRect = instance.reference.getBoundingClientRect();

      fireEvent.mouseEnter(instance.reference, defaultPosition);

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.popperInstance.reference.getBoundingClientRect();

      matches({
        top: referenceRect.top,
        bottom: referenceRect.bottom,
        left: first.clientX,
        right: first.clientX,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: referenceRect.top,
        bottom: referenceRect.bottom,
        left: second.clientX,
        right: second.clientX,
      });
    });
  });

  it('"vertical": follows y-axis', () => {
    placements.forEach(placement => {
      instance = tippy(h(), {followCursor: 'vertical', placement});
      const referenceRect = instance.reference.getBoundingClientRect();

      fireEvent.mouseEnter(instance.reference, defaultPosition);

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: referenceRect.left,
        right: referenceRect.right,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: second.clientY,
        bottom: second.clientY,
        left: referenceRect.left,
        right: referenceRect.right,
      });
    });
  });

  it('"initial": only follows once', () => {
    placements.forEach(placement => {
      instance = tippy(h(), {followCursor: 'initial', placement});

      // lastMouseMove event is used in this case
      instance.reference.dispatchEvent(
        new MouseEvent('mouseenter', {...first}),
      );

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.popperInstance.reference.getBoundingClientRect();
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      });
    });
  });

  it('is at correct position after a delay', () => {
    instance = tippy(h(), {followCursor: true, delay: 100});

    fireEvent.mouseEnter(instance.reference, defaultPosition);

    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, first);

    jest.advanceTimersByTime(100);

    rect = instance.popperInstance.reference.getBoundingClientRect();
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });
  });

  it('is at correct position after a content update', () => {
    instance = tippy(h(), {followCursor: true});

    fireEvent.mouseEnter(instance.reference, defaultPosition);

    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, first);

    rect = instance.popperInstance.reference.getBoundingClientRect();
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });

    instance.setContent('x');

    jest.runAllTimers();

    rect = instance.popperInstance.reference.getBoundingClientRect();
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });
  });

  it('does not continue to follow if interactive: true and cursor is over popper', () => {
    instance = tippy(h(), {
      followCursor: 'horizontal',
      interactive: true,
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);

    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, first);

    const referenceRect = instance.reference.getBoundingClientRect();
    rect = instance.popperInstance.reference.getBoundingClientRect();

    fireEvent.mouseMove(instance.reference, second);

    matches({
      top: referenceRect.top,
      bottom: referenceRect.bottom,
      left: first.clientX,
      right: first.clientX,
    });
  });

  it('touch device behavior is "initial"', () => {
    enableTouchEnvironment();

    instance = tippy(h(), {followCursor: true, flip: false});

    fireEvent.mouseEnter(instance.reference, first);

    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, first);
    rect = instance.popperInstance.reference.getBoundingClientRect();
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });

    fireEvent.mouseMove(instance.reference, second);
    rect = instance.popperInstance.reference.getBoundingClientRect();
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });

    disableTouchEnvironment();
  });

  it('cleans up listener if untriggered before it shows', () => {
    instance = tippy(h(), {
      followCursor: true,
      flip: false,
      delay: 1000,
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);

    jest.advanceTimersByTime(100);

    fireEvent.mouseMove(instance.reference, first);
    fireEvent.mouseLeave(instance.reference);

    jest.advanceTimersByTime(900);

    fireEvent.mouseMove(instance.reference, second);

    rect = instance.popperInstance.reference.getBoundingClientRect();
  });

  it('should reset popperInstance.reference if triggered by `focus`', () => {
    instance = tippy(h(), {
      followCursor: true,
      flip: false,
      delay: 1000,
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);

    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, first);
    fireEvent.mouseLeave(instance.reference);

    fireEvent.mouseMove(instance.reference, second);

    instance.hide();

    fireEvent.focus(instance.reference);

    expect(instance.popperInstance.reference).toBe(instance.reference);
  });

  it('"initial": does not update if triggered again while still visible', () => {
    instance = tippy(h(), {
      followCursor: 'initial',
    });

    fireEvent.mouseEnter(instance.reference, first);

    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, second);

    rect = instance.popperInstance.reference.getBoundingClientRect();

    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });
  });

  it('sets normalizedPlacement for shifted placements correctly', () => {
    instance = tippy(h(), {
      placement: 'top-start',
      followCursor: true,
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.props.placement).toBe('top-end');

    instance.setProps({placement: 'left-end'});

    expect(instance.props.placement).toBe('left-start');

    instance.setProps({followCursor: false});

    fireEvent.mouseLeave(instance.reference, defaultPosition);
    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.props.placement).toBe('left-end');
  });

  it('is disabled if MouseEvent.{clientX,clientY} are 0', () => {
    instance = tippy(h(), {
      followCursor: true,
    });

    fireEvent.mouseEnter(instance.reference);
    jest.runAllTimers();

    expect(instance.popperInstance.reference).toBe(instance.reference);
  });

  it('enables listeners for `true`', () => {
    instance = tippy(h(), {
      followCursor: true,
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.popperInstance.state.eventsEnabled).toBe(true);
  });

  it('enables listeners for `false`', () => {
    instance = tippy(h(), {
      followCursor: false,
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.popperInstance.state.eventsEnabled).toBe(true);
  });

  it('disables listeners for "initial"', () => {
    instance = tippy(h(), {
      followCursor: 'initial',
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.popperInstance.state.eventsEnabled).toBe(false);
  });

  it('disables listeners for "horizontal"', () => {
    instance = tippy(h(), {
      followCursor: 'horizontal',
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.popperInstance.state.eventsEnabled).toBe(false);
  });

  it('disables listeners for "vertical"', () => {
    instance = tippy(h(), {
      followCursor: 'vertical',
    });

    fireEvent.mouseEnter(instance.reference, defaultPosition);
    jest.runAllTimers();

    expect(instance.popperInstance.state.eventsEnabled).toBe(false);
  });

  it('works with manual trigger and .show()', () => {
    instance = tippy(h(), {
      followCursor: true,
      trigger: 'manual',
    });

    instance.show();
    jest.runAllTimers();

    fireEvent.mouseMove(document, first);

    rect = instance.popperInstance.reference.getBoundingClientRect();
    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });
  });
});
