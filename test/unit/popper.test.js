import {h, cleanDocumentBody} from '../utils';

import {defaultProps} from '../../src/props';
import {
  createPopperElement,
  updatePopperElement,
  createArrowElement,
  getChildren,
  addInertia,
  removeInertia,
  addInteractive,
  removeInteractive,
  setContent,
  isCursorOutsideInteractiveBorder,
  getBasePlacement,
  updateTheme,
} from '../../src/popper';
import {div} from '../../src/utils';
import {
  POPPER_SELECTOR,
  BACKDROP_SELECTOR,
  ARROW_SELECTOR,
  SVG_ARROW_SELECTOR,
} from '../../src/constants';

afterEach(cleanDocumentBody);

describe('createPopperElement', () => {
  it('returns an element', () => {
    expect(createPopperElement(1, defaultProps) instanceof Element).toBe(true);
  });

  it('always creates a tooltip element child', () => {
    const popper = createPopperElement(1, defaultProps);
    expect(getChildren(popper).tooltip).not.toBe(null);
  });

  it('sets the `id` property correctly', () => {
    const id = 1829;
    const popper = createPopperElement(id, defaultProps);
    expect(getChildren(popper).tooltip.id).toBe(`__NAMESPACE_PREFIX__-${id}`);
  });

  it('sets the `role` attribute correctly', () => {
    const popper = createPopperElement(1, defaultProps);
    expect(getChildren(popper).tooltip.getAttribute('role')).toBe('tooltip');
  });

  it('sets the className property correctly', () => {
    const popper = createPopperElement(1, defaultProps);
    expect(popper.matches(POPPER_SELECTOR)).toBe(true);
  });

  it('does not create an arrow element if props.arrow is false', () => {
    const popper = createPopperElement(1, {...defaultProps, arrow: false});
    expect(popper.querySelector(ARROW_SELECTOR)).toBe(null);
  });

  it('creates an arrow element if props.arrow is true', () => {
    const popper = createPopperElement(1, {...defaultProps, arrow: true});
    expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null);
  });

  it('sets `[data-interactive]` on the tooltip if props.interactive is true', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      interactive: true,
    });

    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      true,
    );
  });

  it('sets the correct data-* attributes on the tooltip based on props', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      animation: 'scale',
    });

    expect(getChildren(popper).tooltip.getAttribute('data-animation')).toBe(
      'scale',
    );
  });

  it('sets the correct theme class names on the tooltip based on props', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      theme: 'red firetruck',
    });

    expect(getChildren(popper).tooltip.classList.contains('red-theme')).toBe(
      true,
    );
    expect(
      getChildren(popper).tooltip.classList.contains('firetruck-theme'),
    ).toBe(true);
  });

  it('sets [data-state="hidden"] on tooltip and content elements', () => {
    const popper = createPopperElement(1, defaultProps);
    const {tooltip, content} = getChildren(popper);

    expect(tooltip.getAttribute('data-state')).toBe('hidden');
    expect(content.getAttribute('data-state')).toBe('hidden');
  });
});

