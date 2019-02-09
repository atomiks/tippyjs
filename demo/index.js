import tippy from '../src/js'
import '../src/scss/index.scss'
import '../src/scss/themes/light-border.scss'

tippy.group(tippy('.group', { content: 'Tooltip' }), {
  delay: 1000,
  duration: tippy.defaults.duration,
})

tippy('body', {
  appendTo: ref => ref.parentNode,
  target: '.delegation',
})
