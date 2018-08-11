import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import Heading from './Heading'
import ResultBox from './ResultBox'
import Tippy from './Tippy'
const Subheading = Heading('HTMLContent')
import HTML_ELEMENT from '../../snippets/html-element'
import HTML_ELEMENT_JS from '../../snippets/html-element-js'

export default () => (
  <section class="section">
    <Emoji class="section__icon-wrapper">🖼️</Emoji>
    <Heading>HTML Content</Heading>

    <p>
      Along with using a string of HTML content, you can provide an{' '}
      <code>HTMLElement</code> for the <code>content</code> option.
    </p>

    <Code content={HTML_ELEMENT} />
    <Code content={HTML_ELEMENT_JS} />
    <ResultBox>
      <Tippy
        content={
          <div>
            My HTML <strong style={{ color: 'pink' }}>tooltip</strong> content
          </div>
        }
      >
        <button class="btn">I have an HTML template!</button>
      </Tippy>
    </ResultBox>

    <p>
      Tippy will append the DOM element directly to the tooltip, so it will be
      removed from the page.
    </p>

    <p>
      What if you want to reuse it multiple times? There's a DOM method for
      deep-cloning a node.
    </p>

    <Code content="const clone = document.querySelector('#myTemplate').cloneNode(true)" />

    <Subheading>Integration with SPA frameworks</Subheading>

    <p>
      Modern SPA frameworks like React, Hyperapp, Vue, etc. use plain objects to
      describe the real DOM, called a Virtual DOM (VDOM). So if you want to use
      JSX inside the <code>content</code> prop, you need to render the virtual
      nodes into a real HTML element.
    </p>

    <p>
      To ensure the the state of the tooltip stays in sync with the state of the
      app, you can use lifecycle methods to update the tooltip instance.
    </p>
  </section>
)
