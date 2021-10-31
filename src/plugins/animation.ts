import {setVisibilityState, updateTransitionEndListener} from '../dom-utils';
import {getChildren} from '../template';
import {Instance, Plugin} from '../types';
import {getIsDefaultRenderFn} from '../utils';

interface Animation extends Plugin {
  name: 'animation';
  defaultValue: 'fade';
}

interface HeadlessAnimation extends Plugin {
  name: 'animation';
  defaultValue: false;
}

function onTransitionedOut(
  instance: Instance,
  currentListener: ((event: TransitionEvent) => void) | undefined,
  callback: () => void
): ((event: TransitionEvent) => void) | undefined {
  return onTransitionEnd(instance, currentListener, () => {
    if (
      !instance.state.isVisible &&
      instance.popper.parentNode &&
      instance.popper.parentNode.contains(instance.popper)
    ) {
      callback();
    }
  });
}

function onTransitionedIn(
  instance: Instance,
  currentListener: ((event: TransitionEvent) => void) | undefined,
  callback: () => void
): ((event: TransitionEvent) => void) | undefined {
  return onTransitionEnd(instance, currentListener, callback);
}

function onTransitionEnd(
  instance: Instance,
  currentListener: ((event: TransitionEvent) => void) | undefined,
  callback: () => void
): ((event: TransitionEvent) => void) | undefined {
  const {box} = getChildren(instance.popper);

  function listener(event: TransitionEvent): void {
    if (event.target === box) {
      updateTransitionEndListener(box, 'remove', listener);
      callback();
    }
  }

  // Make callback synchronous if duration is 0
  // `transitionend` won't fire otherwise
  if (getComputedStyle(box).transitionDuration === '0s') {
    callback();
    return;
  }

  updateTransitionEndListener(box, 'remove', currentListener);
  updateTransitionEndListener(box, 'add', listener);

  return listener;
}

function objectMount(instance: Instance): void {
  if (typeof instance.props.animation === 'object') {
    instance.props.animation.show(instance);
  }
}

function objectHide(instance: Instance): void {
  if (typeof instance.props.animation === 'object') {
    instance.props.animation.hide(instance);
  } else if (!instance.props.animation) {
    instance.unmount();
  }
}

const animation: Animation = {
  name: 'animation',
  defaultValue: 'fade',
  fn(instance) {
    let currentListener: ((event: TransitionEvent) => void) | undefined;

    return {
      onMount() {
        // reflow to begin CSS transition
        void instance.popper.offsetHeight;

        const animation = instance.props.animation;

        if (
          getIsDefaultRenderFn(instance.props.render) &&
          typeof animation === 'string'
        ) {
          instance.popper.style.visibility = 'visible';
          const {box, content} = getChildren(instance.popper);
          setVisibilityState([box, content], 'visible');

          currentListener = onTransitionedIn(instance, currentListener, () => {
            // TODO: Decide what to do with `onShown`.
            // instance.state.isShown = true;
            // invokeHook('onShown', [instance]);
          });
        }

        objectMount(instance);
      },
      onHide() {
        const animation = instance.props.animation;

        if (
          getIsDefaultRenderFn(instance.props.render) &&
          typeof animation === 'string'
        ) {
          instance.popper.style.visibility = 'hidden';
          const {box, content} = getChildren(instance.popper);
          setVisibilityState([box, content], 'hidden');

          currentListener = onTransitionedOut(
            instance,
            currentListener,
            instance.unmount
          );
        }

        objectHide(instance);
      },
    };
  },
};

const headlessAnimation: HeadlessAnimation = {
  name: 'animation',
  defaultValue: false,
  fn(instance) {
    return {
      onMount() {
        objectMount(instance);
      },
      onHide() {
        objectHide(instance);
      },
    };
  },
};

export {animation, headlessAnimation};
