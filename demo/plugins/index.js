import tippy from '../../src';
import animateFill from '../../src/plugins/animateFill';
import followCursor from '../../src/plugins/followCursor';
import inlinePositioning from '../../src/plugins/inlinePositioning';
import sticky from '../../src/plugins/sticky';
import transitionDimensions from '../../src/plugins/transitionDimensions';

import '../../src/scss/index.scss';
import '../../src/scss/backdrop.scss';
import '../../src/scss/animations/shift-away.scss';

tippy.setDefaultProps({
  plugins: [
    animateFill,
    followCursor,
    sticky,
    inlinePositioning,
    transitionDimensions,
  ],
});

tippy('.followCursor', {
  content: 'tooltip',
  animation: 'fade',
  arrow: false,
  delay: [500, 100],
  followCursor: true,
  placement: 'top-start',
  onCreate({setContent}) {
    setInterval(() => {
      setContent(Math.random());
    }, 1000);
  },
});

tippy('.sticky', {
  content: 'tooltip',
  sticky: true,
  showOnCreate: true,
});

tippy('.animateFill', {
  content: 'tooltip',
  animateFill: true,
});

const placements = ['top', 'bottom', 'left', 'right'];
placements.forEach(placement => {
  tippy('.inlinePositioning', {
    content: 'tooltip',
    multiple: true,
    inlinePositioning: true,
    placement,
  });
});

let contentIndex = 0;
const content = [
  'text',
  'text '.repeat(2),
  'text '.repeat(5),
  'text '.repeat(15),
];

const html = document.createElement('div');
html.innerHTML = content[0];

tippy('.transitionDimensions', {
  content: html,
  transitionDimensions: true,
  updateDuration: 300,
  onCreate(instance) {
    setInterval(() => {
      contentIndex = contentIndex === content.length - 1 ? 0 : ++contentIndex;
      html.innerHTML = content[contentIndex];
      instance.setContent(html);
    }, 1000);
  },
});
