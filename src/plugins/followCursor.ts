import {
  PopperElement,
  Placement,
  FollowCursor,
  FollowCursorProps,
  Props,
} from '../types';
import {
  includes,
  closestCallback,
  useIfDefined,
  isMouseEvent,
  getOwnerDocument,
} from '../utils';
import {getBasePlacement} from '../popper';
import {currentInput} from '../bindGlobalEventListeners';

type ExtendedProps = Props & FollowCursorProps;

const followCursor: FollowCursor = {
  name: 'followCursor',
  defaultValue: false,
  fn(instance) {
    const {reference, popper} = instance;

    // Support iframe contexts
    // Static check that assumes any of the `triggerTarget` or `reference`
    // nodes will never change documents, even when they are updated
    const doc = getOwnerDocument(instance.props.triggerTarget || reference);

    // Internal state
    let lastMouseMoveEvent: MouseEvent;
    let mouseCoords: {clientX: number; clientY: number} | null = null;
    let isInternallySettingControlledProp = false;

    // These are controlled by this plugin, so we need to store the user's
    // original prop value
    const userProps = instance.props;

    function setUserProps(props: Partial<ExtendedProps>): void {
      const keys = Object.keys(props) as Array<keyof ExtendedProps>;
      keys.forEach(prop => {
        (userProps as any)[prop] = useIfDefined(props[prop], userProps[prop]);
      });
    }

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
      if (instance.popperInstance) {
        instance.popperInstance.reference = reference;
      }
    }

    function handlePlacement(): void {
      // Due to `getVirtualOffsets()`, we need to reverse the placement if it's
      // shifted (start -> end, and vice-versa)

      // Early bail-out
      if (!getIsEnabled() && instance.props.placement === userProps.placement) {
        return;
      }

      const {placement} = userProps;
      const shift = placement.split('-')[1];

      isInternallySettingControlledProp = true;

      instance.setProps({
        placement: (getIsEnabled() && shift
          ? placement.replace(shift, shift === 'start' ? 'end' : 'start')
          : placement) as Placement,
      });

      isInternallySettingControlledProp = false;
    }

    function handlePopperListeners(): void {
      if (!instance.popperInstance) {
        return;
      }

      // Popper's scroll listeners make sense for `true` only. TODO: work out
      // how to only listen horizontal scroll for "horizontal" and vertical
      // scroll for "vertical"
      if (
        getIsEnabled() &&
        (getIsInitialBehavior() || instance.props.followCursor !== true)
      ) {
        instance.popperInstance.disableEventListeners();
      }
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

      if (!instance.popperInstance || !instance.state.currentPlacement) {
        return;
      }

      // If the instance is interactive, avoid updating the position unless it's
      // over the reference element
      const isCursorOverReference = closestCallback(
        event.target as Element,
        (el: Element) => el === reference,
      );

      const rect = reference.getBoundingClientRect();
      const {followCursor} = instance.props;
      const isHorizontal = followCursor === 'horizontal';
      const isVertical = followCursor === 'vertical';
      const isVerticalPlacement = includes(
        ['top', 'bottom'],
        getBasePlacement(instance.state.currentPlacement),
      );

      // The virtual reference needs some size to prevent itself from overflowing
      const {size, x, y} = getVirtualOffsets(popper, isVerticalPlacement);

      if (isCursorOverReference || !instance.props.interactive) {
        instance.popperInstance.reference = {
          referenceNode: reference,
          // These `client` values don't get used by Popper.js if they are 0
          clientWidth: 0,
          clientHeight: 0,
          getBoundingClientRect: (): DOMRect | ClientRect => ({
            width: isVerticalPlacement ? size : 0,
            height: isVerticalPlacement ? 0 : size,
            top: (isHorizontal ? rect.top : clientY) - y,
            bottom: (isHorizontal ? rect.bottom : clientY) + y,
            left: (isVertical ? rect.left : clientX) - x,
            right: (isVertical ? rect.right : clientX) + x,
          }),
        };

        instance.popperInstance.update();
      }

      if (getIsInitialBehavior()) {
        removeListener();
      }
    }

    return {
      onAfterUpdate(_, partialProps): void {
        if (!isInternallySettingControlledProp) {
          setUserProps(partialProps);

          if (partialProps.placement) {
            handlePlacement();
          }
        }

        // A new placement causes the popperInstance to be recreated
        if (partialProps.placement) {
          handlePopperListeners();
        }

        // Wait for `.update()` to set `instance.state.currentPlacement` to
        // the new placement
        requestAnimationFrame(triggerLastMouseMove);
      },
      onMount(): void {
        triggerLastMouseMove();
        handlePopperListeners();
      },
      onShow(): void {
        if (getIsManual()) {
          // Since there's no trigger event to use, we have to use these as
          // baseline coords
          mouseCoords = {clientX: 0, clientY: 0};
          // Ensure `lastMouseMoveEvent` doesn't access any other properties
          // of a MouseEvent here
          lastMouseMoveEvent = mouseCoords as MouseEvent;

          handlePlacement();
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

        handlePlacement();
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

export function getVirtualOffsets(
  popper: PopperElement,
  isVerticalPlacement: boolean,
): {
  size: number;
  x: number;
  y: number;
} {
  const size = isVerticalPlacement ? popper.offsetWidth : popper.offsetHeight;

  return {
    size,
    x: isVerticalPlacement ? size : 0,
    y: isVerticalPlacement ? 0 : size,
  };
}
