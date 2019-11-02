import {Sticky} from '../types';

const sticky: Sticky = {
  name: 'sticky',
  defaultValue: false,
  fn(instance) {
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

export default sticky;

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
