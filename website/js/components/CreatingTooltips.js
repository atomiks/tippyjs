import { h } from 'hyperapp'
import Code from './Code'
import Emoji from './Emoji'
import Tippy from './Tippy'
import ResultBox from './ResultBox'
import Heading from './Heading'
const Subheading = Heading('CreatingTootips')

const AUTO_TIPPY_BUTTON = `<button data-tippy="I'm a tooltip!">Text</button>`
const FUNCTION_BUTTON = `<button class="btn">Text</button>`
const FUNCTION_CALL = `tippy('button', { content: "I'm a tooltip!" })`
const DOM_ELEMENT_ARGUMENT = `
tippy(document.querySelector('.btn'))
tippy([document.querySelector('.btn'), document.querySelector('.btn')])
`
const NODE_LIST_ARGUMENT = `tippy(document.querySelectorAll('.btn'))`
const VIRTUAL_REFERENCE = `
const virtualReference = {
  getBoundingClientRect() {
    return {
      width: 100,
      height: 100,
      top: 100,
      left: 100,
      right: 200,
      bottom: 200
    }
  },
  clientHeight: 100,
  clientWidth: 100
}

tippy(virtualReference, { content: "I'm a tooltip!" })
`

export default () => (state, actions) => (
  <section class="section" id="creating-tooltips">
    <Emoji class="section__icon-wrapper">🔧</Emoji>
    <Heading>Creating Tooltips</Heading>

    <Subheading>Method 1: Auto</Subheading>
    <p>
      Give your reference element a <code>data-tippy</code> attribute containing
      the tooltip content.
    </p>
    <Code lang="html">{AUTO_TIPPY_BUTTON}</Code>
    <p>
      When tippy is loaded in the document, it will search for elements with the
      attribute and give them a tooltip automatically.
    </p>

    <Subheading>Method 2: Function</Subheading>
    <p>
      Use the <code>tippy</code> function.
    </p>
    <Code lang="html">{FUNCTION_BUTTON}</Code>
    <Code lang="js">{FUNCTION_CALL}</Code>
    <ResultBox>
      <Tippy>
        <button class="btn">Text</button>
      </Tippy>
    </ResultBox>
    <p>The function allows for more advanced configuration and reusability.</p>

    <p>
      <strong>Which one should you use?</strong> If you're not adding
      configuration and are not using a single page application framework, then
      the first one is fine. As your use cases expand, you will probably want to
      use the function.
    </p>

    <Subheading>
      Accepted inputs <Emoji class="section__emoji">🎛</Emoji>
    </Subheading>
    <p>
      A single{' '}
      <Tippy.secondary
        content={
          <div>
            <strong>D</strong>ocument <strong>O</strong>bject <strong>M</strong>odel
            - the tree structure of the HTML document where each node (such as a
            DIV tag) is represented by an object
          </div>
        }
      >
        <span tabindex="0" class="tippy">
          DOM
        </span>{' '}
      </Tippy.secondary>
      <code>Element</code> (or an array of them) will work:
    </p>

    <Code lang="js">{DOM_ELEMENT_ARGUMENT}</Code>
    <p>
      As well as a <code>NodeList</code>:
    </p>
    <Code lang="js">{NODE_LIST_ARGUMENT}</Code>

    <Subheading>
      Advanced <Emoji class="section__emoji">🤯</Emoji>
    </Subheading>
    <p>
      You can use a virtual element as the positioning reference instead of a
      real element:
    </p>
    <Code lang="js">{VIRTUAL_REFERENCE}</Code>

    <p>
      Popper.js uses these properties to determine the position of the tooltip.
    </p>
  </section>
)
