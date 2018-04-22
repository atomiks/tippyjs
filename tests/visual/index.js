import tippy from '../../src/js/tippy.js'
import '../../src/scss/tippy.scss'

tippy('button:not([data-exclude]), p', {
  content: 'Tippy tooltip'
})

const template = document.createElement('div')
template.innerHTML = '<strong>tooltip</strong>'
tippy('.html', {
  content: template
})
