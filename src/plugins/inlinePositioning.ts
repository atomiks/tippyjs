import {Modifier, Placement} from '@popperjs/core';
import {isMouseEvent} from '../dom-utils';
import {BasePlacement, InlinePositioning, Props} from '../types';
import {arrayFrom, getBasePlacement} from '../utils';

function getProps(props: Props, modifier: Modifier<any, any>): Partial<Props> {
  return {
    popperOptions: {
      ...props.popperOptions,
      modifiers: [
        ...(props.popperOptions?.modifiers || []).filter(
          ({name}) => name !== modifier.name
        ),
        modifier,
      ],
    },
  };
}

const inlinePositioning: InlinePositioning = {
  name: 'inlinePositioning',
  defaultValue: false,
  fn(instance) {
    const {reference} = instance;

    function isEnabled(): boolean {
      return !!instance.props.inlinePositioning;
    }

    let placement: Placement;
    let cursorRectIndex = -1;
    let isInternalUpdate = false;

    const modifier: Modifier<'tippyInlinePositioning', {}> = {
      name: 'tippyInlinePositioning',
      enabled: true,
      phase: 'afterWrite',
      fn({state}) {
        if (isEnabled()) {
          if (placement !== state.placement) {
            instance.setProps({
              getReferenceClientRect: () =>
                getReferenceClientRect(state.placement),
            });
          }

          placement = state.placement;
        }
      },
    };

    function getReferenceClientRect(placement: Placement): ClientRect {
      return getInlineBoundingClientRect(
        getBasePlacement(placement),
        reference.getBoundingClientRect(),
        arrayFrom(reference.getClientRects()),
        cursorRectIndex
      );
    }

    function setInternalProps(partialProps: Partial<Props>): void {
      isInternalUpdate = true;
      instance.setProps(partialProps);
      isInternalUpdate = false;
    }

    function addModifier(): void {
      if (!isInternalUpdate) {
        setInternalProps(getProps(instance.props, modifier));
      }
    }

    return {
      onCreate: addModifier,
      onAfterUpdate: addModifier,
      onTrigger(_, event): void {
        if (isMouseEvent(event)) {
          const rects = arrayFrom(instance.reference.getClientRects());
          const cursorRect = rects.find(
            (rect) =>
              rect.left - 2 <= event.clientX &&
              rect.right + 2 >= event.clientX &&
              rect.top - 2 <= event.clientY &&
              rect.bottom + 2 >= event.clientY
          );

          cursorRectIndex = rects.indexOf(cursorRect);
        }
      },
      onUntrigger(): void {
        cursorRectIndex = -1;
      },
    };
  },
};

export default inlinePositioning;

export function getInlineBoundingClientRect(
  currentBasePlacement: BasePlacement | null,
  boundingRect: ClientRect,
  clientRects: ClientRect[],
  cursorRectIndex: number
): ClientRect {
  // Not an inline element, or placement is not yet known
  if (clientRects.length < 2 || currentBasePlacement === null) {
    return boundingRect;
  }

  // There are two rects and they are disjoined
  if (
    clientRects.length === 2 &&
    cursorRectIndex >= 0 &&
    clientRects[0].left > clientRects[1].right
  ) {
    return clientRects[cursorRectIndex] || boundingRect;
  }

  switch (currentBasePlacement) {
    case 'top':
    case 'bottom': {
      const firstRect = clientRects[0];
      const lastRect = clientRects[clientRects.length - 1];
      const isTop = currentBasePlacement === 'top';

      const top = firstRect.top;
      const bottom = lastRect.bottom;
      const left = isTop ? firstRect.left : lastRect.left;
      const right = isTop ? firstRect.right : lastRect.right;
      const width = right - left;
      const height = bottom - top;

      return {top, bottom, left, right, width, height};
    }
    case 'left':
    case 'right': {
      const minLeft = Math.min(...clientRects.map((rects) => rects.left));
      const maxRight = Math.max(...clientRects.map((rects) => rects.right));
      const measureRects = clientRects.filter((rect) =>
        currentBasePlacement === 'left'
          ? rect.left === minLeft
          : rect.right === maxRight
      );

      const top = measureRects[0].top;
      const bottom = measureRects[measureRects.length - 1].bottom;
      const left = minLeft;
      const right = maxRight;
      const width = right - left;
      const height = bottom - top;

      return {top, bottom, left, right, width, height};
    }
    default: {
      return boundingRect;
    }
  }
}
