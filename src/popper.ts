import {
  PopperElement,
  Props,
  PopperChildren,
  BasePlacement,
  Placement,
} from './types';
import {
  div,
  isElement,
  splitBySpaces,
  appendPxIfNumber,
  setInnerHTML,
} from './utils';
import {isUCBrowser} from './browser';
import {
  POPPER_CLASS,
  TOOLTIP_CLASS,
  CONTENT_CLASS,
  ARROW_CLASS,
  SVG_ARROW_CLASS,
  TOOLTIP_SELECTOR,
  CONTENT_SELECTOR,
  ARROW_SELECTOR,
  SVG_ARROW_SELECTOR,
} from './constants';

/**
 * Returns the popper's placement, ignoring shifting (top-start, etc)
 */
export function getBasePlacement(placement: Placement): BasePlacement {
  return placement.split('-')[0] as BasePlacement;
}

/**
 * Adds `data-inertia` attribute
 */
export function addInertia(tooltip: PopperChildren['tooltip']): void {
  tooltip.setAttribute('data-inertia', '');
}

/**
 * Removes `data-inertia` attribute
 */
export function removeInertia(tooltip: PopperChildren['tooltip']): void {
  tooltip.removeAttribute('data-inertia');
}

/**
 * Adds interactive-related attributes
 */
export function addInteractive(tooltip: PopperChildren['tooltip']): void {
  tooltip.setAttribute('data-interactive', '');
}

/**
 * Removes interactive-related attributes
 */
export function removeInteractive(tooltip: PopperChildren['tooltip']): void {
  tooltip.removeAttribute('data-interactive');
}

/**
 * Sets the content of a tooltip
 */
export function setContent(
  contentEl: PopperChildren['content'],
  props: Props,
): void {
  if (isElement(props.content)) {
    setInnerHTML(contentEl, '');
    contentEl.appendChild(props.content);
  } else if (typeof props.content !== 'function') {
    const key: 'innerHTML' | 'textContent' = props.allowHTML
      ? 'innerHTML'
      : 'textContent';
    contentEl[key] = props.content;
  }
}

/**
 * Returns the child elements of a popper element
 */
export function getChildren(popper: PopperElement): PopperChildren {
  return {
    tooltip: popper.querySelector(TOOLTIP_SELECTOR) as HTMLDivElement,
    content: popper.querySelector(CONTENT_SELECTOR) as HTMLDivElement,
    arrow:
      popper.querySelector(ARROW_SELECTOR) ||
      popper.querySelector(SVG_ARROW_SELECTOR),
  };
}

/**
 * Creates an arrow element and returns it
 */
export function createArrowElement(arrow: Props['arrow']): HTMLDivElement {
  const arrowElement = div();

  if (arrow === true) {
    arrowElement.className = ARROW_CLASS;
  } else {
    arrowElement.className = SVG_ARROW_CLASS;

    if (isElement(arrow)) {
      arrowElement.appendChild(arrow);
    } else {
      setInnerHTML(arrowElement, arrow as string);
    }
  }

  return arrowElement;
}

/**
 * Constructs the popper element and returns it
 */
export function createPopperElement(id: number, props: Props): PopperElement {
  const popper = div();
  popper.className = POPPER_CLASS;
  popper.style.position = 'absolute';
  popper.style.top = '0';
  popper.style.left = '0';

  const tooltip = div();
  tooltip.className = TOOLTIP_CLASS;
  tooltip.id = `__NAMESPACE_PREFIX__-${id}`;
  tooltip.setAttribute('data-state', 'hidden');
  tooltip.setAttribute('tabindex', '-1');

  updateTheme(tooltip, 'add', props.theme);

  const content = div();
  content.className = CONTENT_CLASS;
  content.setAttribute('data-state', 'hidden');

  if (props.interactive) {
    addInteractive(tooltip);
  }

  if (props.arrow) {
    tooltip.setAttribute('data-arrow', '');
    tooltip.appendChild(createArrowElement(props.arrow));
  }

  if (props.inertia) {
    addInertia(tooltip);
  }

  setContent(content, props);

  tooltip.appendChild(content);
  popper.appendChild(tooltip);

  updatePopperElement(popper, props, props);

  return popper;
}

