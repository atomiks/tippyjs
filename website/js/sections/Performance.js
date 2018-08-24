import { h } from 'hyperapp'
import pkg from '../../../package.json'
import Emoji from '../components/Emoji'
import Tippy from '../components/Tippy'
import Heading from '../components/Heading'

export default () => (state, actions) => (
  <section class="section">
    <Emoji class="section__icon-wrapper">⚡️</Emoji>
    <Heading>Performance</Heading>

    <p>Tested with 2.6 GHz Skylake MacBook Pro using Chrome 67:</p>
    <ul>
      <li>
        <strong>
          <code>tippy.all.min.js</code> evaluation time:
        </strong>{' '}
        5ms
      </li>
      <li>
        <strong>Performance mode off (default):</strong> 1.3ms per 10 elements
      </li>
      <li>
        <strong>Performance mode on:</strong> 1ms per 10 elements
      </li>
      <li>
        <strong>Lazy mode off:</strong> 3ms per 10 elements
      </li>
      <li>
        <strong>Event delegation:</strong> &lt;1ms for any number of child
        elements
      </li>
    </ul>
  </section>
)
