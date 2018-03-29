import { h, app } from 'hyperapp'

import tippy from '../dist/tippy.js'
import '../dist/tippy.css'

import 'normalize.css' // Normalize different browser CSS styling
import './css/index.scss' // CSS for docs
import 'focus-visible' // Polyfills :focus-visible so that only keyboard use triggers a focus ring.
import Prism from 'prismjs' // Syntax highlighting
import feather from 'feather-icons' // Icons

import Header from './js/components/Header'
import Main from './js/components/Main'

import state from './js/state'
import actions from './js/actions'

const view = (state, actions) => (
  <div class="app">
    <Header />
    <Main />
  </div>
)

app(state, actions, view, document.body)

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
})
