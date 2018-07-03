import { h } from 'hyperapp'
import pkg from '../../../package.json'
import Emoji from './Emoji'
import Code from './Code'

const PKG_LINK = `
<script src="https://unpkg.com/tippy.js@${
  pkg.version
}/dist/tippy.all.min.js"></script>
`
const NODE_ENVIRONMENT = `
// Node environment
const tippy = require('tippy.js')
// With a module bundler (webpack/rollup/parcel)
import tippy from 'tippy.js'
`

export default () => (
  <section class="section" id="getting-started">
    <Emoji class="section__icon-wrapper">📦</Emoji>
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#getting-started">
        Getting started
      </a>
    </div>
    <h3 class="section__subheading">
      Option 1 <Emoji class="section__emoji">🐝</Emoji>
    </h3>
    <p>
      Include this script from the unpkg CDN in your HTML document before your
      own scripts:
    </p>
    <Code lang="html">{PKG_LINK}</Code>
    <p>
      Once it's loaded, you'll have access to the <code>tippy</code> module
      which will allow you to create awesome tooltips!
    </p>

    <h3 class="section__subheading">
      Option 2 <Emoji class="section__emoji">📦</Emoji>
    </h3>
    <p>Install using either npm or yarn:</p>

    <Code lang="shell">{`npm install tippy.js`}</Code>
    <Code lang="shell">{`yarn add tippy.js`}</Code>

    <p>
      Then you can import the <code>tippy</code> module:
    </p>
    <Code lang="js">{NODE_ENVIRONMENT}</Code>

    <h3 class="section__subheading">
      Files <Emoji class="section__emoji">📁</Emoji>
    </h3>
    <p>Tippy builds a bunch of different files that can be used:</p>
    <ul>
      <li>
        <code>tippy.all.js</code> is all dependencies (Tippy + Popper + CSS) in
        a single file. The CSS is injected into the document head.
      </li>
      <li>
        <code>tippy.js</code> is Tippy + Popper together, without the CSS.
      </li>
      <li>
        <code>tippy.standalone.js</code> is Tippy by itself, without Popper or
        the CSS.
      </li>
      <li>
        <code>tippy.css</code> is Tippy's CSS stylesheet by itself.
      </li>
    </ul>
    <p>
      There are also <code>.min</code> versions of the above, which means the
      file is minified for production use.
    </p>
  </section>
)
