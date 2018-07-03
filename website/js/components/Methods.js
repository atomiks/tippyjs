import { h } from 'hyperapp'
import { emoji } from '../utils'
import Code from './Code'

export default () => (state, actions) => (
  <section class="section" id="methods">
    <div class="section__icon-wrapper" oncreate={emoji('🕹')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#methods">
        Methods
      </a>
    </div>
    <p>
      Tippy instances have 5 methods available which allow you to control the
      tooltip without the use of UI events. They are:
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
    <Code lang="html">{`<button title="Hello!">Text</button>`}</Code>
    <Code lang="js">{`const btn = document.querySelector('button')
tippy(btn)`}</Code>

    <p>
      The Tippy instance is stored on the button element via the{' '}
      <code>_tippy</code> property.
    </p>

    <p>
      <span class="badge">v2.5</span> If you are dealing with a single
      element/tooltip, you can use <code>tippy.one()</code> method to directly
      return the instance instead of having to use the <code>_tippy</code>{' '}
      property.
    </p>
    <Code lang="js">{`const instance = tippy.one('button')`}</Code>

    <h3>Show the tooltip</h3>
    <Code lang="js">{`btn._tippy.show()`}</Code>

    <h3>Hide the tooltip</h3>
    <Code lang="js">{`btn._tippy.hide()`}</Code>

    <h3>Custom transition duration</h3>
    <p>Pass a number in as an argument to override the instance option:</p>
    <Code lang="js">{`btn._tippy.show(200) // 200ms
btn._tippy.hide(1000) // 1000ms`}</Code>

    <h3>Disable the tooltip</h3>
    <p>The tooltip can be temporarily disabled from showing/hiding:</p>
    <Code lang="js">{`btn._tippy.disable()`}</Code>

    <p>To re-enable:</p>
    <Code lang="js">{`btn._tippy.enable()`}</Code>

    <h3>Destroy the tooltip</h3>
    <p>
      To permanently destroy the tooltip and remove all listeners from the
      reference element:
    </p>
    <Code lang="js">{`btn._tippy.destroy()`}</Code>

    <p>
      The <code>_tippy</code> property is deleted from the reference element
      upon destruction.
    </p>

    <h3>Update the tooltip</h3>
    <p>
      There is no method to update the tooltip content, because it's easy to do!
    </p>
    <p>
      Option 1 (recommended): Change the title on the reference element and use
      the <code>dynamicTitle</code> option:
    </p>
    <Code lang="js">{`tippy(btn, { dynamicTitle: true })
btn.title = 'New tooltip :)'`}</Code>

    <p>Option 2: Manually update the tooltip:</p>
    <Code lang="js">{`btn._tippy.popper.querySelector('.tippy-content').textContent = 'New tooltip :)'`}</Code>

    <p>
      Note: With the above method, <code>_tippy.title</code> won't reflect the
      new title, you'll need to update it manually.
    </p>
    <p>
      If you're using an HTML template, save it to a variable reference to
      modify it later.
    </p>
    <Code lang="js">{`const template = document.querySelector('template')
tippy(btn, { html: template })
template.textContent = 'New tooltip :)'`}</Code>
  </section>
)
