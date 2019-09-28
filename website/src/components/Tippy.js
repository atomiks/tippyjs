import React, { forwardRef } from 'react'
import Tippy, { TippySingleton, tippy, roundArrow } from '../tippy.js'

import '../../../dist/backdrop.css'
import '../../../dist/svg-arrow.css'

import '../../../themes/light.css'
import '../../../themes/light-border.css'
import '../../../themes/material.css'
import '../../../themes/translucent.css'

import '../../../animations/perspective.css'
import '../../../animations/perspective-subtle.css'
import '../../../animations/perspective-extreme.css'
import '../../../animations/scale.css'
import '../../../animations/scale-subtle.css'
import '../../../animations/scale-extreme.css'
import '../../../animations/shift-away.css'
import '../../../animations/shift-away-subtle.css'
import '../../../animations/shift-away-extreme.css'
import '../../../animations/shift-toward.css'
import '../../../animations/shift-toward-subtle.css'
import '../../../animations/shift-toward-extreme.css'

export default forwardRef(({ ...props }, ref) => {
  if (props.arrow === 'round') {
    props.arrow = roundArrow
  }

  return <Tippy content="I'm a Tippy tooltip!" {...props} ref={ref} />
})

export { TippySingleton, tippy }
