import Tippy, { TippyGroup } from '@tippy.js/react'
import 'tippy.js/themes/light.css'
import 'tippy.js/themes/light-border.css'
import 'tippy.js/themes/google.css'

Tippy.defaultProps = {
  ...Tippy.defaultProps,
  content: "I'm a Tippy tooltip!",
}

export default Tippy
export { TippyGroup }
