import { h } from 'hyperapp'
import Section from '../components/Section'
import Heading from '../components/Heading'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import ExternalLink from '../components/ExternalLink'

const TITLE = 'Getting Started'
const Subheading = Heading(TITLE)

export default () => (
  <Section title={TITLE} emoji="📦">
    <Subheading>
      <Emoji class="section__emoji">🔗</Emoji> Option 1: CDN
    </Subheading>
    <p>
      Include this script from the unpkg CDN in your HTML document before your
      own scripts:
    </p>
    <Code
      lang="html"
      content="<script src=&quot;https://unpkg.com/tippy.js@3/dist/tippy.all.min.js&quot;></script>"
    />
    <p>
      It's recommended to place this at the bottom of the{' '}
      <code>&lt;body&gt;</code>, or in the <code>&lt;head&gt;</code> with a{' '}
      <code>defer</code> attribute.
    </p>

    <Subheading>
      <Emoji class="section__emoji">📦</Emoji> Option 2: Package Manager
    </Subheading>
    <p>Install using either npm or yarn:</p>

    <Code lang="shell" content="npm i tippy.js" />
    <Code lang="shell" content="yarn add tippy.js" />

    <p>
      Then you can import the <code>tippy</code> module:
    </p>
    <Code content="import tippy from 'tippy.js'" />

    <p>
      You'll also need to import Tippy's CSS. With a module bundler like Webpack
      or Parcel, it can be imported directly:
    </p>

    <Code content="import 'tippy.js/dist/tippy.css'" />

    <Subheading>
      <Emoji class="section__emoji">🎁</Emoji> View Library Components
    </Subheading>

    <p>
      If you would like to use Tippy.js as a declarative component, there are
      wrappers available.
    </p>

    <ul>
      <li>
        <ExternalLink to="https://github.com/atomiks/tippy.js-react">
          React
        </ExternalLink>
      </li>
    </ul>

    <Subheading>
      <Emoji class="section__emoji">📁</Emoji> Files
    </Subheading>
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
        the CSS. This is useful if you are using a CDN and want to use the
        latest version of Popper.js if the bundled version is outdated, or use
        Popper itself for other things.
      </li>
      <li>
        <code>tippy.css</code> is Tippy's CSS stylesheet by itself.
      </li>
    </ul>
    <p>
      There are also <code>.min</code> versions of the above, which means the
      file is minified for production use.
    </p>
  </Section>
)
