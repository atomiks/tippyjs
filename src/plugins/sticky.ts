import {LifecycleHooks, Instance} from '../types';

export default {
  name: 'sticky',
  defaultValue: false,
  fn(instance: Instance): Partial<LifecycleHooks> {
    const {reference, popper} = instance;

    function shouldCheck(value: 'reference' | 'popper'): boolean {
      return instance.props.sticky === true || instance.props.sticky === value;
    }

    let prevRefRect: ClientRect | null = null;
    let prevPopRect: ClientRect | null = null;

    function updatePosition(): void {
      const currentRefRect = shouldCheck('reference')
        ? reference.getBoundingClientRect()
        : null;
      const currentPopRect = shouldCheck('popper')
        ? popper.getBoundingClientRect()
        : null;

      // Schedule an update if the reference rect has changed
      if (
        (currentRefRect && areRectsDifferent(prevRefRect, currentRefRect)) ||
        (currentPopRect && areRectsDifferent(prevPopRect, currentPopRect))
      ) {
        instance.popperInstance!.update();
      }

      prevRefRect = currentRefRect;
      prevPopRect = currentPopRect;

      if (instance.state.isMounted) {
        requestAnimationFrame(updatePosition);
      }
    }

    return {
      onMount(): void {
        if (instance.props.sticky) {
          updatePosition();
        }
      },
    };
  },
};

function areRectsDifferent(
  rectA: ClientRect | null,
  rectB: ClientRect | null,
): boolean {
  if (rectA && rectB) {
    return (
      rectA.top !== rectB.top ||
      rectA.right !== rectB.right ||
      rectA.bottom !== rectB.bottom ||
      rectA.left !== rectB.left
    );
  }

  return true;
}
