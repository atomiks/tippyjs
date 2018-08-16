import tippy from '../../src/js/tippy.js'
import '../../src/scss/tippy.scss'

window.tippy = tippy

tippy('button:not([data-exclude]), p', {
  content: 'Tippy tooltip'
})

const template = document.createElement('div')
template.innerHTML = '<strong>tooltip</strong>'
tippy('.html', {
  content: template
})

tippy('.multiple', {
  content: 'tooltip'
})
tippy('.multiple', {
  content: '<strong>popover</strong>',
  trigger: 'click'
})
