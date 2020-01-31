import {AnimateFill} from '../types';
import {BACKDROP_CLASS} from '../constants';
import {div, setVisibilityState} from '../dom-utils';
import {getChildren} from '../template';

const animateFill: AnimateFill = {
  name: 'animateFill',
  defaultValue: false,
  fn(instance) {
    const {box, content} = getChildren(instance.popper);

    const backdrop = instance.props.animateFill
      ? createBackdropElement()
      : null;

    return {
      onCreate(): void {
        if (backdrop) {
          box.insertBefore(backdrop, box.firstElementChild!);
          box.setAttribute('data-animatefill', '');
          box.style.overflow = 'hidden';

          instance.setProps({arrow: false, animation: 'shift-away'});
        }
      },
      onMount(): void {
        if (backdrop) {
          const {transitionDuration} = box.style;
          const duration = Number(transitionDuration.replace('ms', ''));

          // The content should fade in after the backdrop has mostly filled the
          // tooltip element. `clip-path` is the other alternative but is not
          // well-supported and is buggy on some devices.
          content.style.transitionDelay = `${Math.round(duration / 10)}ms`;

          backdrop.style.transitionDuration = transitionDuration;
          setVisibilityState([backdrop], 'visible');
        }
      },
      onShow(): void {
        if (backdrop) {
          backdrop.style.transitionDuration = '0ms';
        }
      },
      onHide(): void {
        if (backdrop) {
          setVisibilityState([backdrop], 'hidden');
        }
      },
    };
  },
};

export default animateFill;

function createBackdropElement(): HTMLDivElement {
  const backdrop = div();
  backdrop.className = BACKDROP_CLASS;
  setVisibilityState([backdrop], 'hidden');
  return backdrop;
}
