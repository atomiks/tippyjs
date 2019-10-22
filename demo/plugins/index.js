import tippy from '../../src';
import animateFill from '../../src/plugins/animateFill';
import followCursor from '../../src/plugins/followCursor';
import inlinePositioning from '../../src/plugins/inlinePositioning';
import sticky from '../../src/plugins/sticky';

import '../../src/scss/index.scss';
import '../../src/scss/backdrop.scss';
import '../../src/scss/animations/shift-away.scss';

tippy.setDefaultProps({
  plugins: [animateFill, followCursor, sticky, inlinePositioning],
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
