import { h } from 'hyperapp'
import Emoji from '../components/Emoji'
import Heading from '../components/Heading'

export default () => (state, actions) => (
  <section class="section" id="browser-support">
    <Emoji class="section__icon-wrapper">💻</Emoji>
    <Heading>Browser support</Heading>
    <p>
      Tippy supports browsers with <code>requestAnimationFrame</code> and{' '}
      <code>MutationObserver</code> support: See{' '}
      <a
        href="https://caniuse.com/#feat=mutationobserver"
        target="_blank"
        rel="noopener"
      >
        caniuse data
      </a>.
    </p>
    <p>
      IE10 is only partially supported unless you polyfill{' '}
      <code>MutationObserver</code>, then it is fully supported.
    </p>
  </section>
)
