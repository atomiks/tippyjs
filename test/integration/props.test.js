import {fireEvent, createEvent} from '@testing-library/dom';
import {h, enableTouchEnvironment, disableTouchEnvironment} from '../utils';

import tippy from '../../src';
import {getChildren} from '../../src/template';
import {getFormattedMessage} from '../../src/validation';

// =============================================================================
// Key props
// =============================================================================
describe('appendTo', () => {
  describe('Element', () => {
    it('appends the tippy to the node', () => {
      const node = h();
      const instance = tippy(h(), {appendTo: node});

      instance.show();
      jest.runAllTimers();

      expect(node.contains(instance.popper)).toBe(true);
    });
  });

  describe('Function', () => {
    it('appends the tippy to the node', () => {
      const node = h();
      const instance = tippy(h(), {appendTo: () => node});

      instance.show();
      jest.runAllTimers();

      expect(node.contains(instance.popper)).toBe(true);
    });
  });

  describe('"parent"', () => {
    it('appends the tippy to the node', () => {
      const node = h();
      const instance = tippy(h('div', {}, node), {appendTo: 'parent'});

      instance.show();
      jest.runAllTimers();

      expect(node.parentNode.contains(instance.popper)).toBe(true);
    });
  });
});

describe('aria', () => {
  describe('content', () => {
    it('works correctly with "describedby"', () => {
      const instance = tippy(h(), {
        aria: {content: 'describedby'},
      });

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.getAttribute('aria-describedby')).toBe(
        `__NAMESPACE_PREFIX__-${instance.id}`
      );
    });

    it('works correctly with "labelledby"', () => {
      const instance = tippy(h(), {
        aria: {content: 'labelledby'},
      });

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.getAttribute('aria-labelledby')).toBe(
        `__NAMESPACE_PREFIX__-${instance.id}`
      );
    });

    it('does not add `aria-expanded` attribute by default', () => {
      const instance = tippy(h());

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.hasAttribute('aria-expanded')).toBe(false);
    });
  });

  describe('expanded', () => {
    it('does not set any attribute if `null` by default', () => {
      const instance = tippy(h());

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.hasAttribute('aria-expanded')).toBe(false);
    });

    it('sets the attribute if interactive by default', () => {
      const instance = tippy(h(), {interactive: true});

      expect(instance.reference.getAttribute('aria-expanded')).toBe('false');

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.getAttribute('aria-expanded')).toBe('true');
    });

    it('does not set attribute if interactive and explicitly set to false', () => {
      const instance = tippy(h(), {
        interactive: true,
        aria: {expanded: false},
      });

      expect(instance.reference.hasAttribute('aria-expanded')).toBe(false);

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.hasAttribute('aria-expanded')).toBe(false);
    });
  });
});

describe('content', () => {
  describe('string', () => {
    it('is injected into the tippy node', () => {
      const instance = tippy(h(), {content: 'string'});

      instance.show();
      jest.runAllTimers();

      expect(getChildren(instance.popper).content).toMatchSnapshot();
    });
  });

  describe('Element', () => {
    it('is injected into the tippy node', () => {
      const node = h();
      node.textContent = 'string';
      const instance = tippy(h(), {content: node});

      instance.show();
      jest.runAllTimers();

      expect(getChildren(instance.popper).content).toMatchSnapshot();
    });
  });

  describe('DocumentFragment', () => {
    it('is injected into the tippy node', () => {
      const fragment = document.createDocumentFragment();
      const node = h();
      fragment.appendChild(node);
      const instance = tippy(h(), {content: fragment});

      expect(getChildren(instance.popper).content).toMatchSnapshot();
    });
  });

  describe('Function', () => {
    it('is injected into the tippy node', () => {
      const instance = tippy(h(), {content: () => 'string'});

      instance.show();
      jest.runAllTimers();

      expect(getChildren(instance.popper).content).toMatchSnapshot();
    });
  });
});

