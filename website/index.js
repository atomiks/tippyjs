import { h, app } from 'hyperapp'

import tippy from '../src/js/tippy.js'
import '../src/scss/tippy.scss'
import '../src/scss/themes/light.scss'
import '../src/scss/themes/translucent.scss'

import 'normalize.css' // Normalize different browser CSS styling
import './css/index.scss' // CSS for docs
import 'focus-visible' // Polyfills :focus-visible so that only keyboard use triggers a focus ring.
import Prism from 'prismjs' // Syntax highlighting
import feather from 'feather-icons' // Icons

import * as HeaderComponent from './js/components/Header'
import * as MainComponent from './js/components/Main'

const { view: Header } = HeaderComponent
const { view: Main } = MainComponent

const state = {
  header: HeaderComponent.state,
  main: MainComponent.state
}

const actions = {
  init() {
    ;[].forEach.call(document.querySelectorAll('[data-tippy], [data-tippy-delegate]'), el => {
      if (!el.hasAttribute('data-local') && el._tippy) {
        el._tippy.destroy()
      }
    })

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
  },
  header: HeaderComponent.actions,
  main: MainComponent.actions
}

const view = (state, actions) => (
  <div class="app" oncreate={actions.init}>
    <Header state={state.header} actions={actions.header} />
    <Main state={state.main} actions={actions.main} />
  </div>
)

app(state, actions, view, document.body)
