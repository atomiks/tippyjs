import tippy from '../../src';
import {ROUND_ARROW as roundArrow} from '../../src/constants';

import '../../src/scss/index.scss';
import '../../src/scss/svg-arrow.scss';
import '../../src/scss/themes/light.scss';
import '../../src/scss/themes/light-border.scss';
import '../../src/scss/themes/material.scss';
import '../../src/scss/themes/translucent.scss';

const container = document.querySelector('.container');

const themes = ['dark', 'light', 'light-border', 'material', 'translucent'];
const placements = ['top', 'bottom', 'left', 'right'];
const arrows = [false, true, roundArrow];

themes.forEach(theme => {
  const h1 = document.createElement('h1');
  h1.textContent = theme;
  container.appendChild(h1);

  placements.forEach(placement => {
    arrows.forEach(arrow => {
      const button = document.createElement('button');
      button.textContent = 'Button';
      container.appendChild(button);

      tippy(button, {
        content: 'Tooltip',
        showOnCreate: true,
        theme,
        placement,
        arrow,
      });
    });
  });
});
