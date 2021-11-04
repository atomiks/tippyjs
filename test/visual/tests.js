import tippy from '../../src';
import {render} from '../../src/template';
import {ROUND_ARROW as roundArrow} from '../../src/constants';
import sticky from '../../src/plugins/sticky';
import inlinePositioning from '../../src/plugins/inlinePositioning';
import followCursor from '../../src/plugins/followCursor';
import animateFill from '../../src/plugins/animateFill';
import createSingleton from '../../src/addons/createSingleton';
import delegate from '../../src/addons/delegate';

import '../../src/scss/index.scss';
import '../../src/scss/border.scss';
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

tippy.setDefaultProps({render, appendTo: document.body});

window.state = {
  currentTest: '',
  tests: {},
};

const tests = window.state.tests;

tests.default = () => {
  const content = document.createDocumentFragment();
  const svgA = document.createElement('svg');
  const svgB = document.createElement('svg');

  content.appendChild(svgA);
  content.appendChild(svgB);

  const [instance] = tippy('#default .reference', {
    content: 'hello',
    arrow: content,
    interactive: true,
    trigger: 'click focus',
  });

  console.log(instance.props.appendTo);

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

  ['top', 'right', 'bottom', 'left'].forEach((placement) => {
    const [instance] = tippy('#inlinePositioning .reference-connected', {
      placement,
      content: 'tippy',
      trigger: 'manual',
      inlinePositioning: true,
      plugins: [inlinePositioning],
      hideOnClick: false,
      showOnCreate: true,
      duration: 0,
    });

    instances.push(instance);
  });

  for (let i = 0; i < 2; i++) {
    ['top', 'right', 'bottom', 'left'].forEach((placement) => {
      const [instance] = tippy('#inlinePositioning .reference-disconnected', {
        placement,
        content: 'tippy',
        inlinePositioning: true,
        plugins: [inlinePositioning],
        hideOnClick: false,
        showOnCreate: true,
        duration: 0,
      });

      const rects = instance.reference.getClientRects();

      instance.reference.dispatchEvent(
        new MouseEvent('mouseenter', {
          clientX: rects[i].left,
          clientY: rects[i].top,
        })
      );

      instance.setProps({trigger: 'manual'});

      instances.push(instance);
    });
  }

  return () => {
    instances.forEach((instance) => instance.destroy());
  };
};

tests.followCursor = () => {
  const instances = [];

  [true, false, 'vertical', 'horizontal', 'initial', 'contentChange'].forEach(
    (test) => {
      let interval;

      const [instance] = tippy(`#followCursor [data-test="${test}"]`, {
        content: 'tippy',
        followCursor: test === 'contentChange' ? true : test,
        plugins: [followCursor],
        delay: [50, 0],
        duration: 0,
        appendTo: 'parent',
        ...(test === 'contentChange' && {
          onCreate({setContent}) {
            const contentLoop = ['.', '....', '..........'];
            let index = 0;

            interval = setInterval(() => {
              setContent(contentLoop[index++]);

              if (index === 3) {
                clearInterval(interval);
              }
            }, 50);
          },
          onDestroy() {
            clearInterval(interval);
          },
        }),
      });

      instances.push(instance);
    }
  );

  return () => {
    instances.forEach((instance) => instance.destroy());
  };
};

tests.themes = () => {
  const instances = [];

  const themes = ['dark', 'light', 'light-border', 'material', 'translucent'];
  const placements = ['top', 'bottom', 'left', 'right'];
  const arrows = [false, true, roundArrow];

  const container = document.querySelector('#themes .wrapper');

  themes.forEach((theme) => {
    const heading = document.createElement('h3');
    heading.textContent = theme;
    container.appendChild(heading);

    placements.forEach((placement) => {
      arrows.forEach((arrow) => {
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
    instances.forEach((instance) => instance.destroy());
    container.innerHTML = '';
  };
};

tests.animations = () => {
  const instances = [];

  const animations = ['fade'].concat(
    ['shift-away', 'shift-toward', 'scale', 'perspective'].reduce(
      (acc, animation) =>
        acc.concat(animation, `${animation}-subtle`, `${animation}-extreme`),
      []
    )
  );
  const placements = ['top', 'bottom', 'left', 'right'];
  const container = document.querySelector('#animations .wrapper');

  animations.forEach((animation) => {
    placements.forEach((placement) => {
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
    instances.forEach((instance) => instance.destroy());
    container.innerHTML = '';
  };
};

tests.createSingleton = () => {
  const wrapper = document.querySelector('#createSingleton .wrapper');
  const newReference = document.createElement('button');

  newReference.textContent = 'Reference';
  wrapper.append(newReference);

  let instances = tippy('#createSingleton .reference', {
    placement: 'bottom',
    duration: 0,
  });

  const singleton = createSingleton(instances, {
    delay: 500,
    overrides: ['placement', 'duration'],
    showOnCreate: true,
  });

  instances = instances.concat(
    tippy(newReference, {
      content: 'hello',
    })
  );

  singleton.setInstances(instances);
  singleton.setProps({overrides: ['duration']});

  return () => {
    instances.forEach((instance) => instance.destroy());
    singleton.destroy();
  };
};

tests.delegate = () => {
  const refs = Array.from(document.querySelectorAll('#delegate button'));

  refs.forEach((ref) => {
    ref.oncontextmenu = (e) => e.preventDefault();
  });

  const instances = delegate('#delegate', {
    target: 'button',
    trigger: 'click',
  });

  return () => instances.forEach((instance) => instance.destroy());
};

tests.animateFill = () => {
  const instances = [];

  ['top', 'right', 'bottom', 'left'].forEach((placement) => {
    const [instance] = tippy('#animateFill .reference', {
      placement,
      content: 'Tippy',
      animateFill: true,
      plugins: [animateFill],
    });

    instances.push(instance);
  });

  return () => {
    instances.forEach((instance) => instance.destroy());
  };
};

tests.border = () => {
  const props = {
    content: 'Tippy',
    theme: 'border',
    duration: 0,
    showOnCreate: true,
  };

  const instances = [
    tippy('#border .reference:first-child', props),
    tippy('#border .reference:first-child', {
      ...props,
      placement: 'bottom',
    }),
    tippy('#border .reference:first-child', {
      ...props,
      placement: 'right',
    }),
    tippy('#border .reference:first-child', {
      ...props,
      placement: 'left',
    }),
    tippy('#border .reference:last-child', {
      arrow: roundArrow + roundArrow,
      ...props,
    }),
    tippy('#border .reference:last-child', {
      arrow: roundArrow + roundArrow,
      placement: 'bottom',
      ...props,
    }),
    tippy('#border .reference:last-child', {
      arrow: roundArrow + roundArrow,
      placement: 'right',
      ...props,
    }),
    tippy('#border .reference:last-child', {
      arrow: roundArrow + roundArrow,
      placement: 'left',
      ...props,
    }),
  ].flat();

  return () => {
    instances.forEach((instance) => instance.destroy());
  };
};
