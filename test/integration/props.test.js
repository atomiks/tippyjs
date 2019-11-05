import {fireEvent} from '@testing-library/dom';
import {
  h,
  cleanDocumentBody,
  withTestProps,
  enableTouchEnvironment,
  disableTouchEnvironment,
  setTestDefaultProps,
} from '../utils';

import tippy from '../../src';
import {getChildren} from '../../src/popper';
import {ARROW_SELECTOR, SVG_ARROW_SELECTOR} from '../../src/constants';
import {getFormattedMessage} from '../../src/validation';

setTestDefaultProps();
jest.useFakeTimers();

afterEach(cleanDocumentBody);

describe('allowHTML', () => {
  it('false: it does not allow html content inside tooltip', () => {
    const ref = h();
    const {popper} = tippy(ref, {
      content: '<strong>content</strong>',
      allowHTML: false,
    });

    expect(getChildren(popper).content.querySelector('strong')).toBeNull();
  });

  it('true: it allows html content inside tooltip', () => {
    const ref = h();
    const {popper} = tippy(
      ref,
      withTestProps({
        content: '<strong>content</strong>',
        allowHTML: true,
      }),
    );

    expect(getChildren(popper).content.querySelector('strong')).not.toBeNull();
  });
});

describe('placement', () => {
  it('is within popper config correctly', () => {
    const ref = h();
    const {popperInstance} = tippy(ref, withTestProps({placement: 'left-end'}));

    expect(popperInstance.options.placement).toBe('left-end');
  });
});

describe('arrow', () => {
  it('true: creates an arrow element child of the popper', () => {
    const ref = h();
    const {popper} = tippy(ref, {arrow: true});

    expect(getChildren(popper).arrow).not.toBeNull();
  });

  it('false: does not create an arrow element child of the popper', () => {
    const ref = h();
    const {popper} = tippy(ref, {arrow: false});

    expect(getChildren(popper).arrow).toBeNull();
  });

  it('true: is CSS triangle', () => {
    const {popperChildren} = tippy(h(), {arrow: true});

    expect(popperChildren.arrow.matches(ARROW_SELECTOR)).toBe(true);
  });

  it('"round"', () => {
    const {popperChildren} = tippy(h(), {arrow: 'round'});
    expect(popperChildren.arrow.matches(SVG_ARROW_SELECTOR)).toBe(true);
  });

  it('string', () => {
    const svg = '<svg viewBox="0 0 20 8"><path></path></svg>';
    const {popperChildren} = tippy(h(), {arrow: svg});

    expect(popperChildren.arrow.matches(SVG_ARROW_SELECTOR)).toBe(true);
    expect(popperChildren.arrow.innerHTML).toBe(svg);
  });

  it('Element', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.appendChild(path);
    const {popperChildren} = tippy(h(), {arrow: svg});

    expect(popperChildren.arrow.firstElementChild).toBe(svg);
  });
});

describe('animation', () => {
  it('sets the data-animation attribute on the tooltip', () => {
    const animation = 'scale';
    const {tooltip} = tippy(h(), {
      animation,
    }).popperChildren;

    expect(tooltip.getAttribute('data-animation')).toBe(animation);
  });
});

