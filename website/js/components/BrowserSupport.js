import { h } from 'hyperapp'
import pkg from '../../../package.json'
import { emoji } from '../utils'

export default () => (state, actions) => (
  <section class="section" id="browser-support">
    <div class="section__icon-wrapper" oncreate={emoji('💻')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#browser-support">
        Browser support
      </a>
    </div>
    <h3 style={{ fontWeight: '400' }}>
      Current support (tracked): <strong>96% Global</strong>,{' '}
      <strong>99% USA</strong>
    </h3>
    <p>
      Tippy supports browsers with <code>requestAnimationFrame</code> and{' '}
      <code>MutationObserver</code> support: See{' '}
      <a href="https://caniuse.com/#feat=mutationobserver" target="_blank">
        caniuse data
      </a>.
    </p>
    <p>
      IE10 is only partially supported unless you polyfill{' '}
      <code>MutationObserver</code>, then it is fully supported.{' '}
      <code>dynamicTitle</code> relies on it.
    </p>
  </section>
)
