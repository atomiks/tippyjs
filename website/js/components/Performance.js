import { h } from 'hyperapp'
import pkg from '../../../package.json'
import Emoji from './Emoji'
import Tippy from './Tippy'
import Heading from './Heading'

export default () => (state, actions) => (
  <section class="section" id="performance">
    <Emoji class="section__icon-wrapper">⚡️</Emoji>
    <Heading>Performance</Heading>
    <form>
      <input
        placeholder="Enter number of elements"
        oninput={actions.performance.setInputValue}
      />
      <button type="button" onclick={actions.performance.test}>
        Test
      </button>
    </form>
    <ul>
      {[...Array(state.performance.numberOfElements)].map((_, i) => (
        <button class="btn">{i + 1}</button>
      ))}
      <li>
        <strong>Performance mode off:</strong> 13 ms per 100 elements
      </li>
      <li>
        <strong>Performance mode on:</strong> 6 ms per 100 elements
      </li>
      <li>
        <strong>Event delegation:</strong> &lt;1 ms for 1 element!
      </li>
    </ul>
  </section>
)