describe('delay', () => {
  it('number: delays showing the tippy', () => {
    const delay = 500;
    const ref = h();
    const {state} = tippy(ref, {
      trigger: 'mouseenter',
      delay,
    });

    fireEvent.mouseEnter(ref);

    expect(state.isVisible).toBe(false);

    jest.advanceTimersByTime(delay);

    expect(state.isVisible).toBe(true);
  });

  it('number: delays hiding the tippy', async () => {
    const delay = 500;
    const instance = tippy(h(), {
      trigger: 'mouseenter',
      delay,
    });

    fireEvent.mouseEnter(instance.reference);

    jest.advanceTimersByTime(delay);

    fireEvent.mouseLeave(instance.reference);

    expect(instance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(delay);

    expect(instance.state.isVisible).toBe(false);
  });

  it('array: uses the first element as the delay when showing', () => {
    const delay = [20, 100];
    const instance = tippy(h(), {trigger: 'mouseenter', delay});

    fireEvent.mouseEnter(instance.reference);

    expect(instance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(delay[0]);

    expect(instance.state.isVisible).toBe(true);
  });

  it('array: uses the second element as the delay when hiding', () => {
    const delay = [100, 20];
    const instance = tippy(h(), {trigger: 'mouseenter', delay});

    fireEvent.mouseEnter(instance.reference);

    expect(instance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(delay[0]);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.reference);
    jest.advanceTimersByTime(delay[1]);

    expect(instance.state.isVisible).toBe(false);
  });

  it('is 0 in touch context', () => {
    tippy.currentInput.isTouch = true;

    const instance = tippy(h(), {delay: 100});

    fireEvent.mouseEnter(instance.reference);

    expect(instance.state.isVisible).toBe(true);

    tippy.currentInput.isTouch = false;
  });

  it('is 0 in keyboard context', () => {
    const instance = tippy(h(), {delay: 100});

    fireEvent.focus(instance.reference);

    expect(instance.state.isVisible).toBe(true);
  });

  it('instance does not hide if cursor returned after leaving before delay finished', () => {
    const instance = tippy(h(), {delay: 100, interactive: true});
    fireEvent.mouseEnter(instance.reference);

    jest.advanceTimersByTime(100);

    fireEvent.mouseLeave(instance.popper);
    fireEvent.mouseMove(document.body, {
      clientX: 1000,
      clientY: 1000,
    });

    expect(instance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(99);

    fireEvent.mouseEnter(instance.popper);

    jest.advanceTimersByTime(1);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.popper);
    fireEvent.mouseMove(document.body, {
      clientX: 1000,
      clientY: 1000,
    });

    jest.advanceTimersByTime(101);

    fireEvent.mouseEnter(instance.popper);

    expect(instance.state.isVisible).toBe(false);
  });

  it('trigger: "click" ignores delay hiding listeners', () => {
    const instance = tippy(h(), {
      delay: 100,
      interactive: true,
      trigger: 'click',
    });

    fireEvent.click(instance.reference);
    jest.advanceTimersByTime(100);

    fireEvent.mouseLeave(instance.popper);
    fireEvent.mouseMove(document.body, {
      clientX: 1000,
      clientY: 1000,
    });

    expect(instance.state.isVisible).toBe(true);

    jest.advanceTimersByTime(99);

    fireEvent.mouseEnter(instance.popper);

    jest.advanceTimersByTime(1);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.popper);
    fireEvent.mouseMove(document.body, {
      clientX: 1000,
      clientY: 1000,
    });

    jest.advanceTimersByTime(101);

    fireEvent.mouseEnter(instance.popper);

    expect(instance.state.isVisible).toBe(true);
  });

  it('is respected by `showOnCreate` prop', () => {
    const instance = tippy(h(), {
      delay: 100,
      showOnCreate: true,
    });

    jest.advanceTimersByTime(99);

    expect(instance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);

    expect(instance.state.isVisible).toBe(true);
  });
});

describe('content', () => {
  it('works with plain string', () => {
    const {content} = tippy(h(), {
      content: 'tooltip',
    }).popperChildren;
    expect(content.textContent).toBe('tooltip');
  });

  it('works with HTML string', () => {
    const {content} = tippy(h(), {
      content: '<strong>tooltip</strong>',
    }).popperChildren;

    expect(content.querySelector('strong')).not.toBeNull();
  });

  it('works with an HTML element', () => {
    const el = document.createElement('div');
    const {content} = tippy(h(), {
      content: el,
    }).popperChildren;

    expect(content.firstElementChild).toBe(el);
  });

  it('works with a function', () => {
    const instance = tippy(h('div', {title: 'test'}), {
      content(reference) {
        return reference.getAttribute('title');
      },
    });

    expect(instance.props.content).toBe('test');
    expect(instance.popperChildren.content.textContent).toBe('test');
  });

  it('works as a function with instance.setProps() / instance.setContent()', () => {
    const instance = tippy(h('div', {title: 'test'}), {
      content(reference) {
        return reference.getAttribute('title');
      },
    });

    instance.setProps({
      content() {
        return 'set';
      },
    });

    expect(instance.props.content).toBe('set');
    expect(instance.popperChildren.content.textContent).toBe('set');

    instance.setContent(() => 'setContent');

    expect(instance.props.content).toBe('setContent');
    expect(instance.popperChildren.content.textContent).toBe('setContent');
  });
});

describe('trigger', () => {
  it('default: many triggers', () => {
    const instance = tippy(h());

    fireEvent.mouseEnter(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.focus(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.blur(instance.reference);
    expect(instance.state.isVisible).toBe(false);
  });

  it('mouseenter', () => {
    const instance = tippy(h(), {trigger: 'mouseenter'});

    fireEvent.mouseEnter(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(instance.reference);
    expect(instance.state.isVisible).toBe(false);
  });

  it('focus', () => {
    const instance = tippy(h(), {trigger: 'focus'});

    fireEvent.focus(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.blur(instance.reference);
    expect(instance.state.isVisible).toBe(false);
  });

  it('focus + interactive: focus switching to inside popper does not hide tippy', () => {
    const instance = tippy(h(), {interactive: true, trigger: 'focus'});

    fireEvent.focus(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.blur(instance.reference, {
      relatedTarget: instance.popper,
    });
    expect(instance.state.isVisible).toBe(true);
  });

  it('click', () => {
    const instance = tippy(h(), {trigger: 'click'});

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(false);
  });

  it('manual', () => {
    const instance = tippy(h(), {trigger: 'manual'});

    fireEvent.mouseEnter(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.focus(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.click(instance.reference);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.touchStart(instance.reference);
    expect(instance.state.isVisible).toBe(false);
  });
});

describe('interactive', () => {
  it('true: prevents a tippy from hiding when clicked', () => {
    const instance = tippy(h(), {interactive: true});

    instance.show();
    fireEvent.click(instance.popperChildren.tooltip);

    expect(instance.state.isVisible).toBe(true);
  });

  it('false: tippy is hidden when clicked', () => {
    const instance = tippy(h(), {interactive: false});

    instance.show();
    jest.runAllTimers();

    fireEvent.mouseDown(instance.popperChildren.tooltip);

    expect(instance.state.isVisible).toBe(false);
  });

  it('tippy does not hide as cursor moves over it or the reference', () => {
    const instance = tippy(h(), {interactive: true});
    fireEvent.mouseEnter(instance.reference);

    fireEvent.mouseLeave(instance.reference);
    fireEvent.mouseMove(instance.popper);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseMove(instance.popperChildren.tooltip);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseMove(instance.reference);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseMove(document.body, {
      clientX: 1000,
      clientY: 1000,
    });
    expect(instance.state.isVisible).toBe(false);
  });

  it('true: handles the `aria-expanded` attribute', () => {
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

  it('false: does not add `aria-expanded` attribute', () => {
    const instance = tippy(h(), {interactive: false});

    expect(instance.reference.getAttribute('aria-expanded')).toBe(null);

    instance.show();
    jest.runAllTimers();

    expect(instance.reference.getAttribute('aria-expanded')).toBe(null);
  });

  it('true: with default appendTo, uses appendTo: "parent"', () => {
    const ref = h();
    const container = h('div');

    container.appendChild(ref);
    document.body.appendChild(container);

    const instance = tippy(ref, {interactive: true});

    instance.show();
    jest.runAllTimers();

    expect(instance.popper.parentNode).toBe(container);

    document.body.removeChild(container);
  });

  it('true: warns if tippy is not accessible', () => {
    const instance = tippy(h(), {interactive: true});

    const inbetweenNode = h();
    instance.reference.parentNode.appendChild(inbetweenNode);

    const spy = jest.spyOn(console, 'warn');

    instance.show();
    jest.runAllTimers();

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage(
        `Interactive tippy element may not be accessible via keyboard
        navigation because it is not directly after the reference element in
        the DOM source order.

        Using a wrapper <div> or <span> tag around the reference element solves
        this by creating a new parentNode context.

        Specifying \`appendTo: document.body\` silences this warning, but it
        assumes you are using a focus management solution to handle keyboard
        navigation.

        See: https://atomiks.github.io/tippyjs/accessibility/#interactivity`,
      ),
    );

    instance.reference.parentNode.removeChild(inbetweenNode);

    spy.mockRestore();
  });

  it('handles `aria-expanded` attribute correctly with .setProps()', () => {
    const instance = tippy(h(), {interactive: true});

    expect(instance.reference.getAttribute('aria-expanded')).not.toBe(null);

    instance.setProps({interactive: false});

    expect(instance.reference.getAttribute('aria-expanded')).toBe(null);
  });
});

describe('theme', () => {
  it('adds themes to the tooltip class list', () => {
    const {
      popperChildren: {tooltip},
    } = tippy(h(), {
      theme: 'this is a test',
    });

    expect(tooltip.classList.contains('this-theme')).toBe(true);
    expect(tooltip.classList.contains('is-theme')).toBe(true);
    expect(tooltip.classList.contains('a-theme')).toBe(true);
    expect(tooltip.classList.contains('test-theme')).toBe(true);
  });
});

describe('role', () => {
  it('sets "role" attribute to popper element', () => {
    const {
      popperChildren: {tooltip: a},
    } = tippy(h(), {role: 'menu'});

    expect(a.getAttribute('role')).toBe('menu');

    const {
      popperChildren: {tooltip: b},
    } = tippy(h(), {role: null});

    expect(b.hasAttribute('role')).toBe(false);
  });

  it('is updated correctly by .set()', () => {
    const instance = tippy(h(), {role: 'tooltip'});

    instance.setProps({role: 'menu'});
    expect(instance.popperChildren.tooltip.getAttribute('role')).toBe('menu');

    instance.setProps({role: null});
    expect(instance.popperChildren.tooltip.hasAttribute('role')).toBe(false);
  });
});

describe('flip', () => {
  it('true: sets flip to enabled in the popperInstance', () => {
    const {popperInstance} = tippy(h(), withTestProps({flip: true}));
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      true,
    );
  });

  it('false: sets flip to disabled in the popperInstance', () => {
    const {popperInstance} = tippy(h(), withTestProps({flip: false}));
    expect(popperInstance.modifiers.find(m => m.name === 'flip').enabled).toBe(
      false,
    );
  });

  it('does not change after mounting', () => {
    const instance = tippy(h(), withTestProps({flip: false, duration: 0}));
    instance.show();

    expect(
      instance.popperInstance.modifiers.find(m => m.name === 'flip').enabled,
    ).toBe(false);
  });
});

describe('flipBehavior', () => {
  it('sets the value in the popperInstance', () => {
    const {popperInstance} = tippy(
      h(),
      withTestProps({flipBehavior: ['top', 'bottom', 'left']}),
    );

    expect(
      popperInstance.modifiers.find(m => m.name === 'flip').behavior,
    ).toEqual(['top', 'bottom', 'left']);
  });
});

describe('ignoreAttributes', () => {
  it('false: looks at data-tippy-* props', () => {
    const {props} = tippy(h('div', {'data-tippy-arrow': false}), {
      ignoreAttributes: false,
    });

    expect(props.arrow).toBe(false);
  });

  it('true: ignores data-tippy-* props', () => {
    const {props} = tippy(h('div', {'data-tippy-arrow': false}), {
      ignoreAttributes: true,
    });

    expect(props.arrow).toBe(true);
  });
});

describe('inertia', () => {
  it('true: adds a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: {tooltip},
    } = tippy(h(), {inertia: true});

    expect(tooltip.hasAttribute('data-inertia')).toBe(true);
  });

  it('false: does not add a [data-inertia] attribute to the tooltip', () => {
    const {
      popperChildren: {tooltip},
    } = tippy(h(), {inertia: false});

    expect(tooltip.hasAttribute('data-inertia')).toBe(false);
  });
});

describe('multiple', () => {
  it('true: allows multiple tippys to be created on a single reference', () => {
    const ref = h();
    expect(
      [...Array(5)].map(() => tippy(ref, {multiple: true})).filter(Boolean)
        .length,
    ).toBe(5);
  });

  it('false: does not allow multiple tippys to be created on a single reference', () => {
    const ref = h();
    expect(
      [...Array(5)].map(() => tippy(ref, {multiple: false})).filter(Boolean)
        .length,
    ).toBe(1);
  });
});

describe('zIndex', () => {
  it('sets the z-index CSS property on the popper', () => {
    const {popper} = tippy(h(), {zIndex: 82190});
    expect(popper.style.zIndex).toBe('82190');
  });
});

describe('onShow', () => {
  it('is called on show, passed the instance as an argument', () => {
    const spy = jest.fn();
    const instance = tippy(h(), {onShow: spy});

    instance.show();

    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toBeCalledWith(instance);
  });

  it('prevents the the tooltip from showing if it returns `false`', () => {
    const instance = tippy(h(), {onShow: () => false});
    instance.show();

    expect(instance.state.isVisible).toBe(false);
  });
});

describe('onMount', () => {
  it('is called once the tooltip is mounted to the DOM', done => {
    const instance = tippy(h(), {
      onMount(i) {
        expect(i).toBe(instance);
        expect(document.documentElement.contains(i.popper)).toBe(true);

        done();
      },
    });

    instance.show();
  });
});

describe('onShown', () => {
  it('is called on transition end of show, passed the instance as an argument', done => {
    const instance = tippy(h(), {
      onShown(i) {
        expect(i).toBe(instance);
        done();
      },
    });

    instance.show();
  });
});

describe('onHide', () => {
  it('is called on hide, passed the instance as an argument', () => {
    const spy = jest.fn();
    const instance = tippy(h(), {onHide: spy});

    instance.show();
    instance.hide();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalledWith(instance);
  });

  it('prevents the the tooltip from hiding if it returns `false`', () => {
    const instance = tippy(h(), {onHide: () => false});

    instance.show();
    jest.runAllTimers();
    instance.hide();

    expect(instance.state.isVisible).toBe(true);
  });
});

describe('onHidden', () => {
  it('is called on transition end of hide, passed the instance as an argument', () => {
    const spy = jest.fn();
    const instance = tippy(h(), {onHidden: spy, duration: 0});

    instance.show();
    jest.runAllTimers();
    instance.hide();
    jest.runAllTimers();

    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toBeCalledWith(instance);
  });
});

describe('onTrigger', () => {
  it('is called upon an event triggering, passed correct arguments', () => {
    const spy = jest.fn();
    const instance = tippy(h(), {onTrigger: spy});

    fireEvent.mouseEnter(instance.reference);

    expect(spy).toHaveBeenCalledWith(instance, new MouseEvent('mouseenter'));
  });

  it('is not called without an event to pass (showOnCreate)', () => {
    const spy = jest.fn();
    tippy(h(), {onTrigger: spy, showOnCreate: true});

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('onCreate', () => {
  it('is called after instance has been created', () => {
    const spy = jest.fn();
    const instance = tippy(h(), {onCreate: spy});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(instance);
  });
});

describe('onAfterUpdate', () => {
  it('is called before props are updated', done => {
    const props = {content: 'bye'};
    const instance = tippy(h(), {
      content: 'hi',
      onAfterUpdate(instance, updatedProps) {
        expect(instance.props.content).toBe('bye');
        expect(updatedProps).toBe(props);

        done();
      },
    });

    instance.setProps(props);
  });
});

describe('onBeforeUpdate', () => {
  it('is called before props are updated', done => {
    const props = {content: 'bye'};
    const instance = tippy(h(), {
      content: 'hi',
      onBeforeUpdate(instance, updatedProps) {
        expect(instance.props.content).toBe('hi');
        expect(updatedProps).toBe(props);

        done();
      },
    });

    instance.setProps(props);
  });
});

describe('popperOptions', () => {
  it('top level', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      popperOptions: {
        anything: true,
      },
    });

    expect(popperInstance.options.anything).toBe(true);
  });

  it('modifiers', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          preventOverflow: {
            escapeWithReference: true,
          },
        },
      },
    });

    expect(
      popperInstance.options.modifiers.preventOverflow.escapeWithReference,
    ).toBe(true);
  });

  it('modifiers.preventOverflow', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          preventOverflow: {
            test: true,
          },
        },
      },
    });

    expect(popperInstance.options.modifiers.preventOverflow.test).toBe(true);
  });

  it('modifiers.arrow', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          arrow: {
            test: true,
          },
        },
      },
    });

    expect(popperInstance.options.modifiers.arrow.test).toBe(true);
  });

  it('modifiers.flip', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          flip: {
            test: true,
          },
        },
      },
    });

    expect(popperInstance.options.modifiers.flip.test).toBe(true);
  });

  it('modifiers.offset', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      popperOptions: {
        modifiers: {
          offset: {
            test: true,
          },
        },
      },
    });

    expect(popperInstance.options.modifiers.offset.test).toBe(true);
  });

  it('onCreate / onUpdate', () => {
    const onCreate = jest.fn();
    const onUpdate = jest.fn();
    const instance = tippy(h(), {
      lazy: false,
      popperOptions: {onCreate, onUpdate},
    });

    jest.runAllTimers();

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    instance.show();
    jest.runAllTimers();

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledTimes(3);
  });
});

