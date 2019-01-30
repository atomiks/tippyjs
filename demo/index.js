import tippy from '../src/js'
import '../src/scss/index.scss'
import '../src/scss/themes/light-border.scss'

tippy('[data-tippy-content]')

tippy.group(tippy('.group', { content: 'Tooltip' }), {
  delay: 1000,
  duration: tippy.defaults.duration,
})