describe('updatePopperElement', () => {
  it('sets new zIndex', () => {
    const popper = createPopperElement(1, defaultProps);

    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      zIndex: 213,
    });

    expect(popper.style.zIndex).toBe('213');
  });

  it('updates animation attribute', () => {
    const popper = createPopperElement(1, defaultProps);

    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      animation: 'scale',
    });

    expect(getChildren(popper).tooltip.getAttribute('data-animation')).toBe(
      'scale',
    );
  });

  it('sets new content', () => {
    const popper = createPopperElement(1, defaultProps);

    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      content: 'hello',
    });

    expect(getChildren(popper).content.textContent).toBe('hello');

    updatePopperElement(popper, defaultProps, {
      ...defaultProps,
      content: '<strong>hello</strong>',
    });

    expect(getChildren(popper).content.querySelector('strong')).not.toBe(null);
  });

  describe('diffs the arrow correctly', () => {
    it('true -> false', () => {
      const props = {...defaultProps, arrow: true};
      const popper = createPopperElement(1, props);
      updatePopperElement(popper, props, {...defaultProps, arrow: false});

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null);
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null);

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(
        false,
      );
    });

    it('false -> true', () => {
      const props = {...defaultProps, arrow: false};
      const popper = createPopperElement(1, props);

      updatePopperElement(popper, props, {...defaultProps, arrow: true});

      expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null);
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null);

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true);
    });

    it('false -> "round"', () => {
      const props = {...defaultProps, arrow: false};
      const popper = createPopperElement(1, props);

      updatePopperElement(popper, props, {...defaultProps, arrow: 'round'});

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null);
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).not.toBe(null);

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true);
    });

    it('"round" -> false', () => {
      const props = {...defaultProps, arrow: 'round'};
      const popper = createPopperElement(1, props);

      updatePopperElement(popper, props, {...defaultProps, arrow: false});

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null);
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null);

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(
        false,
      );
    });

    it('"round" -> true', () => {
      const props = {...defaultProps, arrow: 'round'};
      const popper = createPopperElement(1, props);

      updatePopperElement(popper, props, {...defaultProps, arrow: true});

      expect(popper.querySelector(ARROW_SELECTOR)).not.toBe(null);
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).toBe(null);

      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true);
    });

    it('"round" -> custom', () => {
      const props = {...defaultProps, arrow: 'round'};
      const popper = createPopperElement(1, props);

      updatePopperElement(popper, props, {
        ...defaultProps,
        arrow: document.createElement('article'),
      });

      expect(popper.querySelector(ARROW_SELECTOR)).toBe(null);
      expect(popper.querySelector(SVG_ARROW_SELECTOR)).not.toBe(null);
      expect(popper.querySelector('article')).not.toBe(null);
      expect(getChildren(popper).tooltip.hasAttribute('data-arrow')).toBe(true);
    });
  });

  it('sets interactive attribute', () => {
    const popper = createPopperElement(1, defaultProps);
    const newProps = {
      ...defaultProps,
      interactive: true,
    };

    updatePopperElement(popper, defaultProps, newProps);

    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      true,
    );

    updatePopperElement(popper, newProps, {
      ...newProps,
      interactive: false,
    });

    expect(getChildren(popper).tooltip.hasAttribute('data-interactive')).toBe(
      false,
    );
  });

  it('sets inertia attribute', () => {
    const popper = createPopperElement(1, defaultProps);
    const newProps = {
      ...defaultProps,
      inertia: true,
    };

    updatePopperElement(popper, defaultProps, newProps);

    expect(getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(true);

    updatePopperElement(popper, newProps, {
      ...newProps,
      inertia: false,
    });

    expect(getChildren(popper).tooltip.hasAttribute('data-inertia')).toBe(
      false,
    );
  });

  it('sets new theme', () => {
    const popper = createPopperElement(1, defaultProps);
    const newProps = {
      ...defaultProps,
      theme: 'my custom themes',
    };
    const classList = getChildren(popper).tooltip.classList;

    updatePopperElement(popper, defaultProps, newProps);

    expect(classList.contains('my-theme')).toBe(true);
    expect(classList.contains('custom-theme')).toBe(true);
    expect(classList.contains('themes-theme')).toBe(true);

    updatePopperElement(popper, newProps, {
      ...newProps,
      theme: 'other',
    });

    expect(classList.contains('my-theme')).toBe(false);
    expect(classList.contains('custom-theme')).toBe(false);
    expect(classList.contains('themes-theme')).toBe(false);
    expect(classList.contains('other-theme')).toBe(true);
  });
});

describe('addInteractive', () => {
  it('adds interactive attributes', () => {
    const tooltip = div();

    addInteractive(tooltip);

    expect(tooltip.hasAttribute('data-interactive')).toBe(true);
  });
});

describe('removeInteractive', () => {
  it('removes interactive attributes', () => {
    const tooltip = div();

    addInteractive(tooltip);
    removeInteractive(tooltip);

    expect(tooltip.hasAttribute('data-interactive')).toBe(false);
  });
});

describe('addInertia', () => {
  it('adds inertia attribute', () => {
    const tooltip = div();

    addInertia(tooltip);

    expect(tooltip.hasAttribute('data-inertia')).toBe(true);
  });
});

