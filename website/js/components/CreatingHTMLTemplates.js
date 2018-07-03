import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import Heading from './Heading'
import ResultBox from './ResultBox'
import Tippy from './Tippy'
const Subheading = Heading('CreatingHTMLTemplates')

const HTML_ELEMENT = `
<button class="btn">Text</button>
<div id="myTemplate">
  My tooltip <strong style="color:pink">HTML</strong> content
</div>
`

const HTML_ELEMENT_JS = `
tippy('.btn', {
  content: document.querySelector('#myTemplate')
})
`

const HTML_ELEMENT_CLONE = `
const clone = document.querySelector('#myTemplate').cloneNode(true)
`

export default () => (
  <section class="section">
    <Emoji class="section__icon-wrapper">🖼️</Emoji>
    <Heading>Creating HTML Templates</Heading>

    <p>
      Provide an <code>HTMLElement</code> for the <code>content</code> prop.
    </p>

    <Code lang="html">{HTML_ELEMENT}</Code>
    <Code lang="js">{HTML_ELEMENT_JS}</Code>
    <ResultBox>
      <Tippy
        content={
          <div>
            My tooltip <strong style={{ color: 'pink' }}>HTML</strong> content
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

    <Code lang="js">{HTML_ELEMENT_CLONE}</Code>

    <Subheading>Integration with SPA frameworks</Subheading>

    <p>
      Modern SPA frameworks like React, Hyperapp, Vue, etc. use plain objects to
      describe the real DOM, called a VDOM. So if you want to use JSX inside the{' '}
      <code>content</code> prop, you need to render the virtual nodes into a
      real HTML element.
    </p>

    <p>
      React does this with <code>ReactDOM.render()</code>, Hyperapp does it with{' '}
      <code>app()</code>.
    </p>
  </section>
)
