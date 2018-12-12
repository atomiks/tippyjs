import tippy from '../../src/js/index'
import '../../src/scss/tippy.scss'
import '../../src/scss/themes/light-border.scss'

window.tippy = tippy

tippy('button:not([data-exclude]), p', {
  content: 'I am a Tippy tooltip',
})

const template = document.createElement('div')
template.innerHTML = '<strong>tooltip</strong>'
tippy('.html', {
  content: template,
})

tippy('.multiple', {
  content: 'tooltip',
})
tippy('.multiple', {
  content: '<strong>popover</strong>',
  trigger: 'click',
})
