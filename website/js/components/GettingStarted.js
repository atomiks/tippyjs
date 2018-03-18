import { h } from 'hyperapp'
import pkg from '../../../package.json'
import { emoji } from '../utils'

export const view = ({ state, actions }) => (
  <section class="section" id="getting-started">
    <div class="section__icon-wrapper" innerHTML={emoji('📦')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#getting-started">
        Getting started
      </a>
    </div>
    <h3 class="section__subheading">
      Option 1 <span class="section__emoji" innerHTML={emoji('🐝')} />
    </h3>
    <p>
      Include this script from the{' '}
      <span
        class="tippy"
        title="unpkg.com is a <strong>C</strong>ontent <strong>D</strong>elivery <strong>N</strong>etwork that hosts npm packages."
        tabindex="0"
      >
        unpkg CDN
      </span>{' '}
      in your HTML document before your own scripts:
    </p>
    <div class="code-wrapper" data-lang="html">
      <pre>
        <code class="lang-html">
          {`<script src="https://unpkg.com/tippy.js@${
            pkg.version
          }/dist/tippy.all.min.js"></script>`}
        </code>
      </pre>
    </div>
    <p>
      Once it's loaded, you'll have access to the <code>tippy</code> module which will allow you to
      create awesome tooltips!
    </p>

    <h3 class="section__subheading">
      Option 2 <span class="section__emoji" innerHTML={emoji('📦')} />
    </h3>
    <p>Install using either npm or yarn:</p>

    <div class="code-wrapper" data-lang="shell">
      <pre class="lang-shell">
        <code>npm install tippy.js</code>
      </pre>
    </div>
    <div class="code-wrapper" data-lang="shell">
      <pre class="lang-shell">
        <code>yarn add tippy.js</code>
      </pre>
    </div>

    <p>
      Then you can import the <code>tippy</code> module:
    </p>
    <div class="code-wrapper" data-lang="js">
      <pre class="lang-js">
        <code>
          {`// Node environment
const tippy = require('tippy.js')
// With a module bundler (webpack/rollup/parcel)
import tippy from 'tippy.js'
`}
        </code>
      </pre>
    </div>

    <h3 class="section__subheading">
      Files <span class="section__emoji" innerHTML={emoji('📁')} />
    </h3>
    <p>Tippy builds a bunch of different files that can be used:</p>
    <ul>
      <li>
        <code>tippy.all.js</code> is all dependencies (Tippy + Popper + CSS) in a single file. The
        CSS is injected into the document head.
      </li>
      <li>
        <code>tippy.js</code> is Tippy + Popper together, without the CSS.
      </li>
      <li>
        <code>tippy.standalone.js</code> is Tippy by itself, without Popper or the CSS.
      </li>
      <li>
        <code>tippy.css</code> is Tippy's CSS stylesheet by itself.
      </li>
    </ul>
    <p>
      There are also <code>.min</code> versions of the above, which means the file is minified for
      production use.
    </p>
  </section>
)
