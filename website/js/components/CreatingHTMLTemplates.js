import { h } from 'hyperapp'
import { emoji } from '../utils'
import tippy from '../../../src/js/tippy.js'

export const actions = {
  initHTMLTemplateTippy(el) {
    const template = document.createElement('div')
    template.innerHTML = `<h3>
  Cool <span style="color: pink;">HTML</span> inside here!
</h3>`
    tippy(el, { html: template })
  }
}

export const view = ({ state, actions }) => (
  <section class="section" id="creating-html-templates">
    <div class="section__icon-wrapper" innerHTML={emoji('🎟')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#creating-html-templates">
        Creating HTML Templates
      </a>
    </div>
    <p>
      There are two ways to create an HTML template: <strong>cloning</strong> or{' '}
      <strong>direct reference</strong>.
    </p>

    <h3>Option 1: Cloning</h3>
    <p>
      Clones the template's <code>innerHTML</code> but does not modify it.
    </p>
    <p>
      Option: <code>html: '#templateId'</code> selector matching a template on the document
    </p>
    <ul>
      <li>Reusable</li>
      <li>Stays on the page</li>
      <li>Does not save event listeners attached to it</li>
      <li>Not directly modifiable</li>
    </ul>

    <h3>Option 2: Direct reference</h3>
    <p>Directly appends an element to the tooltip.</p>
    <p>
      Option: <code>html: document.querySelector('#templateId')</code> HTMLElement
    </p>
    <ul>
      <li>Can only be used once</li>
      <li>Removed from the page and appended to the tooltip element</li>
      <li>Saves event listeners attached to it</li>
      <li>Directly modifiable</li>
    </ul>

    <p>On the document or in JavaScript somewhere, make a template.</p>

    <h4>Cloning</h4>
    <div class="code-wrapper" data-lang="html">
      <pre>
        <code class="lang-html">{`<div id="myTemplate" style="display: none;">
  <h3>Cool <span style="color: pink;">HTML</span> inside here!</h3>
</div>`}</code>
      </pre>
    </div>

    <h4>Direct element reference</h4>
    <div class="code-wrapper" data-lang="html">
      <pre>
        <code class="lang-html">{`<div id="myTemplate">
  <h3>Cool <span style="color: pink;">HTML</span> inside here!</h3>
</div>`}</code>
      </pre>
    </div>

    <h4>Dynamic element with JS</h4>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`const myTemplate = document.createElement('div')
myTemplate.innerHTML = '<h3>Cool <span style="color: pink;">HTML</span> inside here!</h3>'`}</code>
      </pre>
    </div>

    <p>
      Then specify a <code>html</code> option, choosing one of the choices.
    </p>

    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`tippy('selector', {
  html: '#myTemplate',
  // ...or...
  html: document.querySelector('#myTemplate'),
  // ...or you can clone a direct element too...
  html: document.querySelector('#myTemplate').cloneNode(true)
})`}</code>
      </pre>
    </div>

    <div class="section__result">
      <p class="section__result-text">Result:</p>
      <button oncreate={actions.initHTMLTemplateTippy} class="btn">
        I have an HTML template!
      </button>
    </div>
  </section>
)
