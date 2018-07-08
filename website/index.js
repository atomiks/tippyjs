import '../dist/tippy.css'
import '../dist/themes/light.css'
import '../dist/themes/translucent.css'
import 'normalize.css'
import './css/index.scss'
import 'focus-visible'
import { app } from 'hyperapp'
import { withRender } from '@hyperapp/render/src/browser'
import { isBrowser, prerender } from './js/utils'
import state from './js/state'
import actions from './js/actions'
import view from './js/view'

const main = withRender(app)(state, actions, view, isBrowser && document.body)
prerender(main, '<body>')
