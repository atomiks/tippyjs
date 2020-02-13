import {FollowCursor} from '../types';
import {closestCallback, isMouseEvent, getOwnerDocument} from '../dom-utils';
import {currentInput} from '../bindGlobalEventListeners';

const followCursor: FollowCursor = {
  name: 'followCursor',
  defaultValue: false,
  fn(instance) {
    const {reference} = instance;

    // Support iframe contexts
    // Static check that assumes any of the `triggerTarget` or `reference`
    // nodes will never change documents, even when they are updated
    const doc = getOwnerDocument(instance.props.triggerTarget || reference);

    // Internal state
    let lastMouseMoveEvent: MouseEvent;
    let mouseCoords: {clientX: number; clientY: number} | null = null;

    function getIsManual(): boolean {
      return instance.props.trigger.trim() === 'manual';
    }

    function getIsEnabled(): boolean {
      // #597
      const isValidMouseEvent = getIsManual()
        ? true
        : // Check if a keyboard "click"
          mouseCoords !== null &&
          !(mouseCoords.clientX === 0 && mouseCoords.clientY === 0);

      return instance.props.followCursor && isValidMouseEvent;
    }

    function getIsInitialBehavior(): boolean {
      return (
        currentInput.isTouch ||
        (instance.props.followCursor === 'initial' && instance.state.isVisible)
      );
    }

    function resetReference(): void {
      instance.setProps({getReferenceClientRect: null});
    }

    function handleMouseMoveListener(): void {
      if (getIsEnabled()) {
        addListener();
      } else {
        resetReference();
      }
    }

    function triggerLastMouseMove(): void {
      if (getIsEnabled()) {
        onMouseMove(lastMouseMoveEvent);
      }
    }

    function addListener(): void {
      doc.addEventListener('mousemove', onMouseMove);
    }

    function removeListener(): void {
      doc.removeEventListener('mousemove', onMouseMove);
    }

    function onMouseMove(event: MouseEvent): void {
      const {clientX, clientY} = (lastMouseMoveEvent = event);

      // If the instance is interactive, avoid updating the position unless it's
      // over the reference element
      const isCursorOverReference = closestCallback(
        event.target as Element,
        (el: Element) => el === reference,
      );
      const {followCursor} = instance.props;

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

            return {
              width: 0,
              height: 0,
              top: followCursor === 'horizontal' ? rect.top : y,
              bottom: followCursor === 'horizontal' ? rect.bottom : y,
              left: followCursor === 'vertical' ? rect.left : x,
              right: followCursor === 'vertical' ? rect.right : x,
            };
          },
        });
      }

      if (getIsInitialBehavior()) {
        removeListener();
      }
    }

    return {
      onMount(): void {
        triggerLastMouseMove();
      },
      onShow(): void {
        if (getIsManual()) {
          // Since there's no trigger event to use, we have to use these as
          // baseline coords
          mouseCoords = {clientX: 0, clientY: 0};
          // Ensure `lastMouseMoveEvent` doesn't access any other properties
          // of a MouseEvent here
          lastMouseMoveEvent = mouseCoords as MouseEvent;

          handleMouseMoveListener();
        }
      },
      onTrigger(_, event): void {
        // Tapping on touch devices can trigger `mouseenter` then `focus`
        if (mouseCoords) {
          return;
        }

        if (isMouseEvent(event)) {
          mouseCoords = {clientX: event.clientX, clientY: event.clientY};
          lastMouseMoveEvent = event;
        }

        handleMouseMoveListener();
      },
      onUntrigger(): void {
        // If untriggered before showing (`onHidden` will never be invoked)
        if (!instance.state.isVisible) {
          removeListener();
          mouseCoords = null;
        }
      },
      onHidden(): void {
        removeListener();
        resetReference();
        mouseCoords = null;
      },
    };
  },
};

export default followCursor;
