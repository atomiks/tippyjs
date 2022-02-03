import {ReferenceElement, Targets} from './types';
import {PopperTreeData} from './types-internal';
import {arrayFrom, isType, normalizeToArray, getBasePlacement} from './utils';

export function div(): HTMLDivElement {
  return document.createElement('div');
}

export function isElement(value: unknown): value is Element | DocumentFragment {
  return ['Element', 'Fragment'].some((type) => isType(value, type));
}

export function isNodeList(value: unknown): value is NodeList {
  return isType(value, 'NodeList');
}

export function isMouseEvent(value: unknown): value is MouseEvent {
  return isType(value, 'MouseEvent');
}

export function isReferenceElement(value: any): value is ReferenceElement {
  return !!(value && value._tippy && value._tippy.reference === value);
}

export function getArrayOfElements(value: Targets): Element[] {
  if (isElement(value)) {
    return [value];
  }

  if (isNodeList(value)) {
    return arrayFrom(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  return arrayFrom(document.querySelectorAll(value));
}

export function setTransitionDuration(
  els: (HTMLDivElement | null)[],
  value: number
): void {
  els.forEach((el) => {
    if (el) {
      el.style.transitionDuration = `${value}ms`;
    }
  });
}

export function setVisibilityState(
  els: (HTMLDivElement | null)[],
  state: 'visible' | 'hidden'
): void {
  els.forEach((el) => {
    if (el) {
      el.setAttribute('data-state', state);
    }
  });
}

export function getOwnerDocument(
  elementOrElements: Element | Element[]
): Document {
  const [element] = normalizeToArray(elementOrElements);

  // Elements created via a <template> have an ownerDocument with no reference to the body
  return element?.ownerDocument?.body ? element.ownerDocument : document;
}

export function isCursorOutsideInteractiveBorder(
  popperTreeData: PopperTreeData[],
  event: MouseEvent
): boolean {
  const {clientX, clientY} = event;

  return popperTreeData.every(({popperRect, popperState, props}) => {
    const {interactiveBorder} = props;
    const basePlacement = getBasePlacement(popperState.placement);
    const offsetData = popperState.modifiersData.offset;

    if (!offsetData) {
      return true;
    }

    const topDistance = basePlacement === 'bottom' ? offsetData.top!.y : 0;
    const bottomDistance = basePlacement === 'top' ? offsetData.bottom!.y : 0;
    const leftDistance = basePlacement === 'right' ? offsetData.left!.x : 0;
    const rightDistance = basePlacement === 'left' ? offsetData.right!.x : 0;

    const exceedsTop =
      popperRect.top - clientY + topDistance > interactiveBorder;
    const exceedsBottom =
      clientY - popperRect.bottom - bottomDistance > interactiveBorder;
    const exceedsLeft =
      popperRect.left - clientX + leftDistance > interactiveBorder;
    const exceedsRight =
      clientX - popperRect.right - rightDistance > interactiveBorder;

    return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
  });
}

export function updateTransitionEndListener(
  box: HTMLDivElement,
  action: 'add' | 'remove',
  listener: (event: TransitionEvent) => void
): void {
  if (listener) {
    const method = `${action}EventListener` as
      | 'addEventListener'
      | 'removeEventListener';

    // some browsers apparently support `transition` (unprefixed) but only fire
    // `webkitTransitionEnd`...
    ['transitionend', 'webkitTransitionEnd'].forEach((event) => {
      box[method](event, listener as EventListener);
    });
  }
}

/**
 * Compared to xxx.contains, this function works for dom structures with shadow
 * dom
 */
export function actualContains(parent: Element, child: Element): boolean {
  let target = child;
  while (target) {
    if (parent.contains(target)) {
      return true;
    }
    target = (target.getRootNode?.() as any)?.host;
  }
  return false;
}