describe('removeInertia', () => {
  it('removes inertia attribute', () => {
    const tooltip = div();

    addInertia(tooltip);
    removeInertia(tooltip);

    expect(tooltip.hasAttribute('data-ineria')).toBe(false);
  });
});

describe('getChildren', () => {
  it('returns the children of the popper element, default props', () => {
    const popper = createPopperElement(1, defaultProps);
    const children = getChildren(popper);

    expect(children.tooltip).toBeDefined();
    expect(children.content).toBeDefined();
  });

  it('returns the children of the popper element, with arrow', () => {
    const popper = createPopperElement(1, {...defaultProps, arrow: true});
    const children = getChildren(popper);

    expect(children.tooltip).toBeDefined();
    expect(children.content).toBeDefined();
    expect(children.arrow).toBeDefined();
  });

  it('returns the children of the popper element, with round arrow', () => {
    const popper = createPopperElement(1, {
      ...defaultProps,
      arrow: 'round',
    });
    const children = getChildren(popper);

    expect(children.tooltip).toBeDefined();
    expect(children.content).toBeDefined();
    expect(children.arrow).toBeDefined();
  });
});

describe('createArrowElement', () => {
  it('returns a sharp arrow by default', () => {
    const arrow = createArrowElement(defaultProps.arrow);
    expect(arrow.matches(ARROW_SELECTOR)).toBe(true);
  });

  it('returns a round arrow if "round" is passed as argument', () => {
    const roundArrow = createArrowElement('round');
    expect(roundArrow.matches(SVG_ARROW_SELECTOR)).toBe(true);
  });
});

describe('setContent', () => {
  it('sets textContent of an element if `props.allowHTML` is `false`', () => {
    const ref = h();
    const content = 'some content';

    setContent(ref, {allowHTML: false, content});

    expect(ref.textContent).toBe(content);
    expect(ref.querySelector('strong')).toBe(null);
  });

  it('sets innerHTML of an element if `props.allowHTML` is `true`', () => {
    const ref = h();
    const content = '<strong>some content</strong>';

    setContent(ref, {allowHTML: true, content});

    expect(ref.querySelector('strong')).not.toBe(null);
  });
});

