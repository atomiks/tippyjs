import tippy from '../../src';
import '../../src/scss/index.scss';
import '../../src/scss/animations/shift-away.scss';
import '../../src/scss/animations/shift-away-subtle.scss';
import '../../src/scss/animations/shift-away-extreme.scss';
import '../../src/scss/animations/shift-toward.scss';
import '../../src/scss/animations/shift-toward-extreme.scss';
import '../../src/scss/animations/shift-toward-subtle.scss';
import '../../src/scss/animations/perspective.scss';
import '../../src/scss/animations/perspective-extreme.scss';
import '../../src/scss/animations/perspective-subtle.scss';
import '../../src/scss/animations/scale.scss';
import '../../src/scss/animations/scale-subtle.scss';
import '../../src/scss/animations/scale-extreme.scss';

const container = document.querySelector('.container');

const animations = [
  'fade',
  'shift-away',
  'shift-away-subtle',
  'shift-away-extreme',
  'shift-toward',
  'shift-toward-extreme',
  'shift-toward-subtle',
  'perspective',
  'perspective-extreme',
  'perspective-subtle',
  'scale',
  'scale-subtle',
  'scale-extreme',
];
const placements = ['top', 'bottom', 'left', 'right'];

animations.forEach(animation => {
  const h1 = document.createElement('h1');
  h1.textContent = animation;
  container.appendChild(h1);

  placements.forEach(placement => {
    const button = document.createElement('button');
    button.textContent = placement;
    container.appendChild(button);

    tippy(button, {
      content: 'Tooltip',
      animateFill: false,
      duration: 2000,
      animation,
      placement,
    });
  });
});
