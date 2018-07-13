import 'normalize.css'
import './css/index.scss'
import 'focus-visible'
import '../dist/tippy.css'
import '../dist/themes/light.css'
import '../dist/themes/translucent.css'
import { h, app } from 'hyperapp'
import { withRender } from '@hyperapp/render/browser/module'
import tippy from '../dist/tippy.js'
import Prism from 'prismjs'
import feather from 'feather-icons'
import Header from './js/components/Header'
import Main from './js/components/Main'
import state from './js/state'
import actions from './js/actions'
import { isBrowser } from './js/utils'

const view = (state, actions) => (
  <div class="app">
    <Header />
    <Main />
  </div>
)

const main = withRender(app)(state, actions, view, isBrowser && document.body)
// Prerender
if (!isBrowser) {
  const tag = '<body>'
  const output = './docs/index.html'
  if (!isBrowser) {
    const fs = __prerenderRequire('fs')
    const html = fs.readFileSync(output, 'utf8')
    fs.writeFileSync(output, html.replace(tag, tag + main))
  }
}

if (isBrowser) {
  setTimeout(() => {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-tippy], [data-tippy-delegate]'),
      el => {
        if (!el.hasAttribute('data-local') && el._tippy) {
          el._tippy.destroy()
        }
      }
    )

    tippy('[title]:not(.tippy):not([data-exclude])')
    tippy('.tippy', {
      arrow: true,
      hideOnClick: false,
      maxWidth: '250px',
      animation: 'fade',
      livePlacement: false,
      distance: 7
    })
    tippy('#demo__event-delegation', { target: 'button' })

    feather.replace()
    Prism.highlightAll()

    if (location.hash) {
      document.querySelector(location.hash).scrollIntoView()
    }
  })
}
