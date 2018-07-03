import { h } from 'hyperapp'
import { emoji } from '../utils'

export default () => (state, actions) => (
  <section class="section" id="creating-custom-themes">
    <div class="section__icon-wrapper" oncreate={emoji('🖌')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#creating-custom-themes">
        Creating Custom Themes
      </a>
    </div>
    <p>
      Creating a theme for your tooltips is easy! If you wanted to make a theme
      called <code>honeybee</code>, then your CSS would look like:
    </p>
    <div class="code-wrapper" data-lang="css">
      <pre>
        <code class="lang-css">{`.tippy-tooltip.honeybee-theme {
  /* Your styling here. Example: */
  background-color: yellow;
  border: 2px solid orange;
  font-weight: bold;
  color: #333;
}`}</code>
      </pre>
    </div>

    <p>
      The <code>-theme</code> suffix is required.
    </p>

    <h3>
      Styling the <code>animateFill</code> backdrop
    </h3>
    <p>
      By default, tippy tooltips have a cool backdrop filling animation, which
      is just a circle that expands out. Its class name is{' '}
      <code>tippy-backdrop</code>:
    </p>
    <div class="code-wrapper" data-lang="css">
      <pre>
        <code class="lang-css">{`.tippy-tooltip.honeybee-theme .tippy-backdrop {
  /* Your styling here. Example: */
  background-color: yellow;
}`}</code>
      </pre>
    </div>

    <p>
      If you're using the backdrop animation, avoid styling the tooltip directly
      – just the backdrop.
    </p>

    <h3>Styling the arrow</h3>
    <p>
      There are two arrow selectors: <code>.tippy-arrow</code> and{' '}
      <code>.tippy-roundarrow</code>. The first is the pure CSS triangle shape,
      while the second is a custom SVG.
    </p>
    <div class="code-wrapper" data-lang="css">
      <pre>
        <code class="lang-css">{`.tippy-popper[x-placement^=top] .tippy-tooltip.honeybee-theme .tippy-arrow {
  /* Your styling here. */
}`}</code>
      </pre>
    </div>
    <p>
      You will need to style the arrow for each different popper placement (top,
      bottom, left, right), which is why the selector is so long.
    </p>

    <h3>Styling the content directly</h3>
    <div class="code-wrapper" data-lang="css">
      <pre>
        <code class="lang-css">{`.tippy-tooltip.honeybee-theme .tippy-content {
  /* Your styling here. Example: */
  color: #333;
}`}</code>
      </pre>
    </div>

    <h3>
      Specify a <code>theme</code> option
    </h3>
    <p>
      To see what your cool theme looks like, specify a <code>theme</code>{' '}
      option for tippy:
    </p>

    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`tippy('.btn', {
  theme: 'honeybee',
  // ...or add multiple themes by separating each by a space...
  theme: 'honeybee bumblebee shadow'
})`}</code>
      </pre>
    </div>

    <p>
      <code>.honeybee-theme</code>, <code>.bumblebee-theme</code> and{' '}
      <code>.shadow-theme</code> are the selectors for this theme list.
    </p>

    <div class="section__result">
      <p class="section__result-text">Result:</p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-theme="honeybee"
        data-tippy-animateFill="false"
      >
        Custom theme
      </button>
    </div>
  </section>
)
