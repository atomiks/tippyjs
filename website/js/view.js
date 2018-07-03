import { h } from 'hyperapp'
import Header from './components/Header'
import Main from './components/Main'

export default (state, actions) => (
  <div class="app">
    <Header />
    <Main />
  </div>
)
