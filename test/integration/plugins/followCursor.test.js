import {fireEvent} from '@testing-library/dom';
import {h, enableTouchEnvironment, disableTouchEnvironment} from '../../utils';

import tippy from '../../../src';
import followCursor from '../../../src/plugins/followCursor';
import {getBasePlacement} from '../../../src/utils';

tippy.setDefaultProps({
  plugins: [followCursor],
});

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
      getBasePlacement(instance.popperInstance.state.placement)
    );

    expect(rect.left).toBe(receivedRect.left);
    expect(rect.right).toBe(receivedRect.right);
    expect(rect.top).toBe(receivedRect.top);
    expect(rect.bottom).toBe(receivedRect.bottom);
  }

  it('true: follows both axes', () => {
    placements.forEach((placement) => {
      instance = tippy(h(), {followCursor: true, placement});

      fireEvent.mouseEnter(instance.reference, defaultPosition);

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.props.getReferenceClientRect();
      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.props.getReferenceClientRect();
      matches({
        top: second.clientY,
        bottom: second.clientY,
        left: second.clientX,
        right: second.clientX,
      });
    });
  });

  it('"horizontal": follows x-axis', () => {
    placements.forEach((placement) => {
      instance = tippy(h(), {
        followCursor: 'horizontal',
        placement,
      });
      const referenceRect = instance.reference.getBoundingClientRect();

      fireEvent.mouseEnter(instance.reference, defaultPosition);

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.props.getReferenceClientRect();

      matches({
        top: referenceRect.top,
        bottom: referenceRect.bottom,
        left: first.clientX,
        right: first.clientX,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.props.getReferenceClientRect();

      matches({
        top: referenceRect.top,
        bottom: referenceRect.bottom,
        left: second.clientX,
        right: second.clientX,
      });
    });
  });

  it('"vertical": follows y-axis', () => {
    placements.forEach((placement) => {
      instance = tippy(h(), {followCursor: 'vertical', placement});
      const referenceRect = instance.reference.getBoundingClientRect();

      fireEvent.mouseEnter(instance.reference, defaultPosition);

      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.props.getReferenceClientRect();

      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: referenceRect.left,
        right: referenceRect.right,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.props.getReferenceClientRect();

      matches({
        top: second.clientY,
        bottom: second.clientY,
        left: referenceRect.left,
        right: referenceRect.right,
      });
    });
  });

  it('"initial": only follows once', () => {
    placements.forEach((placement) => {
      instance = tippy(h(), {followCursor: 'initial', placement});

      fireEvent.mouseMove(instance.reference, first);

      instance.show();
      jest.runAllTimers();

      fireEvent.mouseMove(instance.reference, first);
      rect = instance.props.getReferenceClientRect();

      matches({
        top: first.clientY,
        bottom: first.clientY,
        left: first.clientX,
        right: first.clientX,
      });

      fireEvent.mouseMove(instance.reference, second);
      rect = instance.props.getReferenceClientRect();

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

    rect = instance.props.getReferenceClientRect();

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

    rect = instance.props.getReferenceClientRect();

    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });

    instance.setContent('x');

    jest.runAllTimers();

    rect = instance.props.getReferenceClientRect();

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
    rect = instance.props.getReferenceClientRect();

    fireEvent.mouseMove(instance.reference, second);

    matches({
      top: referenceRect.top,
      bottom: referenceRect.bottom,
      left: first.clientX,
      right: first.clientX,
    });
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

    expect(instance.props.getReferenceClientRect).toBe(null);
  });

  it('"initial": does not update if triggered again while still visible', () => {
    instance = tippy(h(), {
      followCursor: 'initial',
    });

    fireEvent.mouseMove(instance.reference, first);

    instance.show();
    jest.runAllTimers();

    fireEvent.mouseMove(instance.reference, second);

    rect = instance.props.getReferenceClientRect();

    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });
  });

  it('works with manual trigger and .show()', () => {
    instance = tippy(h(), {
      followCursor: true,
      trigger: 'manual',
    });

    instance.show();
    jest.runAllTimers();

    fireEvent.mouseMove(document, first);

    rect = instance.props.getReferenceClientRect();

    matches({
      top: first.clientY,
      bottom: first.clientY,
      left: first.clientX,
      right: first.clientX,
    });
  });

  it('is cleaned up if untriggered before showing', () => {
    instance = tippy(h(), {followCursor: true, delay: 100});

    fireEvent.mouseEnter(instance.reference, first);
    fireEvent.mouseLeave(instance.reference);
    fireEvent.mouseMove(instance.reference, second);

    expect(instance.props.getReferenceClientRect).toBe(null);
  });
});
