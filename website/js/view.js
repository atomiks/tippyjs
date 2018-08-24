import { h } from 'hyperapp'
import Header from './sections/Header'
import Main from './sections/Main'

export default (state, actions) => (
  <div class="app">
    <Header />
    <Main />
  </div>
)
