import tippy from '../../src';
import '../../src/scss/index.scss';
import createSingleton from '../../src/addons/createSingleton';
import delegate from '../../src/addons/delegate';
import transitionDimensions from '../../src/plugins/transitionDimensions';

delegate('#delegate', {target: 'button'});

let index = 0;

const content = [
  'Initial',
  'See as the tooltip',
  'Smoothly transitions in size',
  'This is a button that causes the tooltip to change height as well as width.',
];

const instances = tippy('.createSingleton', {
  content: () => content[index++],
});

const s = createSingleton(instances, {
  placement: 'bottom',
  flipOnUpdate: true,
  updateDuration: 300,
  delay: [0, 250],
  hideOnClick: false,
  boundary: 'viewport',
  transitionDimensions: true,
  plugins: [transitionDimensions],
});
