import { h } from 'hyperapp'

import HTML_ELEMENT from '../../snippets/html-element'
import HTML_ELEMENT_JS from '../../snippets/html-element-js'

import Section from '../components/Section'
import Heading from '../components/Heading'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import ResultBox from '../components/ResultBox'
import Tippy from '../components/Tippy'

const TITLE = 'HTML Content'
const Subheading = Heading(TITLE)

export default () => (
  <Section title={TITLE} emoji="🖼️">
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
  </Section>
)
