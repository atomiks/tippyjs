import {InlinePositioning, BasePlacement} from '../types';
import {getBasePlacement, arrayFrom} from '../utils';
import {Modifier, Placement} from '@popperjs/core';

// TODO: Work on a "cursor" value so it chooses a rect optimal to the cursor
// position.
const inlinePositioning: InlinePositioning = {
  name: 'inlinePositioning',
  defaultValue: false,
  fn(instance) {
    const {reference} = instance;

    function isEnabled(): boolean {
      return !!instance.props.inlinePositioning;
    }

    let placement: Placement;

    const modifier: Modifier<{}> = {
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
      );
    }

    return {
      onCreate(): void {
        instance.setProps({
          popperOptions: {
            modifiers: [
              ...(instance.popperInstance?.state.options.modifiers || []),
              modifier,
            ],
          },
        });
      },
    };
  },
};

export default inlinePositioning;

export function getInlineBoundingClientRect(
  currentBasePlacement: BasePlacement | null,
  boundingRect: ClientRect,
  clientRects: ClientRect[],
): ClientRect {
  // Not an inline element, or placement is not yet known
  if (clientRects.length < 2 || currentBasePlacement === null) {
    return boundingRect;
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
      const minLeft = Math.min(...clientRects.map(rects => rects.left));
      const maxRight = Math.max(...clientRects.map(rects => rects.right));
      const measureRects = clientRects.filter(rect =>
        currentBasePlacement === 'left'
          ? rect.left === minLeft
          : rect.right === maxRight,
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
