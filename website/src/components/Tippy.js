import Tippy, { TippyGroup, tippy } from '@tippy.js/react'
import 'tippy.js/themes/light.css'
import 'tippy.js/themes/light-border.css'
import 'tippy.js/themes/google.css'

Tippy.defaultProps = { content: "I'm a Tippy tooltip!" }

export default Tippy
export { TippyGroup, tippy }
