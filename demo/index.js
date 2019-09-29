import tippy from '../src';
import '../src/scss/index.scss';

const container = document.querySelector('.container');

const button = document.createElement('button');
button.textContent = 'Reference';
container.appendChild(button);

tippy(button, {
  content: 'Tooltip',
});
