import React, {forwardRef} from 'react';
import Tippy, {TippySingleton, tippy} from '@tippy.js/react';
import {roundArrow, followCursor, animateFill} from 'tippy.js';

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

export default forwardRef(({...props}, ref) => {
  if (props.arrow === 'round') {
    props.arrow = roundArrow;
  }

  return (
    <Tippy
      content="I'm a Tippy tooltip!"
      plugins={[followCursor, animateFill]}
      {...props}
      ref={ref}
    />
  );
});

export {TippySingleton, tippy};