describe('maxWidth', () => {
  it('adds the value to tooltip.style.maxWidth', () => {
    const pxTip = tippy(h(), {maxWidth: '100px'});
    expect(pxTip.popperChildren.tooltip.style.maxWidth).toBe('100px');

    const remTip = tippy(h(), {maxWidth: '100rem'});
    expect(remTip.popperChildren.tooltip.style.maxWidth).toBe('100rem');
  });

  it('auto-adds "px" to a number', () => {
    const numTip = tippy(h(), {maxWidth: 100});
    expect(numTip.popperChildren.tooltip.style.maxWidth).toBe('100px');
  });
});

describe('aria', () => {
  it('sets the correct attribute on the reference', () => {
    const ref = h();
    const instance = tippy(ref, {aria: 'labelledby', duration: 0});

    instance.show();
    jest.runAllTimers();

    expect(ref.getAttribute('aria-labelledby')).toBe(
      instance.popperChildren.tooltip.id,
    );
  });

  it('removes the attribute on hide', () => {
    const ref = h();
    const instance = tippy(ref, {aria: 'labelledby', duration: 0});

    instance.show();
    jest.runAllTimers();
    instance.hide();

    expect(ref.getAttribute('aria-labelledby')).toBe(null);
  });

  it('does not set attribute for falsy/null value', () => {
    const ref = h();
    const instance = tippy(ref, {aria: null, duration: 0});

    instance.show();
    jest.runAllTimers();

    expect(ref.getAttribute('aria-null')).toBe(null);
    expect(ref.getAttribute('aria-describedby')).toBe(null);
  });

  it('handles multiple tippys using a space-separated list of ids', () => {
    const ref = h();
    const instance1 = tippy(ref, {multiple: true});
    const instance2 = tippy(ref, {multiple: true});

    instance1.show();
    instance2.show();

    jest.runAllTimers();

    const id1 = `__NAMESPACE_PREFIX__-${instance1.id}`;
    const id2 = `__NAMESPACE_PREFIX__-${instance2.id}`;

    expect(ref.getAttribute('aria-describedby')).toBe(`${id1} ${id2}`);

    instance1.hide();

    expect(ref.getAttribute('aria-describedby')).toBe(id2);

    instance2.hide();

    expect(ref.getAttribute('aria-describedby')).toBe(null);
    expect(ref.hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('boundary', () => {
  it('sets the `boundariesElement` property in popperInstance', () => {
    const {popperInstance} = tippy(h(), {
      lazy: false,
      boundary: 'example',
    });

    expect(
      popperInstance.options.modifiers.preventOverflow.boundariesElement,
    ).toBe('example');
  });
});

describe('showOnCreate', () => {
  it('shows the tooltip on init', () => {
    const instance = tippy(h(), {showOnCreate: true});
    expect(instance.state.isVisible).toBe(true);
  });
});

describe('touch', () => {
  beforeEach(enableTouchEnvironment);
  afterEach(disableTouchEnvironment);

  it('true: shows tooltips on touch device', () => {
    const instance = tippy(h(), {touch: true});

    instance.show();

    expect(instance.state.isVisible).toBe(true);
  });

  it('false: does not show tooltip on touch device', () => {
    const instance = tippy(h(), {touch: false});

    instance.show();

    expect(instance.state.isVisible).toBe(false);
  });

  it('"hold": uses `touch` listeners instead', () => {
    const ref = h();
    const instance = tippy(ref, {touch: 'hold'});

    fireEvent.mouseEnter(ref);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.focus(ref);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.touchStart(ref);
    expect(instance.state.isVisible).toBe(true);
  });

  it('"hold": hides due to the correct event', () => {
    const ref = h();
    const instance = tippy(ref, {touch: 'hold'});

    fireEvent.touchStart(ref);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseLeave(ref);
    expect(instance.state.isVisible).toBe(true);

    fireEvent.touchEnd(ref);
    expect(instance.state.isVisible).toBe(false);
  });

  it('"hold": respects duration', () => {
    const ref = h();
    const instance = tippy(ref, {touch: ['hold', 100]});

    fireEvent.touchStart(ref);
    expect(instance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(99);
    expect(instance.state.isVisible).toBe(false);

    jest.advanceTimersByTime(1);
    expect(instance.state.isVisible).toBe(true);
  });

  it('"hold": timeout is cancelled correctly', () => {
    const ref = h();
    const instance = tippy(ref, {touch: ['hold', 100]});

    fireEvent.touchStart(ref);
    expect(instance.state.isVisible).toBe(false);

    fireEvent.touchEnd(ref);
    jest.advanceTimersByTime(100);
    expect(instance.state.isVisible).toBe(false);
  });
});

describe('appendTo', () => {
  it('"parent" appends to parentNode', done => {
    const ref = h();
    const instance = tippy(ref, {
      appendTo: 'parent',
      onMount() {
        expect(ref.parentNode.contains(instance.popper)).toBe(true);
        done();
      },
    });

    instance.show();
  });

  it('function', done => {
    const ref = h();
    const instance = tippy(ref, {
      appendTo: ref => ref.parentNode,
      onMount() {
        expect(ref.parentNode.contains(instance.popper)).toBe(true);
        done();
      },
    });

    instance.show();
  });

  it('element', done => {
    const ref = h();
    const instance = tippy(ref, {
      appendTo: ref.parentNode,
      onMount() {
        expect(ref.parentNode.contains(instance.popper)).toBe(true);
        done();
      },
    });

    instance.show();
  });
});

describe('triggerTarget', () => {
  it('acts as the trigger for the tooltip instead of the reference', () => {
    const node = h('div');
    const instance = tippy(h(), {triggerTarget: node});

    fireEvent.mouseEnter(instance.reference);

    expect(instance.state.isVisible).toBe(false);

    fireEvent.mouseEnter(node);

    expect(instance.state.isVisible).toBe(true);
  });

  it('updates accordingly with instance.setProps()', () => {
    const node = h('div');
    const node2 = h('button');
    const instance = tippy(h(), {triggerTarget: node});

    instance.setProps({triggerTarget: node2});

    fireEvent.mouseEnter(node);

    expect(instance.state.isVisible).toBe(false);

    fireEvent.mouseEnter(node2);

    expect(instance.state.isVisible).toBe(true);
  });

  it('works as an array of nodes', () => {
    const nodes = Array(4)
      .fill()
      .map(() => h());
    const instance = tippy(h(), {triggerTarget: nodes});

    nodes.forEach(node => {
      fireEvent.mouseEnter(instance.reference);

      expect(instance.state.isVisible).toBe(false);

      fireEvent.mouseEnter(node);

      expect(instance.state.isVisible).toBe(true);

      fireEvent.mouseLeave(node);

      expect(instance.state.isVisible).toBe(false);
    });
  });
});

describe('hideOnClick', () => {
  it('true: hides if reference element was clicked', () => {
    const instance = tippy(h(), {hideOnClick: true});

    instance.show();
    fireEvent.mouseDown(instance.reference);

    expect(instance.state.isVisible).toBe(false);
  });

  it('true: does not hide if interactive and popper element child was clicked', () => {
    const instance = tippy(h(), {hideOnClick: true, interactive: true});

    instance.show();

    fireEvent.mouseDown(instance.popperChildren.tooltip);
    fireEvent.click(instance.popperChildren.tooltip);

    expect(instance.state.isVisible).toBe(true);
  });

  it('true: hides if not interactive and popper element was clicked', () => {
    const instance = tippy(h(), {hideOnClick: true, interactive: false});

    instance.show();
    jest.runAllTimers();

    fireEvent.mouseDown(instance.popperChildren.tooltip);
    fireEvent.click(instance.popperChildren.tooltip);

    expect(instance.state.isVisible).toBe(false);
  });

  it('false: does not hide if reference element was clicked', () => {
    const instance = tippy(h(), {hideOnClick: false});

    instance.show();

    fireEvent.mouseDown(instance.reference);
    fireEvent.click(instance.reference);

    expect(instance.state.isVisible).toBe(true);
  });

  it('false: never hides if trigger is `click`', () => {
    const instance = tippy(h(), {trigger: 'click', hideOnClick: false});

    instance.show();

    fireEvent.mouseDown(instance.popperChildren.tooltip);
    fireEvent.click(instance.popperChildren.tooltip);
    fireEvent.mouseDown(instance.reference);
    fireEvent.click(instance.reference);
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);

    expect(instance.state.isVisible).toBe(true);
  });

  it('"toggle": hides only if reference element was clicked', () => {
    const instance = tippy(h(), {trigger: 'click', hideOnClick: 'toggle'});

    instance.show();

    jest.runAllTimers();

    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);
    fireEvent.mouseDown(instance.popperChildren.tooltip);
    fireEvent.click(instance.popperChildren.tooltip);

    expect(instance.state.isVisible).toBe(true);

    fireEvent.mouseDown(instance.reference);
    fireEvent.click(instance.reference);

    expect(instance.state.isVisible).toBe(false);
  });

  it('handles `mousedown` -> `focus` quirk', () => {
    const instance = tippy(h(), {hideOnClick: true});

    fireEvent.mouseEnter(instance.reference);
    fireEvent.mouseDown(instance.reference);
    fireEvent.click(instance.reference);

    expect(instance.state.isVisible).toBe(false);
  });
});

describe('distance', () => {
  // currentPlacement is always `top` for these
  it('number: should set `top` on tooltip element', () => {
    const instance = tippy(h(), {distance: 100});
    const {tooltip} = instance.popperChildren;

    instance.show();
    jest.runAllTimers();

    expect(tooltip.style.top).toBe('-100px');
  });

  it('string: should set `top` on tooltip element', () => {
    const instance = tippy(h(), {distance: '5rem'});
    const {tooltip} = instance.popperChildren;

    instance.show();
    jest.runAllTimers();

    expect(tooltip.style.top).toBe(`-${5 * 16}px`);
  });
});

describe('plugins', () => {
  it('passes correctly', () => {
    const plugins = [{name: 'x', fn: () => ({})}];
    const instance = tippy(h(), {plugins});
    expect(instance.plugins).toEqual(plugins);
  });

  it('warns when changed plugins passed to .setProps()', () => {
    const instance = tippy(h(), {plugins: []});
    const spy = jest.spyOn(console, 'warn');

    instance.setProps({plugins: []});

    expect(spy).not.toHaveBeenCalledWith(
      ...getFormattedMessage('Cannot update plugins'),
    );

    instance.setProps({plugins: [{}]});

    expect(spy).toHaveBeenCalledWith(
      ...getFormattedMessage('Cannot update plugins'),
    );

    spy.mockRestore();
  });

  it('does not warn if plugin was passed', () => {
    const spy = jest.spyOn(console, 'warn');

    tippy(h(), {
      x: true,
      plugins: [{name: 'x', fn: () => ({})}],
    });

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
