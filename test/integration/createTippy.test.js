import {fireEvent} from '@testing-library/dom';
import {h, enableTouchEnvironment, disableTouchEnvironment} from '../utils';

import {defaultProps} from '../../src/props';
import createTippy, {mountedInstances} from '../../src/createTippy';
import {IOS_CLASS} from '../../src/constants';
import animateFill from '../../src/plugins/animateFill';
import {getChildren} from '../../src/template';
import {getFormattedMessage} from '../../src/validation';

let instance;

afterEach(() => {
  if (instance) {
    instance.destroy();
  }
});

describe('createTippy', () => {
  it('returns the instance with expected properties', () => {
    instance = createTippy(h(), defaultProps);

    expect(instance).toMatchSnapshot();
  });

  it('sets `undefined` prop to the default', () => {
    instance = createTippy(h(), {
      theme: undefined,
    });

    expect(instance.props.theme).not.toBe(undefined);
  });

  it('increments the `id` on each call with valid arguments', () => {
    const instances = [
      createTippy(h(), defaultProps),
      createTippy(h(), defaultProps),
      createTippy(h(), defaultProps),
    ];

    expect(instances[0].id).toBe(instances[1].id - 1);
    expect(instances[1].id).toBe(instances[2].id - 1);
  });

  it('adds correct listeners to the reference element based on `trigger` (`interactive`: false)', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      trigger: 'mouseenter focus click focusin',
    });

    fireEvent.mouseEnter(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.focus(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.blur(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.focusIn(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.focusOut(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    // For completeness, it would seem to make sense to test that the tippy *is*
    // hidden on clicking it's content (as this is a non-interactive instance);
    // however, we use CSS pointer-events: none for non-interaction, so firing a
    // click event on the tippy content won't test this scenario. Neither can we
    // test for that style with window.getComputedStyle in the testing
    // environment.
  });

  it('adds correct listeners to the reference element based on `trigger` (`interactive`: true)', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      interactive: true,
      trigger: 'mouseenter focus click focusin',
    });

    fireEvent.mouseEnter(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    // For interactive tippies, the reference onMouseLeave adds a document.body
    // listener to scheduleHide, but doesn't scheduleHide itself (hence event
    // bubbling being required here for the tip to hide).
    fireEvent.mouseLeave(instance.reference, {bubbles: true});
    expect(instance.state.isVisible).toBe(false);

    fireEvent.focus(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.blur(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.click(getChildren(instance.popper).content);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.focusIn(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.focusOut(instance.reference);
    expect(instance.state.isVisible).toBe(false);
  });

  it('extends `instance.props` with plugin props', () => {
    instance = createTippy(h(), {...defaultProps, plugins: [animateFill]});

    expect(instance.props.animateFill).toBe(animateFill.defaultValue);
  });

  it('`instance.plugins` does not contain duplicate plugins', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      plugins: [animateFill, animateFill],
    });

    expect(instance.plugins).toEqual([animateFill]);
  });

  it('does not remove an existing `aria-expanded` attribute', () => {
    const ref = h('div', {'aria-expanded': 'true'});
    instance = createTippy(ref, {interactive: false});

    expect(ref.hasAttribute('aria-expanded')).toBe(true);
  });

  // I don't know why a TDZ error occurs due to this, it doesn't happen in the
  // browser
  it.skip('bails if props.render is not supplied', () => {
    const spy = jest.spyOn(console, 'error');
    instance = createTippy(h(), {render: null});

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage('render() function has not been supplied.')
    );
  });

  // I don't know why a TDZ error occurs due to this, it doesn't happen in the
  // browser
  it.skip('bails if props.content is not supplied', () => {
    const spy = jest.spyOn(console, 'error');
    instance = createTippy(h(), {content: null});

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage('content has not been supplied.')
    );
  });

  it('does not pass props that are `undefined`', () => {
    instance = createTippy(h(), {placement: undefined});

    expect(instance.props.placement).toBe('top');

    instance.setProps({placement: undefined});

    expect(instance.props.placement).toBe('top');
  });
});

