import { h } from 'hyperapp'

import HTML_ELEMENT from '../../snippets/html-element'
import HTML_ELEMENT_JS from '../../snippets/html-element-js'
import INNER_HTML from '../../snippets/innerhtml'
import CONTENT_FUNCTION_HTML from '../../snippets/content-function-html'
import CONTENT_FUNCTION from '../../snippets/content-function'

import Section from '../components/Section'
import Heading from '../components/Heading'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import ResultBox from '../components/ResultBox'
import Tippy from '../components/Tippy'
import { Emojis } from './TableOfContents'

const TITLE = 'HTML Content'
const Subheading = Heading(TITLE)

export default () => (
  <Section title={TITLE} emoji={Emojis.HTML_CONTENT}>
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
      To reuse the template multiple times, you can pass its{' '}
      <code>innerHTML</code> content:
    </p>
    <Code content={INNER_HTML} />

    <p>
      If each reference element should have a different template associated with
      it, you can pass a function that receives the current reference as an
      argument and return its associated template:
    </p>
    <Code content={CONTENT_FUNCTION_HTML} />
    <Code content={CONTENT_FUNCTION} />
  </Section>
)
