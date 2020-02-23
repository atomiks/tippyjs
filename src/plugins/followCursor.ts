import {currentInput} from '../bindGlobalEventListeners';
import {getOwnerDocument, isMouseEvent} from '../dom-utils';
import {FollowCursor} from '../types';

const followCursor: FollowCursor = {
  name: 'followCursor',
  defaultValue: false,
  fn(instance) {
    const reference = instance.reference;
    const doc = getOwnerDocument(instance.props.triggerTarget || reference);

    let initialMouseCoords: {clientX: number; clientY: number} | null = null;

    function getIsManual(): boolean {
      return instance.props.trigger.trim() === 'manual';
    }

    function getIsEnabled(): boolean {
      // #597
      const isValidMouseEvent = getIsManual()
        ? true
        : // Check if a keyboard "click"
          initialMouseCoords !== null &&
          !(
            initialMouseCoords.clientX === 0 && initialMouseCoords.clientY === 0
          );

      return instance.props.followCursor && isValidMouseEvent;
    }

    function getIsInitialBehavior(): boolean {
      return (
        currentInput.isTouch ||
        (instance.props.followCursor === 'initial' && instance.state.isVisible)
      );
    }

    function unsetReferenceClientRect(shouldUnset: any): void {
      if (shouldUnset) {
        instance.setProps({getReferenceClientRect: null});
      }
    }

    function handleMouseMoveListener(): void {
      if (getIsEnabled()) {
        addListener();
      } else {
        unsetReferenceClientRect(instance.props.followCursor);
      }
    }

    function triggerLastMouseMove(): void {
      if (getIsEnabled()) {
        onMouseMove(initialMouseCoords as MouseEvent);
      }
    }

    function addListener(): void {
      doc.addEventListener('mousemove', onMouseMove);
    }

    function removeListener(): void {
      doc.removeEventListener('mousemove', onMouseMove);
    }

    function onMouseMove(event: MouseEvent): void {
      initialMouseCoords = {
        clientX: event.clientX,
        clientY: event.clientY,
      };

      // If the instance is interactive, avoid updating the position unless it's
      // over the reference element
      const isCursorOverReference = event.target
        ? reference.contains(event.target as Node)
        : true;
      const {followCursor} = instance.props;
      const {clientX, clientY} = event;

      const rect = reference.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      if (isCursorOverReference || !instance.props.interactive) {
        instance.setProps({
          getReferenceClientRect() {
            const rect = reference.getBoundingClientRect();

            let x = clientX;
            let y = clientY;

            if (followCursor === 'initial') {
              x = rect.left + relativeX;
              y = rect.top + relativeY;
            }

            const top = followCursor === 'horizontal' ? rect.top : y;
            const right = followCursor === 'vertical' ? rect.right : x;
            const bottom = followCursor === 'horizontal' ? rect.bottom : y;
            const left = followCursor === 'vertical' ? rect.left : x;

            return {
              width: right - left,
              height: bottom - top,
              top,
              right,
              bottom,
              left,
            };
          },
        });
      }

      if (getIsInitialBehavior()) {
        removeListener();
      }
    }

    return {
      onAfterUpdate(_, {followCursor}): void {
        if (followCursor !== undefined && !followCursor) {
          unsetReferenceClientRect(true);
        }
      },
      onMount(): void {
        triggerLastMouseMove();
      },
      onShow(): void {
        if (getIsManual()) {
          // Since there's no trigger event to use, we have to use these as
          // baseline coords
          initialMouseCoords = {
            clientX: 0,
            clientY: 0,
          };

          handleMouseMoveListener();
        }
      },
      onTrigger(_, event): void {
        // Tapping on touch devices can trigger `mouseenter` then `focus`
        if (initialMouseCoords) {
          return;
        }

        if (isMouseEvent(event)) {
          initialMouseCoords = {
            clientX: event.clientX,
            clientY: event.clientY,
          };
        }

        handleMouseMoveListener();
      },
      onUntrigger(): void {
        // If untriggered before showing (`onHidden` will never be invoked)
        if (!instance.state.isVisible) {
          removeListener();
          initialMouseCoords = null;
        }
      },
      onHidden(): void {
        removeListener();
        initialMouseCoords = null;
      },
    };
  },
};

export default followCursor;
