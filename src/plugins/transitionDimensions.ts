import {PopperChildren, Instance, Props, TransitionDimensions} from '../types';
import {div, getOwnerDocument, find} from '../utils';

type Dimensions = {
  width: number;
  height: number;
};

const NAME = 'transitionDimensions';
const TRANSITIONABLE_PROPERTIES = 'transform,top,left';

function getWindow(element: Element): Window {
  return getOwnerDocument(element).defaultView || window;
}

function buildTransitionString(ms: number, timingFn: string): string {
  return [
    `opacity ${ms}ms`,
    `visibility ${ms}ms`,
    `width ${ms}ms ${timingFn}`,
    `height ${ms}ms ${timingFn}`,
    `top ${ms / 2}ms`,
    `left ${ms / 2}ms`,
  ].join(',');
}

function getDimensions(element: HTMLElement): Dimensions {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

function setDimensions(elements: HTMLElement[], dimensions: Dimensions): void {
  elements.forEach(element => {
    element.style.width = `${dimensions.width}px`;
    element.style.height = `${dimensions.height}px`;
  });
}

function undoDimensions(elements: HTMLElement[]): void {
  elements.forEach(element => {
    element.style.width = '';
    element.style.height = '';
  });
}

const transitionDimensions: TransitionDimensions = {
  name: NAME,
  defaultValue: false,
  fn(instance) {
    let prevDimensions: Dimensions | null = null;
    let nextDimensions: Dimensions | null = null;

    const {popper} = instance;
    const {tooltip, content} = instance.popperChildren;

    const contentWrapper = div();
    contentWrapper.className = '__NAMESPACE_PREFIX__-content-wrapper';
    contentWrapper.style.position = 'relative';
    contentWrapper.style.overflow = 'hidden';
    contentWrapper.style.willChange = 'transform';

    function getIsEnabled(): boolean {
      const isPluginNameSelf =
        find(instance.plugins, plugin => plugin.name === NAME) ===
        transitionDimensions;

      if (isPluginNameSelf) {
        return !!instance.props[NAME];
      }

      return false;
    }

    function unset(): void {
      undoDimensions([content, contentWrapper, tooltip, popper]);
      const arrow = getArrow();
      if (arrow) {
        arrow.style.transitionProperty = '';
        arrow.style.transitionTimingFunction = '';
        arrow.style.transitionDuration = '';
      }
    }

    function onCreate(): void {
      contentWrapper.appendChild(content);
      tooltip.appendChild(contentWrapper);
    }

    function getArrow(): PopperChildren['arrow'] {
      return instance.popperChildren.arrow;
    }

    function onBeforeUpdate(
      instance: Instance,
      partialProps: Partial<Props>,
    ): void {
      if (!getIsEnabled()) {
        return;
      }

      if (
        partialProps[NAME] === false &&
        partialProps[NAME] !== instance.props[NAME]
      ) {
        unset();
      }

      if (!instance.state.isMounted) {
        return;
      }

      if (prevDimensions === null) {
        prevDimensions = getDimensions(contentWrapper);
      }
    }

    function onAfterUpdate(): void {
      if (!getIsEnabled() || !instance.state.isMounted) {
        return;
      }

      const {updateDuration} = instance.props;
      const timingFn = getWindow(popper).getComputedStyle(popper)
        .transitionTimingFunction;
      const transition = buildTransitionString(updateDuration, timingFn);

      const arrow = getArrow();
      if (arrow) {
        arrow.style.transitionProperty = TRANSITIONABLE_PROPERTIES;
        arrow.style.transitionTimingFunction = timingFn;
        arrow.style.transitionDuration = `${updateDuration}ms`;
      }

      contentWrapper.style.transition = '';
      tooltip.style.transition = '';

      undoDimensions([content, contentWrapper, tooltip, popper]);
      nextDimensions = getDimensions(contentWrapper);

      contentWrapper.style.transition = transition;
      tooltip.style.transition = transition;

      setDimensions([content], {
        ...nextDimensions,
        // TODO: figure out why this is needed/if it can be removed.
        // The text reflows and cuts off otherwise
        width: nextDimensions.width + 1,
      });

      if (prevDimensions) {
        setDimensions([contentWrapper, tooltip, popper], prevDimensions);
      }

      // trigger reflow for transition
      void tooltip.offsetHeight;

      setDimensions([contentWrapper, tooltip, popper], nextDimensions);

      prevDimensions = null;
    }

    function onShow(): void {
      if (!getIsEnabled()) {
        return;
      }

      if (!instance.state.isMounted) {
        unset();
      }
    }

    function onMount(): void {
      prevDimensions = getDimensions(contentWrapper);
    }

    return {
      onCreate,
      onBeforeUpdate,
      onAfterUpdate,
      onShow,
      onMount,
    };
  },
};

export default transitionDimensions;
