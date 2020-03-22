import {cloneElement, Children} from 'react';
import Flipper from 'react-flip-toolkit/es/core';
import {useInstance} from '../hooks';

function parseTranslate3d(string) {
  const match = string.match(/translate3d\((.+?),\s*(.+?),/);
  return {x: parseFloat(match[1]), y: parseFloat(match[2])};
}

function preserveInvocation(fn, args) {
  if (fn) {
    fn.apply(null, args);
  }
}

function useStableMemo(fn, deps) {
  const component = useInstance();
  let areDepsEqual = component.prevDeps ? true : false;

  if (Array.isArray(deps) && areDepsEqual) {
    for (let i = 0; i < deps.length; i++) {
      if (deps[i] !== component.prevDeps[i]) {
        areDepsEqual = false;
        break;
      }
    }
  }

  component.prevDeps = deps;

  if (!areDepsEqual) {
    component.result = fn();
  }

  return component.result;
}

function TippyTransition({children, onChange}) {
  const child = Children.only(children);

  const component = useInstance({
    offsets: {},
  });

  function onCreate(instance) {
    const {popper} = instance;
    const {tooltip, content, arrow} = instance.popperChildren;

    // Very first transition is jerky otherwise.
    content.style.willChange = 'transform';
    tooltip.style.textAlign = 'left';

    const flipper = new Flipper({element: popper});

    flipper.addFlipped({
      element: tooltip,
      // TODO: Make this unique if this component is used more than once
      flipId: 'tooltip',
      spring: 'veryGentle',
      onComplete() {
        popper.style.transitionDuration = `${child.props.updateDuration}ms`;
        popper.style.transitionProperty = '';
        component.instance.popperInstance.enableEventListeners();
        component.wasManuallyUpdated = false;
      },
      onSpringUpdate(springValue) {
        if (component.wasInterrupted) {
          // Since the FLIP animation was interrupted, the popper's translation
          // begins at the tweened offset
          component.offsets.prev = component.offsets.tween;
          component.wasInterrupted = false;
        }

        const {x: prevX, y: prevY} = component.offsets.prev;
        const {x: currentX, y: currentY} = component.offsets.current;

        // Calculate tweened offset
        const tweenedX = prevX - springValue * (prevX - currentX);
        const tweenedY = prevY - springValue * (prevY - currentY);

        // Write the current tweened offsets due to the FLIP animation
        component.offsets.tween = {x: tweenedX, y: tweenedY};

        // Set tweened transform
        const tweenedTransform = `translate3d(${tweenedX}px, ${tweenedY}px, 0)`;
        component.instance.popper.style.transform = tweenedTransform;
      },
    });

    flipper.addInverted({
      element: content,
      parent: tooltip,
    });

    if (arrow) {
      flipper.addInverted({
        element: arrow,
        parent: tooltip,
      });
    }

    component.instance = instance;
    component.flipper = flipper;
  }

  function onBeforeUpdate(instance) {
    if (!instance.state.isVisible) {
      return;
    }

    component.wasManuallyUpdated = true;
    component.flipper.recordBeforeUpdate();

    const {tooltip} = instance.popperChildren;
    const prevDimensions = component.dimensions;

    tooltip.style.width = '';
    tooltip.style.height = '';

    component.dimensions = {
      width: tooltip.offsetWidth,
      height: tooltip.offsetHeight,
    };

    if (prevDimensions) {
      tooltip.style.width = `${prevDimensions.width}px`;
      tooltip.style.height = `${prevDimensions.height}px`;
    }

    Object.keys(instance.popperChildren).forEach((key) => {
      if (instance.popperChildren[key]) {
        instance.popperChildren[key].style.transitionDuration = '0ms';
        instance.popperChildren[key].style.transitionProperty =
          'opacity, visibility';
      }
    });

    if (component.dimensions.width) {
      tooltip.style.width = `${component.dimensions.width + 1}px`;
      tooltip.style.height = `${component.dimensions.height}px`;
    }
  }

  function onAfterUpdate(instance) {
    if (!instance.state.isVisible) {
      return;
    }

    // Allow `padding` to be transitioned if the popper switches placements
    component.instance.popper.style.transitionProperty = 'padding';
    component.instance.popper.style.transitionDuration = '500ms';
    component.instance.popperInstance.disableEventListeners();

    component.flipper.onUpdate();

    if (onChange) {
      onChange(instance);
    }
  }

  function onMount(instance) {
    if (!component.dimensions) {
      onBeforeUpdate(instance);
    }
  }

  function onHidden(instance) {
    const {content, tooltip, arrow} = instance.popperChildren;

    content.style.transform = '';
    tooltip.style.transform = '';
    tooltip.style.top = '';

    if (arrow) {
      arrow.style.transform = '';
    }

    component.wasManuallyUpdated = false;
  }

  function popperOnCreate(data) {
    const currentOffsets = parseTranslate3d(data.styles.transform);
    component.offsets.prev = currentOffsets;
    component.offsets.current = currentOffsets;
    component.offsets.tween = currentOffsets;
  }

  function popperOnUpdate(data) {
    const {arrow} = component.instance.popperChildren;

    // `react-flip-toolkit` adds this
    if (arrow) {
      arrow.style.transformOrigin = '';
    }

    component.wasInterrupted = true;
    component.offsets.prev = component.offsets.current;

    // We need to parse it because Popper rounds the values but doesn't expose
    // the rounded values for us...
    const currentOffsets = parseTranslate3d(data.styles.transform);

    component.offsets.current = currentOffsets;

    // Runs AFTER first `onSpringUpdate` frame
    requestAnimationFrame(() => {
      component.offsets.tween = currentOffsets;
    });

    // onSpringUpdate and popper's .update() run in different frames, leading to
    // 1 frame glitch
    if (component.wasManuallyUpdated) {
      const {x, y} = component.offsets.tween || component.offsets.prev;
      component.instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }

  const popperOptions = useStableMemo(
    () => ({
      ...child.props.popperOptions,
      onCreate(data) {
        preserveInvocation(
          child.props.popperOptions && child.props.popperOptions.onCreate,
          [data]
        );
        popperOnCreate(data);
      },
      onUpdate(data) {
        preserveInvocation(
          child.props.popperOptions && child.props.popperOptions.onUpdate,
          [data]
        );
        popperOnUpdate(data);
      },
    }),
    [child.props.popperOptions]
  );

  return cloneElement(child, {
    popperOptions,
    onBeforeUpdate(...args) {
      preserveInvocation(child.props.onBeforeUpdate, args);
      onBeforeUpdate(...args);
    },
    onAfterUpdate(...args) {
      preserveInvocation(child.props.onAfterUpdate, args);
      onAfterUpdate(...args);
    },
    onCreate(...args) {
      preserveInvocation(child.props.onCreate, args);
      onCreate(...args);
    },
    onMount(...args) {
      preserveInvocation(child.props.onMount, args);
      onMount(...args);
    },
    onHidden(...args) {
      preserveInvocation(child.props.onHidden, args);
      onHidden(...args);
    },
  });
}

export default TippyTransition;