describe('instance.destroy()', () => {
  it('sets state.isDestroyed to `true`', () => {
    instance = createTippy(h(), defaultProps);
    instance.destroy();

    expect(instance.state.isDestroyed).toBe(true);
  });

  it('deletes the `_tippy` property from the reference', () => {
    const ref = h();
    instance = createTippy(ref, defaultProps);

    expect('_tippy' in ref).toBe(true);

    instance.destroy();

    expect('_tippy' in ref).toBe(false);
  });

  it('removes listeners from the reference', () => {
    const ref = h();

    instance = createTippy(ref, {
      ...defaultProps,
      trigger: 'mouseenter',
    });

    instance.destroy();
    fireEvent.mouseEnter(ref);

    expect(instance.state.isVisible).toBe(false);
  });

  it('does nothing if the instance is already destroyed', () => {
    const ref = h();

    instance = createTippy(ref, defaultProps);
    instance.state.isDestroyed = true;
    instance.destroy();

    expect(ref._tippy).toBeDefined();
  });

  it('still unmounts the tippy if the instance is disabled', () => {
    instance = createTippy(h(), defaultProps);

    instance.show();
    instance.disable();
    instance.destroy();

    expect(instance.state.isMounted).toBe(false);
  });

  it('still unmounts the tippy if the instance is disabled', () => {
    instance = createTippy(h(), defaultProps);

    instance.show();

    jest.runAllTimers();

    instance.disable();
    instance.destroy();

    expect(instance.state.isMounted).toBe(false);
  });

  it('clears pending timeouts', () => {
    instance = createTippy(h(), {...defaultProps, delay: 500});

    const spy = jest.spyOn(instance, 'clearDelayTimeouts');

    fireEvent.mouseEnter(instance.reference);

    instance.destroy();

    jest.advanceTimersByTime(500);

    expect(spy).toHaveBeenCalled();
  });

  it('destroys popperInstance if it was created', () => {
    const spy = jest.fn();
    instance = createTippy(h(), {
      ...defaultProps,
      delay: 500,
      popperOptions: {
        modifiers: [
          {
            name: 'x',
            enabled: true,
            phase: 'afterWrite',
            fn() {},
            effect() {
              return spy;
            },
          },
        ],
      },
    });

    instance.show();
    jest.runAllTimers();
    instance.destroy();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not cause a circular call loop if called within onHidden()', () => {
    instance = createTippy(h(), {
      ...defaultProps,
      onHidden() {
        instance.destroy();
      },
    });

    instance.show();
    jest.runAllTimers();

    instance.hide();

    expect(instance.state.isDestroyed).toBe(true);
    expect(instance.state.isMounted).toBe(false);
  });
});

