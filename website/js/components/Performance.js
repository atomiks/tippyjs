import { h } from 'hyperapp'
import pkg from '../../../package.json'
import { emoji } from '../utils'

export default () => (state, actions) => (
  <section class="section" id="performance">
    <div class="section__icon-wrapper" oncreate={emoji('⚡️')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#performance">
        Performance
      </a>
    </div>
    <p>On a 2016 MacBook Pro 2.6 GHz Skylake, using Chrome 65:</p>
    <ul>
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