describe('delay', () => {
  describe('number', () => {
    it('delays after a trigger', () => {
      const instance = tippy(h(), {delay: 128});

      fireEvent.mouseEnter(instance.reference);
      jest.advanceTimersByTime(127);

      expect(instance.state.isVisible).toBe(false);

      jest.advanceTimersByTime(1);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseLeave(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      jest.advanceTimersByTime(127);

      expect(instance.state.isVisible).toBe(true);

      jest.advanceTimersByTime(1);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('tuple', () => {
    it('delays after a trigger', () => {
      const instance = tippy(h(), {delay: [242, 199]});

      fireEvent.mouseEnter(instance.reference);
      jest.advanceTimersByTime(241);

      expect(instance.state.isVisible).toBe(false);

      jest.advanceTimersByTime(1);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseLeave(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      jest.advanceTimersByTime(198);

      expect(instance.state.isVisible).toBe(true);

      jest.advanceTimersByTime(1);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  it('is cleared if untriggered before timeout finishes', () => {
    const instance = tippy(h(), {delay: 128});

    fireEvent.mouseEnter(instance.reference);
    jest.advanceTimersByTime(100);

    fireEvent.mouseLeave(instance.reference);
    jest.advanceTimersByTime(28);

    expect(instance.state.isVisible).toBe(false);
  });

  it('is cleared if the cursor leaves the popper then re-enters', () => {
    const instance = tippy(h(), {delay: [0, 100], interactive: true});

    fireEvent.mouseEnter(instance.reference);
    jest.runAllTimers();

    fireEvent.mouseEnter(instance.popper);
    fireEvent.mouseLeave(instance.popper);
    jest.advanceTimersByTime(99);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseEnter(instance.popper);
    jest.advanceTimersByTime(1);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.popper);
    fireEvent.mouseMove(document.body, {clientX: 1000, clientY: 1000});
    jest.advanceTimersByTime(100);

    expect(instance.state.isVisible).toBe(false);
  });
});

describe('duration', () => {
  describe('number', () => {
    it('sets the CSS transition duration', () => {
      const instance = tippy(h(), {duration: 59});
      const box = getChildren(instance.popper).box;

      instance.show();
      jest.runAllTimers();

      expect(box.style.transitionDuration).toBe('59ms');

      instance.hide();

      expect(box.style.transitionDuration).toBe('59ms');
    });
  });

  describe('tuple', () => {
    it('sets the CSS transition duration', () => {
      const instance = tippy(h(), {duration: [1, 218]});
      const box = getChildren(instance.popper).box;

      instance.show();
      jest.runAllTimers();

      expect(box.style.transitionDuration).toBe('1ms');

      instance.hide();

      expect(box.style.transitionDuration).toBe('218ms');
    });
  });
});

describe('getReferenceClientRect', () => {
  it('sets a virtual element as the popperInstance reference', () => {
    const getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });

    const instance = tippy(h(), {
      getReferenceClientRect: getBoundingClientRect,
    });

    instance.show();
    jest.runAllTimers();

    expect(
      instance.popperInstance.state.elements.reference.getBoundingClientRect
    ).toBe(getBoundingClientRect);
  });

  it('leaves the popperInstance reference as default when null', () => {
    const instance = tippy(h());

    instance.show();
    jest.runAllTimers();

    expect(instance.popperInstance.state.elements.reference).toBe(
      instance.reference
    );
  });
});

describe('onClickOutside', () => {
  it('should be called on document mousedown if provided', () => {
    const onClickOutside = jest.fn();
    const instance = tippy(h(), {onClickOutside});

    instance.show();
    jest.runAllTimers();
    const outsideClickEvent = createEvent.mouseDown(document.body);
    fireEvent(document.body, outsideClickEvent);
    // fire events multiple times to be sure its called once
    fireEvent(document.body, outsideClickEvent);
    fireEvent(document.body, outsideClickEvent);

    expect(onClickOutside).toHaveBeenCalledTimes(1);
    expect(onClickOutside).toHaveBeenCalledWith(instance, outsideClickEvent);
  });

  it('should not be called if instance not shown', () => {
    const onClickOutside = jest.fn();
    tippy(h(), {onClickOutside});

    fireEvent.mouseDown(document.body);

    expect(onClickOutside).toHaveBeenCalledTimes(0);
  });

  it('should not be called if instance already hidden', () => {
    const onClickOutside = jest.fn();
    const instance = tippy(h(), {onClickOutside});

    instance.show();
    jest.runAllTimers();
    instance.hide();
    jest.runAllTimers();
    fireEvent.mouseDown(document.body);

    expect(onClickOutside).toHaveBeenCalledTimes(0);
  });
});

describe('hideOnClick', () => {
  describe('true', () => {
    it('hides the tippy on outside mousedown', () => {
      const instance = tippy(h(), {hideOnClick: true});

      instance.show();
      jest.runAllTimers();
      fireEvent.mouseDown(document.body);

      expect(instance.state.isVisible).toBe(false);
    });

    it('hides the tippy on inside mousedown', () => {
      const instance = tippy(h(), {hideOnClick: true});

      instance.show();
      jest.runAllTimers();
      fireEvent.mouseDown(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });

    it('does not hide tippy upon clicking popper', () => {
      const instance = tippy(h(), {hideOnClick: true, interactive: true});

      instance.show();
      jest.runAllTimers();
      fireEvent.mouseDown(instance.popper);

      expect(instance.state.isVisible).toBe(true);
    });

    it('does not hide on unintentional tap outside', () => {
      const instance = tippy(h(), {hideOnClick: true});

      instance.show();
      jest.runAllTimers();

      fireEvent.touchStart(instance.popper);
      fireEvent.touchMove(instance.popper);
      fireEvent.touchEnd(instance.popper);

      expect(instance.state.isVisible).toBe(true);
    });

    it('hides on intentional tap outside', () => {
      const instance = tippy(h(), {hideOnClick: true});

      instance.show();
      jest.runAllTimers();

      fireEvent.touchStart(instance.popper);
      fireEvent.touchEnd(instance.popper);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('false', () => {
    it('does not hide the tippy on outside mousedown', () => {
      const instance = tippy(h(), {hideOnClick: false});

      instance.show();
      jest.runAllTimers();
      fireEvent.mouseDown(document.body);

      expect(instance.state.isVisible).toBe(true);
    });

    it('does not hide the tippy on inside mousedown', () => {
      const instance = tippy(h(), {hideOnClick: false});

      instance.show();
      jest.runAllTimers();
      fireEvent.mouseDown(instance.reference);

      expect(instance.state.isVisible).toBe(true);
    });
  });

  describe('"toggle"', () => {
    it('does not hide the tippy on outside mousedown', () => {
      const instance = tippy(h(), {hideOnClick: 'toggle'});

      instance.show();
      jest.runAllTimers();
      fireEvent.mouseDown(document.body);

      expect(instance.state.isVisible).toBe(true);
    });

    it('hides the tippy on inside click', () => {
      const instance = tippy(h(), {
        hideOnClick: 'toggle',
        trigger: 'click',
      });

      instance.show();
      jest.runAllTimers();
      fireEvent.click(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });
});

describe('ignoreAttributes', () => {
  describe('true', () => {
    it('ignores data-tippy-* attributes on the reference', () => {
      const instance = tippy(h('div', {'data-tippy-animation': 'x'}), {
        animation: 'y',
        ignoreAttributes: true,
      });

      expect(instance.props.animation).toBe('y');
    });
  });

  describe('false', () => {
    it('does not ignore data-tippy-* attributes on the reference', () => {
      const instance = tippy(h('div', {'data-tippy-animation': 'x'}), {
        animation: 'y',
        ignoreAttributes: false,
      });

      expect(instance.props.animation).toBe('x');
    });
  });
});

describe('interactive', () => {
  describe('false', () => {
    it('sets pointer-events: none styles on show', () => {
      const instance = tippy(h(), {interactive: false});

      instance.show();

      expect(instance.popper.style.pointerEvents).toBe('none');
    });

    it('does not add `aria-expanded` attribute', () => {
      const instance = tippy(h(), {interactive: false});

      expect(instance.reference.getAttribute('aria-expanded')).toBe(null);

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.getAttribute('aria-expanded')).toBe(null);
    });
  });

  describe('true', () => {
    it('sets no pointer-events styles on show', () => {
      const instance = tippy(h(), {interactive: true});

      instance.show();

      expect(instance.popper.style.pointerEvents).toBe('');
    });

    it('sets pointer-events styles to none on hide', () => {
      const instance = tippy(h(), {interactive: true});

      instance.show();
      jest.runAllTimers();
      instance.hide();

      expect(instance.popper.style.pointerEvents).toBe('none');
    });

    it('appends the tippy to the reference parent', () => {
      const parentNode = h();
      const instance = tippy(h('div', {}, parentNode), {interactive: true});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      expect(parentNode.contains(instance.popper)).toBe(true);
    });

    it('does not cause the tippy to hide when clicked inside', () => {
      const instance = tippy(h(), {interactive: true});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      fireEvent.click(instance.popper);

      expect(instance.state.isVisible).toBe(true);
    });

    it('tippy does not hide as cursor moves over it or the reference', () => {
      const instance = tippy(h(), {interactive: true});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      fireEvent.mouseLeave(instance.reference);
      fireEvent.mouseMove(instance.popper);
      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseMove(getChildren(instance.popper).box);
      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseMove(instance.reference);
      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseMove(document.body, {clientX: 1000, clientY: 1000});
      expect(instance.state.isVisible).toBe(false);
    });

    it('handles the `aria-expanded` attribute', () => {
      const instance = tippy(h(), {interactive: true});
      const triggerTarget = h();

      expect(instance.reference.getAttribute('aria-expanded')).toBe('false');

      instance.show();
      jest.runAllTimers();

      expect(instance.reference.getAttribute('aria-expanded')).toBe('true');

      instance.hide();

      expect(instance.reference.getAttribute('aria-expanded')).toBe('false');

      instance.setProps({triggerTarget});

      fireEvent.mouseEnter(triggerTarget);
      jest.runAllTimers();

      expect(instance.reference.getAttribute('aria-expanded')).toBe(null);
      expect(triggerTarget.getAttribute('aria-expanded')).toBe('true');

      instance.hide();

      expect(triggerTarget.getAttribute('aria-expanded')).toBe('false');
    });

    it('true: warns if tippy is not accessible', () => {
      const instance = tippy(h(), {interactive: true});

      const inbetweenNode = h();
      instance.reference.parentNode.appendChild(inbetweenNode);

      instance.show();
      jest.runAllTimers();

      expect(console.warn).toHaveBeenCalledWith(
        ...getFormattedMessage(
          [
            'Interactive tippy element may not be accessible via keyboard',
            'navigation because it is not directly after the reference element',
            'in the DOM source order.',
            '\n\n',
            'Using a wrapper <div> or <span> tag around the reference element',
            'solves this by creating a new parentNode context.',
            '\n\n',
            'Specifying `appendTo: document.body` silences this warning, but it',
            'assumes you are using a focus management solution to handle',
            'keyboard navigation.',
            '\n\n',
            'See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity',
          ].join(' ')
        )
      );

      instance.reference.parentNode.removeChild(inbetweenNode);
    });

    it('it cleans up correctly if cursor entered and left before show with `delay`', () => {
      const instance = tippy(h(), {interactive: true, delay: 100});

      fireEvent.mouseEnter(instance.reference);
      fireEvent.mouseLeave(instance.reference);

      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(false);
    });

    it('handles `aria-expanded` attribute correctly with .setProps()', () => {
      const instance = tippy(h(), {interactive: true});

      expect(instance.reference.getAttribute('aria-expanded')).not.toBe(null);

      instance.setProps({interactive: false});

      expect(instance.reference.getAttribute('aria-expanded')).toBe(null);
    });
  });
});

describe('interactiveBorder', () => {
  // TODO
});

describe('interactiveDebounce', () => {
  it('debounces the internal mousemove listener', () => {
    const instance = tippy(h(), {interactive: true, interactiveDebounce: 500});

    fireEvent.mouseEnter(instance.reference);
    jest.runAllTimers();

    fireEvent.mouseLeave(instance.reference);
    fireEvent.mouseMove(document.body, {clientX: 1000, clientY: 1000});
    jest.advanceTimersByTime(499);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseMove(document.body, {clientX: 1000, clientY: 1000});
    jest.advanceTimersByTime(1);

    expect(instance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(498);

    expect(instance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(1);

    expect(instance.state.isVisible).toBe(false);
  });
});

describe('moveTransition', () => {
  it('sets the transition on the popper element', () => {
    const instance = tippy(h(), {moveTransition: 'transform 0.5s ease'});

    instance.show();
    jest.runAllTimers();

    expect(instance.popper.style.transition).toBe('transform 0.5s ease');
  });

  it('disables the "computeStyles" modifier\'s `adaptive` option', () => {
    const instance = tippy(h(), {moveTransition: 'transform 0.5s ease'});

    instance.show();
    jest.runAllTimers();

    expect(
      instance.popperInstance.state.options.modifiers.find(
        (modifier) => modifier.name === 'computeStyles'
      ).options.adaptive
    ).toBe(false);
  });
});

describe('offset', () => {
  it('is placed in the offset modifier', () => {
    const instance = tippy(h(), {offset: [5, 20]});

    instance.show();
    jest.runAllTimers();

    expect(
      instance.popperInstance.state.options.modifiers.find(
        (modifier) => modifier.name === 'offset'
      ).options.offset
    ).toEqual([5, 20]);
  });
});

describe('onAfterUpdate', () => {
  it('is called after the instance props change', () => {
    const onAfterUpdate = jest.fn(() => {
      expect(instance.props.content).toBe('next');
    });
    const instance = tippy(h(), {
      content: 'prev',
      onAfterUpdate,
    });

    const props = {content: 'next'};
    instance.setProps(props);

    expect(onAfterUpdate).toHaveBeenCalledTimes(1);
    expect(onAfterUpdate).toHaveBeenCalledWith(instance, props);
  });
});

describe('onBeforeUpdate', () => {
  it('is called before the instance props change', () => {
    const onBeforeUpdate = jest.fn(() => {
      expect(instance.props.content).toBe('prev');
    });
    const instance = tippy(h(), {
      content: 'prev',
      onBeforeUpdate,
    });

    const props = {content: 'next'};
    instance.setProps(props);

    expect(onBeforeUpdate).toHaveBeenCalledTimes(1);
    expect(onBeforeUpdate).toHaveBeenCalledWith(instance, props);
  });
});

describe('onCreate', () => {
  it('is called once the instance has been created', () => {
    const onCreate = jest.fn();
    const instance = tippy(h(), {onCreate});

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith(instance);
  });
});

describe('onDestroy', () => {
  it('is called once the instance has been destroyed', () => {
    const onDestroy = jest.fn();
    const instance = tippy(h(), {onDestroy});

    expect(onDestroy).toHaveBeenCalledTimes(0);

    instance.destroy();

    expect(onDestroy).toHaveBeenCalledTimes(1);
    expect(onDestroy).toHaveBeenCalledWith(instance);
  });
});

describe('onHidden', () => {
  it('is called once the instance is unmounted', () => {
    const onHidden = jest.fn();
    const instance = tippy(h(), {onHidden});

    instance.show();
    jest.runAllTimers();

    expect(onHidden).toHaveBeenCalledTimes(0);

    instance.hide();

    expect(onHidden).toHaveBeenCalledTimes(1);
    expect(onHidden).toHaveBeenCalledWith(instance);
  });

  it('is called once the instance is hidden', () => {
    const onHidden = jest.fn();
    const instance = tippy(h(), {onHidden});

    expect(onHidden).toHaveBeenCalledTimes(0);

    instance.show();
    jest.runAllTimers();
    instance.hide();

    expect(onHidden).toHaveBeenCalledTimes(1);
    expect(onHidden).toHaveBeenCalledWith(instance);
  });
});

describe('onHide', () => {
  it('is called once the instance starts to hide', () => {
    const onHide = jest.fn();
    const instance = tippy(h(), {onHide});

    expect(onHide).toHaveBeenCalledTimes(0);

    instance.show();
    jest.runAllTimers();
    instance.hide();

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith(instance);
  });

  // TODO: this may be a bad idea so remove it maybe; it doesn't work with
  // plugins (not composable)
  it('can cancel hiding by returning false', () => {
    const onHide = jest.fn(() => false);
    const instance = tippy(h(), {onHide});

    expect(onHide).toHaveBeenCalledTimes(0);

    instance.show();
    jest.runAllTimers();
    instance.hide();

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith(instance);
    expect(instance.state.isVisible).toBe(true);
  });
});

describe('onShow', () => {
  it('is called once the instance starts to hide', () => {
    const onShow = jest.fn();
    const instance = tippy(h(), {onShow});

    expect(onShow).toHaveBeenCalledTimes(0);

    instance.show();

    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onShow).toHaveBeenCalledWith(instance);
  });

  // TODO: this may be a bad idea so remove it maybe; it doesn't work with
  // plugins (not composable)
  it('can cancel showing by returning false', () => {
    const onShow = jest.fn(() => false);
    const instance = tippy(h(), {onShow});

    expect(onShow).toHaveBeenCalledTimes(0);

    instance.show();

    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onShow).toHaveBeenCalledWith(instance);
    expect(instance.state.isVisible).toBe(false);
  });
});

describe('onShown', () => {
  it('is called once the CSS transitions finish', () => {
    const onShown = jest.fn();
    const instance = tippy(h(), {onShown, duration: 100});

    expect(onShown).toHaveBeenCalledTimes(0);

    instance.show();
    jest.runAllTimers();
    fireEvent.transitionEnd(getChildren(instance.popper).box);

    expect(onShown).toHaveBeenCalledTimes(1);
    expect(onShown).toHaveBeenCalledWith(instance);
  });
});

describe('onTrigger', () => {
  it('is called due to a trigger event', () => {
    const onTrigger = jest.fn();
    const instance = tippy(h(), {onTrigger});

    expect(onTrigger).toHaveBeenCalledTimes(0);

    instance.show();
    jest.runAllTimers();

    expect(onTrigger).toHaveBeenCalledTimes(0);

    instance.hide();

    fireEvent.mouseEnter(instance.reference);

    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger).toHaveBeenCalledWith(
      instance,
      new MouseEvent('mouseenter')
    );
  });
});

describe('onTrigger', () => {
  it('is called due to an untrigger event', () => {
    const onUntrigger = jest.fn();
    const instance = tippy(h(), {onUntrigger});

    expect(onUntrigger).toHaveBeenCalledTimes(0);

    instance.show();
    jest.runAllTimers();

    expect(onUntrigger).toHaveBeenCalledTimes(0);

    instance.hide();

    fireEvent.mouseLeave(instance.reference);

    expect(onUntrigger).toHaveBeenCalledTimes(1);
    expect(onUntrigger).toHaveBeenCalledWith(
      instance,
      new MouseEvent('mouseleave')
    );
  });
});

describe('placement', () => {
  it('is placed in popper options', () => {
    const instance = tippy(h(), {placement: 'right'});

    instance.show();
    jest.runAllTimers();

    expect(instance.popperInstance.state.options.placement).toBe('right');
  });
});

describe('plugins', () => {
  it('is placed in instance.plugins uniquely', () => {
    const pluginA = {fn: () => ({})};
    const pluginB = {fn: () => ({})};
    const plugins = [pluginA, pluginB, pluginA];

    const instance = tippy(h(), {plugins});

    expect(instance.plugins).toEqual([pluginA, pluginB]);
  });

  it('invokes plugin fn', () => {
    const fn = jest.fn(() => ({}));
    const instance = tippy(h(), {
      plugins: [{fn}],
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(instance);
  });
});

describe('popperOptions', () => {
  it('merges modifiers correctly', () => {
    const instance = tippy(h(), {
      popperOptions: {
        strategy: 'fixed',
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['right'],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              rootBoundary: 'document',
            },
          },
          {
            name: 'offset',
            enabled: false,
          },
          {
            name: 'arrow',
            options: {
              padding: 999,
            },
          },
        ],
      },
    });

    instance.show();
    jest.runAllTimers();

    expect(instance.popperInstance.state.orderedModifiers).toMatchSnapshot();
  });
});

describe('render', () => {
  it('is used as the template creator', () => {
    const popper = h();

    const instance = tippy(h(), {
      render() {
        return {
          popper,
          update() {},
        };
      },
    });

    expect(instance.popper).toBe(popper);
  });

  it('calls the update function with (prevProps, nextProps) args', () => {
    const spy = jest.fn();

    const instance = tippy(h(), {
      render() {
        return {
          popper: h(),
          onUpdate: spy,
        };
      },
    });

    const prevProps = instance.props;
    instance.setProps({});
    const nextProps = instance.props;

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(prevProps, nextProps);
  });
});

describe('showOnCreate', () => {
  describe('true', () => {
    it('is called onCreate', () => {
      const instance = tippy(h(), {showOnCreate: true});

      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(true);
    });

    it('respects delays', () => {
      const instance = tippy(h(), {showOnCreate: true, delay: 100});

      jest.advanceTimersByTime(99);

      expect(instance.state.isVisible).toBe(false);

      jest.advanceTimersByTime(1);
      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(true);
    });
  });
});

describe('touch', () => {
  beforeEach(enableTouchEnvironment);
  afterEach(disableTouchEnvironment);

  describe('true', () => {
    it('does not prevent the instance from showing', () => {
      const instance = tippy(h(), {touch: true});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(true);
    });
  });

  describe('false', () => {
    it('prevents instance from showing', () => {
      const instance = tippy(h(), {touch: false});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('hold', () => {
    it('only shows while holding the press', () => {
      const instance = tippy(h(), {touch: 'hold'});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(false);

      fireEvent.touchStart(instance.reference);
      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(true);

      fireEvent.touchEnd(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('["hold", delay]', () => {
    it('only shows after a delay', () => {
      const instance = tippy(h(), {touch: ['hold', 500]});

      fireEvent.mouseEnter(instance.reference);
      jest.runAllTimers();

      expect(instance.state.isVisible).toBe(false);

      fireEvent.touchStart(instance.reference);
      jest.advanceTimersByTime(499);

      expect(instance.state.isVisible).toBe(false);

      jest.advanceTimersByTime(1);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.touchEnd(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });
});

describe('trigger', () => {
  describe('mouseenter', () => {
    it('is triggered and untriggered correctly', () => {
      const instance = tippy(h(), {trigger: 'mouseenter'});

      fireEvent.mouseEnter(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseLeave(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('mouseenter focus', () => {
    it('is triggered and untriggered correctly', () => {
      const instance = tippy(h(), {trigger: 'mouseenter focus'});

      fireEvent.mouseEnter(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseLeave(instance.reference);

      expect(instance.state.isVisible).toBe(false);

      fireEvent.focus(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.blur(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('focus', () => {
    it('is triggered and untriggered correctly', () => {
      const instance = tippy(h(), {trigger: 'mouseenter focus'});

      fireEvent.focus(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.blur(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('click', () => {
    it('is triggered and untriggered correctly', () => {
      const instance = tippy(h(), {trigger: 'click'});

      fireEvent.click(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.click(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });

    it('toggles on repeated clicks with inner element target', () => {
      const inner = h();
      const outer = h();
      outer.appendChild(inner);

      const instance = tippy(outer, {trigger: 'click'});

      fireEvent.mouseDown(inner, {bubbles: true});
      fireEvent.click(inner, {bubbles: true});

      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseDown(inner, {bubbles: true});
      fireEvent.click(inner, {bubbles: true});

      expect(instance.state.isVisible).toBe(false);
    });
  });

  describe('click focus', () => {
    it('does not hide immediately and can be toggled', () => {
      const instance = tippy(h(), {trigger: 'click focus'});

      fireEvent.focus(instance.reference);

      fireEvent.click(instance.reference);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.click(instance.reference);

      expect(instance.state.isVisible).toBe(false);
    });
  });
});

describe('triggerTarget', () => {
  describe('null', () => {
    it('uses the reference as the trigger target', () => {
      const instance = tippy(h(), {triggerTarget: null});

      fireEvent.mouseEnter(instance.reference);

      expect(instance.state.isVisible).toBe(true);
    });
  });

  describe('Element', () => {
    it('is used as the trigger target', () => {
      const triggerTarget = h();
      const instance = tippy(h(), {triggerTarget});

      fireEvent.mouseEnter(instance.reference);

      expect(instance.state.isVisible).toBe(false);

      fireEvent.mouseEnter(triggerTarget);

      expect(instance.state.isVisible).toBe(true);
    });
  });

  describe('Element[]', () => {
    it('is used as the trigger target', () => {
      const triggerTarget = [h(), h(), h()];
      const instance = tippy(h(), {triggerTarget});

      fireEvent.mouseEnter(instance.reference);

      expect(instance.state.isVisible).toBe(false);

      fireEvent.mouseEnter(triggerTarget[0]);

      expect(instance.state.isVisible).toBe(true);

      instance.hide();

      fireEvent.mouseEnter(triggerTarget[1]);

      expect(instance.state.isVisible).toBe(true);

      instance.hide();

      fireEvent.mouseEnter(triggerTarget[2]);

      expect(instance.state.isVisible).toBe(true);

      instance.hide();
    });
  });
});

// =============================================================================
// Render props
// =============================================================================
describe('animation', () => {
  it('is set correctly on .tippy-box', () => {
    const instance = tippy(h(), {animation: 'anything'});

    expect(
      getChildren(instance.popper).box.getAttribute('data-animation')
    ).toBe('anything');
  });
});

describe('allowHTML', () => {
  describe('true', () => {
    it('renders content as HTML', () => {
      const instance = tippy(h(), {content: '<b>hello</b>', allowHTML: true});

      expect(getChildren(instance.popper).content.querySelector('b')).not.toBe(
        null
      );
    });
  });

  describe('false', () => {
    it('renders content as HTML', () => {
      const instance = tippy(h(), {content: '<b>hello</b>', allowHTML: false});

      expect(getChildren(instance.popper).content.querySelector('b')).toBe(
        null
      );
    });
  });

  it('should update even if content does not change', () => {
    const instance = tippy(h(), {content: '<b>hello</b>', allowHTML: true});

    expect(getChildren(instance.popper).content.querySelector('b')).not.toBe(
      null
    );

    instance.setProps({allowHTML: false});

    expect(getChildren(instance.popper).content.querySelector('b')).toBe(null);
  });
});

describe('inertia', () => {
  it('sets attribute correctly on .tippy-box', () => {
    const instance = tippy(h(), {inertia: true});

    expect(getChildren(instance.popper).box.hasAttribute('data-inertia')).toBe(
      true
    );
  });

  it('is updated correctly with .setProps()', () => {
    const instance = tippy(h(), {inertia: false});

    expect(getChildren(instance.popper).box.hasAttribute('data-inertia')).toBe(
      false
    );

    instance.setProps({inertia: true});

    expect(getChildren(instance.popper).box.hasAttribute('data-inertia')).toBe(
      true
    );
  });
});

describe('arrow', () => {
  describe('true', () => {
    it('creates an arrow', () => {
      const instance = tippy(h(), {arrow: true});

      expect(getChildren(instance.popper).arrow).not.toBe(undefined);
    });
  });

  describe('false', () => {
    it('does not create an arrow', () => {
      const instance = tippy(h(), {arrow: false});

      expect(getChildren(instance.popper).arrow).toBe(undefined);
    });
  });

  describe('string', () => {
    it('creates an svg', () => {
      const instance = tippy(h(), {arrow: '<svg></svg>'});

      expect(getChildren(instance.popper).arrow.className).toBe(
        '__NAMESPACE_PREFIX__-svg-arrow'
      );
      expect(getChildren(instance.popper).arrow.querySelector('svg')).not.toBe(
        null
      );
    });
  });

  describe('Element', () => {
    it('uses an svg', () => {
      const instance = tippy(h(), {
        arrow: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      });

      expect(getChildren(instance.popper).arrow.className).toBe(
        '__NAMESPACE_PREFIX__-svg-arrow'
      );
      expect(getChildren(instance.popper).arrow.querySelector('svg')).not.toBe(
        null
      );
    });
  });

  describe('Fragment', () => {
    it('uses an svg', () => {
      const fragment = document.createDocumentFragment();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      fragment.appendChild(svg);

      const instance = tippy(h(), {
        arrow: fragment,
      });

      expect(getChildren(instance.popper).arrow.querySelector('svg')).not.toBe(
        null
      );
    });
  });

  it('is updated correctly by .setProps()', () => {
    const instance = tippy(h(), {arrow: true});

    instance.setProps({arrow: false});

    expect(getChildren(instance.popper).arrow).toBe(undefined);

    instance.setProps({arrow: '<svg></svg>'});

    expect(getChildren(instance.popper).arrow).not.toBe(undefined);

    instance.setProps({arrow: '<svg><path d="" /></svg>'});

    expect(getChildren(instance.popper).arrow.querySelector('path')).not.toBe(
      undefined
    );
  });
});

describe('content', () => {
  describe('string', () => {
    it('is injected into .tippy-content correctly', () => {
      const instance = tippy(h(), {content: 'hello'});

      expect(getChildren(instance.popper).content.textContent).toBe('hello');
    });

    it('does not render HTML by default', () => {
      const instance = tippy(h(), {content: '<b>hello</b>'});

      expect(getChildren(instance.popper).content.innerHTML).not.toBe(
        '<b>hello</b>'
      );
    });
  });

  describe('Element', () => {
    it('is injected into .tippy-content correctly', () => {
      const content = h();
      const instance = tippy(h(), {content});

      expect(getChildren(instance.popper).content.firstElementChild).toBe(
        content
      );
    });
  });

  describe('Function', () => {
    it('is called with the reference as an argument', () => {
      const node = h();
      const content = jest.fn(() => node);
      const instance = tippy(h(), {content});

      expect(getChildren(instance.popper).content.firstElementChild).toBe(node);
      expect(content).toHaveBeenCalledWith(instance.reference);
    });
  });
});

describe('maxWidth', () => {
  describe('number', () => {
    it('appends px', () => {
      const instance = tippy(h(), {maxWidth: 200});

      expect(getChildren(instance.popper).box.style.maxWidth).toBe('200px');
    });
  });

  describe('string', () => {
    it('appends directly ("none")', () => {
      const instance = tippy(h(), {maxWidth: 'none'});

      expect(getChildren(instance.popper).box.style.maxWidth).toBe('none');
    });

    it('appends directly ("10rem")', () => {
      const instance = tippy(h(), {maxWidth: '10rem'});

      expect(getChildren(instance.popper).box.style.maxWidth).toBe('10rem');
    });
  });

  it('is updated correctly by .setProps()', () => {
    const instance = tippy(h(), {maxWidth: 'none'});

    instance.setProps({maxWidth: 100});

    expect(getChildren(instance.popper).box.style.maxWidth).toBe('100px');
  });
});

describe('moveTransition', () => {
  it('is set correctly', () => {
    const instance = tippy(h(), {moveTransition: 'transform 1s ease-in'});

    instance.show();
    jest.runAllTimers();

    expect(instance.popper.style.transition).toBe('transform 1s ease-in');
  });

  it('is updated correctly by .setProps()', () => {
    const instance = tippy(h(), {moveTransition: 'transform 1s ease-in'});

    instance.setProps({moveTransition: 'none'});

    instance.show();
    jest.runAllTimers();

    expect(instance.popper.style.transition).toBe('none');
  });
});

describe('role', () => {
  it('sets role attribute', () => {
    const instance = tippy(h(), {role: 'menu'});

    expect(getChildren(instance.popper).box.getAttribute('role')).toBe('menu');
  });

  it('does not add an attribute if `null`', () => {
    const instance = tippy(h(), {role: null});

    expect(getChildren(instance.popper).box.hasAttribute('role')).toBe(false);
  });
});

describe('theme', () => {
  it('sets `data-theme` attribute correctly', () => {
    const instance = tippy(h(), {theme: 'a bunch of themes'});

    expect(getChildren(instance.popper).box.getAttribute('data-theme')).toBe(
      'a bunch of themes'
    );
  });

  it('does not add `data-theme` attribute if `null`', () => {
    const instance = tippy(h(), {theme: null});

    expect(getChildren(instance.popper).box.hasAttribute('data-theme')).toBe(
      false
    );
  });
});

describe('zIndex', () => {
  it('sets zIndex style property correctly', () => {
    const instance = tippy(h(), {zIndex: 927});

    expect(instance.popper.style.zIndex).toBe('927');
  });
});