describe('instance.show()', () => {
  it('changes state.isVisible to `true`', () => {
    instance = createTippy(h(), defaultProps);
    instance.show();

    expect(instance.state.isVisible).toBe(true);
  });

  it('mounts the popper to the DOM', () => {
    instance = createTippy(h(), defaultProps);
    instance.show();
    jest.runAllTimers();

    expect(document.body.contains(instance.popper)).toBe(true);
  });

  it('does not show tooltip if the reference has a `disabled` attribute', () => {
    const ref = h();

    ref.setAttribute('disabled', 'disabled');
    instance = createTippy(ref, defaultProps);
    instance.show();

    expect(instance.state.isVisible).toBe(false);
  });

  it('bails out if already visible', () => {
    const spy = jest.fn();

    instance = createTippy(h(), {...defaultProps, onShow: spy});
    instance.show();
    instance.show();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('instance.hide()', () => {
  it('changes state.isVisible to false', () => {
    instance = createTippy(h(), defaultProps);
    instance.hide();

    expect(instance.state.isVisible).toBe(false);
  });

  it('removes the popper element from the DOM after hiding', () => {
    instance = createTippy(h(), {
      ...defaultProps,
    });

    instance.show();
    jest.runAllTimers();

    expect(document.body.contains(instance.popper)).toBe(true);

    instance.hide();
    jest.runAllTimers();

    expect(document.body.contains(instance.popper)).toBe(false);
  });

  it('bails out if already hidden', () => {
    const spy = jest.fn();

    instance = createTippy(h(), {...defaultProps, onHide: spy});
    instance.hide();
    instance.hide();

    expect(spy).toHaveBeenCalledTimes(0);

    instance.show();
    instance.hide();
    instance.hide();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('instance.enable()', () => {
  it('sets state.isEnabled to `true`', () => {
    instance = createTippy(h(), defaultProps);
    instance.enable();

    expect(instance.state.isEnabled).toBe(true);
  });

  it('allows a tippy to be shown', () => {
    instance = createTippy(h(), defaultProps);
    instance.enable();
    instance.show();

    expect(instance.state.isVisible).toBe(true);
  });
});

describe('instance.disable()', () => {
  it('sets state.isEnabled to `false`', () => {
    instance = createTippy(h(), defaultProps);
    instance.disable();

    expect(instance.state.isEnabled).toBe(false);
  });

  it('disallows a tippy to be shown', () => {
    instance = createTippy(h(), defaultProps);
    instance.disable();
    instance.show();

    expect(instance.state.isVisible).toBe(false);
  });

  it('hides the instance if visible', () => {
    instance = createTippy(h(), defaultProps);
    instance.show();
    instance.disable();

    expect(instance.state.isVisible).toBe(false);
  });
});

describe('instance.setProps()', () => {
  it('sets the new props by merging them with the current instance', () => {
    instance = createTippy(h(), defaultProps);

    expect(instance.props.arrow).toBe(defaultProps.arrow);
    expect(instance.props.duration).toBe(defaultProps.duration);

    instance.setProps({arrow: !defaultProps.arrow, duration: 82});

    expect(instance.props.arrow).toBe(!defaultProps.arrow);
    expect(instance.props.duration).toBe(82);
  });

  it('redraws the tooltip by creating a new popper element', () => {
    instance = createTippy(h(), defaultProps);

    expect(
      instance.popper.querySelector('.__NAMESPACE_PREFIX__-arrow')
    ).not.toBeNull();

    instance.setProps({arrow: false});

    expect(
      instance.popper.querySelector('.__NAMESPACE_PREFIX__-arrow')
    ).toBeNull();
  });

  it('popper._tippy is defined with the correct instance', () => {
    instance = createTippy(h(), defaultProps);

    instance.setProps({arrow: true});

    expect(instance.popper._tippy).toBe(instance);
  });

  it('changing `trigger` or `touchHold` changes listeners', () => {
    const ref = h();
    instance = createTippy(ref, defaultProps);

    instance.setProps({trigger: 'click'});
    fireEvent.mouseEnter(ref);

    expect(instance.state.isVisible).toBe(false);

    fireEvent.click(ref);
    expect(instance.state.isVisible).toBe(true);
  });

  it('does nothing if the instance is destroyed', () => {
    instance = createTippy(h(), defaultProps);

    instance.destroy();
    instance.setProps({content: 'hello'});

    expect(instance.props.content).not.toBe('hello');
  });

  it('correctly removes stale `aria-expanded` attributes', () => {
    instance = createTippy(h(), {...defaultProps, interactive: true});
    const triggerTarget = h();

    expect(instance.reference.getAttribute('aria-expanded')).toBe('false');

    instance.setProps({interactive: false});

    expect(instance.reference.getAttribute('aria-expanded')).toBe(null);

    instance.setProps({triggerTarget, interactive: true});

    expect(instance.reference.getAttribute('aria-expanded')).toBe(null);
    expect(triggerTarget.getAttribute('aria-expanded')).toBe('false');

    instance.setProps({triggerTarget: null});

    expect(instance.reference.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('instance.setContent()', () => {
  it('works like set({ content: newContent })', () => {
    instance = createTippy(h(), defaultProps);

    const content = 'Hello!';
    instance.setContent(content);

    expect(instance.props.content).toBe(content);
    expect(getChildren(instance.popper).content.textContent).toBe(content);

    const div = document.createElement('div');
    instance.setContent(div);

    expect(instance.props.content).toBe(div);
    expect(getChildren(instance.popper).content.firstElementChild).toBe(div);
  });
});

describe('instance.state', () => {
  it('isEnabled', () => {
    instance = createTippy(h(), defaultProps);
    instance.show();

    expect(instance.state.isVisible).toBe(true);

    instance.state.isEnabled = false;
    instance.hide();

    expect(instance.state.isVisible).toBe(true);

    instance.state.isEnabled = true;
    instance.hide();

    expect(instance.state.isVisible).toBe(false);

    instance.state.isEnabled = false;
    instance.show();

    expect(instance.state.isVisible).toBe(false);
  });

  it('isVisible', () => {
    instance = createTippy(h(), defaultProps);
    instance.show();

    expect(instance.state.isVisible).toBe(true);

    instance.hide();

    expect(instance.state.isVisible).toBe(false);
  });

  it('isShown', () => {
    instance = createTippy(h(), defaultProps);
    instance.show();

    expect(instance.state.isShown).toBe(false);

    jest.runAllTimers();

    expect(instance.state.isShown).toBe(true);

    instance.hide();

    expect(instance.state.isShown).toBe(false);
  });
});

describe('mountedInstances', () => {
  it('should correctly add and clear instances', () => {
    instance = createTippy(h(), defaultProps);

    instance.show();
    jest.runAllTimers();

    expect(mountedInstances[0]).toBe(instance);

    const instance2 = createTippy(h(), defaultProps);

    instance2.show();
    jest.runAllTimers();

    expect(mountedInstances[0]).toBe(instance);
    expect(mountedInstances[1]).toBe(instance2);

    instance.destroy();

    expect(mountedInstances[0]).toBe(instance2);

    instance2.hide();

    expect(mountedInstances.length).toBe(0);

    instance2.destroy();
  });
});

describe('updateIOSClass', () => {
  beforeEach(enableTouchEnvironment);
  afterEach(disableTouchEnvironment);

  // TODO: figure out why this no longer works. The `platform` property is empty
  it.skip('should add on mount and remove on unmount', () => {
    instance = createTippy(h(), defaultProps);

    instance.show();
    jest.runAllTimers();

    expect(document.body.classList.contains(IOS_CLASS)).toBe(true);

    instance.hide();

    expect(document.body.classList.contains(IOS_CLASS)).toBe(false);
  });

  // TODO: figure out why this no longer works. The `platform` property is empty
  it.skip('should only remove if mountedInstances.length is 0', () => {
    instance = createTippy(h(), defaultProps);
    const instance2 = createTippy(h(), defaultProps);

    instance.show();
    instance2.show();
    jest.runAllTimers();

    expect(document.body.classList.contains(IOS_CLASS)).toBe(true);

    instance.hide();

    expect(document.body.classList.contains(IOS_CLASS)).toBe(true);

    instance2.destroy();

    expect(document.body.classList.contains(IOS_CLASS)).toBe(false);
  });
});

describe('instance.unmount()', () => {
  it('unmounts the tippy from the DOM', () => {
    instance = createTippy(h(), defaultProps);

    instance.show();
    jest.runAllTimers();

    expect(document.body.contains(instance.popper)).toBe(true);

    instance.unmount();

    expect(document.body.contains(instance.popper)).toBe(false);
  });

  it('unmounts subtree poppers', () => {
    const content = h();
    const subNode = h();

    content.appendChild(subNode);

    const subInstance = createTippy(subNode, {
      ...defaultProps,
      interactive: true,
    });

    subInstance.show();
    jest.runAllTimers();

    instance = createTippy(h(), {...defaultProps, content});

    instance.show();
    jest.runAllTimers();

    expect(document.body.contains(instance.popper)).toBe(true);
    expect(document.body.contains(subInstance.popper)).toBe(true);

    instance.unmount();

    expect(document.body.contains(instance.popper)).toBe(false);
    expect(instance.popper.contains(subInstance.popper)).toBe(false);
  });
});