/**
 * Updates the popper element based on the new props
 */
export function updatePopperElement(
  popper: PopperElement,
  prevProps: Props,
  nextProps: Props,
): void {
  const {tooltip, content, arrow} = getChildren(popper);

  popper.style.zIndex = '' + nextProps.zIndex;

  tooltip.setAttribute('data-animation', nextProps.animation);
  tooltip.style.maxWidth = appendPxIfNumber(nextProps.maxWidth);

  if (nextProps.role) {
    tooltip.setAttribute('role', nextProps.role);
  } else {
    tooltip.removeAttribute('role');
  }

  if (prevProps.content !== nextProps.content) {
    setContent(content, nextProps);
  }

  // arrow
  if (!prevProps.arrow && nextProps.arrow) {
    // false to true
    tooltip.appendChild(createArrowElement(nextProps.arrow));
    tooltip.setAttribute('data-arrow', '');
  } else if (prevProps.arrow && !nextProps.arrow) {
    // true to false
    tooltip.removeChild(arrow!);
    tooltip.removeAttribute('data-arrow');
  } else if (prevProps.arrow !== nextProps.arrow) {
    // true to 'round' or vice-versa
    tooltip.removeChild(arrow!);
    tooltip.appendChild(createArrowElement(nextProps.arrow));
  }

  // interactive
  if (!prevProps.interactive && nextProps.interactive) {
    addInteractive(tooltip);
  } else if (prevProps.interactive && !nextProps.interactive) {
    removeInteractive(tooltip);
  }

  // inertia
  if (!prevProps.inertia && nextProps.inertia) {
    addInertia(tooltip);
  } else if (prevProps.inertia && !nextProps.inertia) {
    removeInertia(tooltip);
  }

  // theme
  if (prevProps.theme !== nextProps.theme) {
    updateTheme(tooltip, 'remove', prevProps.theme);
    updateTheme(tooltip, 'add', nextProps.theme);
  }
}

/**
 * Add/remove transitionend listener from tooltip
 */
export function updateTransitionEndListener(
  tooltip: PopperChildren['tooltip'],
  action: 'add' | 'remove',
  listener: (event: TransitionEvent) => void,
): void {
  const eventName =
    isUCBrowser && document.body.style.webkitTransition !== undefined
      ? 'webkitTransitionEnd'
      : 'transitionend';
  tooltip[
    (action + 'EventListener') as 'addEventListener' | 'removeEventListener'
  ](eventName, listener as EventListener);
}

/**
 * Adds/removes theme from tooltip's classList
 */
export function updateTheme(
  tooltip: PopperChildren['tooltip'],
  action: 'add' | 'remove',
  theme: Props['theme'],
): void {
  splitBySpaces(theme).forEach(name => {
    tooltip.classList[action](`${name}-theme`);
  });
}

/**
 * Determines if the mouse cursor is outside of the popper's interactive border
 * region
 */
export function isCursorOutsideInteractiveBorder(
  popperTreeData: {
    popperRect: ClientRect;
    tooltipRect: ClientRect;
    interactiveBorder: Props['interactiveBorder'];
  }[],
  event: MouseEvent,
): boolean {
  const {clientX, clientY} = event;

  return popperTreeData.every(
    ({popperRect, tooltipRect, interactiveBorder}) => {
      // Get min/max bounds of both the popper and tooltip rects due to
      // `distance` offset
      const mergedRect = {
        top: Math.min(popperRect.top, tooltipRect.top),
        right: Math.max(popperRect.right, tooltipRect.right),
        bottom: Math.max(popperRect.bottom, tooltipRect.bottom),
        left: Math.min(popperRect.left, tooltipRect.left),
      };

      const exceedsTop = mergedRect.top - clientY > interactiveBorder;
      const exceedsBottom = clientY - mergedRect.bottom > interactiveBorder;
      const exceedsLeft = mergedRect.left - clientX > interactiveBorder;
      const exceedsRight = clientX - mergedRect.right > interactiveBorder;

      return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
    },
  );
}
