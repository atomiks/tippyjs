import {
  Props,
  PopperElement,
  LifecycleHooks,
  Placement,
  Instance,
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

export default {
  name: 'followCursor',
  defaultValue: false,
  fn(instance: Instance): Partial<LifecycleHooks> {
    const {reference, popper} = instance;

    // Support iframe contexts
    // Static check that assumes any of the `triggerTarget` or `reference`
    // nodes will never change documents, even when they are updated
    const doc = getOwnerDocument(instance.props.triggerTarget || reference);

    // Internal state
    let lastMouseMoveEvent: MouseEvent;
    let triggerEvent: Event | null = null;
    let isInternallySettingControlledProp = false;

    // These are controlled by this plugin, so we need to store the user's
    // original prop value
    const userProps = instance.props;

    function setUserProps(props: Partial<Props>): void {
      Object.keys(props).forEach((prop): void => {
        userProps[prop] = useIfDefined(props[prop], userProps[prop]);
      });
    }

    // Due to `getVirtualOffsets()`, we need to reverse the placement if it's
    // shifted (start -> end, and vice-versa)
    function setNormalizedPlacement(): void {
      const {placement} = userProps;

      if (!placement) {
        return;
      }

      const shift = placement.split('-')[1];

      isInternallySettingControlledProp = true;

      instance.setProps({
        placement: (getIsEnabled() && shift
          ? placement.replace(shift, shift === 'start' ? 'end' : 'start')
          : placement) as Placement,
      });

      isInternallySettingControlledProp = false;
    }

    function getIsEnabled(): boolean {
      return (
        instance.props.followCursor &&
        isMouseEvent(triggerEvent) &&
        !(triggerEvent.clientX === 0 && triggerEvent.clientY === 0)
      );
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

    function handleListeners(): void {
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
        (el: Element): boolean => el === reference,
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
          // @ts-ignore - awaiting popper.js@1.16.0 release
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
            setNormalizedPlacement();
          }
        }

        // A new placement causes the popperInstance to be recreated
        if (partialProps.placement) {
          handleListeners();
        }

        // Wait for `.update()` to set `instance.state.currentPlacement` to
        // the new placement
        requestAnimationFrame(triggerLastMouseMove);
      },
      onMount(): void {
        triggerLastMouseMove();
        handleListeners();
      },
      onTrigger(_, event): void {
        // Tapping on touch devices can trigger `mouseenter` then `focus`
        if (triggerEvent) {
          return;
        }

        triggerEvent = event;

        if (isMouseEvent(event)) {
          lastMouseMoveEvent = event;
        }

        // With "initial" behavior, flipping may be incorrect for the first show
        if (getIsEnabled() && getIsInitialBehavior()) {
          isInternallySettingControlledProp = true;
          instance.setProps({flipOnUpdate: true});
          isInternallySettingControlledProp = false;
        } else {
          instance.setProps({flipOnUpdate: userProps.flipOnUpdate});
        }

        setNormalizedPlacement();

        if (getIsEnabled()) {
          // Ignore any trigger events fired immediately after the first one
          // e.g. `focus` can be fired right after `mouseenter` on touch devices
          if (event === triggerEvent) {
            addListener();
          }
        } else {
          resetReference();
        }
      },
      onUntrigger(): void {
        // If untriggered before showing (`onHidden` will never be invoked)
        if (!instance.state.isVisible) {
          removeListener();
          triggerEvent = null;
        }
      },
      onHidden(): void {
        removeListener();
        resetReference();
        triggerEvent = null;
      },
    };
  },
};

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
