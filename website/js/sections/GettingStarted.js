import { h } from 'hyperapp'
import { version } from '../../../package.json'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import Heading from '../components/Heading'
const Subheading = Heading('GettingStarted')

export default () => (
  <section class="section" id="getting-started">
    <Emoji class="section__icon-wrapper">📦</Emoji>
    <Heading>Getting started</Heading>

    <Subheading>
      Option 1: CDN <Emoji class="section__emoji">🔗</Emoji>
    </Subheading>
    <p>
      Include this script from the unpkg CDN in your HTML document before your
      own scripts:
    </p>
    <Code
      lang="html"
      content={`<script src="https://unpkg.com/tippy.js@${version}/dist/tippy.all.min.js"></script>`}
    />
    <p>
      Once it's loaded, you'll have access to the <code>tippy</code> module
      which will allow you to create awesome tooltips!
    </p>

    <Subheading>
      Option 2: Package Manager <Emoji class="section__emoji">📦</Emoji>
    </Subheading>
    <p>Install using either npm or yarn:</p>

    <Code lang="shell" content="npm i tippy.js" />
    <Code lang="shell" content="yarn add tippy.js" />

    <p>
      Then you can import the <code>tippy</code> module:
    </p>
    <Code content="import tippy from 'tippy.js'" />

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
