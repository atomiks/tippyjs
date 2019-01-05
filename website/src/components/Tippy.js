import Tippy from '@tippy.js/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/dist/themes/light.css'
import 'tippy.js/dist/themes/light-border.css'
import 'tippy.js/dist/themes/google.css'

Tippy.defaultProps = {
  content: "I'm a Tippy tooltip!",
  performance: true,
}

export default Tippy
