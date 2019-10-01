import Flipper from 'react-flip-toolkit/core';
import tippy from '../../src';
import '../../src/scss/index.scss';

const container = document.querySelector('.container');

const button = document.createElement('button');
button.style.transform = 'translate(100px, 300px)';
button.textContent = 'Reference';
container.appendChild(button);

const tippyContent = document.createElement('div');
const btn = document.createElement('button');
const wrapper = document.createElement('div');
const img = document.createElement('img');

tippyContent.appendChild(btn);
tippyContent.appendChild(wrapper);

img.src =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60';
img.style.width = '300px';
img.style.display = 'block';
img.style.transform = 'scale(1.1)';
img.style.marginTop = '20px';

wrapper.appendChild(img);
wrapper.style.display = 'none';
btn.textContent = 'Open image';

let flipper = null;
let originalDimensions = null;
let isExpanded = false;
let wasInterrupted = false;
let wasManuallyUpdated = false;
const offsets = {prev: undefined, current: undefined, tween: undefined};

btn.onclick = () => {
  isExpanded = !isExpanded;

  wasManuallyUpdated = true;

  flipper.recordBeforeUpdate();

  Object.keys(instance.popperChildren).forEach(key => {
    if (instance.popperChildren[key]) {
      instance.popperChildren[key].style.transitionDuration = '0ms';
      instance.popperChildren[key].style.transitionProperty =
        'opacity, visibility';
    }
  });

  const {tooltip} = instance.popperChildren;
  tooltip.style.width = isExpanded ? '' : `${originalDimensions.width}px`;
  tooltip.style.height = isExpanded ? '' : `${originalDimensions.height}px`;

  instance.popperInstance.update();
  flipper.onUpdate();
};

function parseTranslate3d(string) {
  const match = string.match(/translate3d\((.+?),\s*(.+?),/);
  return {x: parseFloat(match[1]), y: parseFloat(match[2])};
}

const instance = tippy(button, {
  content: tippyContent,
  interactive: true,
  animation: 'fade',
  trigger: 'click',
  flipOnUpdate: true,
  arrow: false,
  updateDuration: 500,
  onCreate(instance) {
    const {popper} = instance;
    const {tooltip, content, arrow} = instance.popperChildren;

    popper.style.transitionProperty = 'padding';

    // Very first transition is jerky otherwise.
    content.style.willChange = 'transform';
    tooltip.style.textAlign = 'left';

    flipper = new Flipper({element: popper});

    flipper.addFlipped({
      element: tooltip,
      flipId: 'tooltip',
      spring: 'veryGentle',
      onStart() {
        // .disable() hides the tippy by default now
        instance.popperInstance.disableEventListeners();
      },
      onComplete() {
        instance.enable();
        wasManuallyUpdated = false;
      },
      // We need to ensure the popper's translation animation is in concert with
      // the dimensions spring animation so it stays perfectly positioned
      // throughout
      onSpringUpdate(springValue) {
        if (wasInterrupted) {
          // Since the FLIP animation was interrupted, the popper's translation
          // begins at the tweened offset
          offsets.prev = offsets.tween;
          wasInterrupted = false;
        }

        const {x: prevX, y: prevY} = offsets.prev;
        const {x: currentX, y: currentY} = offsets.current;

        // Calculate tweened offset
        const tweenedX = prevX - springValue * (prevX - currentX);
        const tweenedY = prevY - springValue * (prevY - currentY);

        // Write the current tweened offsets due to the FLIP animation
        offsets.tween = {x: tweenedX, y: tweenedY};

        // Set tweened transform
        const tweenedTransform = `translate3d(${tweenedX}px, ${tweenedY}px, 0)`;
        instance.popper.style.transform = tweenedTransform;
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
  },
  onMount() {
    const {tooltip} = instance.popperChildren;

    if (!originalDimensions) {
      originalDimensions = {
        width: tooltip.offsetWidth,
        height: tooltip.offsetHeight,
      };
      tooltip.style.width = `${originalDimensions.width}px`;
      tooltip.style.height = `${originalDimensions.height}px`;
      wrapper.style.display = 'block';
    }
  },
  onHidden() {
    const {content, tooltip, arrow} = instance.popperChildren;

    content.style.transform = '';
    tooltip.style.transform = '';

    if (arrow) {
      arrow.style.transform = '';
    }

    wasManuallyUpdated = false;
  },
  popperOptions: {
    onCreate(data) {
      const currentOffsets = parseTranslate3d(data.styles.transform);
      offsets.current = currentOffsets;
      offsets.prev = currentOffsets;
    },
    onUpdate(data) {
      const {arrow} = instance.popperChildren;

      // `react-flip-toolkit` adds this
      if (arrow) {
        arrow.style.transformOrigin = '';
      }

      wasInterrupted = true;
      offsets.prev = offsets.current;

      // We need to parse it because Popper rounds the values but doesn't expose
      // the rounded values for us...
      const currentOffsets = parseTranslate3d(data.styles.transform);

      offsets.current = currentOffsets;

      // Runs AFTER first `onSpringUpdate` frame
      requestAnimationFrame(() => {
        offsets.tween = currentOffsets;
      });

      // onSpringUpdate and popper's .update() run in different frames, leading to
      // 1 frame glitch
      if (wasManuallyUpdated) {
        const {x, y} = offsets.tween || offsets.prev;
        instance.popper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    },
  },
});