describe('isCursorOutsideInteractiveBorder', () => {
  const distance = 10;
  const interactiveBorder = 5;
  const popperRect = {top: 100, left: 100, right: 110, bottom: 110};
  const base = {popperRect, interactiveBorder};

  function getMergedRect(rectA, rectB) {
    return {
      top: Math.min(rectA.top, rectB.top),
      right: Math.max(rectA.right, rectB.right),
      bottom: Math.max(rectA.bottom, rectB.bottom),
      left: Math.min(rectA.left, rectB.left),
    };
  }

  const data = {
    top: {
      tooltipRect: {
        top: popperRect.top - distance,
        left: popperRect.left,
        right: popperRect.right,
        bottom: popperRect.bottom - distance,
      },
    },
    right: {
      tooltipRect: {
        top: popperRect.top,
        left: popperRect.left + distance,
        right: popperRect.right + distance,
        bottom: popperRect.bottom,
      },
    },
    bottom: {
      tooltipRect: {
        top: popperRect.top + distance,
        left: popperRect.left,
        right: popperRect.right,
        bottom: popperRect.bottom + distance,
      },
    },
    left: {
      tooltipRect: {
        top: popperRect.top,
        left: popperRect.left - distance,
        right: popperRect.right - distance,
        bottom: popperRect.bottom,
      },
    },
  };

  Object.values(data).forEach(placementObject => {
    const mergedRect = getMergedRect(popperRect, placementObject.tooltipRect);

    placementObject.inside = [
      {
        clientX: mergedRect.left - interactiveBorder,
        clientY: mergedRect.top - interactiveBorder,
      },
      {
        clientX: mergedRect.left - interactiveBorder,
        clientY: mergedRect.bottom + interactiveBorder,
      },
      {
        clientX: mergedRect.right + interactiveBorder,
        clientY: mergedRect.top - interactiveBorder,
      },
      {
        clientX: mergedRect.right + interactiveBorder,
        clientY: mergedRect.bottom + interactiveBorder,
      },
    ];

    placementObject.outside = [
      // All outside
      {
        clientX: mergedRect.left - interactiveBorder - 1,
        clientY: mergedRect.top - interactiveBorder - 1,
      },
      {
        clientX: mergedRect.left - interactiveBorder - 1,
        clientY: mergedRect.bottom + interactiveBorder + 1,
      },
      {
        clientX: mergedRect.right + interactiveBorder + 1,
        clientY: mergedRect.top - interactiveBorder - 1,
      },
      {
        clientX: mergedRect.right + interactiveBorder + 1,
        clientY: mergedRect.bottom + interactiveBorder + 1,
      },

      // x outside
      {
        clientX: mergedRect.left - interactiveBorder - 1,
        clientY: mergedRect.top - interactiveBorder,
      },
      {
        clientX: mergedRect.left - interactiveBorder - 1,
        clientY: mergedRect.bottom + interactiveBorder,
      },
      {
        clientX: mergedRect.right + interactiveBorder + 1,
        clientY: mergedRect.top - interactiveBorder,
      },
      {
        clientX: mergedRect.right + interactiveBorder + 1,
        clientY: mergedRect.bottom + interactiveBorder,
      },

      // y outside
      {
        clientX: mergedRect.left - interactiveBorder,
        clientY: mergedRect.top - interactiveBorder - 1,
      },
      {
        clientX: mergedRect.left - interactiveBorder,
        clientY: mergedRect.bottom + interactiveBorder + 1,
      },
      {
        clientX: mergedRect.right + interactiveBorder,
        clientY: mergedRect.top - interactiveBorder - 1,
      },
      {
        clientX: mergedRect.right + interactiveBorder,
        clientY: mergedRect.bottom + interactiveBorder + 1,
      },
    ];
  });

  it('top inside', () => {
    data.top.inside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.top}], coords),
      ).toBe(false);
    });
  });

  it('bottom inside', () => {
    data.bottom.inside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.bottom}], coords),
      ).toBe(false);
    });
  });

  it('left inside', () => {
    data.left.inside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.left}], coords),
      ).toBe(false);
    });
  });

  it('right inside', () => {
    data.right.inside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.right}], coords),
      ).toBe(false);
    });
  });

  it('top outside', () => {
    data.top.outside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.top}], coords),
      ).toBe(true);
    });
  });

  it('bottom outside', () => {
    data.bottom.outside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.bottom}], coords),
      ).toBe(true);
    });
  });

  it('left outside', () => {
    data.left.outside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.left}], coords),
      ).toBe(true);
    });
  });

  it('right outside', () => {
    data.right.outside.forEach(coords => {
      expect(
        isCursorOutsideInteractiveBorder([{...base, ...data.right}], coords),
      ).toBe(true);
    });
  });
});

describe('getBasePlacement', () => {
  it('returns the base value without shifting', () => {
    const allPlacements = ['top', 'bottom', 'left', 'right'].reduce(
      (acc, basePlacement) => [
        ...acc,
        `${basePlacement}-start`,
        `${basePlacement}-end`,
      ],
    );

    allPlacements.forEach(placement => {
      expect(getBasePlacement(placement).endsWith('-start')).toBe(false);
      expect(getBasePlacement(placement).endsWith('-end')).toBe(false);
    });
  });

  it('returns an empty string if there is no placement', () => {
    expect(getBasePlacement('')).toBe('');
  });
});

describe('updateTheme', () => {
  it('updates the theme on an element correctly', () => {
    const div = document.createElement('div');
    const theme = 'hello world';

    updateTheme(div, 'add', theme);
    expect(div.className).toBe('hello-theme world-theme');

    updateTheme(div, 'remove', theme);
    expect(div.className).toBe('');
  });

  it('does not add a `-theme` class if the theme is an empty string', () => {
    const div = document.createElement('div');

    updateTheme(div, 'add', '');

    expect(div.className).toBe('');
  });

  it('ignores multiple whitespace characters in-between themes', () => {
    const div = document.createElement('div');
    const theme = 'hello   world';

    updateTheme(div, 'add', theme);

    expect(div.className).toBe('hello-theme world-theme');
  });
});
