import tippy from '../../src';
import {render} from '../../src/template';
import {ROUND_ARROW as roundArrow} from '../../src/constants';
import sticky from '../../src/plugins/sticky';
import inlinePositioning from '../../src/plugins/inlinePositioning';
import followCursor from '../../src/plugins/followCursor';
import animateFill from '../../src/plugins/animateFill';
import createSingleton from '../../src/addons/createSingleton';

import '../../src/scss/index.scss';
import '../../src/scss/svg-arrow.scss';
import '../../src/scss/backdrop.scss';

import '../../src/scss/themes/light.scss';
import '../../src/scss/themes/light-border.scss';
import '../../src/scss/themes/material.scss';
import '../../src/scss/themes/translucent.scss';

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

tippy.setDefaultProps({render});

window.state = {
  currentTest: '',
  tests: {},
};

const tests = window.state.tests;

tests.default = () => {
  const [instance] = tippy('#default .reference', {
    content: 'Tippy',
  });

  return instance.destroy;
};

tests.sticky = () => {
  const reference = document.querySelector('#sticky .reference');

  const instance = tippy(reference, {
    content: 'tippy',
    sticky: true,
    plugins: [sticky],
    showOnCreate: true,
    duration: 0,
    hideOnClick: false,
    trigger: 'manual',
    onMount() {
      reference.style.transform = 'translateY(150px)';
    },
  });

  document.querySelector('#sticky .animation').onclick = () => {
    reference.classList.add('animate');
  };

  return instance.destroy;
};

tests.inlinePositioning = () => {
  const instances = [];

  ['top', 'right', 'bottom', 'left'].forEach(placement => {
    const [instance] = tippy('#inlinePositioning .reference', {
      placement,
      content: 'tippy',
      trigger: 'manual',
      inlinePositioning: true,
      plugins: [inlinePositioning],
      showOnCreate: true,
      duration: 0,
      hideOnClick: false,
    });

    instances.push(instance);
  });

  return () => {
    instances.forEach(instance => instance.destroy());
  };
};

tests.followCursor = () => {
  let interval;

  const [instance] = tippy('#followCursor .reference', {
    content: Math.random(),
    followCursor: 'initial',
    plugins: [followCursor],
    delay: [100, 10000],
    appendTo: 'parent',
    onCreate({setContent}) {
      interval = setInterval(() => {
        setContent(Math.random());
      }, 1000);
    },
    onDestroy() {
      clearInterval(interval);
    },
  });

  return instance.destroy;
};

tests.themes = () => {
  const instances = [];

  const themes = ['dark', 'light', 'light-border', 'material', 'translucent'];
  const placements = ['top', 'bottom', 'left', 'right'];
  const arrows = [false, true, roundArrow];

  const container = document.querySelector('#themes .wrapper');

  themes.forEach(theme => {
    const heading = document.createElement('h3');
    heading.textContent = theme;
    container.appendChild(heading);

    placements.forEach(placement => {
      arrows.forEach(arrow => {
        const button = document.createElement('button');
        button.textContent = 'ref';
        button.style.margin = '0 5px';
        container.appendChild(button);

        const instance = tippy(button, {
          content: '.',
          showOnCreate: true,
          duration: 0,
          trigger: 'manual',
          hideOnClick: false,
          arrow,
          theme,
          placement,
        });

        instances.push(instance);
      });
    });
  });

  return () => {
    instances.forEach(instance => instance.destroy());
    container.innerHTML = '';
  };
};

tests.animations = () => {
  const instances = [];

  const animations = ['fade'].concat(
    ['shift-away', 'shift-toward', 'scale', 'perspective'].reduce(
      (acc, animation) =>
        acc.concat(animation, `${animation}-subtle`, `${animation}-extreme`),
      [],
    ),
  );
  const placements = ['top', 'bottom', 'left', 'right'];
  const container = document.querySelector('#animations .wrapper');

  animations.forEach(animation => {
    placements.forEach(placement => {
      const button = document.createElement('button');
      button.textContent = animation;
      container.appendChild(button);

      const instance = tippy(button, {
        content: 'Tippy',
        animation,
        placement,
      });

      instances.push(instance);
    });
  });

  return () => {
    instances.forEach(instance => instance.destroy());
    container.innerHTML = '';
  };
};

tests.createSingleton = () => {
  const instances = tippy('#createSingleton .reference', {
    placement: 'bottom',
    duration: 0,
  });
  const singleton = createSingleton(instances, {
    delay: 500,
    overrides: ['placement', 'duration'],
  });

  return () => {
    instances.forEach(instance => instance.destroy());
    singleton.destroy();
  };
};

tests.animateFill = () => {
  const instances = [];

  ['top', 'right', 'bottom', 'left'].forEach(placement => {
    const [instance] = tippy('#animateFill .reference', {
      placement,
      content: 'Tippy',
      animateFill: true,
      plugins: [animateFill],
    });

    instances.push(instance);
  });

  return () => {
    instances.forEach(instance => instance.destroy());
  };
};
