import { h } from 'hyperapp'
import { emoji } from '../utils'

import Code from './Code'

export default () => (state, actions) => (
  <section class="section" id="customizing-tooltips">
    <div class="section__icon-wrapper" oncreate={emoji('⚙️')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#customizing-tooltips">
        Customizing tooltips
      </a>
    </div>
    <p>
      <code>tippy()</code> takes an object of options as a second argument for
      you to customize the tooltips being created. Here's an example:
    </p>

    <Code lang="js">
      {`tippy('.btn', {
  delay: 100,
  arrow: true,
  arrowType: 'round',
  size: 'large',
  duration: 500
  animation: 'scale'
})`}
    </Code>

    <div class="section__result">
      <p class="section__result-text">Result:</p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-delay="100"
        data-tippy-arrow="true"
        data-tippy-arrowType="round"
        data-tippy-size="large"
        data-tippy-duration="500"
        data-tippy-animation="scale"
      >
        Text
      </button>
    </div>

    <h3>
      Data attributes <span class="section__emoji" oncreate={emoji('🏷')} />
    </h3>
    <p>
      You can also specify options on the reference element itself by adding{' '}
      <code>data-tippy-*</code> attributes. This will override the options
      specified in the instance.
    </p>

    <Code lang="html">
      {`<button
  class="btn"
  title="I'm a Tippy tooltip!"
  data-tippy-delay="0"
  data-tippy-arrow="false"
  data-tippy-size="small"
  data-tippy-animation="shift-toward"
>
  Text
</button>`}
    </Code>

    <div class="section__result">
      <p class="section__result-text">Result:</p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-delay="0"
        data-tippy-arrow="false"
        data-tippy-size="small"
        data-tippy-animation="shift-toward"
      >
        Overridden
      </button>
    </div>
  </section>
)
