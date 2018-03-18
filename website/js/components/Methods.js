import { h } from 'hyperapp'
import { emoji } from '../utils'

export const view = ({ state, actions }) => (
  <section class="section" id="methods">
    <div class="section__icon-wrapper" innerHTML={emoji('🕹')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#methods">
        Methods
      </a>
    </div>
    <p>
      Tippy instances have 5 methods available which allow you to control the tooltip without the
      use of UI events. They are:
    </p>
    <ul>
      <li>
        <code>Tippy.prototype.show()</code>
      </li>
      <li>
        <code>Tippy.prototype.hide()</code>
      </li>
      <li>
        <code>Tippy.prototype.enable()</code>
      </li>
      <li>
        <code>Tippy.prototype.disable()</code>
      </li>
      <li>
        <code>Tippy.prototype.destroy()</code>
      </li>
    </ul>
    <p>Given the following element with a tooltip:</p>
    <div class="code-wrapper" data-lang="html">
      <pre>
        <code class="lang-html">{`<button title="Hello!">Text</button>`}</code>
      </pre>
    </div>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`const btn = document.querySelector('button')
tippy(btn)`}</code>
      </pre>
    </div>
    <p>
      The Tippy instance is stored on the button element via the <code>_tippy</code> property.
    </p>

    <h3>Show the tooltip</h3>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.show()`}</code>
      </pre>
    </div>

    <h3>Hide the tooltip</h3>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.hide()`}</code>
      </pre>
    </div>

    <h3>Custom transition duration</h3>
    <p>Pass a number in as an argument to override the instance option:</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.show(200) // 200ms
btn._tippy.hide(1000) // 1000ms`}</code>
      </pre>
    </div>

    <h3>Disable the tooltip</h3>
    <p>The tooltip can be temporarily disabled from showing/hiding:</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.disable()`}</code>
      </pre>
    </div>
    <p>To re-enable:</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.enable()`}</code>
      </pre>
    </div>

    <h3>Destroy the tooltip</h3>
    <p>To permanently destroy the tooltip and remove all listeners from the reference element:</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.destroy()`}</code>
      </pre>
    </div>
    <p>
      The <code>_tippy</code> property is deleted from the reference element upon destruction.
    </p>

    <h3>Update the tooltip</h3>
    <p>There is no method to update the tooltip content, because it's easy to do!</p>
    <p>Option 1 (recommended): Change the title on the reference element:</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn.title = 'New tooltip :)'`}</code>
      </pre>
    </div>
    <p>Option 2: Manually update the tooltip:</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`btn._tippy.popper.querySelector('.tippy-content').textContent = 'New tooltip :)'`}</code>
      </pre>
    </div>
    <p>
      Note: With the above method, <code>_tippy.title</code> won't reflect the new title, you'll
      need to update it manually.
    </p>
    <p>If you're using an HTML template, save it to a variable reference to modify it later.</p>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`const template = document.querySelector('template')
tippy(btn, { html: template })
template.textContent = 'New tooltip :)'`}</code>
      </pre>
    </div>
  </section>
)
