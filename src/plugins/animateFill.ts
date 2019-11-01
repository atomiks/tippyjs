import {AnimateFill} from '../types';
import {BACKDROP_CLASS} from '../constants';
import {div, setVisibilityState} from '../utils';
import {isUCBrowser} from '../browser';
import {warnWhen} from '../validation';

const animateFill: AnimateFill = {
  name: 'animateFill',
  defaultValue: false,
  fn(instance) {
    const {tooltip, content} = instance.popperChildren;

    const backdrop =
      instance.props.animateFill && !isUCBrowser
        ? createBackdropElement()
        : null;

    function addBackdropToPopperChildren(): void {
      instance.popperChildren.backdrop = backdrop;
    }

    return {
      onCreate(): void {
        if (backdrop) {
          addBackdropToPopperChildren();

          tooltip.insertBefore(backdrop, tooltip.firstElementChild!);
          tooltip.setAttribute('data-animatefill', '');
          tooltip.style.overflow = 'hidden';

          instance.setProps({animation: 'shift-away', arrow: false});
        }
      },
      onMount(): void {
        if (backdrop) {
          const {transitionDuration} = tooltip.style;
          const duration = Number(transitionDuration.replace('ms', ''));

          // The content should fade in after the backdrop has mostly filled the
          // tooltip element. `clip-path` is the other alternative but is not
          // well-supported and is buggy on some devices.
          content.style.transitionDelay = `${Math.round(duration / 10)}ms`;

          backdrop.style.transitionDuration = transitionDuration;
          setVisibilityState([backdrop], 'visible');

          // Warn if the stylesheets are not loaded
          if (__DEV__) {
            warnWhen(
              getComputedStyle(backdrop).position !== 'absolute',
              `The \`tippy.js/dist/backdrop.css\` stylesheet has not been
              imported!
              
              The \`animateFill\` plugin requires this stylesheet to work.`,
            );

            warnWhen(
              getComputedStyle(tooltip).transform === 'none',
              `The \`tippy.js/animations/shift-away.css\` stylesheet has not
              been imported!
              
              The \`animateFill\` plugin requires this stylesheet to work.`,
            );
          }
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
      onAfterUpdate(): void {
        // With this type of prop, it's highly unlikely it will be changed
        // dynamically. We'll leave out the diff/update logic it to save bytes.

        // `popperChildren` is assigned a new object onAfterUpdate
        addBackdropToPopperChildren();
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
