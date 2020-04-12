import React, {forwardRef} from 'react';
import Tippy, {useSingleton, tippy} from '@tippyjs/react';
import {
  roundArrow,
  followCursor,
  animateFill,
  inlinePositioning,
  sticky,
} from 'tippy.js';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/dist/svg-arrow.css';

import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';

import 'tippy.js/animations/perspective.css';
import 'tippy.js/animations/perspective-subtle.css';
import 'tippy.js/animations/perspective-extreme.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/animations/scale-subtle.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-away.css';
import 'tippy.js/animations/shift-away-subtle.css';
import 'tippy.js/animations/shift-away-extreme.css';
import 'tippy.js/animations/shift-toward.css';
import 'tippy.js/animations/shift-toward-subtle.css';
import 'tippy.js/animations/shift-toward-extreme.css';

const hideOnPopperBlur = {
  name: 'hideOnPopperBlur',
  defaultValue: true,
  fn(instance) {
    return {
      onCreate() {
        instance.popper.addEventListener('focusout', (event) => {
          if (
            instance.props.hideOnPopperBlur &&
            event.relatedTarget &&
            !instance.popper.contains(event.relatedTarget)
          ) {
            instance.hide();
          }
        });
      },
    };
  },
};

const hideOnEsc = {
  name: 'hideOnEsc',
  defaultValue: false,
  fn({hide}) {
    function onKeyDown(event) {
      if (event.keyCode === 27) {
        hide();
      }
    }

    return {
      onShow() {
        document.addEventListener('keydown', onKeyDown);
      },
      onHide() {
        document.removeEventListener('keydown', onKeyDown);
      },
    };
  },
};

export default forwardRef(({...props}, ref) => {
  if (props.arrow === 'round') {
    props.arrow = roundArrow;
  }

  return (
    <Tippy
      content="I'm a Tippy tooltip!"
      plugins={[
        followCursor,
        animateFill,
        inlinePositioning,
        sticky,
        hideOnPopperBlur,
        hideOnEsc,
        ...(props.plugins || []),
      ]}
      {...props}
      ref={ref}
    />
  );
});

export {useSingleton, tippy};
